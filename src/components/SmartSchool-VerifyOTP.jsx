import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import supabase from "../hooks/supabaseClient";

/**
 * SmartSchoolVerifyOTP Component
 * Handles the 6-digit OTP verification for password recovery.
 */
const SmartSchoolVerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || !email) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "OTP Verified! Redirecting to dashboard..." });
        // Navigation to dashboard or reset password page would go here
        setTimeout(() => navigate("/admin"), 1500);
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "#F9FAFC",
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Poppins', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "567px",
        padding: "40px",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        border: "1px solid #E5E7EB"
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", letterSpacing: "-0.025em" }}>
            Verify OTP
          </h1>
          <p style={{ color: "#6B7280", marginTop: "8px", fontSize: "16px" }}>
            Enter the 6-digit code sent to {email || "your email"}
          </p>
        </div>

        {message && (
          <div style={{
            padding: "14px",
            borderRadius: "10px",
            marginBottom: "24px",
            fontSize: "14px",
            textAlign: "center",
            backgroundColor: message.type === "success" ? "#F0FDF4" : "#FEF2F2",
            color: message.type === "success" ? "#166534" : "#991B1B",
            border: `1px solid ${message.type === "success" ? "#BBF7D0" : "#FECACA"}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleVerifyOTP} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label style={{ display: "block", fontSize: "16px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              ENTER CODE
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="••••••"
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "1px solid #D1D5DB",
                borderRadius: "10px",
                fontSize: "24px",
                textAlign: "center",
                letterSpacing: "12px",
                fontWeight: "700",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: (loading || otp.length !== 6) ? "#A78BFA" : "#8A1ED3",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: (loading || otp.length !== 6) ? "not-allowed" : "pointer",
              boxShadow: "0 4px 6px -1px rgba(138, 30, 211, 0.2)"
            }}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div style={{ borderBottom: "1px solid #E5E7EB", margin: "32px 0" }}></div>

        <div style={{ textAlign: "center" }}>
          <Link to="/login" style={{ fontSize: "16px", color: "#8A1ED3", textDecoration: "none", fontWeight: "600" }}>
            BACK TO LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SmartSchoolVerifyOTP;