import { Link } from "react-router-dom";

export default function NewLandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-rose-600 to-purple-700 p-4">
      <div className="text-center space-y-8 bg-white/10 backdrop-blur-md p-8 md:p-16 rounded-[40px] border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-700">
        <div className="space-y-4">
          <p className="text-lg md:text-2xl text-pink-100 font-light tracking-wide max-w-lg mx-auto">
            Your professional dashboard for salon management and client appointments.
          </p>
        </div>
        
        <Link
          to="/login"
          className="inline-block bg-white text-pink-600 px-12 py-5 rounded-full font-bold text-xl hover:bg-pink-50 transition-all transform hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
        >
          Login to Portal
        </Link>
      </div>
    </div>
  );
}