import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../hooks/supabaseClient";
import { User as UserIcon, Save, ArrowLeft } from "lucide-react";

export default function ProfileEditPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProfileEditPage useEffect triggered"); // Added for debugging
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("Session data on profile edit:", session, sessionError);
        if (sessionError) throw sessionError;

        if (session?.user) {
          const currentUser = session.user;
          setUser(currentUser);
          setFormData({
            fullName: currentUser.user_metadata?.full_name || "",
            email: currentUser.email || "",
            password: "",
            confirmPassword: "",
          });
        } else { // No session found, redirect to login
          console.log("No session found for edit, redirecting to /login");
          navigate("/login");
          return;
        }
      } catch (err: any) {
        console.error("Profile edit fetch error:", err);
        setError(err.message || "An unexpected error occurred");
      } finally { // Ensure loading is false on success or error, but not during redirect
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading || (!user && !error)) { // Show loading if actively loading or waiting for redirect
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50 px-4 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const updates: { email?: string; password?: string; data?: { full_name: string } } = {};

      if (formData.email !== user.email) {
        updates.email = formData.email;
      }
      if (formData.fullName !== (user.user_metadata?.full_name || "")) {
        updates.data = { full_name: formData.fullName };
      }
      if (formData.password) {
        updates.password = formData.password;
      }

      if (Object.keys(updates).length > 0) {
        const { data, error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
        setUser(data.user); // Update local user state
        setSuccess("Profile updated successfully!");
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" })); // Clear password fields
      } else {
        setSuccess("No changes to save.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Should be covered by loading state, but kept as a final fallback

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50 px-4 pt-20">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <UserIcon className="mx-auto h-16 w-16 text-pink-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
          <p className="text-gray-500 text-sm mt-2">Update your personal information</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl text-center">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input type="email" name="email" value={formData.email} disabled className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 cursor-not-allowed focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password (optional)</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50">
            <Save size={20} /> {loading ? "Saving..." : "Save Changes"}
          </button>
          <Link to="/profile" className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-all hover:bg-gray-100">
            <ArrowLeft size={20} /> Back to Profile
          </Link>
        </form>
      </div>
    </div>
  );
}