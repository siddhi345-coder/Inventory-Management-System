import React from "react";

export default function Table({ columns = [], data = [], className = "", style = {} }) {
  return (
    <div className={`table-wrapper ${className}`} style={{ overflowX: "auto", ...style }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  textAlign: "left",
                  padding: "14px 16px",
                  backgroundColor: "#f8fafc",
                  borderBottom: "2px solid #e2e8f0",
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex} style={{ borderBottom: "1px solid #e2e8f0" }}>
              {columns.map((column) => (
                <td key={column.key} style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
