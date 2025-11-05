import { Card } from "@/components/ui/card";
import { UserPlus, CreditCard, Settings, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "Step 1",
    title: "Quick Registration",
    description: "Sign up with your phone, email, and verify with OTP. Takes less than 2 minutes.",
    gradient: "bg-gradient-hero"
  },
  {
    icon: CreditCard,
    step: "Step 2",
    title: "Choose Your Plan",
    description: "Select from Free, Starter, Pro, or Premium. Secure payment via Razorpay or Stripe.",
    gradient: "bg-gradient-accent"
  },
  {
    icon: Settings,
    step: "Step 3",
    title: "Business Setup",
    description: "Answer a few questions about your business. We'll customize your dashboard automatically.",
    gradient: "bg-gradient-success"
  },
  {
    icon: Rocket,
    step: "Step 4",
    title: "Start Billing",
    description: "Get your unique ID and password. Access your personalized dashboard and start billing instantly.",
    gradient: "bg-gradient-hero"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-6 bg-gradient-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Get Started in Minutes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple onboarding process designed to get you up and running fast.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connection lines */}
          <div className="hidden lg:block absolute top-1/4 left-0 right-0 h-0.5 bg-border -z-10" />
          
          {steps.map((item, index) => (
            <Card 
              key={index} 
              className="p-6 text-center hover:shadow-medium transition-all duration-300 border-border relative"
            >
              <div className={`w-16 h-16 rounded-2xl ${item.gradient} flex items-center justify-center mx-auto mb-4 shadow-soft`}>
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm font-medium text-primary mb-2">{item.step}</p>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;