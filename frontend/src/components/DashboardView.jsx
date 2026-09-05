import React, { useState, useEffect } from "react";
import { api } from "../api";
import {
  DollarSign,
  Users,
  FileCheck,
  CalendarCheck,
  Activity,
  AlertTriangle,
  Info,
  Clock,
  TrendingUp,
  Filter,
  CheckCircle,
  Building
} from "lucide-react";

export const DashboardView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [period, setPeriod] = useState("ALL");
  const [department, setDepartment] = useState("ALL");
  const [employeeType, setEmployeeType] = useState("ALL");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardMetrics({ period, department, employeeType });
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [period, department, employeeType]);

  if (loading && !data) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
        <Activity size={32} className="spin" style={{ margin: "0 auto 12px" }} />
        <p>Loading real-time payroll & operations analytics...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const alerts = data?.operationalAlerts || [];
  const charts = data?.charts || {};
  const attendance = data?.attendanceBreakdown || {};
  const deptBreakdown = data?.departmentBreakdown || [];

  return (
    <div>
      {/* Title & Filter Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>HR & Payroll Operations Dashboard</h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>
            Real-time live aggregation across Employees, Contracts, Attendance, Leaves, and Payruns
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "white", padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <Filter size={14} color="#64748b" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>FILTERS:</span>
          </div>

          <select
            className="form-control"
            style={{ width: "auto", padding: "6px 12px", fontSize: 13 }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="ALL">All Periods</option>
            <option value="CURRENT_MONTH">Current Month</option>
            <option value="LAST_3_MONTHS">Last 3 Months</option>
          </select>

          <select
            className="form-control"
            style={{ width: "auto", padding: "6px 12px", fontSize: 13 }}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
          </select>

          <select
            className="form-control"
            style={{ width: "auto", padding: "6px 12px", fontSize: 13 }}
            value={employeeType}
            onChange={(e) => setEmployeeType(e.target.value)}
          >
            <option value="ALL">All Employment Types</option>
            <option value="FULL_TIME">Full-Time Staff</option>
            <option value="PART_TIME">Part-Time</option>
            <option value="CONTRACT">Contractors</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: 14, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#991b1b", marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        {/* Total Net Paid */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>TOTAL NET PAID</span>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>
            ${Number(kpis.totalNetSalaryPaid || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: "#059669" }}>
            <TrendingUp size={13} />
            <span>Disbursed & confirmed</span>
          </div>
        </div>

        {/* Payslips Generated */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>PAYSLIPS PROCESSED</span>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#eef2ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>
            {kpis.payslipsGenerated || 0}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: "#64748b" }}>
            <span>Across selected filters</span>
          </div>
        </div>

        {/* Average Salary */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>AVERAGE NET SALARY</span>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f0f9ff", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>
            ${Number(kpis.averageSalary || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: "#64748b" }}>
            <span>Per employee per cycle</span>
          </div>
        </div>

        {/* Approved Leave Days */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>APPROVED TIME OFF</span>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CalendarCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>
            {kpis.approvedTimeOffDays || 0} <span style={{ fontSize: 15, fontWeight: 500, color: "#64748b" }}>days</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: "#64748b" }}>
            <span>Approved leave consumption</span>
          </div>
        </div>

        {/* Attendance Health */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>ATTENDANCE HEALTH</span>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={20} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>
            {kpis.attendanceHealth || 100}%
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: "#059669" }}>
            <CheckCircle size={13} />
            <span>Presence & on-time rating</span>
          </div>
        </div>
      </div>

      {/* Operational Alerts Banner */}
      {alerts.length > 0 && (
        <div className="card" style={{ marginBottom: 24, borderLeft: "4px solid #f59e0b" }}>
          <div className="card-header" style={{ background: "#fffbeb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AlertTriangle color="#d97706" size={20} />
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#92400e" }}>
                  Operational Payroll & HR Alerts ({alerts.length})
                </h3>
                <p style={{ fontSize: 12, color: "#b45309" }}>
                  Action items surfaced before finalizing upcoming payruns
                </p>
              </div>
            </div>
          </div>
          <div style={{ padding: "12px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: alert.severity === "ERROR" ? "#fef2f2" : "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontSize: 13.5
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {alert.severity === "ERROR" ? (
                    <AlertTriangle size={16} color="#ef4444" />
                  ) : alert.severity === "WARNING" ? (
                    <AlertTriangle size={16} color="#f59e0b" />
                  ) : (
                    <Info size={16} color="#0284c7" />
                  )}
                  <div>
                    <strong>{alert.title}:</strong> {alert.message}
                  </div>
                </div>
                {alert.department && (
                  <span className="badge badge-draft" style={{ fontSize: 11 }}>
                    {alert.department}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20, marginBottom: 24 }}>
        {/* Department Salary Expenditure Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Salary Expenditure by Department</div>
              <div className="card-subtitle">Active contractual payroll commitment</div>
            </div>
            <Building size={18} color="#64748b" />
          </div>
          <div className="card-body">
            {charts.salaryCostByDepartment?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {charts.salaryCostByDepartment.map((dept) => {
                  const maxCost = Math.max(...charts.salaryCostByDepartment.map((d) => d.totalSalaryCost), 1);
                  const pct = Math.round((dept.totalSalaryCost / maxCost) * 100);
                  return (
                    <div key={dept.department}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{dept.department} ({dept.headcount} staff)</span>
                        <span style={{ fontWeight: 700, color: "#4f46e5" }}>
                          ${Number(dept.totalSalaryCost).toLocaleString()} /mo
                        </span>
                      </div>
                      <div style={{ width: "100%", height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)",
                            borderRadius: 4
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>No department expenditure data for selected filter.</p>
            )}
          </div>
        </div>

        {/* Attendance Breakdown Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Attendance & Shift Health</div>
              <div className="card-subtitle">Breakdown of worked shifts, punctuality, and exceptions</div>
            </div>
            <Clock size={18} color="#64748b" />
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ padding: 14, background: "#ecfdf5", borderRadius: 10, border: "1px solid #a7f3d0" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#065f46" }}>ON TIME / PRESENT</span>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#047857", marginTop: 4 }}>
                  {attendance.present || 0}
                </div>
              </div>

              <div style={{ padding: 14, background: "#eef2ff", borderRadius: 10, border: "1px solid #c7d2fe" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#3730a3" }}>OVERTIME SHIFTS</span>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#4338ca", marginTop: 4 }}>
                  {attendance.overtime || 0}
                </div>
              </div>

              <div style={{ padding: 14, background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>LATE ARRIVALS</span>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#b45309", marginTop: 4 }}>
                  {attendance.late || 0}
                </div>
              </div>

              <div style={{ padding: 14, background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#991b1b" }}>EXCEPTIONS / MANUAL</span>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#dc2626", marginTop: 4 }}>
                  {attendance.exceptions || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Department Operational Overview</div>
            <div className="card-subtitle">Staff headcount, active employment contracts, and average wage breakdown</div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Headcount</th>
                <th>Active Contracts</th>
                <th>Total Monthly Salary</th>
                <th>Average Monthly Wage</th>
              </tr>
            </thead>
            <tbody>
              {deptBreakdown.map((row) => (
                <tr key={row.department}>
                  <td style={{ fontWeight: 600 }}>{row.department}</td>
                  <td>
                    <span className="badge badge-active">{row.headcount} Staff</span>
                  </td>
                  <td>{row.activeContracts}</td>
                  <td style={{ fontWeight: 600, color: "#4f46e5" }}>
                    ${Number(row.totalSalaryCost || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    ${Number(row.avgWage || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
