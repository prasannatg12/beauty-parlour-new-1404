import { useState, useEffect } from "react";
import siteData from "../data/site.json";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Gallery", href: "#gallery" },
    { label: "Offers", href: "#offers" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={`fixed top-9 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <a href="#hero" className="flex flex-col leading-tight">
          <span
            className={`font-bold text-lg tracking-wide ${
              scrolled ? "text-pink-700" : "text-white"
            }`}
          >
            {siteData.salon.name}
          </span>
          <span
            className={`text-xs tracking-widest ${
              scrolled ? "text-pink-400" : "text-pink-200"
            }`}
          >
            THANJAVUR
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-pink-500 ${
                scrolled ? "text-gray-700" : "text-white"
              }`}
            >
              {l.label}
            </a>
          ))}
          {/* <a
            href="#booking"
            className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
          >
            Book Now
          </a> */}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-6 transition-colors ${
                scrolled ? "bg-gray-700" : "bg-white"
              }`}
            />
            <span
              className={`block h-0.5 w-6 transition-colors ${
                scrolled ? "bg-gray-700" : "bg-white"
              }`}
            />
            <span
              className={`block h-0.5 w-6 transition-colors ${
                scrolled ? "bg-gray-700" : "bg-white"
              }`}
            />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg px-4 py-4 space-y-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block text-gray-700 font-medium hover:text-pink-600 py-1"
            >
              {l.label}
            </a>
          ))}
          {/* <a
            href="#booking"
            onClick={() => setMenuOpen(false)}
            className="block bg-pink-600 text-white text-center font-semibold px-5 py-2 rounded-full"
          >
            Book Now
          </a> */}
        </div>
      )}
    </nav>
  );
}
