import React, { useState, useEffect } from "react";
import { api } from "../api";
import {
  Users,
  LayoutGrid,
  List,
  Plus,
  Search,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  CreditCard,
  Edit2,
  Trash2,
  DollarSign
} from "lucide-react";

export const EmployeeModule = ({ onNavigateToModule, currentRole }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("kanban"); // kanban or list
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Selected Employee for Form View (Operational Hub)
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [smartButtons, setSmartButtons] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Modal for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "Engineering",
    jobTitle: "Software Engineer",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    joiningDate: new Date().toISOString().split("T")[0],
    bankDetails: {
      bankName: "",
      accountNumber: "",
      ifscRouting: "",
      accountHolderName: ""
    },
    address: ""
  });
  const [formError, setFormError] = useState("");

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.getEmployees({
        search: search || undefined,
        department: departmentFilter || undefined
      });
      if (res.success) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [search, departmentFilter]);

  const openEmployeeForm = async (emp) => {
    setSelectedEmployee(emp);
    try {
      setDetailsLoading(true);
      const res = await api.getEmployeeById(emp._id);
      if (res.success) {
        setEmployeeDetails(res.data);
        setSmartButtons(res.smartButtons);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      if (formData._id) {
        await api.updateEmployee(formData._id, formData);
      } else {
        await api.createEmployee(formData);
      }
      setIsModalOpen(false);
      loadEmployees();
      if (selectedEmployee && selectedEmployee._id === formData._id) {
        openEmployeeForm(formData);
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  const openCreateModal = () => {
    const nextNum = Math.floor(100 + Math.random() * 900);
    setFormData({
      employeeId: `EMP-${nextNum}`,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "Engineering",
      jobTitle: "Software Engineer",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      joiningDate: new Date().toISOString().split("T")[0],
      bankDetails: {
        bankName: "Chase Bank",
        accountNumber: "1234567890",
        ifscRouting: "CHASUS33XXX",
        accountHolderName: ""
      },
      address: ""
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setFormData({
      ...emp,
      joiningDate: emp.joiningDate ? emp.joiningDate.split("T")[0] : "",
      bankDetails: emp.bankDetails || { bankName: "", accountNumber: "", ifscRouting: "", accountHolderName: "" }
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to remove this employee?")) return;
    try {
      await api.deleteEmployee(id);
      if (selectedEmployee?._id === id) {
        setSelectedEmployee(null);
      }
      loadEmployees();
    } catch (err) {
      alert(err.message);
    }
  };

  // If viewing an employee form (Requirement A1, B2: Unified Employee Form acting as the operational hub)
  if (selectedEmployee) {
    const emp = employeeDetails || selectedEmployee;
    const sb = smartButtons || {};

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedEmployee(null)}
          >
            ← Back to Employee Directory
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            {currentRole !== "EMPLOYEE" && (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openEditModal(emp)}
                >
                  <Edit2 size={14} /> Edit Profile
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDeleteEmployee(emp._id)}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </>
            )}
          </div>
        </div>

        {/* Smart-Buttons Navigation Bar */}
        <div className="smart-buttons-bar">
          <div
            className="smart-btn"
            onClick={() => onNavigateToModule("contracts", { employeeId: emp._id })}
            title="View related Contracts"
          >
            <div className="smart-btn-icon">
              <FileText size={20} />
            </div>
            <div>
              <div className="smart-btn-count">{sb.contractsCount ?? 0}</div>
              <div className="smart-btn-label">Contracts</div>
            </div>
          </div>

          <div
            className="smart-btn"
            onClick={() => onNavigateToModule("attendance", { employeeId: emp._id })}
            title="View related Attendance records"
          >
            <div className="smart-btn-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
              <Clock size={20} />
            </div>
            <div>
              <div className="smart-btn-count">{sb.attendanceCount ?? 0}</div>
              <div className="smart-btn-label">Attendance</div>
            </div>
          </div>

          <div
            className="smart-btn"
            onClick={() => onNavigateToModule("timeoff", { employeeId: emp._id, subtab: "requests" })}
            title="View Time Off Requests"
          >
            <div className="smart-btn-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
              <Calendar size={20} />
            </div>
            <div>
              <div className="smart-btn-count">{sb.timeOffCount ?? 0}</div>
              <div className="smart-btn-label">Leave Requests</div>
            </div>
          </div>

          <div
            className="smart-btn"
            onClick={() => onNavigateToModule("timeoff", { employeeId: emp._id, subtab: "allocations" })}
            title="View Leave Allocations"
          >
            <div className="smart-btn-icon" style={{ background: "#fae8ff", color: "#a855f7" }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <div className="smart-btn-count">{sb.allocationsCount ?? 0}</div>
              <div className="smart-btn-label">Allocations</div>
            </div>
          </div>

          {currentRole !== "HR_MANAGER" && currentRole !== "EMPLOYEE" && (
            <div
              className="smart-btn"
              onClick={() => onNavigateToModule("payroll", { employeeId: emp._id, subtab: "payslips" })}
              title="View Historical Payslips"
            >
              <div className="smart-btn-icon" style={{ background: "#e0e7ff", color: "#4338ca" }}>
                <DollarSign size={20} />
              </div>
              <div>
                <div className="smart-btn-count">{sb.payslipsCount ?? 0}</div>
                <div className="smart-btn-label">Payslips</div>
              </div>
            </div>
          )}
        </div>

        {/* Operational Hub Form */}
        <div className="card">
          <div className="card-header" style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 700
                }}
              >
                {emp.firstName?.[0]}{emp.lastName?.[0]}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                    {emp.firstName} {emp.lastName}
                  </h2>
                  <span className={`badge ${emp.status === "ACTIVE" ? "badge-active" : "badge-refused"}`}>
                    {emp.status}
                  </span>
                  <span className="badge badge-computed" style={{ fontSize: 11 }}>
                    {emp.employmentType?.replace("_", " ")}
                  </span>
                </div>
                <p style={{ color: "#64748b", fontSize: 13.5, marginTop: 4 }}>
                  {emp.jobTitle} • {emp.department} • ID: {emp.employeeId}
                </p>
              </div>
            </div>
          </div>

          <div className="card-body" style={{ padding: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
              {/* Work Details */}
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 }}>
                  Employment & Role
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>Department:</span>
                    <strong>{emp.department}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>Job Title:</span>
                    <strong>{emp.jobTitle}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>Working Schedule:</span>
                    <strong>{emp.workingSchedule?.name || "Standard 40h Schedule"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>Joining Date:</span>
                    <strong>{new Date(emp.joiningDate).toLocaleDateString()}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>Active Contract Wage:</span>
                    <strong style={{ color: "#4f46e5" }}>
                      {sb.activeContract ? `$${Number(sb.activeContract.salary).toLocaleString()} /mo` : "No Active Contract"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Contact & Banking */}
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 }}>
                  Contact & Banking Details
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>Email Address:</span>
                    <span>{emp.email}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>Phone Number:</span>
                    <span>{emp.phone || "Not recorded"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>Bank Name:</span>
                    <strong style={{ color: emp.bankDetails?.bankName ? "#0f172a" : "#ef4444" }}>
                      {emp.bankDetails?.bankName || "Missing Bank Name"}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>Account Number:</span>
                    <strong style={{ color: emp.bankDetails?.accountNumber ? "#0f172a" : "#ef4444" }}>
                      {emp.bankDetails?.accountNumber || "Missing Account #"}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>IFSC / Routing:</span>
                    <span>{emp.bankDetails?.ifscRouting || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Directory View (Kanban / List)
  return (
    <div>
      {/* Header Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>Employee Master Directory</h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>
            Centralized hub for employee master data, employment contracts, and records
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* View Toggle */}
          <div style={{ display: "flex", background: "white", borderRadius: 8, border: "1px solid #e2e8f0", padding: 2 }}>
            <button
              className={`btn btn-sm ${viewMode === "kanban" ? "btn-primary" : "btn-secondary"}`}
              style={{ border: "none" }}
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-secondary"}`}
              style={{ border: "none" }}
              onClick={() => setViewMode("list")}
            >
              <List size={15} />
            </button>
          </div>

          {currentRole !== "EMPLOYEE" && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={16} /> New Employee
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, ID, job title, email..."
            style={{ paddingLeft: 38 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: "auto", minWidth: 180 }}
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Sales">Sales</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Finance">Finance</option>
          <option value="Operations">Operations</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: "#64748b" }}>
          Loading employees...
        </div>
      ) : employees.length === 0 ? (
        <div className="card" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          No employees found matching criteria.
        </div>
      ) : viewMode === "kanban" ? (
        /* Kanban View */
        <div className="kanban-board">
          {employees.map((emp) => (
            <div
              key={emp._id}
              className="kanban-card"
              onClick={() => openEmployeeForm(emp)}
            >
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 700
                    }}
                  >
                    {emp.firstName?.[0]}{emp.lastName?.[0]}
                  </div>
                  <span className={`badge ${emp.status === "ACTIVE" ? "badge-active" : "badge-refused"}`}>
                    {emp.status}
                  </span>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>
                  {emp.firstName} {emp.lastName}
                </h3>
                <p style={{ fontSize: 13, color: "#4f46e5", fontWeight: 600, marginBottom: 8 }}>
                  {emp.jobTitle}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "#64748b" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Building size={13} />
                    <span>{emp.department}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Mail size={13} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{emp.email}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "#94a3b8" }}>{emp.employeeId}</span>
                <span style={{ fontSize: 11.5, color: "#4f46e5", fontWeight: 600 }}>Open Hub →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th>Job Position</th>
                  <th>Employment Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                        onClick={() => openEmployeeForm(emp)}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: "#eef2ff",
                            color: "#4f46e5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 13
                          }}
                        >
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><code>{emp.employeeId}</code></td>
                    <td>{emp.department}</td>
                    <td>{emp.jobTitle}</td>
                    <td>
                      <span className="badge badge-computed" style={{ fontSize: 11 }}>
                        {emp.employmentType?.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${emp.status === "ACTIVE" ? "badge-active" : "badge-refused"}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEmployeeForm(emp)}
                      >
                        View Hub
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                {formData._id ? "Edit Employee Profile" : "Create New Employee"}
              </h3>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdate}>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {formError && (
                  <div style={{ padding: 10, background: "#fef2f2", color: "#991b1b", borderRadius: 6, fontSize: 13 }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Employment Type</label>
                    <select
                      className="form-control"
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Work Email</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-control"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Sales">Sales</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    />
                  </div>
                </div>

                {/* Bank Details */}
                <div style={{ marginTop: 6, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 12 }}>
                    Bank Account Details (For Payroll Direct Deposit)
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Bank Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Chase Bank"
                        value={formData.bankDetails?.bankName || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Account Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 987654321098"
                        value={formData.bankDetails?.accountNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">IFSC / Routing Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. CHASUS33XXX"
                      value={formData.bankDetails?.ifscRouting || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: { ...formData.bankDetails, ifscRouting: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {formData._id ? "Save Changes" : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
