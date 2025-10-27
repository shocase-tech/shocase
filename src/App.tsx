import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Outreach from "./pages/Outreach";
import Shows from "./pages/Shows";
import Venues from "./pages/Venues";
import VenuePage from "./pages/VenuePage";
import AccountSettings from "./pages/AccountSettings";
import SimplePublicProfile from "./pages/SimplePublicProfile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import RiderBuilder from "./pages/RiderBuilder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/epk" element={<Dashboard />} />
            <Route path="/outreach" element={<Outreach />} />
            <Route path="/shows" element={<Shows />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/venues/:slug" element={<VenuePage />} />
            <Route path="/account" element={<AccountSettings />} />
            <Route path="/rider" element={<RiderBuilder />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/:identifier" element={<SimplePublicProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
