/**
 * PeoplePay360 Frontend API Client with JWT Authentication
 */

const API_BASE = "/api";

const getToken = () => localStorage.getItem("pp360_token");

const authHeaders = () => {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP Error ${res.status}`);
  }
  return data;
};

export const api = {
  // Token management
  getToken,
  setToken: (token) => localStorage.setItem("pp360_token", token),
  removeToken: () => localStorage.removeItem("pp360_token"),

  // Auth & JWT endpoints
  register: (name, email, password, role) =>
    fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    }).then(handleResponse),

  login: (email, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    }).then(handleResponse),

  demoLogin: (role) =>
    fetch(`${API_BASE}/auth/demo-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: authHeaders()
    }).then(handleResponse),

  getRoles: () => fetch(`${API_BASE}/auth/roles`).then(handleResponse),

  // Health & Seed
  checkHealth: () => fetch(`${API_BASE}/health`).then(handleResponse),
  reseedDatabase: () =>
    fetch(`${API_BASE}/seed/run`, {
      method: "POST",
      headers: authHeaders()
    }).then(handleResponse),

  // Dashboard
  getDashboardMetrics: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/dashboard?${qs}`, {
      headers: authHeaders()
    }).then(handleResponse);
  },

  // Employees
  getEmployees: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/employees?${qs}`, {
      headers: authHeaders()
    }).then(handleResponse);
  },
  getEmployeeById: (id) =>
    fetch(`${API_BASE}/employees/${id}`, {
      headers: authHeaders()
    }).then(handleResponse),
  createEmployee: (payload) =>
    fetch(`${API_BASE}/employees`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),
  updateEmployee: (id, payload) =>
    fetch(`${API_BASE}/employees/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),
  deleteEmployee: (id) =>
    fetch(`${API_BASE}/employees/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    }).then(handleResponse),

  // Contracts
  getContracts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/contracts?${qs}`, {
      headers: authHeaders()
    }).then(handleResponse);
  },
  getContractById: (id) =>
    fetch(`${API_BASE}/contracts/${id}`, {
      headers: authHeaders()
    }).then(handleResponse),
  createContract: (payload) =>
    fetch(`${API_BASE}/contracts`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),
  updateContract: (id, payload) =>
    fetch(`${API_BASE}/contracts/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),
  deleteContract: (id) =>
    fetch(`${API_BASE}/contracts/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    }).then(handleResponse),

  // Working Schedules
  getSchedules: () =>
    fetch(`${API_BASE}/schedules`, {
      headers: authHeaders()
    }).then(handleResponse),
  getScheduleById: (id) =>
    fetch(`${API_BASE}/schedules/${id}`, {
      headers: authHeaders()
    }).then(handleResponse),
  createSchedule: (payload) =>
    fetch(`${API_BASE}/schedules`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),
  updateSchedule: (id, payload) =>
    fetch(`${API_BASE}/schedules/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  // Attendance
  getAttendance: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/attendance?${qs}`, {
      headers: authHeaders()
    }).then(handleResponse);
  },
  getAttendanceStats: () =>
    fetch(`${API_BASE}/attendance/stats`, {
      headers: authHeaders()
    }).then(handleResponse),
  clockIn: (employeeId) =>
    fetch(`${API_BASE}/attendance/clock-in`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ employeeId })
    }).then(handleResponse),
  clockOut: (employeeId) =>
    fetch(`${API_BASE}/attendance/clock-out`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ employeeId })
    }).then(handleResponse),
  correctAttendance: (id, payload) =>
    fetch(`${API_BASE}/attendance/${id}/correct`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),
  createAttendance: (payload) =>
    fetch(`${API_BASE}/attendance/manual`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  // Time Off
  getTimeOffTypes: () =>
    fetch(`${API_BASE}/timeoff/types`, {
      headers: authHeaders()
    }).then(handleResponse),
  createTimeOffType: (payload) =>
    fetch(`${API_BASE}/timeoff/types`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),
  getAllocations: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/timeoff/allocations?${qs}`, {
      headers: authHeaders()
    }).then(handleResponse);
  },
  createAllocation: (payload) =>
    fetch(`${API_BASE}/timeoff/allocations`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),
  approveAllocation: (id, approvedBy) =>
    fetch(`${API_BASE}/timeoff/allocations/${id}/approve`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ approvedBy })
    }).then(handleResponse),
  refuseAllocation: (id) =>
    fetch(`${API_BASE}/timeoff/allocations/${id}/refuse`, {
      method: "PUT",
      headers: authHeaders()
    }).then(handleResponse),
  getLeaveRequests: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/timeoff/requests?${qs}`, {
      headers: authHeaders()
    }).then(handleResponse);
  },
  createLeaveRequest: (payload) =>
    fetch(`${API_BASE}/timeoff/requests`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),
  approveLeaveRequest: (id, approvedBy) =>
    fetch(`${API_BASE}/timeoff/requests/${id}/approve`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ approvedBy })
    }).then(handleResponse),
  refuseLeaveRequest: (id, rejectionReason) =>
    fetch(`${API_BASE}/timeoff/requests/${id}/refuse`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ rejectionReason })
    }).then(handleResponse),
  getEmployeeBalances: (employeeId) =>
    fetch(`${API_BASE}/timeoff/balances/${employeeId}`, {
      headers: authHeaders()
    }).then(handleResponse),

  // Salary Rules & Structures
  getSalaryRules: () =>
    fetch(`${API_BASE}/salary-rules`, {
      headers: authHeaders()
    }).then(handleResponse),
  createSalaryRule: (payload) =>
    fetch(`${API_BASE}/salary-rules`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),
  updateSalaryRule: (id, payload) =>
    fetch(`${API_BASE}/salary-rules/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),
  getSalaryStructures: () =>
    fetch(`${API_BASE}/salary-structures`, {
      headers: authHeaders()
    }).then(handleResponse),
  getSalaryStructureById: (id) =>
    fetch(`${API_BASE}/salary-structures/${id}`, {
      headers: authHeaders()
    }).then(handleResponse),
  createSalaryStructure: (payload) =>
    fetch(`${API_BASE}/salary-structures`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),
  updateSalaryStructure: (id, payload) =>
    fetch(`${API_BASE}/salary-structures/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  // Payruns & Wizard
  getEligibleEmployees: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/payruns/eligible-employees?${qs}`, {
      headers: authHeaders()
    }).then(handleResponse);
  },
  getPayruns: () =>
    fetch(`${API_BASE}/payruns`, {
      headers: authHeaders()
    }).then(handleResponse),
  getPayrunById: (id) =>
    fetch(`${API_BASE}/payruns/${id}`, {
      headers: authHeaders()
    }).then(handleResponse),
  createPayrun: (payload) =>
    fetch(`${API_BASE}/payruns`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),
  computePayrun: (id) =>
    fetch(`${API_BASE}/payruns/${id}/compute`, {
      method: "POST",
      headers: authHeaders()
    }).then(handleResponse),
  validatePayrun: (id, validationNotes) =>
    fetch(`${API_BASE}/payruns/${id}/validate`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ validationNotes })
    }).then(handleResponse),
  markPayrunPaid: (id) =>
    fetch(`${API_BASE}/payruns/${id}/mark-paid`, {
      method: "POST",
      headers: authHeaders()
    }).then(handleResponse),
  sendBulkPayslipEmails: (id) =>
    fetch(`${API_BASE}/payruns/${id}/send-emails`, {
      method: "POST",
      headers: authHeaders()
    }).then(handleResponse),
  deletePayrun: (id) =>
    fetch(`${API_BASE}/payruns/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    }).then(handleResponse),

  // Payslips
  getPayslips: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/payslips?${qs}`, {
      headers: authHeaders()
    }).then(handleResponse);
  },
  getPayslipById: (id) =>
    fetch(`${API_BASE}/payslips/${id}`, {
      headers: authHeaders()
    }).then(handleResponse),
  sendSinglePayslipEmail: (id) =>
    fetch(`${API_BASE}/payslips/${id}/send-email`, {
      method: "POST",
      headers: authHeaders()
    }).then(handleResponse)
};
