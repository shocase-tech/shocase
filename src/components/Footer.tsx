import showcaseLogo from "@/assets/newlogo.svg";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-glass">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left - Logo */}
          <div className="flex items-center">
            <img 
              src={showcaseLogo} 
              alt="Shocase" 
              className="h-8 w-auto"
            />
          </div>

          {/* Center - Copyright & Privacy */}
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-1">
              © 2025 Shocase. All rights reserved.
            </p>
            <Link 
              to="/privacy-policy"
              className="text-muted-foreground text-sm hover:text-primary transition-colors duration-200"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Right - Contact */}
          <div className="text-center md:text-right">
            <a 
              href="mailto:shocase.artists@gmail.com"
              className="text-foreground text-sm font-medium hover:text-primary transition-colors duration-200"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
