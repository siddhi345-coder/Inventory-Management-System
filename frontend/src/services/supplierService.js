import api from './api';

export const getSuppliers = async () => {
  const res = await api.get('/suppliers');
  return res.data;
};

export const addSupplier = async (data) => {
  const res = await api.post('/suppliers', data);
  return res.data;
};

export const updateSupplier = async (id, data) => {
  const res = await api.put(`/suppliers/${id}`, data);
  return res.data;
};

export const deleteSupplier = async (id) => {
  const res = await api.delete(`/suppliers/${id}`);
  return res.data;
};

export const getSupplierProducts = async (supplierId) => {
  const res = await api.get(`/suppliers/${supplierId}/products`);
  return res.data;
};

export const getProductSuppliers = async (productId) => {
  const res = await api.get(`/suppliers/products/${productId}/suppliers`);
  return res.data;
};
