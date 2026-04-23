import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../hooks/supabaseClient";

export default function SignupPage() {
  const [credentials, setCredentials] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email: credentials.email.trim(),
      password: credentials.password.trim(),
      options: {
        data: {
          full_name: credentials.fullName.trim(),
        },
      },
    });

    if (error) {
      let message = error.message;
      
      // Specifically catch rate limit errors
      if (error.status === 429 || error.message.includes("rate limit")) {
        message = "Email rate limit exceeded. Since this is a test, please create the user manually in the Supabase Dashboard or disable 'Confirm Email' in Auth Settings.";
      }
      
      if (error.message.includes("Email address is invalid")) {
        message = "Please enter a valid email address.";
      }
      
      setError(message);
      setLoading(false);
    } else {
      if (data?.session) {
        navigate("/admin");
      } else if (data?.user) {
        setSuccess(true);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50 px-4 pt-20">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Sign Up</h1>
          <p className="text-gray-500 text-sm mt-2">Create an account to manage the parlour</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl">
              Registration successful! Please check your email to confirm your account.
            </div>
            <Link to="/login" className="block text-pink-600 font-bold hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="John Doe"
                value={credentials.fullName}
                onChange={(e) => setCredentials({ ...credentials, fullName: e.target.value })}
              />
            </div>
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
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-pink-600 font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}