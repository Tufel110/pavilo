import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, Upload, Loader2, X } from "lucide-react";
import { z } from "zod";
import paymentQR from "@/assets/payment-qr.jpg";

const paymentSchema = z.object({
  planId: z.string().uuid("Please select a plan"),
  amount: z.number().positive("Amount must be positive"),
  transactionNote: z.string().min(5, "Please provide transaction details").max(500),
  screenshot: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB"
  ).refine(
    (file) => ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
    "Only JPG, JPEG, and PNG files are allowed"
  ),
});

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  description: string;
  features: string[] | any;
}

interface PaymentStatus {
  status: string;
  created_at: string;
  amount: number;
  transaction_note?: string;
}

const Subscription = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [transactionNote, setTransactionNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLicense();
    fetchPlans();
    fetchPaymentSettings();
    checkPendingPayment();
  }, []);

  const checkAuthAndLicense = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has active license
    const { data: license } = await supabase
      .from("licenses")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .single();

    if (license) {
      navigate("/dashboard");
    }
  };

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (error) {
      toast.error("Failed to load plans");
      return;
    }

    setPlans(data || []);
  };

  const fetchPaymentSettings = async () => {
    const { data } = await supabase
      .from("payment_settings")
      .select("*")
      .eq("is_active", true)
      .single();

    setPaymentSettings(data);
  };

  const checkPendingPayment = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("payments")
      .select("status, created_at, amount, transaction_note")
      .eq("user_id", session.user.id)
      .in("status", ["pending", "rejected"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setPaymentStatus(data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast.error("Only JPG, JPEG, and PNG files are allowed");
        return;
      }
      setScreenshot(file);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan || !screenshot) {
      toast.error("Please select a plan and upload payment screenshot");
      return;
    }

    try {
      const validation = paymentSchema.safeParse({
        planId: selectedPlan.id,
        amount: selectedPlan.price,
        transactionNote: transactionNote.trim(),
        screenshot,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      setLoading(true);

      // Upload screenshot
      const fileExt = screenshot.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment-screenshots")
        .upload(fileName, screenshot);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("payment-screenshots")
        .getPublicUrl(fileName);

      // Submit payment
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("submit-payment", {
        body: {
          plan_id: selectedPlan.id,
          amount: selectedPlan.price,
          screenshot_url: publicUrl,
          transaction_note: transactionNote.trim(),
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      toast.success("Payment submitted successfully! Waiting for admin verification.");
      setPaymentStatus({
        status: "pending",
        created_at: new Date().toISOString(),
        amount: selectedPlan.price,
      });
      setSelectedPlan(null);
      setScreenshot(null);
      setTransactionNote("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit payment");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (paymentStatus) {
    if (paymentStatus.status === "pending") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Payment Pending Verification</CardTitle>
              <CardDescription>
                Your payment is being reviewed by our team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">Payment Under Review</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Amount: ₹{paymentStatus.amount}
                </p>
                <p className="text-sm text-muted-foreground">
                  Submitted: {new Date(paymentStatus.created_at).toLocaleString()}
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  Your payment will be verified within 24 hours. You'll receive an email
                  once your subscription is activated.
                </p>
              </div>
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    } else if (paymentStatus.status === "rejected") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent p-4">
          <Card className="max-w-md w-full border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Payment Rejected</CardTitle>
              <CardDescription>
                Your payment was not approved
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <X className="w-16 h-16 mx-auto text-destructive mb-4" />
                <p className="text-lg font-medium">Payment Not Verified</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Amount: ₹{paymentStatus.amount}
                </p>
              </div>
              {paymentStatus.transaction_note && (
                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <p className="text-sm font-medium mb-1">Rejection Reason:</p>
                  <p className="text-sm">{paymentStatus.transaction_note}</p>
                </div>
              )}
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  Please submit a new payment with correct details or contact support for assistance.
                </p>
              </div>
              <Button 
                onClick={() => {
                  setPaymentStatus(null);
                  fetchPlans();
                }} 
                className="w-full"
              >
                Try Again
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Choose Your Plan</h1>
            <p className="text-muted-foreground mt-1">
              Select a plan and complete payment to access Pavilo
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all ${
                selectedPlan?.id === plan.id
                  ? "border-2 border-primary shadow-lg scale-105"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="flex items-baseline mt-4">
                  <span className="text-3xl font-bold">₹{plan.price}</span>
                  <span className="text-muted-foreground ml-2">
                    / {plan.duration_days} days
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {!Array.isArray(plan.features) && (
                    <p className="text-sm text-muted-foreground">No features listed</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Form */}
        {selectedPlan && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
              <CardDescription>
                Pay ₹{selectedPlan.price} for {selectedPlan.name} plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPayment} className="space-y-6">
                {/* UPI Payment Details */}
                <div className="bg-muted p-6 rounded-lg space-y-4">
                  <h3 className="font-semibold text-center">Scan QR Code to Pay</h3>
                  <div className="flex justify-center">
                    <img
                      src={paymentQR}
                      alt="Payment QR Code"
                      className="w-full max-w-md rounded-lg shadow-lg"
                    />
                  </div>
                  <div className="text-center space-y-2 pt-4">
                    <p className="text-sm">
                      <span className="font-medium">UPI ID:</span> 9712269151@fam
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> Shaikh Mohamad Tufel Mohamad Sfd
                    </p>
                    <p className="text-lg font-bold text-primary">
                      Amount: ₹{selectedPlan.price}
                    </p>
                  </div>
                </div>

                {/* Transaction Note */}
                <div className="space-y-2">
                  <Label htmlFor="transactionNote">
                    Transaction ID / UTR Number *
                  </Label>
                  <Textarea
                    id="transactionNote"
                    placeholder="Enter transaction ID, UTR number, or payment reference"
                    value={transactionNote}
                    onChange={(e) => setTransactionNote(e.target.value)}
                    required
                    maxLength={500}
                  />
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-2">
                  <Label htmlFor="screenshot">Payment Screenshot *</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="screenshot"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      required
                    />
                    {screenshot && (
                      <Check className="w-5 h-5 text-success" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max size: 5MB. Formats: JPG, PNG
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Payment
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Subscription;
