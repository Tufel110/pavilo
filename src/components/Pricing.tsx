import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "Up to 100 bills/month",
      "Basic inventory management",
      "Single user access",
      "Mobile app access",
      "Email support"
    ],
    cta: "Start Free",
    highlighted: false
  },
  {
    name: "Starter",
    price: "₹499",
    period: "/month",
    description: "For small businesses",
    features: [
      "Up to 500 bills/month",
      "Full inventory management",
      "Up to 3 users",
      "Khata Book feature",
      "WhatsApp integration",
      "Priority support"
    ],
    cta: "Start Trial",
    highlighted: false
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/month",
    description: "Most popular choice",
    features: [
      "Unlimited bills",
      "AI Smart Billing",
      "Voice commands",
      "Up to 10 users",
      "Bhav Record (Mandi)",
      "Advanced analytics",
      "Report generation",
      "24/7 support"
    ],
    cta: "Start Trial",
    highlighted: true
  },
  {
    name: "Premium",
    price: "₹1,999",
    period: "/month",
    description: "For large businesses",
    features: [
      "Everything in Pro",
      "Unlimited users",
      "Pavilo Buddy AI",
      "Custom integrations",
      "Offline sync",
      "Role management",
      "Dedicated account manager",
      "Custom training"
    ],
    cta: "Contact Sales",
    highlighted: false
  }
];

const Pricing = () => {
  return (
    <section className="py-20 px-6" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business. Upgrade or downgrade anytime.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`p-6 relative ${
                plan.highlighted 
                  ? 'border-2 border-primary shadow-large scale-105' 
                  : 'border-border'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-hero text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </div>
              
              <Button 
                className={`w-full mb-6 ${
                  plan.highlighted 
                    ? 'bg-gradient-hero' 
                    : ''
                }`}
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
              
              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;