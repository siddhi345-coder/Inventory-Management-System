import React from "react";

export default function Input({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  className = "",
  style = {},
  ...props
}) {
  return (
    <div className={`input-group ${className}`} style={{ display: "flex", flexDirection: "column", gap: "8px", ...style }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: "14px", fontWeight: 600, color: "#2d3748" }}>
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          padding: "12px 14px",
          borderRadius: "8px",
          border: "1px solid #cbd5e0",
          fontSize: "14px",
          outline: "none",
        }}
        {...props}
      />
    </div>
  );
}
