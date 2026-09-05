import { api } from '../api';

export const getExplainPayslip = (payslipId) => fetch(`/api/ai/explain-payslip/${payslipId}`, {
  headers: { "Authorization": `Bearer ${api.getToken()}` }
}).then(res => res.json());

export const getPayrollAnomalies = (payrunId) => fetch(`/api/ai/anomalies${payrunId ? `?payrunId=${payrunId}` : ''}`, {
  headers: { "Authorization": `Bearer ${api.getToken()}` }
}).then(res => res.json());

export const runPayrollSimulation = (data) => fetch('/api/ai/simulate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${api.getToken()}`
  },
  body: JSON.stringify(data)
}).then(res => res.json());
