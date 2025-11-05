import { Card } from "@/components/ui/card";
import { 
  Mic, 
  Brain, 
  BookOpen, 
  TrendingUp, 
  Receipt, 
  Users,
  BarChart3,
  MessageSquare,
  CloudDownload
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Smart Billing",
    description: "Predict items instantly with partial input or barcode scanning. Let AI handle the heavy lifting.",
    gradient: "bg-gradient-hero"
  },
  {
    icon: Mic,
    title: "Voice Commands",
    description: "Add items, check stock, and create bills using natural speech. Your voice is your keyboard.",
    gradient: "bg-gradient-accent"
  },
  {
    icon: BookOpen,
    title: "Digital Khata Book",
    description: "Traditional ledger meets modern tech. Track customer credit/debit with automatic reminders.",
    gradient: "bg-gradient-success"
  },
  {
    icon: TrendingUp,
    title: "Bhav Record (Mandi Style)",
    description: "Daily rate charts for commodities. Perfect for wholesale and agricultural businesses.",
    gradient: "bg-gradient-hero"
  },
  {
    icon: Receipt,
    title: "Smart Inventory",
    description: "Real-time stock management with low-stock alerts and automatic reorder suggestions.",
    gradient: "bg-gradient-accent"
  },
  {
    icon: BarChart3,
    title: "Profit Analytics",
    description: "Visual dashboards showing expenses, revenue, and profit margins at a glance.",
    gradient: "bg-gradient-success"
  },
  {
    icon: MessageSquare,
    title: "Pavilo Buddy AI",
    description: "Your 24/7 AI assistant for accounting queries, tax help, and business guidance.",
    gradient: "bg-gradient-hero"
  },
  {
    icon: CloudDownload,
    title: "Offline Sync",
    description: "Work without internet. All data syncs automatically when you're back online.",
    gradient: "bg-gradient-accent"
  },
  {
    icon: Users,
    title: "Role Management",
    description: "Set permissions for owners, employees, and accountants. Everyone sees what they need.",
    gradient: "bg-gradient-success"
  }
];

const Features = () => {
  return (
    <section className="py-20 px-6 bg-gradient-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Everything Your Business Needs
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for Indian businesses, from small shops to large mandis.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-medium transition-all duration-300 border-border hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.gradient} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;