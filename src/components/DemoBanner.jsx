// DemoBanner.jsx
import React from "react";

const DemoBanner = () => {
  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      width: "100%",
      background: "#000",
      color: "#fff",
      textAlign: "center",
      padding: "8px",
      fontSize: "14px",
      zIndex: 9999
    }}>
      Demo Version – Developed by Prasanna TG | Not for Public Use
    </div>
  );
};

export default DemoBanner;