import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../hooks/supabaseClient";
import { User as UserIcon, Mail, Phone, Edit, LogOut, Store } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [salonName, setSalonName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  console.log("ProfilePage component rendered"); // Added for debugging

  useEffect(() => {
    console.log("ProfilePage useEffect triggered"); // Added for debugging
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log("Session data on profile fetch:", session, sessionError);
        if (sessionError) throw sessionError;
        if (session?.user) {
          setUser(session.user);
          
          // Fetch organization name linked to this user UID
          const { data: orgData } = await supabase
            .from("organization")
            .select("name")
            .eq("id", session.user.id)
            .single();
          
          if (orgData) setSalonName(orgData.name);
        } else {
          console.log("No session found, redirecting to /login");
          navigate("/login");
          return;
        }
      } catch (err: any) {
        console.error("Profile fetch error:", err);
        setError(err.message || "Failed to load user profile");
      } finally { // Ensure loading is false on success or error, but not during redirect
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]); // Dependency array includes navigate

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50 px-4 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
    }
    navigate("/");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50 px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-lg text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Should be covered by loading state, but kept as a final fallback
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50 px-4 pt-20">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <UserIcon className="mx-auto h-16 w-16 text-pink-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">{user.user_metadata?.full_name || user.email || "Your Profile"}</h1>
          <p className="text-gray-500 text-sm mt-2">Manage your account details</p>
        </div>

        <div className="space-y-4">
          {salonName && (
            <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-100">
              <Store size={20} className="text-pink-600" />
              <span className="text-pink-700 font-bold">{salonName}</span>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Mail size={20} className="text-gray-500" />
            <span className="text-gray-700">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Phone size={20} className="text-gray-500" />
              <span className="text-gray-700">{user.phone}</span>
            </div>
          )}
          <Link to="/profile/edit" className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition-all shadow-md">
            <Edit size={20} /> Edit Profile
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 border border-red-400 text-red-600 font-bold py-3 rounded-xl transition-all hover:bg-red-50">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}