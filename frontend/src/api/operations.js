import api from './api';

export const getContracts = () => api.get('/contracts');
export const getContractById = (id) => api.get(`/contracts/${id}`);
export const createContract = (data) => api.post('/contracts', data);
export const updateContract = (id, data) => api.put(`/contracts/${id}`, data);

export const getAttendances = () => api.get('/attendance');
export const checkIn = () => api.post('/attendance/check-in');
export const checkOut = () => api.post('/attendance/check-out');

export const getTimeOffRequests = () => api.get('/leaves');
export const createTimeOffRequest = (data) => api.post('/leaves', data);
export const approveTimeOffRequest = (id) => api.put(`/leaves/${id}/approve`);
export const rejectTimeOffRequest = (id) => api.put(`/leaves/${id}/reject`);
