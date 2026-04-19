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
import { useEffect } from "react";

export default function App() {
  useTrackVisit();
  return (
    <>
    <DemoBanner />
    <div className="scroll-smooth"
    style={{
      top: 25,
    }}>
      <Navbar />
           <Analytics />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <GallerySection />
      <OffersSection />
      <ReviewsSection />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </div>
    </>
  );
}
