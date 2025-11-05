import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroDashboard from "@/assets/hero-dashboard.jpg";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5 -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Billing</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Smart Billing for{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Modern India
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Pavilo combines cutting-edge AI with traditional Indian business practices. 
              From Khata Book to smart invoicing, manage your business with voice commands 
              and intelligent automation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-hero text-lg px-8 shadow-medium hover:shadow-large transition-all">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold text-foreground">10,000+</p>
                <p className="text-sm text-muted-foreground">Active Businesses</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="text-3xl font-bold text-foreground">99.9%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="text-3xl font-bold text-foreground">₹500Cr+</p>
                <p className="text-sm text-muted-foreground">Processed</p>
              </div>
            </div>
          </div>
          
          {/* Right image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
            <img 
              src={heroDashboard} 
              alt="Pavilo Dashboard" 
              className="relative rounded-2xl shadow-large border border-border"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;