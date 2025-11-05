import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { invoiceId, userId, pdfBlob, fileName } = await req.json();

    if (!invoiceId || !userId || !pdfBlob || !fileName) {
      throw new Error('Missing required parameters');
    }

    console.log('Starting upload for invoice:', invoiceId);

    // Get user's Drive tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_drive_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('User Drive not connected');
    }

    // Check if token is expired
    const now = new Date();
    const expiry = new Date(tokenData.token_expiry);
    let accessToken = tokenData.access_token;

    if (now >= expiry) {
      console.log('Token expired, refreshing...');
      
      // Refresh token
      const refreshResponse = await fetch(`${supabaseUrl}/functions/v1/refresh-drive-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ userId }),
      });

      const refreshData = await refreshResponse.json();
      if (!refreshData.success) {
        throw new Error('Failed to refresh token');
      }
      accessToken = refreshData.access_token;
    }

    // Create folder structure: Pavilo Invoices/<YYYY-MM>
    const date = new Date();
    const folderName = `Pavilo Invoices/${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    console.log('Creating/finding folder:', folderName);

    // Search for or create the folder
    const folderId = await findOrCreateFolder(accessToken, folderName);

    // Convert base64 PDF to binary
    const pdfData = Uint8Array.from(atob(pdfBlob), c => c.charCodeAt(0));

    console.log('Uploading file to Drive...');

    // Upload file to Google Drive
    const metadata = {
      name: fileName,
      parents: [folderId],
      mimeType: 'application/pdf',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([pdfData], { type: 'application/pdf' }));

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error('Upload failed:', error);
      throw new Error(`Failed to upload to Drive: ${error}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('File uploaded successfully:', uploadResult.id);

    // Update invoice record
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        drive_uploaded: true,
        drive_file_id: uploadResult.id,
        drive_uploaded_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);

    if (updateError) {
      console.error('Failed to update invoice:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        fileId: uploadResult.id,
        message: 'Invoice uploaded to Google Drive successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in upload-invoice-to-drive:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function findOrCreateFolder(accessToken: string, folderPath: string): Promise<string> {
  const parts = folderPath.split('/');
  let parentId = 'root';

  for (const part of parts) {
    // Search for folder
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${part}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    const searchResult = await searchResponse.json();

    if (searchResult.files && searchResult.files.length > 0) {
      parentId = searchResult.files[0].id;
    } else {
      // Create folder
      const createResponse = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: part,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
          }),
        }
      );

      const createResult = await createResponse.json();
      parentId = createResult.id;
    }
  }

  return parentId;
}