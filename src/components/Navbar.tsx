import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import siteData from "../data/site.json";
import supabase from "../hooks/supabaseClient";
import { User } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);

    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      subscription.unsubscribe();
    };
  }, []);

  const links = [
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Gallery", href: "#gallery" },
    { label: "Offers", href: "#offers" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "#contact" },
    { label: "Admin", href: "/login" },
  ];

  const isLandingPage = location.pathname === "/";
  const isLoginPage = location.pathname === "/login";
  const isSolid = !isLandingPage || scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSolid ? "bg-white shadow-md py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-tight">
          <span
            className={`font-bold text-lg tracking-wide ${
              isSolid ? "text-pink-700" : "text-white"
            }`}
          >
            {siteData.salon.name}
          </span>
          <span
            className={`text-xs tracking-widest ${
              isSolid ? "text-pink-400" : "text-pink-200"
            }`}
          >
            THANJAVUR
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {!isLoggedIn && !isLoginPage && links.map((l) => (
            l.href.startsWith("#") ? (
              <a
                key={l.href}
                href={`/${l.href}`} // Prepend / to make it absolute to root
                className={`text-sm font-medium transition-colors hover:text-pink-500 ${
                  isSolid ? "text-gray-700" : "text-white"
                }`}
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                to={l.href}
                className={`text-sm font-medium transition-colors hover:text-pink-500 ${
                  isSolid ? "text-gray-700" : "text-white"
                }`}
              >
              {l.label === "Admin" ? <User size={20} title="Admin Portal" /> : l.label}
              </Link>
            )
          ))}
          {/* <a
            href="#booking"
            className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
          >
            Book Now
          </a> */}
        </div>

        {!isLoggedIn && (
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5">
              <span
                className={`block h-0.5 w-6 transition-colors ${
                  isSolid ? "bg-gray-700" : "bg-white"
                }`}
              />
              <span
                className={`block h-0.5 w-6 transition-colors ${
                  isSolid ? "bg-gray-700" : "bg-white"
                }`}
              />
              <span
                className={`block h-0.5 w-6 transition-colors ${
                  isSolid ? "bg-gray-700" : "bg-white"
                }`}
              />
            </div>
          </button>
        )}
      </div>

      {menuOpen && !isLoggedIn && !isLoginPage && (
        <div className="md:hidden bg-white border-t shadow-lg px-4 py-4 space-y-3">
          {links.map((l) => (
            l.href.startsWith("#") ? (
              <a
                key={l.href}
                    href={`/${l.href}`} // Prepend / to make it absolute to root
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 font-medium hover:text-pink-600 py-1"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 font-medium hover:text-pink-600 py-1"
              >
                {l.label === "Admin" ? <User size={20} className="inline" /> : l.label}
              </Link>
            )
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
