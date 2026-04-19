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

export default function App() {
  return (
    <div className="scroll-smooth">
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
       <DemoBanner /> 
      <WhatsAppButton />
    </div>
  );
}
