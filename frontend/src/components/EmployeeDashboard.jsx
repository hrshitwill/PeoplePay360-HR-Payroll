import React, { useState, useEffect } from "react";
import { api } from "../api";
import { generatePayslipPDF, downloadPayrunCSV } from "../utils/pdfGenerator";
import {
  Clock,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Play,
  Square,
  FileText,
  User,
  Briefcase,
  Download,
  Eye,
  Plus,
  RefreshCw,
  TrendingUp,
  Shield,
  Layers,
  Check,
  X,
  Search,
  Filter,
  ArrowDownToLine
} from "lucide-react";

export const EmployeeDashboard = ({
  currentUser,
  activeTab = "dashboard",
  onNavigateTab,
  onSignOut
}) => {
  // Current real-time clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Attendance state
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [punchLoading, setPunchLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  // Time off state
  const [timeOffTypes, setTimeOffTypes] = useState([]);
  const [leaveAllocations, setLeaveAllocations] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    timeOffType: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    duration: 1,
    isHalfDay: false,
    reason: ""
  });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveError, setLeaveError] = useState("");

  // Pay role & contract state
  const [contract, setContract] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [payrunSearch, setPayrunSearch] = useState("");

  // Notification toast
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // Resolve employee identifier
  const employeeData = currentUser?.linkedEmployee || currentUser;
  const employeeId = employeeData?._id || employeeData?.id || currentUser?.id;

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all employee dashboard data
  const loadDashboardData = async () => {
    if (!employeeId) return;
    setAttendanceLoading(true);

    try {
      // 1. Fetch Today's Attendance
      try {
        const todayRes = await api.getTodayAttendance(employeeId);
        if (todayRes.success) {
          setTodayAttendance(todayRes.data);
        }
      } catch (err) {
        console.warn("Could not fetch today's attendance:", err.message);
      }

      // 2. Fetch Attendance History
      try {
        const histRes = await api.getEmployeeAttendance(employeeId, { limit: 14 });
        if (histRes.success && Array.isArray(histRes.data)) {
          setAttendanceHistory(histRes.data);
        }
      } catch (err) {
        console.warn("Could not fetch attendance history:", err.message);
      }

      // 3. Fetch Time Off Allocations & Leave Types
      try {
        const [typesRes, allocRes, reqRes] = await Promise.all([
          api.getTimeOffTypes(),
          api.getAllocations({ employeeId }),
          api.getLeaveRequests({ employeeId })
        ]);

        if (typesRes.success) {
          setTimeOffTypes(typesRes.data || []);
          if (typesRes.data?.length > 0 && !leaveForm.timeOffType) {
            setLeaveForm((prev) => ({ ...prev, timeOffType: typesRes.data[0]._id }));
          }
        }
        if (allocRes.success) {
          setLeaveAllocations(allocRes.data || []);
        }
        if (reqRes.success) {
          setLeaveRequests(reqRes.data || []);
        }
      } catch (err) {
        console.warn("Could not fetch time off data:", err.message);
      }

      // 4. Fetch Contract / Pay Role
      try {
        const contractRes = await api.getContracts({ employeeId });
        if (contractRes.success && contractRes.data?.length > 0) {
          const activeContract = contractRes.data.find((c) => c.status === "ACTIVE") || contractRes.data[0];
          setContract(activeContract);
        }
      } catch (err) {
        console.warn("Could not fetch contracts:", err.message);
      }

      // 5. Fetch Individual Payruns & Payslips
      try {
        let payslipRes = await api.getEmployeePayruns(employeeId);
        if (!payslipRes.success || !payslipRes.data?.length) {
          payslipRes = await api.getPayslips({ employeeId });
        }
        if (payslipRes.success && Array.isArray(payslipRes.data)) {
          setPayslips(payslipRes.data);
        }
      } catch (err) {
        console.warn("Could not fetch payslips:", err.message);
      }
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [employeeId]);

  // Handle Clock-In
  const handleClockIn = async () => {
    if (!employeeId) return;
    setPunchLoading(true);
    try {
      const res = await api.clockIn(employeeId);
      if (res.success) {
        setTodayAttendance(res.data);
        showToast("Checked In successfully! Shift timestamp recorded.");
        loadDashboardData();
      }
    } catch (err) {
      showToast(`Clock In error: ${err.message}`);
    } finally {
      setPunchLoading(false);
    }
  };

  // Handle Clock-Out
  const handleClockOut = async () => {
    if (!employeeId) return;
    setPunchLoading(true);
    try {
      const res = await api.clockOut(employeeId);
      if (res.success) {
        setTodayAttendance(res.data);
        showToast("Checked Out successfully! Total hours updated.");
        loadDashboardData();
      }
    } catch (err) {
      showToast(`Clock Out error: ${err.message}`);
    } finally {
      setPunchLoading(false);
    }
  };

  // Handle Apply For Leave Submit
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLeaveError("");
    setLeaveSubmitting(true);

    try {
      const payload = {
        employee: employeeId,
        timeOffType: leaveForm.timeOffType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        duration: Number(leaveForm.duration),
        isHalfDay: Boolean(leaveForm.isHalfDay),
        reason: leaveForm.reason
      };

      const res = await api.createLeaveRequest(payload);
      if (res.success) {
        showToast("Leave request submitted successfully! Pending manager review.");
        setIsLeaveModalOpen(false);
        setLeaveForm({
          timeOffType: timeOffTypes[0]?._id || "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
          duration: 1,
          isHalfDay: false,
          reason: ""
        });
        const [allocRes, reqRes] = await Promise.all([
          api.getAllocations({ employeeId }),
          api.getLeaveRequests({ employeeId })
        ]);
        if (allocRes.success) setLeaveAllocations(allocRes.data || []);
        if (reqRes.success) setLeaveRequests(reqRes.data || []);
      }
    } catch (err) {
      setLeaveError(err.message || "Failed to submit leave request.");
    } finally {
      setLeaveSubmitting(false);
    }
  };

  // Format exact timestamp
  const formatExactTime = (dateStr) => {
    if (!dateStr) return "--:--:--";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "--:--:--" : d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const isCheckedIn = Boolean(todayAttendance?.checkIn && !todayAttendance?.checkOut);
  const isCompletedToday = Boolean(todayAttendance?.checkIn && todayAttendance?.checkOut);

  // Compute worked hours today
  let todayHours = 0;
  if (todayAttendance?.totalWorkedHours) {
    todayHours = Number(todayAttendance.totalWorkedHours);
  } else if (isCheckedIn && todayAttendance?.checkIn) {
    const checkInTime = new Date(todayAttendance.checkIn).getTime();
    todayHours = Math.max(0, (currentTime.getTime() - checkInTime) / 3600000);
  }

  // Compute weekly hours from attendance history (current week)
  const weeklyHours = attendanceHistory
    .slice(0, 7)
    .reduce((sum, item) => sum + (Number(item.totalWorkedHours) || 0), 0) + (isCheckedIn ? todayHours : 0);

  // Filter payslips/payruns by search query
  const filteredPayslips = payslips.filter((ps) => {
    if (!payrunSearch.trim()) return true;
    const q = payrunSearch.toLowerCase();
    const batchName = (ps.payrun?.name || "").toLowerCase();
    const batchNum = (ps.payrun?.payrunBatchNumber || "").toLowerCase();
    const slipNum = (ps.payslipNumber || "").toLowerCase();
    return batchName.includes(q) || batchNum.includes(q) || slipNum.includes(q);
  });

  const totalNetDisbursed = payslips.reduce((sum, ps) => sum + (Number(ps.netSalary) || 0), 0);

  // =========================================================================
  // SUB-VIEW: DEDICATED INDIVIDUAL PAYRUNS & STATEMENTS VIEW (activeTab === "payslips")
  // =========================================================================
  const renderDedicatedPayrunsView = () => {
    return (
      <div>
        {/* Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            borderRadius: 16,
            padding: "24px 28px",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)"
              }}
            >
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "white" }}>
                My Individual Payruns & Statements
              </h2>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 13 }}>
                Download official PDF payrun statements and export salary records for {employeeData?.firstName} {employeeData?.lastName} ({employeeData?.employeeId || "EMP-SELF"})
              </p>
            </div>
          </div>

          {payslips.length > 0 && (
            <button
              onClick={() => generatePayslipPDF(payslips[0])}
              style={{
                padding: "10px 18px",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(37,99,235,0.4)"
              }}
            >
              <Download size={16} />
              <span>Download Latest Payrun (PDF)</span>
            </button>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "white", padding: 20, borderRadius: 14, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>TOTAL NET SALARY RECEIVED</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#059669", marginTop: 4 }}>
              ${totalNetDisbursed.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>Aggregated across all disbursed payruns</div>
          </div>

          <div style={{ background: "white", padding: 20, borderRadius: 14, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>BASE MONTHLY COMPENSATION</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#1d4ed8", marginTop: 4 }}>
              ${(contract?.salary || 6500).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
              Structure: {contract?.salaryStructure?.name || "Regular Corporate Structure"}
            </div>
          </div>

          <div style={{ background: "white", padding: 20, borderRadius: 14, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>AVAILABLE PAYRUN STATEMENTS</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>
              {payslips.length} <span style={{ fontSize: 14, fontWeight: 500, color: "#64748b" }}>statements</span>
            </div>
            <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>Ready for PDF / CSV download</div>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ background: "white", padding: "16px 20px", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by payrun batch, date, or slip ID..."
              style={{ paddingLeft: 36, height: 38, borderRadius: 8, fontSize: 13 }}
              value={payrunSearch}
              onChange={(e) => setPayrunSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: 12.5, color: "#64748b" }}>
            Showing {filteredPayslips.length} of {payslips.length} payrun statements
          </span>
        </div>

        {/* Payruns List */}
        {filteredPayslips.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filteredPayslips.map((ps) => (
              <div
                key={ps._id}
                style={{
                  background: "white",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: "#ecfdf5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#059669"
                    }}
                  >
                    <DollarSign size={22} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ fontSize: 15, color: "#0f172a" }}>
                        {ps.payrun?.name || "Regular Corporate Payrun"}
                      </strong>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          background: "#ecfdf5",
                          color: "#059669",
                          padding: "2px 8px",
                          borderRadius: 8,
                          border: "1px solid #a7f3d0"
                        }}
                      >
                        ✓ PAID
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                      Batch: <code style={{ color: "#334155" }}>{ps.payrun?.payrunBatchNumber || "PAYRUN-2026"}</code> • Slip:{" "}
                      <code>{ps.payslipNumber || "PS-2026"}</code> • Period:{" "}
                      {new Date(ps.periodStart).toLocaleDateString()} - {new Date(ps.periodEnd).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11.5, color: "#64748b" }}>Net Disbursed Pay</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>
                      ${Number(ps.netSalary || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                      Gross: ${Number(ps.grossSalary || ps.totalGross || 0).toFixed(2)} | Deductions: -${Number(ps.totalDeductions || 0).toFixed(2)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setSelectedPayslip(ps)}
                      style={{
                        padding: "8px 12px",
                        background: "white",
                        border: "1px solid #cbd5e1",
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                      title="View itemized earnings and deductions"
                    >
                      <Eye size={15} />
                      <span>Breakdown</span>
                    </button>

                    <button
                      onClick={() => downloadPayrunCSV(ps)}
                      style={{
                        padding: "8px 12px",
                        background: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#334155"
                      }}
                      title="Export individual payrun as CSV"
                    >
                      <FileSpreadsheet size={15} />
                      <span>CSV</span>
                    </button>

                    <button
                      onClick={() => generatePayslipPDF(ps)}
                      style={{
                        padding: "8px 14px",
                        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 2px 6px rgba(37,99,235,0.3)"
                      }}
                      title="Download Official Individual Payrun Statement PDF"
                    >
                      <Download size={15} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 14, padding: "48px 20px", textAlign: "center", border: "1px solid #e2e8f0" }}>
            <FileSpreadsheet size={36} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#334155", margin: "0 0 6px" }}>No Individual Payrun Statements Found</h3>
            <p style={{ fontSize: 13, color: "#64748b", maxWidth: 460, margin: "0 auto" }}>
              Payruns are generated monthly by the corporate payroll system. Once your department disburses the cycle, your statement with breakdown, PDF and CSV will appear here.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#0f172a",
            color: "white",
            padding: "12px 20px",
            borderRadius: 10,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 9999,
            fontSize: 13.5,
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <CheckCircle size={16} color="#10b981" />
          <span>{toast}</span>
        </div>
      )}

      {/* If activeTab is specifically "payslips", render dedicated Payrun portal */}
      {activeTab === "payslips" ? (
        renderDedicatedPayrunsView()
      ) : (
        /* Full Client Dashboard Overview */
        <>
          {/* Header Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              borderRadius: 16,
              padding: "24px 28px",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 20,
              marginBottom: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)"
                }}
              >
                {employeeData?.firstName ? employeeData.firstName[0] : currentUser?.name ? currentUser.name[0] : "E"}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "white" }}>
                    Welcome, {employeeData?.firstName || currentUser?.name || "Employee"}!
                  </h2>
                  <span
                    style={{
                      background: "rgba(16, 185, 129, 0.2)",
                      color: "#34d399",
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      border: "1px solid rgba(16, 185, 129, 0.3)"
                    }}
                  >
                    Active Employee
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 13 }}>
                  {contract?.jobPosition || employeeData?.jobTitle || "Software Engineer"} •{" "}
                  {contract?.department || employeeData?.department || "Engineering"} • ID:{" "}
                  {employeeData?.employeeId || "EMP-SELF"}
                </p>
              </div>
            </div>

            {/* Live Digital Clock */}
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: "12px 20px",
                textAlign: "right"
              }}
            >
              <div style={{ fontSize: 11.5, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "monospace", color: "#60a5fa", marginTop: 2 }}>
                {currentTime.toLocaleTimeString("en-US")}
              </div>
            </div>
          </div>

          {/* Top 3 Cards Grid: Punch In/Out, Activity Time, Pay Roles */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 28 }}>
            
            {/* CARD 1: Clock In / Clock Out Shift Widget */}
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: 24,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={18} color="#3b82f6" />
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Today's Shift Attendance</h3>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 12,
                      background: isCheckedIn ? "#ecfdf5" : isCompletedToday ? "#eff6ff" : "#f1f5f9",
                      color: isCheckedIn ? "#059669" : isCompletedToday ? "#2563eb" : "#64748b"
                    }}
                  >
                    {isCheckedIn ? "CURRENTLY WORKING" : isCompletedToday ? "SHIFT COMPLETED" : "NOT CLOCKED IN"}
                  </span>
                </div>

                {/* Exact Timestamps Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 10,
                      padding: "12px 14px",
                      border: "1px solid #e2e8f0"
                    }}
                  >
                    <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>CHECK-IN TIME</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: todayAttendance?.checkIn ? "#0f172a" : "#94a3b8", marginTop: 4 }}>
                      {formatExactTime(todayAttendance?.checkIn)}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 10,
                      padding: "12px 14px",
                      border: "1px solid #e2e8f0"
                    }}
                  >
                    <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>CHECK-OUT TIME</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: todayAttendance?.checkOut ? "#0f172a" : "#94a3b8", marginTop: 4 }}>
                      {formatExactTime(todayAttendance?.checkOut)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  onClick={handleClockIn}
                  disabled={punchLoading || isCheckedIn || isCompletedToday}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 10,
                    border: "none",
                    background: !isCheckedIn && !isCompletedToday ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "#e2e8f0",
                    color: !isCheckedIn && !isCompletedToday ? "white" : "#94a3b8",
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: !isCheckedIn && !isCompletedToday ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.15s"
                  }}
                >
                  <Play size={16} />
                  <span>{punchLoading ? "Processing..." : "Clock In"}</span>
                </button>

                <button
                  onClick={handleClockOut}
                  disabled={punchLoading || !isCheckedIn}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 10,
                    border: "none",
                    background: isCheckedIn ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" : "#e2e8f0",
                    color: isCheckedIn ? "white" : "#94a3b8",
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: isCheckedIn ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.15s"
                  }}
                >
                  <Square size={16} />
                  <span>{punchLoading ? "Processing..." : "Clock Out"}</span>
                </button>
              </div>
            </div>

            {/* CARD 2: Activity Time & Shift Progress */}
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: 24,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <TrendingUp size={18} color="#8b5cf6" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Activity & Worked Hours</h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                <div style={{ background: "#faf5ff", borderRadius: 10, padding: 14, border: "1px solid #f3e8ff" }}>
                  <div style={{ fontSize: 12, color: "#6b21a8", fontWeight: 600 }}>TODAY'S ACTIVITY</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#581c87", marginTop: 4 }}>
                    {todayHours.toFixed(1)} <span style={{ fontSize: 14, fontWeight: 600 }}>hrs</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#9333ea", marginTop: 2 }}>Target: 8.0 hrs / day</div>
                </div>

                <div style={{ background: "#eff6ff", borderRadius: 10, padding: 14, border: "1px solid #dbeafe" }}>
                  <div style={{ fontSize: 12, color: "#1e40af", fontWeight: 600 }}>THIS WEEK</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#1e3a8a", marginTop: 4 }}>
                    {weeklyHours.toFixed(1)} <span style={{ fontSize: 14, fontWeight: 600 }}>hrs</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#2563eb", marginTop: 2 }}>Target: 40.0 hrs / wk</div>
                </div>
              </div>

              {/* Daily Progress Bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
                  <span style={{ color: "#64748b" }}>Daily Shift Completion</span>
                  <span style={{ color: "#0f172a" }}>{Math.min(100, Math.round((todayHours / 8) * 100))}%</span>
                </div>
                <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(100, (todayHours / 8) * 100)}%`,
                      background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
                      borderRadius: 4,
                      transition: "width 0.3s ease"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* CARD 3: Pay Roles & Employment Agreement */}
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: 24,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <DollarSign size={18} color="#10b981" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Pay Roles & Compensation</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 12.5, color: "#64748b" }}>Role / Designation:</span>
                  <strong style={{ fontSize: 13, color: "#0f172a" }}>
                    {contract?.jobPosition || employeeData?.jobTitle || "Software Engineer"}
                  </strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 12.5, color: "#64748b" }}>Base Wage:</span>
                  <strong style={{ fontSize: 14, color: "#059669", fontWeight: 700 }}>
                    ${(contract?.salary || 6500).toLocaleString("en-US", { minimumFractionDigits: 2 })} / mo
                  </strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 12.5, color: "#64748b" }}>Salary Structure:</span>
                  <span style={{ fontSize: 12.5, color: "#1e293b", fontWeight: 600 }}>
                    {contract?.salaryStructure?.name || "Regular Corporate Structure"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12.5, color: "#64748b" }}>Contract Reference:</span>
                  <span style={{ fontSize: 12, color: "#475569", fontFamily: "monospace" }}>
                    {contract?.contractReference || "CNT-2026-ACTIVE"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Management Section */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              marginBottom: 28
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={20} color="#3b82f6" />
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Leave Quotas & Applications</h3>
                  <p style={{ margin: 0, fontSize: 12.5, color: "#64748b" }}>Check your remaining balances and apply for time off</p>
                </div>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                style={{
                  padding: "9px 16px",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 2px 6px rgba(37,99,235,0.3)"
                }}
              >
                <Plus size={16} />
                <span>Apply for Leave</span>
              </button>
            </div>

            {/* Leave Balances Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
              {leaveAllocations.length > 0 ? (
                leaveAllocations.map((alloc) => (
                  <div
                    key={alloc._id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: 16,
                      background: "#f8fafc"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                        {alloc.timeOffType?.name || "Paid Leave"}
                      </span>
                      <span style={{ fontSize: 10, background: "#dbeafe", color: "#1d4ed8", padding: "2px 6px", borderRadius: 6, fontWeight: 600 }}>
                        {alloc.timeOffType?.code || "PTO"}
                      </span>
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "8px 0 4px" }}>
                      {alloc.remainingUnits || 0}{" "}
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>days left</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b" }}>
                      Allocated: {alloc.allocatedUnits} • Taken: {alloc.takenUnits || 0}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 16,
                    background: "#f8fafc"
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Paid Time Off (PTO)</span>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "8px 0 4px" }}>
                    20 <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>days left</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>Standard 2026 Annual Quota</div>
                </div>
              )}
            </div>

            {/* Recent Leave Requests List */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "#334155", marginBottom: 12 }}>My Recent Leave Requests</h4>
              {leaveRequests.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: 12, color: "#64748b" }}>
                        <th style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0" }}>Type</th>
                        <th style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0" }}>Duration</th>
                        <th style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0" }}>Dates</th>
                        <th style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0" }}>Reason</th>
                        <th style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveRequests.map((req) => (
                        <tr key={req._id} style={{ fontSize: 13, borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px 14px", fontWeight: 600 }}>{req.timeOffType?.name || "Leave"}</td>
                          <td style={{ padding: "10px 14px" }}>{req.duration} day{req.duration > 1 ? "s" : ""}</td>
                          <td style={{ padding: "10px 14px", color: "#475569" }}>
                            {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "10px 14px", color: "#64748b" }}>{req.reason || "—"}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "3px 8px",
                                borderRadius: 10,
                                background:
                                  req.status === "APPROVED"
                                    ? "#ecfdf5"
                                    : req.status === "REFUSED"
                                    ? "#fef2f2"
                                    : "#fffbeb",
                                color:
                                  req.status === "APPROVED"
                                    ? "#059669"
                                    : req.status === "REFUSED"
                                    ? "#dc2626"
                                    : "#d97706"
                              }}
                            >
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: 13 }}>
                  No leave requests filed yet. Click "Apply for Leave" above when you need time off.
                </div>
              )}
            </div>
          </div>

          {/* Individual Payruns & Attendance History Section */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: 24 }}>
            
            {/* Individual Payruns Section with Direct PDF Download */}
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: 24,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileSpreadsheet size={18} color="#10b981" />
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>My Individual Payruns</h3>
                    <p style={{ margin: 0, fontSize: 11.5, color: "#64748b" }}>Download your official salary statements & payrun PDFs</p>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{payslips.length} statement(s)</span>
              </div>

              {payslips.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {payslips.map((ps) => (
                    <div
                      key={ps._id}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: 16,
                        background: "#f8fafc",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 12
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                          {ps.payrun?.name || "Monthly Payrun Statement"}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                          Period: {new Date(ps.periodStart).toLocaleDateString()} - {new Date(ps.periodEnd).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#059669", marginTop: 4 }}>
                          Net: ${(ps.netSalary || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => setSelectedPayslip(ps)}
                          style={{
                            padding: "7px 11px",
                            background: "white",
                            border: "1px solid #cbd5e1",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4
                          }}
                          title="View statement breakdown"
                        >
                          <Eye size={14} />
                          <span>Breakdown</span>
                        </button>

                        <button
                          onClick={() => downloadPayrunCSV(ps)}
                          style={{
                            padding: "7px 11px",
                            background: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            color: "#334155"
                          }}
                          title="Download CSV statement"
                        >
                          <FileSpreadsheet size={14} />
                          <span>CSV</span>
                        </button>

                        <button
                          onClick={() => generatePayslipPDF(ps)}
                          style={{
                            padding: "7px 12px",
                            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            boxShadow: "0 2px 6px rgba(37,99,235,0.3)"
                          }}
                          title="Download Payrun PDF Statement"
                        >
                          <Download size={14} />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "#94a3b8", fontSize: 13 }}>
                  No payrun statements issued yet. Once payroll is processed, your individual payruns and download buttons will appear here.
                </div>
              )}
            </div>

            {/* Recent Attendance Logs */}
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: 24,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={18} color="#3b82f6" />
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Attendance Log History</h3>
                </div>
                <span style={{ fontSize: 12, color: "#64748b" }}>Exact Timestamps</span>
              </div>

              {attendanceHistory.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", color: "#64748b", textAlign: "left" }}>
                        <th style={{ padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>Date</th>
                        <th style={{ padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>Clock In</th>
                        <th style={{ padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>Clock Out</th>
                        <th style={{ padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>Hours</th>
                        <th style={{ padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceHistory.map((att) => (
                        <tr key={att._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "9px 12px", fontWeight: 600 }}>
                            {new Date(att.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "9px 12px", fontFamily: "monospace", color: "#059669" }}>
                            {formatExactTime(att.checkIn)}
                          </td>
                          <td style={{ padding: "9px 12px", fontFamily: "monospace", color: "#dc2626" }}>
                            {formatExactTime(att.checkOut)}
                          </td>
                          <td style={{ padding: "9px 12px", fontWeight: 700 }}>
                            {(att.totalWorkedHours || 0).toFixed(1)}h
                          </td>
                          <td style={{ padding: "9px 12px" }}>
                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: 6,
                                background: att.status === "PRESENT" ? "#ecfdf5" : "#f1f5f9",
                                color: att.status === "PRESENT" ? "#059669" : "#64748b"
                              }}
                            >
                              {att.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "#94a3b8", fontSize: 13 }}>
                  No past attendance history recorded yet. Punch in and out above to record timestamps.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODAL: Apply For Leave */}
      {isLeaveModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500, borderRadius: 16 }}>
            <div className="modal-header" style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Calendar size={20} color="#2563eb" />
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Apply for Leave</h3>
              </div>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
                onClick={() => setIsLeaveModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} style={{ padding: "20px 24px" }}>
              {leaveError && (
                <div style={{ padding: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#991b1b", fontSize: 13, marginBottom: 14 }}>
                  {leaveError}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Leave Type</label>
                <select
                  className="form-control"
                  value={leaveForm.timeOffType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, timeOffType: e.target.value })}
                  required
                >
                  {timeOffTypes.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Number of Days</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  className="form-control"
                  value={leaveForm.duration}
                  onChange={(e) => setLeaveForm({ ...leaveForm, duration: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Reason / Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Annual family vacation, personal errands..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsLeaveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={leaveSubmitting}
                >
                  {leaveSubmitting ? "Submitting..." : "Submit Leave Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Payslip Detail Breakdown */}
      {selectedPayslip && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 640, borderRadius: 16 }}>
            <div className="modal-header" style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0" }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>
                  Individual Payrun Statement: {selectedPayslip.payslipNumber || "N/A"}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
                  {selectedPayslip.payrun?.name || "Corporate Payrun"} • Period: {new Date(selectedPayslip.periodStart).toLocaleDateString()} - {new Date(selectedPayslip.periodEnd).toLocaleDateString()}
                </p>
              </div>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
                onClick={() => setSelectedPayslip(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>Gross Earnings</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#059669", marginTop: 2 }}>
                    ${(selectedPayslip.grossSalary || selectedPayslip.totalGross || 0).toFixed(2)}
                  </div>
                </div>
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>Total Deductions</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#dc2626", marginTop: 2 }}>
                    ${(selectedPayslip.totalDeductions || 0).toFixed(2)}
                  </div>
                </div>
                <div style={{ background: "#eff6ff", padding: 12, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 11.5, color: "#1d4ed8" }}>Net Disbursed</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#1d4ed8", marginTop: 2 }}>
                    ${(selectedPayslip.netSalary || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Line Items List */}
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 10 }}>Calculated Line Items</h4>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", textAlign: "left", color: "#64748b" }}>
                      <th style={{ padding: "8px 12px" }}>Component</th>
                      <th style={{ padding: "8px 12px" }}>Category</th>
                      <th style={{ padding: "8px 12px", textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPayslip.lines || []).map((line, idx) => (
                      <tr key={idx} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px 12px", fontWeight: 600 }}>{line.ruleName || line.name} ({line.code})</td>
                        <td style={{ padding: "8px 12px", color: "#64748b" }}>{line.category}</td>
                        <td
                          style={{
                            padding: "8px 12px",
                            textAlign: "right",
                            fontWeight: 700,
                            color: line.type === "DEDUCTION" ? "#dc2626" : "#059669"
                          }}
                        >
                          {line.type === "DEDUCTION" ? "-" : "+"}${Number(line.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedPayslip(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => downloadPayrunCSV(selectedPayslip)}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <FileSpreadsheet size={15} />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => generatePayslipPDF(selectedPayslip)}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Download size={15} />
                  <span>Download Payrun PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
