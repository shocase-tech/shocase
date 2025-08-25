import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import WizardPreview from "@/components/WizardPreview";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = "AI Press Kit Generator - Professional EPKs for Musicians";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Create professional Electronic Press Kits in minutes. Upload photos, add bios, streaming links, and tour dates. Get shareable landing pages and downloadable PDFs with AI assistance.');
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-dark">
      <HeroSection />
      <FeaturesSection />
      <WizardPreview />
    </main>
  );
};

export default Index;