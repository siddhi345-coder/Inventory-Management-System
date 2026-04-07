import API from "./api";

export const getDashboardStats = async () => {
  try {
    const response = await API.get("/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error.response?.data || error.message;
  }
};

export const getRecentSales = async () => {
  try {
    const response = await API.get("/dashboard/activities");
    return response.data;
  } catch (error) {
    console.error("Error fetching recent sales:", error);
    throw error.response?.data || error.message;
  }
};

export const getTopProducts = async () => {
  try {
    const response = await API.get("/dashboard/top-products");
    return response.data;
  } catch (error) {
    console.error("Error fetching top products:", error);
    throw error.response?.data || error.message;
  }
};

export const getSalesChartData = async () => {
  try {
    const response = await API.get("/dashboard/sales-chart");
    return response.data;
  } catch (error) {
    console.error("Error fetching sales chart data:", error);
    throw error.response?.data || error.message;
  }
};

export const getSalesOverview = async () => {
  try {
    const response = await API.get("/dashboard/overview");
    return response.data;
  } catch (error) {
    console.error("Error fetching sales overview:", error);
    throw error.response?.data || error.message;
  }
};

