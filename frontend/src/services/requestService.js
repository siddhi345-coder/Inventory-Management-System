import API from './api';

export const submitRequest = (data) => API.post('/requests', data).then(r => r.data);
export const getMyRequests = () => API.get('/requests/my').then(r => r.data);
export const getAllRequests = () => API.get('/requests').then(r => r.data);
export const updateRequestStatus = (id, status) => API.patch(`/requests/${id}/status`, { status }).then(r => r.data);
