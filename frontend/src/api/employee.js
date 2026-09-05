import api from './api';

export const getEmployees = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.department) params.append('department', filters.department);
  if (filters.status) params.append('status', filters.status);
  
  const response = await api.get(`/employees?${params.toString()}`);
  return response.data;
};

export const getEmployeeById = async (id) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

export const createEmployee = async (data) => {
  const response = await api.post('/employees', data);
  return response.data;
};

export const updateEmployee = async (id, data) => {
  const response = await api.put(`/employees/${id}`, data);
  return response.data;
};
