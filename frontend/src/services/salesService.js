import API from "./api";

export const getAllProducts = async () => {
  try {
    const response = await API.get("/products");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await API.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createSale = async (saleData) => {
  try {
    const response = await API.post("/sales", saleData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to create sale';
  }
};

export const getSales = async (filters = {}) => {
  try {
    const response = await API.get("/sales", { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSaleById = async (id) => {
  try {
    const response = await API.get(`/sales/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCustomers = async () => {
  try {
    const response = await API.get("/customers");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
