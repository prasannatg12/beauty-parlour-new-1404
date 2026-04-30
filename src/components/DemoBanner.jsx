// DemoBanner.jsx
import React from "react";

const DemoBanner = () => {
  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "50%",
      background: "#0006",
      color: "#fff",
      textAlign: "center",
      padding: "8px",
      fontSize: "14px",
      fontWeight: "bold",
      textShadow: "0px 0px 4px #000",
      borderTopLeftRadius: "15px",
      borderTopRightRadius: "15px",
      zIndex: 9999
    }}>
      Demo Version – Developed by FReshUIT | Not for Public Use
    </div>
  );
};

export default DemoBanner;