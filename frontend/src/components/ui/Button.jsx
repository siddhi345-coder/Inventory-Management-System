import React from "react";

export default function Button({
  type = "button",
  onClick,
  text,
  children,
  className = "",
  style = {},
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`button-component ${className}`}
      style={{
        padding: "10px 16px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: disabled ? "#94a3b8" : "#667eea",
        color: "#ffffff",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 600,
        ...style,
      }}
      disabled={disabled}
      {...props}
    >
      {text || children}
    </button>
  );
}
