import React, { useState, useEffect } from "react";
import { api } from "../api";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Layers,
  FileCheck,
  Tag,
  AlertCircle
} from "lucide-react";

export const TimeOffModule = ({ initialSubtab, initialEmployeeId, currentRole }) => {
  const [subtab, setSubtab] = useState(initialSubtab || "requests"); // requests, allocations, types
  const [requests, setRequests] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [types, setTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [employeeFilter, setEmployeeFilter] = useState(initialEmployeeId || "");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  const [requestForm, setRequestForm] = useState({
    employee: "",
    timeOffType: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    duration: 1,
    reason: ""
  });
  const [requestError, setRequestError] = useState("");

  const [allocForm, setAllocForm] = useState({
    name: "2026 Annual Grant",
    employee: "",
    timeOffType: "",
    allocatedUnits: 15,
    validityStartDate: "2026-01-01",
    validityEndDate: "2026-12-31"
  });

  const [typeForm, setTypeForm] = useState({
    name: "",
    code: "",
    unit: "DAYS",
    requiresAllocation: true,
    isPaid: true,
    color: "#3B82F6",
    description: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqRes, allocRes, typesRes, empRes] = await Promise.all([
        api.getLeaveRequests({
          employeeId: employeeFilter || undefined,
          status: statusFilter || undefined
        }),
        api.getAllocations({ employeeId: employeeFilter || undefined }),
        api.getTimeOffTypes(),
        api.getEmployees()
      ]);

      if (reqRes.success) setRequests(reqRes.data);
      if (allocRes.success) setAllocations(allocRes.data);
      if (typesRes.success) {
        setTypes(typesRes.data);
        if (!requestForm.timeOffType && typesRes.data.length > 0) {
          setRequestForm((prev) => ({ ...prev, timeOffType: typesRes.data[0]._id }));
          setAllocForm((prev) => ({ ...prev, timeOffType: typesRes.data[0]._id }));
        }
      }
      if (empRes.success) {
        setEmployees(empRes.data);
        if (!requestForm.employee && empRes.data.length > 0) {
          setRequestForm((prev) => ({ ...prev, employee: empRes.data[0]._id }));
          setAllocForm((prev) => ({ ...prev, employee: empRes.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [subtab, employeeFilter, statusFilter]);

  // Request Actions
  const handleApproveRequest = async (id) => {
    try {
      await api.approveLeaveRequest(id, "Sarah Jenkins (HR Manager)");
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRefuseRequest = async (id) => {
    const reason = prompt("Enter refusal reason:", "Operational scheduling conflict");
    if (!reason) return;
    try {
      await api.refuseLeaveRequest(id, reason);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setRequestError("");
    try {
      await api.createLeaveRequest(requestForm);
      setIsRequestModalOpen(false);
      loadData();
    } catch (err) {
      setRequestError(err.message);
    }
  };

  // Allocation Actions
  const handleApproveAllocation = async (id) => {
    try {
      await api.approveAllocation(id, "HR Manager");
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateAllocation = async (e) => {
    e.preventDefault();
    try {
      await api.createAllocation(allocForm);
      setIsAllocModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Type Actions
  const handleCreateType = async (e) => {
    e.preventDefault();
    try {
      await api.createTimeOffType(typeForm);
      setIsTypeModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const canApprove = currentRole !== "EMPLOYEE";

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>Time Off Management</h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>
            Leave requests, quota allocations, balance consumption, and custom leave policies
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {subtab === "requests" && (
            <button className="btn btn-primary" onClick={() => setIsRequestModalOpen(true)}>
              <Plus size={16} /> Request Time Off
            </button>
          )}

          {subtab === "allocations" && canApprove && (
            <button className="btn btn-primary" onClick={() => setIsAllocModalOpen(true)}>
              <Plus size={16} /> New Allocation Grant
            </button>
          )}

          {subtab === "types" && canApprove && (
            <button className="btn btn-primary" onClick={() => setIsTypeModalOpen(true)}>
              <Plus size={16} /> New Time Off Type
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="subtabs-bar">
        <button
          className={`subtab-btn ${subtab === "requests" ? "active" : ""}`}
          onClick={() => setSubtab("requests")}
        >
          <Calendar size={16} /> Leave Requests ({requests.length})
        </button>
        <button
          className={`subtab-btn ${subtab === "allocations" ? "active" : ""}`}
          onClick={() => setSubtab("allocations")}
        >
          <Layers size={16} /> Balance Allocations ({allocations.length})
        </button>
        <button
          className={`subtab-btn ${subtab === "types" ? "active" : ""}`}
          onClick={() => setSubtab("types")}
        >
          <Tag size={16} /> Leave Types ({types.length})
        </button>
      </div>

      {/* Filters (for requests and allocations) */}
      {subtab !== "types" && (
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

          {subtab === "requests" && (
            <select
              className="form-control"
              style={{ width: "auto", minWidth: 160 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REFUSED">Refused</option>
            </select>
          )}

          {employeeFilter && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setEmployeeFilter("")}
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* SUBTAB 1: REQUESTS */}
      {subtab === "requests" && (
        <div className="card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates (Start → End)</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 30 }}>
                      Loading requests...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                      No time off requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>
                          {req.employee?.firstName} {req.employee?.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {req.employee?.employeeId} • {req.employee?.department}
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: `${req.timeOffType?.color || "#3b82f6"}18`,
                            color: req.timeOffType?.color || "#3b82f6",
                            border: `1px solid ${req.timeOffType?.color || "#3b82f6"}40`
                          }}
                        >
                          {req.timeOffType?.name || "Leave"}
                        </span>
                      </td>
                      <td>
                        {new Date(req.startDate).toLocaleDateString()}
                        {" → "}
                        {new Date(req.endDate).toLocaleDateString()}
                      </td>
                      <td>
                        <strong>{req.duration} {req.timeOffType?.unit?.toLowerCase() || "days"}</strong>
                      </td>
                      <td style={{ color: "#475569", maxWidth: 220 }}>
                        {req.reason || "Personal"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            req.status === "APPROVED"
                              ? "badge-active"
                              : req.status === "REFUSED"
                              ? "badge-refused"
                              : "badge-draft"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td>
                        {req.status === "PENDING" && canApprove && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleApproveRequest(req._id)}
                              title="Approve & automatically deduct balance"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleRefuseRequest(req._id)}
                              title="Refuse leave request"
                            >
                              <XCircle size={14} /> Refuse
                            </button>
                          </div>
                        )}
                        {req.status === "APPROVED" && (
                          <span style={{ fontSize: 12, color: "#059669" }}>
                            Approved by {req.approvedBy || "Manager"}
                          </span>
                        )}
                        {req.status === "REFUSED" && (
                          <span style={{ fontSize: 12, color: "#dc2626" }}>
                            {req.rejectionReason}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ALLOCATIONS */}
      {subtab === "allocations" && (
        <div className="card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Allocation Name</th>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Allocated</th>
                  <th>Consumed</th>
                  <th>Remaining Balance</th>
                  <th>Validity Period</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((alloc) => {
                  const pct = Math.min(100, Math.round((alloc.takenUnits / alloc.allocatedUnits) * 100));
                  return (
                    <tr key={alloc._id}>
                      <td style={{ fontWeight: 600 }}>{alloc.name}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>
                          {alloc.employee?.firstName} {alloc.employee?.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {alloc.employee?.employeeId}
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: `${alloc.timeOffType?.color || "#3b82f6"}18`,
                            color: alloc.timeOffType?.color || "#3b82f6"
                          }}
                        >
                          {alloc.timeOffType?.name}
                        </span>
                      </td>
                      <td>{alloc.allocatedUnits} {alloc.timeOffType?.unit}</td>
                      <td>{alloc.takenUnits} {alloc.timeOffType?.unit}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <strong style={{ color: "#4f46e5" }}>
                            {alloc.remainingUnits} {alloc.timeOffType?.unit}
                          </strong>
                          <div style={{ width: 60, height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${100 - pct}%`, height: "100%", background: "#10b981" }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        {new Date(alloc.validityStartDate).toLocaleDateString()} -{" "}
                        {new Date(alloc.validityEndDate).toLocaleDateString()}
                      </td>
                      <td>
                        {alloc.status === "DRAFT" && canApprove ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleApproveAllocation(alloc._id)}
                          >
                            Approve Grant
                          </button>
                        ) : (
                          <span className="badge badge-active">{alloc.status}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: TYPES */}
      {subtab === "types" && (
        <div className="card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Type Name</th>
                  <th>Code</th>
                  <th>Unit</th>
                  <th>Allocation Required</th>
                  <th>Paid Leave</th>
                  <th>Color Badge</th>
                </tr>
              </thead>
              <tbody>
                {types.map((t) => (
                  <tr key={t._id}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td><code>{t.code}</code></td>
                    <td>{t.unit}</td>
                    <td>{t.requiresAllocation ? "Yes (Deducts Balance)" : "No"}</td>
                    <td>
                      <span className={`badge ${t.isPaid ? "badge-active" : "badge-draft"}`}>
                        {t.isPaid ? "Paid Leave" : "Unpaid"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: t.color }} />
                        <span style={{ fontSize: 12 }}>{t.color}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Request Time Off */}
      {isRequestModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Request Time Off</h3>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
                onClick={() => setIsRequestModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest}>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {requestError && (
                  <div style={{ padding: 10, background: "#fef2f2", color: "#991b1b", borderRadius: 8, fontSize: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <AlertCircle size={15} />
                      <strong>Balance Validation:</strong>
                    </div>
                    <div>{requestError}</div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Employee</label>
                  <select
                    className="form-control"
                    required
                    value={requestForm.employee}
                    onChange={(e) => setRequestForm({ ...requestForm, employee: e.target.value })}
                  >
                    {employees.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.firstName} {e.lastName} ({e.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Time Off Type</label>
                  <select
                    className="form-control"
                    required
                    value={requestForm.timeOffType}
                    onChange={(e) => setRequestForm({ ...requestForm, timeOffType: e.target.value })}
                  >
                    {types.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.requiresAllocation ? "Allocation Required" : "No Quota"})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={requestForm.startDate}
                      onChange={(e) => setRequestForm({ ...requestForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={requestForm.endDate}
                      onChange={(e) => setRequestForm({ ...requestForm, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Duration (Days / Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    className="form-control"
                    required
                    value={requestForm.duration}
                    onChange={(e) => setRequestForm({ ...requestForm, duration: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Brief description of leave reason..."
                    value={requestForm.reason}
                    onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsRequestModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Allocation */}
      {isAllocModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Grant Leave Allocation</h3>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
                onClick={() => setIsAllocModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAllocation}>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Allocation Description</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={allocForm.name}
                    onChange={(e) => setAllocForm({ ...allocForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employee</label>
                  <select
                    className="form-control"
                    required
                    value={allocForm.employee}
                    onChange={(e) => setAllocForm({ ...allocForm, employee: e.target.value })}
                  >
                    {employees.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.firstName} {e.lastName} ({e.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Time Off Type</label>
                  <select
                    className="form-control"
                    required
                    value={allocForm.timeOffType}
                    onChange={(e) => setAllocForm({ ...allocForm, timeOffType: e.target.value })}
                  >
                    {types.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Allocated Units (Days)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    required
                    value={allocForm.allocatedUnits}
                    onChange={(e) => setAllocForm({ ...allocForm, allocatedUnits: Number(e.target.value) })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Validity Start</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={allocForm.validityStartDate}
                      onChange={(e) => setAllocForm({ ...allocForm, validityStartDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Validity End</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={allocForm.validityEndDate}
                      onChange={(e) => setAllocForm({ ...allocForm, validityEndDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAllocModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Grant Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Type */}
      {isTypeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Define Time Off Policy</h3>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
                onClick={() => setIsTypeModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateType}>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Type Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Parental Leave"
                      value={typeForm.name}
                      onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Code</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. PARENTAL"
                      value={typeForm.code}
                      onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select
                      className="form-control"
                      value={typeForm.unit}
                      onChange={(e) => setTypeForm({ ...typeForm, unit: e.target.value })}
                    >
                      <option value="DAYS">DAYS</option>
                      <option value="HOURS">HOURS</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color Hex</label>
                    <input
                      type="color"
                      className="form-control"
                      value={typeForm.color}
                      onChange={(e) => setTypeForm({ ...typeForm, color: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 20 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={typeForm.requiresAllocation}
                      onChange={(e) => setTypeForm({ ...typeForm, requiresAllocation: e.target.checked })}
                    />
                    Requires Pre-Allocated Balance
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={typeForm.isPaid}
                      onChange={(e) => setTypeForm({ ...typeForm, isPaid: e.target.checked })}
                    />
                    Paid Time Off
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsTypeModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
