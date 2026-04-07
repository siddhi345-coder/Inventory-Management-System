import API from "./api";

export const getCustomers = async () => {
  try {
    const response = await API.get("/customers");
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error.response?.data || error.message;
  }
};

export const getCustomerById = async (id) => {
  try {
    const response = await API.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw error.response?.data || error.message;
  }
};

export const addCustomer = async (customerData) => {
  try {
    const response = await API.post("/customers", customerData);
    return response.data;
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error.response?.data || error.message;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const response = await API.put(`/customers/${id}`, customerData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update customer';
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await API.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to delete customer';
  }
};