import api from './api';

export const getPayruns = () => api.get('/payruns');
export const getPayrunById = (id) => api.get(`/payruns/${id}`);
export const createPayrun = (data) => api.post('/payruns', data);
export const computePayrun = (id) => api.post(`/payruns/${id}/compute`);
export const validatePayrun = (id) => api.post(`/payruns/${id}/validate`);
export const markPayrunPaid = (id) => api.post(`/payruns/${id}/mark-paid`);

export const getPayslips = (params) => api.get('/payslips', { params });
export const getPayslipById = (id) => api.get(`/payslips/${id}`);
export const getPayslipPDF = (id) => api.get(`/payslips/${id}/pdf`);
