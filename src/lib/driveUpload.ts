import { supabase } from "@/integrations/supabase/client";

export async function uploadInvoiceToDrive(
  invoiceId: string,
  pdfBlob: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if user has connected Google Drive
    const { data: driveToken } = await supabase
      .from('user_drive_tokens')
      .select('is_connected')
      .eq('user_id', user.id)
      .single();

    if (!driveToken || !driveToken.is_connected) {
      console.log('Drive not connected, skipping upload');
      return { success: true }; // Not an error, just skip
    }

    console.log('Uploading invoice to Drive:', fileName);

    // Call edge function to upload
    const { data, error } = await supabase.functions.invoke('upload-invoice-to-drive', {
      body: {
        invoiceId,
        userId: user.id,
        pdfBlob,
        fileName,
      },
    });

    if (error) {
      console.error('Drive upload error:', error);
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      return { success: false, error: 'Upload failed' };
    }

    console.log('Invoice uploaded to Drive successfully');
    return { success: true };
  } catch (error) {
    console.error('Exception during Drive upload:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
