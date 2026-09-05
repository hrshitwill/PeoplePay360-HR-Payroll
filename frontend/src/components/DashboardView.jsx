import React, { useState, useEffect } from "react";
import { api } from "../api";
import {
  DollarSign,
  Users,
  FileCheck,
  CalendarCheck,
  Activity,
  AlertTriangle,
  Clock,
  TrendingUp,
  CreditCard,
  FileText,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export const DashboardView = ({ onNavigateToModule, currentUser }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [period, setPeriod] = useState("CURRENT_MONTH");
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
      <div style={{ padding: "80px 0", textAlign: "center", color: "var(--text-muted)" }}>
        <div style={{ width: 40, height: 40, margin: "0 auto 16px" }}>
          <Activity size={40} className="spin" color="#2563eb" />
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
          Loading real-time workforce & payroll operations...
        </p>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const attendance = data?.attendanceBreakdown || {};
  const charts = data?.charts || {};
  const deptBreakdown = data?.departmentBreakdown || [];

  // Attendance metrics calculation for Donut Chart
  const totalAttendance = attendance.total || 360;
  const presentCount = attendance.present || 320;
  const overtimeCount = attendance.overtime || 24;
  const lateCount = attendance.late || 12;
  const exceptionsCount = attendance.exceptions || 4;

  const safeTotal = totalAttendance > 0 ? totalAttendance : 1;
  const pctPresent = Math.round((presentCount / safeTotal) * 100);
  const pctOvertime = Math.round((overtimeCount / safeTotal) * 100);
  const pctLate = Math.round((lateCount / safeTotal) * 100);
  const pctExceptions = Math.round((exceptionsCount / safeTotal) * 100);

  // SVG Donut calculation
  const radius = 62;
  const circumference = 2 * Math.PI * radius; // ~389.55
  const strokePresent = (pctPresent / 100) * circumference;
  const strokeOvertime = (pctOvertime / 100) * circumference;
  const strokeLate = (pctLate / 100) * circumference;
  const strokeExceptions = (pctExceptions / 100) * circumference;

  const offsetPresent = 0;
  const offsetOvertime = -strokePresent;
  const offsetLate = -(strokePresent + strokeOvertime);
  const offsetExceptions = -(strokePresent + strokeOvertime + strokeLate);

  const userName = currentUser?.name?.split(" ")[0] || "Admin";

  return (
    <div className="dashboard-container-ref animate-fade-in">
      {/* 1. Greeting & Period Filter Bar */}
      <div className="dash-greeting-row">
        <div className="dash-greeting-left">
          <div className="dash-greeting-title-area">
            <h2>Good morning, {userName}</h2>
            <span className="badge-live-ops">
              <span className="dot-live" />
              Live Operations
            </span>
          </div>
          <p className="dash-greeting-sub">
            Here's what's happening across your workforce today.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="dash-filters-pills-area">
          {/* Period Pill */}
          <div className="filter-pill-box">
            <span className="filter-pill-tag">PERIOD:</span>
            <select
              className="filter-pill-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="CURRENT_MONTH">September 2026</option>
              <option value="LAST_3_MONTHS">Last 3 Months</option>
              <option value="ALL">All Periods</option>
            </select>
          </div>

          {/* Dept Pill */}
          <div className="filter-pill-box">
            <span className="filter-pill-tag">DEPT:</span>
            <select
              className="filter-pill-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Finance">Finance</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>

          {/* Type Pill */}
          <div className="filter-pill-box">
            <span className="filter-pill-tag">TYPE:</span>
            <select
              className="filter-pill-select"
              value={employeeType}
              onChange={(e) => setEmployeeType(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="FULL_TIME">Full-Time Staff</option>
              <option value="PART_TIME">Part-Time</option>
              <option value="CONTRACT">Contractors</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Five KPI Cards Row */}
      <div className="dash-kpi-grid">
        {/* KPI 1: Total Employees */}
        <div className="kpi-card-ref">
          <div className="kpi-ref-top">
            <span className="kpi-ref-label">TOTAL EMPLOYEES</span>
            <div className="kpi-icon-pill icon-blue">
              <Users size={17} />
            </div>
          </div>
          <div className="kpi-ref-value">
            {kpis.payslipsGenerated > 0 ? kpis.payslipsGenerated : 120}
          </div>
          <div className="kpi-ref-sub">
            {kpis.payslipsGenerated > 0 ? kpis.payslipsGenerated : 120} active staff
          </div>
        </div>

        {/* KPI 2: Total Net Salary */}
        <div className="kpi-card-ref">
          <div className="kpi-ref-top">
            <span className="kpi-ref-label">TOTAL NET SALARY</span>
            <div className="kpi-icon-pill icon-green">
              <CreditCard size={17} />
            </div>
          </div>
          <div className="kpi-ref-value">
            ₹{Number(kpis.totalNetSalaryPaid || 2676600).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <div className="kpi-ref-trend trend-positive">
            <span>↑ +4.2%</span>
            <span className="trend-text">vs last month</span>
          </div>
        </div>

        {/* KPI 3: Payslips Generated */}
        <div className="kpi-card-ref">
          <div className="kpi-ref-top">
            <span className="kpi-ref-label">PAYSLIPS GENERATED</span>
            <div className="kpi-icon-pill icon-purple">
              <FileCheck size={17} />
            </div>
          </div>
          <div className="kpi-ref-value">
            {kpis.payslipsGenerated || 120}
          </div>
          <div className="kpi-ref-sub">
            Ready for distribution
          </div>
        </div>

        {/* KPI 4: Pending Leave */}
        <div className="kpi-card-ref">
          <div className="kpi-ref-top">
            <span className="kpi-ref-label">PENDING LEAVE</span>
            <div className="kpi-icon-pill icon-orange">
              <CalendarCheck size={17} />
            </div>
          </div>
          <div className="kpi-ref-value">
            2
          </div>
          <div className="kpi-ref-sub">
            requests awaiting action
          </div>
        </div>

        {/* KPI 5: Attendance Health */}
        <div className="kpi-card-ref">
          <div className="kpi-ref-top">
            <span className="kpi-ref-label">ATTENDANCE HEALTH</span>
            <div className="kpi-icon-pill icon-teal">
              <Activity size={17} />
            </div>
          </div>
          <div className="kpi-ref-value">
            {kpis.attendanceHealth || 92}%
          </div>
          <div className="kpi-ref-sub">
            {presentCount} present today
          </div>
        </div>
      </div>

      {/* 3. Needs Attention Section (4-Card Horizontal Grid matching image) */}
      <div className="attention-container-ref">
        <div className="attention-header-bar">
          <div className="attention-title-area">
            <AlertTriangle size={18} color="#d97706" />
            <h3 className="attention-heading">Needs Attention</h3>
            <span className="badge-critical-items">4 critical items</span>
          </div>
          <span className="attention-hint-text">
            Click any card to review and resolve immediately
          </span>
        </div>

        {/* 4 Cards Grid */}
        <div className="attention-cards-grid">
          {/* Card 1: Banking Alert */}
          <div
            className="attention-card border-amber"
            onClick={() => onNavigateToModule && onNavigateToModule("employees")}
          >
            <div className="att-card-header">
              <span className="att-dot dot-amber" />
              <span className="att-category-label text-amber">BANKING ALERT</span>
            </div>
            <h4 className="att-card-title">Missing Bank Details</h4>
            <p className="att-card-desc">
              Sneha Rao (EMP004) has no bank account or IFSC configured for payout.
            </p>
            <div className="att-action-link text-amber">
              <span>Update Profile</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 2: Time Tracking */}
          <div
            className="attention-card border-blue"
            onClick={() => onNavigateToModule && onNavigateToModule("attendance")}
          >
            <div className="att-card-header">
              <span className="att-dot dot-blue" />
              <span className="att-category-label text-blue">TIME TRACKING</span>
            </div>
            <h4 className="att-card-title">Attendance Incomplete</h4>
            <p className="att-card-desc">
              Deepak Kumar logged 4.5h with missing punch-out on Sep 4.
            </p>
            <div className="att-action-link text-blue">
              <span>Regularize Log</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 3: Contract Expiry */}
          <div
            className="attention-card border-red"
            onClick={() => onNavigateToModule && onNavigateToModule("contracts")}
          >
            <div className="att-card-header">
              <span className="att-dot dot-red" />
              <span className="att-category-label text-red">CONTRACT EXPIRY</span>
            </div>
            <h4 className="att-card-title">Contract Ending Soon</h4>
            <p className="att-card-desc">
              Aditi Bose's contract CNT-2023-030 ends on 2026-09-30 (25 days left).
            </p>
            <div className="att-action-link text-red">
              <span>Review Renewal</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 4: Payrun Status */}
          <div
            className="attention-card border-purple"
            onClick={() => onNavigateToModule && onNavigateToModule("payroll")}
          >
            <div className="att-card-header">
              <span className="att-dot dot-purple" />
              <span className="att-category-label text-purple">PAYRUN STATUS</span>
            </div>
            <h4 className="att-card-title">Payroll Review Required</h4>
            <p className="att-card-desc">
              Batch PR-2026-09 has 3 warnings to inspect before finalization.
            </p>
            <div className="att-action-link text-purple">
              <span>Open Payrun Batch</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Analytics Section: Expenditure Area Chart & Attendance Donut */}
      <div className="dash-charts-grid-ref">
        {/* Left: Monthly Payroll Expenditure */}
        <div className="card-chart-box">
          <div className="chart-header-ref">
            <div>
              <h3 className="chart-title-ref">Monthly Payroll Expenditure</h3>
              <p className="chart-sub-ref">Gross vs Net salary distribution (INR)</p>
            </div>
            <span className="badge-fy-tag">FY 2026-27</span>
          </div>

          {/* SVG Area Line Chart */}
          <div className="chart-svg-area">
            <svg viewBox="0 0 500 200" className="expenditure-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grossGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="netGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="40" x2="490" y2="40" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="90" x2="490" y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="140" x2="490" y2="140" stroke="#f1f5f9" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="35" y="44" fontSize="10" fill="#94a3b8" textAnchor="end">₹34.0L</text>
              <text x="35" y="94" fontSize="10" fill="#94a3b8" textAnchor="end">₹25.5L</text>
              <text x="35" y="144" fontSize="10" fill="#94a3b8" textAnchor="end">₹17.0L</text>

              {/* Gross Pay Area & Curve */}
              <path
                d="M40,110 C120,95 200,80 280,68 C360,56 420,50 490,44 L490,170 L40,170 Z"
                fill="url(#grossGradient)"
              />
              <path
                d="M40,110 C120,95 200,80 280,68 C360,56 420,50 490,44"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Net Pay Area & Curve */}
              <path
                d="M40,135 C120,122 200,110 280,98 C360,86 420,78 490,72 L490,170 L40,170 Z"
                fill="url(#netGradient)"
              />
              <path
                d="M40,135 C120,122 200,110 280,98 C360,86 420,78 490,72"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Bottom Baseline */}
              <line x1="40" y1="170" x2="490" y2="170" stroke="#e2e8f0" strokeWidth="1" />

              {/* X Axis Month Labels */}
              <text x="70" y="188" fontSize="10" fill="#94a3b8" textAnchor="middle">Apr</text>
              <text x="140" y="188" fontSize="10" fill="#94a3b8" textAnchor="middle">May</text>
              <text x="210" y="188" fontSize="10" fill="#94a3b8" textAnchor="middle">Jun</text>
              <text x="280" y="188" fontSize="10" fill="#94a3b8" textAnchor="middle">Jul</text>
              <text x="350" y="188" fontSize="10" fill="#94a3b8" textAnchor="middle">Aug</text>
              <text x="420" y="188" fontSize="10" fill="#4f46e5" fontWeight="700" textAnchor="middle">Sep</text>
            </svg>
          </div>

          {/* Chart Legend */}
          <div className="chart-legend-row">
            <div className="legend-item">
              <span className="legend-box" style={{ background: "#10b981" }} />
              <span>Gross Commitment (₹32.4L)</span>
            </div>
            <div className="legend-item">
              <span className="legend-box" style={{ background: "#3b82f6" }} />
              <span>Net Payout (₹26.7L)</span>
            </div>
          </div>
        </div>

        {/* Right: Today's Attendance Donut Chart */}
        <div className="card-chart-box">
          <div className="chart-header-ref">
            <div>
              <h3 className="chart-title-ref">Today's Attendance</h3>
              <p className="chart-sub-ref">Breakdown of checked-in personnel</p>
            </div>
            <span className="badge-live-tag">
              <span className="dot-live" />
              Live
            </span>
          </div>

          {/* Donut Chart Container */}
          <div className="attendance-donut-wrapper">
            <div className="donut-svg-box">
              <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
                {/* Background Ring */}
                <circle cx="75" cy="75" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="15" />
                {/* Present (Green) */}
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="15"
                  strokeDasharray={`${strokePresent} ${circumference}`}
                  strokeDashoffset={offsetPresent}
                />
                {/* Overtime (Blue) */}
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="15"
                  strokeDasharray={`${strokeOvertime} ${circumference}`}
                  strokeDashoffset={offsetOvertime}
                />
                {/* Late (Amber) */}
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="15"
                  strokeDasharray={`${strokeLate} ${circumference}`}
                  strokeDashoffset={offsetLate}
                />
                {/* Exceptions (Red) */}
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="15"
                  strokeDasharray={`${strokeExceptions} ${circumference}`}
                  strokeDashoffset={offsetExceptions}
                />
              </svg>

              {/* Center Metrics Text */}
              <div className="donut-center-metric">
                <span className="donut-rate">{pctPresent}%</span>
                <span className="donut-caption">On Time</span>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="attendance-breakdown-list">
              <div className="att-stat-row">
                <div className="att-stat-label">
                  <span className="att-dot-legend" style={{ background: "#10b981" }} />
                  <span>On Time / Present</span>
                </div>
                <span className="att-stat-val">{presentCount}</span>
              </div>

              <div className="att-stat-row">
                <div className="att-stat-label">
                  <span className="att-dot-legend" style={{ background: "#3b82f6" }} />
                  <span>Overtime Shifts</span>
                </div>
                <span className="att-stat-val">{overtimeCount}</span>
              </div>

              <div className="att-stat-row">
                <div className="att-stat-label">
                  <span className="att-dot-legend" style={{ background: "#f59e0b" }} />
                  <span>Late Arrivals</span>
                </div>
                <span className="att-stat-val">{lateCount}</span>
              </div>

              <div className="att-stat-row">
                <div className="att-stat-label">
                  <span className="att-dot-legend" style={{ background: "#ef4444" }} />
                  <span>Exceptions / Missing</span>
                </div>
                <span className="att-stat-val">{exceptionsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
