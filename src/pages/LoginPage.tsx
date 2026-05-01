import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../hooks/supabaseClient";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password.trim(),
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate("/admin");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative"
      // style={{background:"#0000"}}
      // style={{ backgroundImage: "url('../../public/gallery/ai-generated-composition-of-beauty-and-make-up-cosmetics-on-pink-studio-background-photo.jpg')" }}
    >
      {/* Soft overlay to ensure form legibility against the detailed beauty background */}
      <div className="absolute inset-0 bg-pink-900/10 backdrop-blur-[100px]"></div>

      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl relative z-10 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-2">Enter your credentials to access the portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="admin@example.com"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          {/* <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/signup" className="text-pink-600 font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </div> */}
        </form>
      </div>
    </div>
  );
}