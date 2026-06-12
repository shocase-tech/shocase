import showcaseLogo from "@/assets/newlogo.svg";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <img
              src={showcaseLogo}
              alt="Shocase"
              className="h-8 w-auto mb-4"
            />
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Professional press kits, venue discovery, and outreach for
              independent artists.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              Product
            </p>
            <nav className="flex flex-col gap-3">
              <Link to="/venues" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                Venues
              </Link>
              <Link to="/epk" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                Press Kit
              </Link>
              <Link to="/outreach" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                Outreach
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              Company
            </p>
            <nav className="flex flex-col gap-3">
              <a
                href="mailto:shocase.artists@gmail.com"
                className="text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                Contact
              </a>
              <Link to="/privacy-policy" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-and-conditions" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                Terms & Conditions
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06]">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Shocase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
