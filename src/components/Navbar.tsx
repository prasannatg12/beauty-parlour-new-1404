import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import siteData from "../data/site.json";
import supabase from "../hooks/supabaseClient";
import { User } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [salonName, setSalonName] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);

    const getSalon = async (userId: string) => {
      const { data } = await supabase.from("organization").select("name").eq("id", userId).single();
      if (data) setSalonName(data.name);
    };

    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      const loggedIn = !!session;
      setIsLoggedIn(loggedIn);
      if (session?.user) getSalon(session.user.id);
    });

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const loggedIn = !!session;
      setIsLoggedIn(loggedIn);
      if (session?.user) {
        getSalon(session.user.id);
      } else {
        setSalonName("");
      }
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
  ];

  const isLandingPage = location.pathname === "/";
  const isLoginPage = location.pathname === "/login";
  const isWebsitePage = location.pathname === "/web";
  const isSolid = (!isLandingPage && !isWebsitePage) || scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSolid ? "bg-white shadow-md py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        {(location.pathname.startsWith("/admin") || location.pathname.startsWith("/profile") || isWebsitePage) && (
          <Link to={isWebsitePage ? "/web" : "/"} className="flex flex-col leading-tight">
            <span
              className={`font-bold text-lg tracking-wide ${
                isSolid ? "text-pink-700" : "text-white"
              }`}
            >
              {isWebsitePage ? "Meena's Beauty Parlour" : (salonName || siteData.salon.name)}
            </span>
            <span
              className={`text-xs tracking-widest ${
                isSolid ? "text-pink-400" : "text-pink-200"
              }`}
            >
              THANJAVUR
            </span>
          </Link>
        )}

        <div className="flex items-center gap-4 md:gap-6">
          {isWebsitePage && links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`hidden md:block text-sm font-medium transition-colors hover:text-pink-500 ${
                isSolid ? "text-gray-700" : "text-white"
              }`}
            >
              {l.label}
            </a>
          ))}

          {isLoggedIn && !isLandingPage && !isLoginPage ? (
            <Link
              to="/profile"
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-pink-500 ${
                isSolid ? "text-gray-700" : "text-white"
              }`}
            >
              <User size={20} title="Profile" />
              Profile
            </Link>
          ) : !isLoggedIn && !isLoginPage && !isLandingPage && (
            <Link
              to="/login"
                className={`text-sm font-medium transition-colors hover:text-pink-500 ${
                  isSolid ? "text-gray-700" : "text-white"
                }`}
              >
              <User size={20} title="Admin Login" />
              Admin
            </Link>
          )}

          {isWebsitePage && (
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
      </div>

      {/* Mobile Menu Dropdown for Website */}
      {menuOpen && isWebsitePage && (
        <div className="md:hidden bg-white border-t shadow-lg px-4 py-4 space-y-3 animate-in slide-in-from-top duration-300">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block text-gray-700 font-medium hover:text-pink-600 py-1 border-b border-gray-50 last:border-0"
            >
              {l.label}
            </a>
          ))}
          {!isLoggedIn && (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block text-pink-600 font-bold py-1"
            >
              Admin Portal
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
