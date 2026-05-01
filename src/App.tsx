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
import ProfilePage from "./pages/ProfilePage";
import ProfileEditPage from "./pages/ProfileEditPage";
import NewLandingPage from "./pages/NewLandingPage";

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

  const WebsitePage = () => (
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

  if (checkingAuth) {
    return null; // Or a loading spinner if preferred
  }

  return (
    <Router>
      <div className="scroll-smooth">
        <Navbar />
        <Analytics />
        <Routes>
          <Route path="/" element={session ? <Navigate to="/admin" replace /> : <NewLandingPage />} />
          <Route path="/login" element={session ? <Navigate to="/admin" replace /> : <LoginPage />} />
          <Route path="/signup" element={session ? <Navigate to="/admin" replace /> : <SignupPage />} />
          <Route path="/web" element={<WebsitePage />} />

          <Route path="/admin" element={session ? <AdminPage /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={session ? <ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="/profile/edit" element={session ? <ProfileEditPage /> : <Navigate to="/login" replace />} />
        </Routes>

        <div className="fixed bottom-0 left-0 w-1/2 z-[100]">
          {/* <DemoBanner /> */}
        </div>
        {/* <WhatsAppButton /> */}
      </div>
    </Router>
  );
}
