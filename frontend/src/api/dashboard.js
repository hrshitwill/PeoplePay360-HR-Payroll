import api from './api';

export const getDashboardData = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.periodStart) params.append('periodStart', filters.periodStart);
  if (filters.periodEnd) params.append('periodEnd', filters.periodEnd);
  if (filters.department) params.append('department', filters.department);
  if (filters.employeeType) params.append('employeeType', filters.employeeType);
  
  const response = await api.get(`/dashboard?${params.toString()}`);
  return response.data;
};
