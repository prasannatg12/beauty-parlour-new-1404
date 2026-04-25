import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import supabase from "./hooks/supabaseClient";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import GallerySection from "@/components/GallerySection";
import OffersSection from "@/components/OffersSection";
import ReviewsSection from "@/components/ReviewsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import DemoBanner from "@/components/DemoBanner";
import { Analytics } from "@vercel/analytics/react";
import useTrackVisit from "./hooks/trackVisit.js";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  useTrackVisit();
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingAuth(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const LandingPage = () => {
    if (!checkingAuth && session) {
      return <Navigate to="/admin" replace />;
    }

    return (
      <>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <GallerySection />
        <OffersSection />
        <ReviewsSection />
        <ContactSection />
        <Footer />
      </>
    );
  };

  return (
    <Router>
      <div className="scroll-smooth">
        <Navbar />
        <Analytics />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>

        <div className="fixed bottom-0 left-0 w-1/2 z-[100]">
          <DemoBanner />
        </div>
        <WhatsAppButton />
      </div>
    </Router>
  );
}
