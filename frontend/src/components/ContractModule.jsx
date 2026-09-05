import React, { useState, useEffect } from "react";
import { api } from "../api";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Briefcase,
  Building,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export const ContractModule = ({ initialEmployeeId, currentRole }) => {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [structures, setStructures] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeFilter, setEmployeeFilter] = useState(initialEmployeeId || "");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee: "",
    contractReference: "",
    contractType: "FULL_TIME",
    department: "Engineering",
    jobPosition: "Software Engineer",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    salary: 5000,
    wageType: "MONTHLY",
    salaryStructure: "",
    workingSchedule: "",
    status: "ACTIVE",
    notes: ""
  });
  const [formError, setFormError] = useState("");

  const loadContracts = async () => {
    try {
      setLoading(true);
      const res = await api.getContracts({
        employeeId: employeeFilter || undefined,
        status: statusFilter || undefined
      });
      if (res.success) {
        setContracts(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [empRes, strRes, schRes] = await Promise.all([
        api.getEmployees(),
        api.getSalaryStructures(),
        api.getSchedules()
      ]);
      if (empRes.success) setEmployees(empRes.data);
      if (strRes.success) setStructures(strRes.data);
      if (schRes.success) setSchedules(schRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadContracts();
  }, [employeeFilter, statusFilter]);

  const openCreateModal = () => {
    setFormData({
      employee: employees[0]?._id || "",
      contractReference: `CNT-2026-${Math.floor(100 + Math.random() * 900)}`,
      contractType: "FULL_TIME",
      department: "Engineering",
      jobPosition: "Software Engineer",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      salary: 6000,
      wageType: "MONTHLY",
      salaryStructure: structures[0]?._id || "",
      workingSchedule: schedules[0]?._id || "",
      status: "ACTIVE",
      notes: "Standard operational contract"
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveContract = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      const payload = {
        ...formData,
        endDate: formData.endDate ? formData.endDate : null
      };

      if (formData._id) {
        await api.updateContract(formData._id, payload);
      } else {
        await api.createContract(payload);
      }
      setIsModalOpen(false);
      loadContracts();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>Contract Management</h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>
            Track active terms and historical contracts. Concurrency validation ensures period-specific active contracts.
          </p>
        </div>

        {currentRole !== "EMPLOYEE" && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> New Contract
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <select
          className="form-control"
          style={{ width: "auto", minWidth: 220 }}
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
        >
          <option value="">All Employees</option>
          {employees.map((e) => (
            <option key={e._id} value={e._id}>
              {e.firstName} {e.lastName} ({e.employeeId})
            </option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: "auto", minWidth: 160 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active Contracts</option>
          <option value="EXPIRED">Expired</option>
          <option value="TERMINATED">Terminated</option>
        </select>

        {employeeFilter && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setEmployeeFilter("")}
          >
            Clear Employee Filter
          </button>
        )}
      </div>

      {/* Contracts Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Employee</th>
                <th>Contract Type</th>
                <th>Duration (Start - End)</th>
                <th>Monthly Wage</th>
                <th>Salary Structure</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: 30 }}>
                    Loading contracts...
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                    No contracts found.
                  </td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <code>{c.contractReference || c._id.slice(-6)}</code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>
                        {c.employee?.firstName} {c.employee?.lastName}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {c.employee?.employeeId} • {c.jobPosition || c.employee?.jobTitle}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-computed" style={{ fontSize: 11 }}>
                        {c.contractType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        {new Date(c.startDate).toLocaleDateString()}
                        {" → "}
                        {c.endDate ? new Date(c.endDate).toLocaleDateString() : "Indefinite"}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: "#4f46e5" }}>
                      ${Number(c.salary || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        {c.salaryStructure?.name || "Standard Structure"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          c.status === "ACTIVE"
                            ? "badge-active"
                            : c.status === "EXPIRED"
                            ? "badge-expired"
                            : "badge-draft"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Contract Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Add Employment Contract</h3>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContract}>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {formError && (
                  <div style={{ padding: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 8, fontSize: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <AlertCircle size={16} />
                      <strong>Validation Error:</strong>
                    </div>
                    <div style={{ marginTop: 4 }}>{formError}</div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Employee</label>
                  <select
                    className="form-control"
                    required
                    value={formData.employee}
                    onChange={(e) => {
                      const sel = employees.find((emp) => emp._id === e.target.value);
                      setFormData({
                        ...formData,
                        employee: e.target.value,
                        department: sel?.department || formData.department,
                        jobPosition: sel?.jobTitle || formData.jobPosition
                      });
                    }}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.firstName} {e.lastName} ({e.employeeId} - {e.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Contract Reference</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contractReference}
                      onChange={(e) => setFormData({ ...formData, contractReference: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contract Type</label>
                    <select
                      className="form-control"
                      value={formData.contractType}
                      onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date (Leave blank if indefinite)</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Monthly Wage / Base Salary ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      step="50"
                      required
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Salary Structure</label>
                    <select
                      className="form-control"
                      required
                      value={formData.salaryStructure}
                      onChange={(e) => setFormData({ ...formData, salaryStructure: e.target.value })}
                    >
                      <option value="">Select Salary Structure</option>
                      {structures.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Working Schedule</label>
                    <select
                      className="form-control"
                      value={formData.workingSchedule}
                      onChange={(e) => setFormData({ ...formData, workingSchedule: e.target.value })}
                    >
                      <option value="">Select Working Schedule</option>
                      {schedules.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.totalWeeklyHours}h/wk)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="EXPIRED">EXPIRED</option>
                    </select>
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
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
