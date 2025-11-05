import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Loader2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Payment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  screenshot_url: string;
  transaction_note: string;
  status: string;
  created_at: string;
  plans?: {
    name: string;
    duration_days: number;
  };
}

const PaymentVerification = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchPendingPayments();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!userRole) {
      toast.error("Unauthorized access");
      navigate("/dashboard");
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          plans (
            name,
            duration_days
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string, verify: boolean) => {
    setProcessingId(paymentId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: {
          payment_id: paymentId,
          verify,
          rejection_reason: verify ? null : rejectionReason,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast.success(verify ? "Payment verified successfully!" : "Payment rejected");
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedPayment(null);
      fetchPendingPayments();
    } catch (error: any) {
      toast.error(error.message || "Failed to process payment");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowRejectDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent p-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Payment Verification</h1>
            <p className="text-muted-foreground mt-1">
              Review and verify pending payments
            </p>
          </div>
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        {payments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Check className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No pending payments</p>
              <p className="text-sm text-muted-foreground">
                All payments have been processed
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {payment.plans?.name || "Unknown Plan"}
                        <Badge variant="secondary">Pending</Badge>
                      </CardTitle>
                      <CardDescription>
                        Submitted {new Date(payment.created_at).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₹{payment.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.plans?.duration_days} days
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Transaction ID / UTR Number</Label>
                        <p className="text-sm bg-muted p-3 rounded mt-1">
                          {payment.transaction_note}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleVerifyPayment(payment.id, true)}
                          disabled={processingId === payment.id}
                          className="flex-1"
                        >
                          {processingId === payment.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          onClick={() => openRejectDialog(payment)}
                          disabled={processingId === payment.id}
                          variant="destructive"
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Payment Screenshot</Label>
                      <a
                        href={payment.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={payment.screenshot_url}
                          alt="Payment screenshot"
                          className="w-full rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer"
                        />
                        <div className="flex items-center gap-1 text-xs text-primary mt-2">
                          <ExternalLink className="w-3 h-3" />
                          <span>Click to view full size</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment. This will be recorded.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Rejection Reason *</Label>
            <Textarea
              id="rejection-reason"
              placeholder="e.g., Invalid transaction ID, screenshot not clear, amount mismatch"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              maxLength={500}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setSelectedPayment(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedPayment &&
                handleVerifyPayment(selectedPayment.id, false)
              }
              disabled={!rejectionReason.trim() || processingId !== null}
            >
              {processingId ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentVerification;
