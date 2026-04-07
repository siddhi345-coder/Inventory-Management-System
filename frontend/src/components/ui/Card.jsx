import React from "react";

export default function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`card-component ${className}`}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
