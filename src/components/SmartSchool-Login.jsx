import React, { useState } from "react";
import { Link } from "react-router-dom";

/**
 * SmartSchoolLogin Component
 * Renders a login page with a specific background color and professional layout.
 */
const SmartSchoolLogin = () => {
  const [selectedContext, setSelectedContext] = useState("Super-Admin Login");
  const [showPassword, setShowPassword] = useState(false);

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
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">              <g>
                <rect x="2" width="72" height="72" rx="16" fill="#8A1ED3" shapeRendering="crispEdges"/>
                <path d="M38 14L20 22V34C20 45.1 27.68 55.48 38 58C48.32 55.48 56 45.1 56 34V22L38 14ZM38 21.8C39.1867 21.8 40.3467 22.1519 41.3334 22.8112C42.3201 23.4705 43.0892 24.4075 43.5433 25.5039C43.9974 26.6003 44.1162 27.8067 43.8847 28.9705C43.6532 30.1344 43.0818 31.2035 42.2426 32.0426C41.4035 32.8818 40.3344 33.4532 39.1705 33.6847C38.0067 33.9162 36.8003 33.7974 35.7039 33.3433C34.6075 32.8892 33.6705 32.1201 33.0112 31.1334C32.3519 30.1467 32 28.9867 32 27.8C32 26.2087 32.6321 24.6826 33.7574 23.5574C34.8826 22.4321 36.4087 21.8 38 21.8ZM38 37.6C42 37.6 50 39.78 50 43.76C48.6865 45.7402 46.9033 47.3646 44.8095 48.4883C42.7156 49.612 40.3763 50.2001 38 50.2001C35.6237 50.2001 33.2844 49.612 31.1905 48.4883C29.0967 47.3646 27.3135 45.7402 26 43.76C26 39.78 34 37.6 38 37.6Z" fill="white"/>
              </g>
            </svg>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", letterSpacing: "-0.025em" }}>
            Super Admin Portal
          </h1>
          <p style={{ color: "#6B7280", marginTop: "8px", fontSize: "16px" }}>
            Please select your login context below
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
          {[
            "Super-Admin Login",
            "Super-Admin-Team Login",
            "Finance Manager Login",
          ].map((label) => (
            <div
              key={label}
              onClick={() => setSelectedContext(label)}
              style={{
                padding: "14px 20px",
                borderRadius: "10px",
                border: "2px solid",
                borderColor: selectedContext === label ? "#8A1ED3" : "#E5E7EB",
                backgroundColor: selectedContext === label ? "#FBF5FF" : "#ffffff",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontWeight: "600",
                color: selectedContext === label ? "#8A1ED3" : "#6B7280",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}
            >
              {label === "Super-Admin Login" && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 4.9C12.5933 4.9 13.1734 5.07595 13.6667 5.40559C14.1601 5.73524 14.5446 6.20377 14.7716 6.75195C14.9987 7.30013 15.0581 7.90333 14.9424 8.48527C14.8266 9.06721 14.5409 9.60176 14.1213 10.0213C13.7018 10.4409 13.1672 10.7266 12.5853 10.8424C12.0033 10.9581 11.4001 10.8987 10.8519 10.6716C10.3038 10.4446 9.83524 10.0601 9.50559 9.56671C9.17595 9.07336 9 8.49334 9 7.9C9 7.10435 9.31607 6.34129 9.87868 5.77868C10.4413 5.21607 11.2044 4.9 12 4.9ZM12 12.8C14 12.8 18 13.89 18 15.88C17.3432 16.8701 16.4516 17.6823 15.4047 18.2442C14.3578 18.806 13.1881 19.1 12 19.1C10.8119 19.1 9.64218 18.806 8.59527 18.2442C7.54836 17.6823 6.65677 16.8701 6 15.88C6 13.89 10 12.8 12 12.8Z" fill={selectedContext === label ? "#8A1ED3" : "#6B7280"} />
                </svg>
              )}
              {label === "Super-Admin-Team Login" && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 22C15.6167 22 14.4377 21.5123 13.463 20.537C12.4883 19.5617 12.0007 18.3827 12 17C11.9993 15.6173 12.487 14.4383 13.463 13.463C14.439 12.4877 15.618 12 17 12C18.382 12 19.5613 12.4877 20.538 13.463C21.5147 14.4383 22.002 15.6173 22 17C21.998 18.3827 21.5103 19.562 20.537 20.538C19.5637 21.514 18.3847 22.0013 17 22ZM12 22C9.68333 21.4167 7.77067 20.0873 6.262 18.012C4.75333 15.9367 3.99933 13.6327 4 11.1V5L12 2L20 5V10.675C19.5667 10.4583 19.079 10.2917 18.537 10.175C17.995 10.0583 17.4827 10 17 10C15.0667 10 13.4167 10.6833 12.05 12.05C10.6833 13.4167 10 15.0667 10 17C10 18.0333 10.196 18.9667 10.588 19.8C10.98 20.6333 11.4757 21.3583 12.075 21.975C12.0583 21.975 12.046 21.9793 12.038 21.988C12.03 21.9967 12.0173 22.0007 12 22ZM18.063 16.563C18.3543 16.271 18.5 15.9167 18.5 15.5C18.5 15.0833 18.3543 14.7293 18.063 14.438C17.7717 14.1467 17.4173 14.0007 17 14C16.5827 13.9993 16.2287 14.1453 15.938 14.438C15.6473 14.7307 15.5013 15.0847 15.5 15.5C15.4987 15.9153 15.6447 16.2697 15.938 16.563C16.2313 16.8563 16.5853 17.002 17 17C17.4147 16.998 17.769 16.8523 18.063 16.563ZM17 20C17.5167 20 17.9917 19.879 18.425 19.637C18.8583 19.395 19.2083 19.0743 19.475 18.675C19.1083 18.4583 18.7167 18.2917 18.3 18.175C17.8833 18.0583 17.45 18 17 18C16.55 18 16.1167 18.0583 15.7 18.175C15.2833 18.2917 14.8917 18.4583 14.525 18.675C14.7917 19.075 15.1417 19.396 15.575 19.638C16.0083 19.88 16.4833 20.0007 17 20Z" fill={selectedContext === label ? "#8A1ED3" : "#6B7280"} />
                </svg>
              )}
              {label === "Finance Manager Login" && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 13C13.1667 13 12.4583 12.7083 11.875 12.125C11.2917 11.5417 11 10.8333 11 10C11 9.16667 11.2917 8.45833 11.875 7.875C12.4583 7.29167 13.1667 7 14 7C14.8333 7 15.5417 7.29167 16.125 7.875C16.7083 8.45833 17 9.16667 17 10C17 10.8333 16.7083 11.5417 16.125 12.125C15.5417 12.7083 14.8333 13 14 13ZM7 16C6.45 16 5.97933 15.8043 5.588 15.413C5.19667 15.0217 5.00067 14.5507 5 14V6C5 5.45 5.196 4.97933 5.588 4.588C5.98 4.19667 6.45067 4.00067 7 4H21C21.55 4 22.021 4.196 22.413 4.588C22.805 4.98 23.0007 5.45067 23 6V14C23 14.55 22.8043 15.021 22.413 15.413C22.0217 15.805 21.5507 16.0007 21 16H7ZM9 14H19C19 13.45 19.196 12.9793 19.588 12.588C19.98 12.1967 20.4507 12.0007 21 12V8C20.45 8 19.9793 7.80433 19.588 7.413C19.1967 7.02167 19.0007 6.55067 19 6H9C9 6.55 8.80433 7.021 8.413 7.413C8.02167 7.805 7.55067 8.00067 7 8V12C7.55 12 8.021 12.196 8.413 12.588C8.805 12.98 9.00067 13.4507 9 14ZM19 20H3C2.45 20 1.97933 19.8043 1.588 19.413C1.19667 19.0217 1.00067 18.5507 1 18V8C1 7.71667 1.096 7.47933 1.288 7.288C1.48 7.09667 1.71733 7.00067 2 7C2.28267 6.99933 2.52033 7.09533 2.713 7.288C2.90567 7.48067 3.00133 7.718 3 8V18H19C19.2833 18 19.521 18.096 19.713 18.288C19.905 18.48 20.0007 18.7173 20 19C19.9993 19.2827 19.9033 19.5203 19.712 19.713C19.5207 19.9057 19.2833 20.0013 19 20Z" fill={selectedContext === label ? "#8A1ED3" : "#6B7280"} />
                </svg>
              )}
              {label}
            </div>
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "16px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              ENTER EMAIL
            </label>
            <input
              type="email"
              placeholder="admin@smartschool.edu"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #D1D5DB",
                borderRadius: "10px",
                fontSize: "16px",
                transition: "border-color 0.2s",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "16px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              ENTER PASSWORD
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  paddingRight: "46px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "10px",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "#9CA3AF"
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 640 512" fill="currentColor">
                    <path d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 576 512" fill="currentColor">
                    <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z" />
                  </svg>
                )}
              </div>
            </div>
            <div style={{ textAlign: "right", marginTop: "8px" }}>
              <Link
                to="/smartschool-forgotpassword"
                style={{ fontSize: "16px", color: "#8A1ED3", textDecoration: "none", fontWeight: "600" }}
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#8A1ED3",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "10px",
              boxShadow: "0 4px 6px -1px rgba(138, 30, 211, 0.2)"
            }}
          >
            Login as {selectedContext.replace(' Login', '')}
          </button>
        </form>

        {/* Separator Line */}
        <div style={{
          borderBottom: "1px solid #E5E7EB",
          margin: "32px 0"
        }}></div>

        {/* School Administrator Portal Link */}
        <div style={{ textAlign: "center" }}>
          <a href="#" style={{ fontSize: "16px", color: "#8A1ED3", textDecoration: "none", fontWeight: "600" }}>
            SCHOOL ADMINISTRATOR PORTAL →
          </a>
        </div>

      </div>
    </div>
  );
};

export default SmartSchoolLogin;