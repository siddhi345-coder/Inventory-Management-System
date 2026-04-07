import api from './api';

export const getPurchases = async () => {
  try {
    const response = await api.get('/purchases');
    return response.data;
  } catch (error) {
    console.error('Error fetching purchases:', error);
    throw error;
  }
};

export const getPurchaseById = async (id) => {
  try {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase:', error);
    throw error;
  }
};

export const createPurchase = async (purchaseData) => {
  try {
    const response = await api.post('/purchases', purchaseData);
    return response.data;
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw error;
  }
};

export const getSuppliers = async () => {
  try {
    const response = await api.get('/suppliers');
    return response.data;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }
};
