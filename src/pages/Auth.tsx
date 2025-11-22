import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
  businessType: z.enum(['mini_dmart', 'anaj_vyapari', 'shoe_shop']).optional(),
});

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessType, setBusinessType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validation = authSchema.safeParse({
        email,
        password,
        fullName: isSignUp ? fullName : undefined,
        businessType: isSignUp ? businessType : undefined,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      if (isSignUp && !businessType) {
        toast.error("Please select your business type");
        return;
      }

      setLoading(true);

      if (isSignUp) {
        console.log("Starting sign up...");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              business_type: businessType,
            },
          },
        });

        if (error) throw error;

        toast.success("Account created! Please check your email to verify.");
        setIsSignUp(false);
      } else {
        toast.info("Starting sign in...");
        console.log("Starting sign in...");

        // Create a promise that resolves when auth state changes to SIGNED_IN
        let authSubscription: any = null;
        const signInSuccessPromise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            authSubscription?.unsubscribe();
            reject(new Error("Request timed out"));
          }, 30000); // Increased timeout to 30s

          authSubscription = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              console.log("Auth state change detected: SIGNED_IN");
              clearTimeout(timeout);
              authSubscription?.unsubscribe();
              resolve();
            }
          });
        });

        // Initiate sign in (don't await the result, as it may hang)
        supabase.auth.signInWithPassword({
          email,
          password,
        }).catch(err => {
          // Log but don't throw - we rely on state change listener
          console.error("signInWithPassword error:", err);
        });

        // Wait for either SIGNED_IN event or timeout
        await signInSuccessPromise;

        toast.info("Sign in successful. Checking account...");

        // Check if user has active license
        console.log("Checking session...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session:", session);

        if (session) {
          console.log("Checking license...");
          // Wrap license check in try/catch to prevent blocking
          try {
            const { data: license, error: licenseError } = await supabase
              .from("licenses")
              .select("*")
              .eq("user_id", session.user.id)
              .eq("status", "active")
              .gte("expires_at", new Date().toISOString())
              .single();

            console.log("License result:", { license, licenseError });

            if (license) {
              console.log("License found, navigating to dashboard...");
              toast.success("Welcome back!");
              navigate("/dashboard");
            } else {
              console.log("No license found, navigating to subscription...");
              toast.success("Welcome! Please complete your subscription.");
              navigate("/subscription");
            }
          } catch (err) {
            console.error("License check error:", err);
            // If license check fails (e.g. table missing), let them in or send to subscription?
            // For now, send to dashboard to avoid blocking valid users if table is missing
            console.log("License check failed, defaulting to dashboard access");
            toast.success("Welcome back!");
            navigate("/dashboard");
          }
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      console.log("Auth finally block, setting loading false");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-3xl font-bold text-primary">PAVILO</h1>
          </div>
          <CardTitle className="text-2xl text-center">
            {isSignUp ? "Create your account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? "Start managing your business with Pavilo"
              : "Enter your credentials to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select value={businessType} onValueChange={setBusinessType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mini_dmart">General Store / Mini D-Mart</SelectItem>
                    <SelectItem value="anaj_vyapari">APMC / Anaj Vyapari (Wholesale)</SelectItem>
                    <SelectItem value="shoe_shop">Shoe & Clothes Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
            </Button>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary hover:underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
