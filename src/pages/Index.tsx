import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import FeaturedVenuesSection from "@/components/FeaturedVenuesSection";
import MarqueeBanner from "@/components/MarqueeBanner";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = "SHOCASE - Professional EPKs for Musicians";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Create professional Electronic Press Kits in minutes with SHOCASE. Upload photos, add bios, streaming links, and tour dates. Get shareable landing pages and downloadable PDFs with AI assistance.');
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-dark">
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <FeaturedVenuesSection />
      <FeaturesSection />
      <MarqueeBanner />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;