import React, { useState, useEffect } from "react";
import { api } from "../api";
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Filter,
  Edit2,
  ShieldAlert
} from "lucide-react";

export const AttendanceModule = ({ initialEmployeeId, currentRole }) => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(initialEmployeeId || "");
  const [statusFilter, setStatusFilter] = useState("");

  // Manual Correction Modal
  const [correctingRecord, setCorrectingRecord] = useState(null);
  const [correctionForm, setCorrectionForm] = useState({
    checkIn: "",
    checkOut: "",
    workedHours: 8,
    status: "PRESENT",
    reason: "",
    correctedBy: "HR Manager"
  });

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const [attRes, statsRes] = await Promise.all([
        api.getAttendance({
          employeeId: selectedEmployeeId || undefined,
          status: statusFilter || undefined
        }),
        api.getAttendanceStats()
      ]);

      if (attRes.success) setAttendance(attRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await api.getEmployees();
      if (res.success) {
        setEmployees(res.data);
        if (!clockEmployeeId && res.data.length > 0) {
          setClockEmployeeId(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [selectedEmployeeId, statusFilter]);

  const openCorrectionModal = (record) => {
    setCorrectingRecord(record);
    const formatDT = (d) => (d ? new Date(d).toISOString().slice(0, 16) : "");
    setCorrectionForm({
      checkIn: formatDT(record.checkIn),
      checkOut: formatDT(record.checkOut),
      workedHours: record.workedHours,
      status: record.status,
      reason: record.correctionReason || "Badge scanner clocking adjustment",
      correctedBy: "HR Manager"
    });
  };

  const handleSaveCorrection = async (e) => {
    e.preventDefault();
    try {
      await api.correctAttendance(correctingRecord._id, correctionForm);
      setCorrectingRecord(null);
      loadAttendance();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>Attendance & Shift Operations</h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>
            Real-time daily presence tracking, shift exceptions, and authorized manual audit corrections
          </p>
        </div>
      </div>

      {/* Admin Attendance Tracking Banner */}
      <div className="card" style={{ marginBottom: 20, borderLeft: "4px solid #4f46e5", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eef2ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Attendance & Timestamp Verification Ledger</h3>
              <p style={{ fontSize: 13, color: "#64748b" }}>
                Authorized audit logs of employee check-in and check-out timestamps with duration calculation
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="badge badge-active" style={{ fontSize: 12 }}>Admin Monitor Mode</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
          <div className="card" style={{ padding: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>TOTAL ENTRIES</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
              {stats.total}
            </div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#065f46" }}>PRESENT / ON-TIME</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#047857", marginTop: 2 }}>
              {stats.present}
            </div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>LATE ARRIVALS</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#b45309", marginTop: 2 }}>
              {stats.late}
            </div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#4338ca" }}>OVERTIME</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#3730a3", marginTop: 2 }}>
              {stats.overtime}
            </div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#991b1b" }}>EXCEPTIONS / EDITS</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#dc2626", marginTop: 2 }}>
              {stats.exceptions}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <select
          className="form-control"
          style={{ width: "auto", minWidth: 220 }}
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
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
          style={{ width: "auto", minWidth: 180 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PRESENT">Present</option>
          <option value="LATE">Late</option>
          <option value="OVERTIME">Overtime</option>
          <option value="HALF_DAY">Half Day</option>
          <option value="MISSING_CHECKOUT">Missing Checkout</option>
        </select>

        {selectedEmployeeId && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedEmployeeId("")}
          >
            Clear Employee Filter
          </button>
        )}
      </div>

      {/* Attendance Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Shift Date</th>
                <th>Check In (Timestamp)</th>
                <th>Check Out (Timestamp)</th>
                <th>Duration / Worked</th>
                <th>Status</th>
                <th>Audit / Edits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: 30 }}>
                    Loading attendance records...
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendance.map((att) => {
                  const formatTimestamp = (d) => {
                    if (!d) return "—";
                    const dateObj = new Date(d);
                    return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                  };
                  return (
                    <tr key={att._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>
                          {att.employee?.firstName} {att.employee?.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {att.employee?.employeeId} • {att.employee?.department}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, color: "#334155" }}>
                          {new Date(att.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: att.checkIn ? "#047857" : "#64748b" }}>
                          <LogIn size={13} color="#10b981" />
                          <span>{formatTimestamp(att.checkIn)}</span>
                        </div>
                      </td>
                      <td>
                        {att.checkOut ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#4338ca" }}>
                            <LogOut size={13} color="#6366f1" />
                            <span>{formatTimestamp(att.checkOut)}</span>
                          </div>
                        ) : (
                          <span className="badge badge-warning" style={{ fontSize: 11 }}>In Progress</span>
                        )}
                      </td>
                      <td>
                        <strong>{att.workedHours || 0} hrs</strong>
                      </td>
                      <td>
                        <span className={`badge badge-${att.status?.toLowerCase()}`}>
                          {att.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        {att.isManuallyCorrected ? (
                          <div style={{ fontSize: 11.5, color: "#d97706" }}>
                            <strong>Manually Adjusted</strong>
                            <div style={{ color: "#64748b", maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {att.correctionReason}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>Original Record</span>
                        )}
                      </td>
                      <td>
                        {currentRole !== "EMPLOYEE" && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openCorrectionModal(att)}
                            title="Authorized manual correction"
                          >
                            <Edit2 size={13} /> Adjust
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Correction Modal */}
      {correctingRecord && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldAlert color="#d97706" size={20} />
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Authorized Attendance Correction</h3>
              </div>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
                onClick={() => setCorrectingRecord(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCorrection}>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ padding: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, fontSize: 12.5, color: "#92400e" }}>
                  All manual changes are logged into the compliance audit trail preserving original clock timestamps.
                </div>

                <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                  Employee: {correctingRecord.employee?.firstName} {correctingRecord.employee?.lastName} ({new Date(correctingRecord.date).toLocaleDateString()})
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Check In Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={correctionForm.checkIn}
                      onChange={(e) => setCorrectionForm({ ...correctionForm, checkIn: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Check Out Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={correctionForm.checkOut}
                      onChange={(e) => setCorrectionForm({ ...correctionForm, checkOut: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Worked Hours</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      className="form-control"
                      value={correctionForm.workedHours}
                      onChange={(e) => setCorrectionForm({ ...correctionForm, workedHours: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={correctionForm.status}
                      onChange={(e) => setCorrectionForm({ ...correctionForm, status: e.target.value })}
                    >
                      <option value="PRESENT">PRESENT</option>
                      <option value="LATE">LATE</option>
                      <option value="HALF_DAY">HALF DAY</option>
                      <option value="OVERTIME">OVERTIME</option>
                      <option value="ABSENT">ABSENT</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Correction Reason (Mandatory Audit Requirement)</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. Employee forgot badge, confirmed via facility camera"
                    value={correctionForm.reason}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCorrectingRecord(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Apply & Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
