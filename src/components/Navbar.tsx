import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Pavilo
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Features
            </a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors font-medium">
              Pricing
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Resources
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              About
            </a>
          </div>
          
          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-hero">Get Started</Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border space-y-4">
            <a href="#" className="block text-foreground hover:text-primary transition-colors font-medium">
              Features
            </a>
            <a href="#pricing" className="block text-foreground hover:text-primary transition-colors font-medium">
              Pricing
            </a>
            <a href="#" className="block text-foreground hover:text-primary transition-colors font-medium">
              Resources
            </a>
            <a href="#" className="block text-foreground hover:text-primary transition-colors font-medium">
              About
            </a>
            <div className="flex flex-col gap-2 pt-4">
              <Link to="/auth">
                <Button variant="ghost" className="w-full">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="w-full bg-gradient-hero">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;