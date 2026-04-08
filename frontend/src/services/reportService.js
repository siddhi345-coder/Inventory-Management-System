const REPORTS_BASE = import.meta.env.VITE_REPORTS_URL || "/reports-api";

// Fetch sales JSON summary from the Python microservice
export const getSalesReport = async () => {
  const res = await fetch(`${REPORTS_BASE}/reports/sales`);
  if (!res.ok) throw new Error("Failed to fetch sales report");
  return res.json();
};

// Trigger Excel download
export const downloadExcel = () => {
  window.open(`${REPORTS_BASE}/reports/sales/excel`, "_blank");
};

// Trigger PDF download
export const downloadPDF = () => {
  window.open(`${REPORTS_BASE}/reports/sales/pdf`, "_blank");
};
