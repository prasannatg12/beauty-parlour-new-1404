import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../hooks/supabaseClient";

/**
 * SmartSchoolForgotPassword Component
 * Renders a forgot password page with consistent branding and reset logic.
 */
const SmartSchoolForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  /**
   * Handles the password reset form submission.
   * Sends a reset link to the provided email address using Supabase Auth.
   */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        setMessage({ 
          type: "error", 
          text: error.message 
        });
      } else {
        setMessage({ 
          type: "success", 
          text: "A reset link has been sent to your email address." 
        });
        // Navigate to OTP verification page
        setTimeout(() => {
          navigate("/smartschool-verifyotp", { state: { email: email.trim() } });
        }, 2000);
      }
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: "An unexpected error occurred. Please try again later." 
      });
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
          {/* <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" width="72" height="72" rx="16" fill="#8A1ED3" shapeRendering="crispEdges"/>
              <path d="M40 18c-7.73 0-14 6.27-14 14v6h-2c-2.21 0-4 1.79-4 4v16c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V42c0-2.21-1.79-4-4-4h-2v-6c0-7.73-6.27-14-14-14zm0 4c5.52 0 10 4.48 10 10v6H30v-6c0-5.52 4.48-10 10-10zm0 28c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="white"/>
            </svg>
          </div> */}
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", letterSpacing: "-0.025em" }}>
            Forgot Password?
          </h1>
          {/* <p style={{ color: "#6B7280", marginTop: "8px", fontSize: "16px" }}>
            Please enter your email to reset your password
          </p> */}
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

        <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label style={{ display: "block", fontSize: "16px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              ENTER EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smartschool.edu"
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "1px solid #D1D5DB",
                borderRadius: "10px",
                fontSize: "16px",
                transition: "border-color 0.2s",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: loading ? "#A78BFA" : "#8A1ED3",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 6px -1px rgba(138, 30, 211, 0.2)"
            }}
          >
            {loading ? "Sending link..." : "Send Code"}
          </button>
        </form>

        <div style={{
          borderBottom: "1px solid #E5E7EB",
          margin: "32px 0"
        }}></div>

        <div style={{ textAlign: "center" }}>
          <Link to="/login" style={{ fontSize: "16px", color: "#8A1ED3", textDecoration: "none", fontWeight: "600" }}>
            BACK TO LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SmartSchoolForgotPassword;