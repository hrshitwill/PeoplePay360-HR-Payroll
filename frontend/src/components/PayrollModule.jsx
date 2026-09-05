import React, { useState, useEffect } from "react";
import { api } from "../api";
import { generatePayslipPDF } from "../utils/pdfGenerator";
import {
  DollarSign,
  Plus,
  Play,
  CheckCircle,
  CreditCard,
  Send,
  FileText,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Printer,
  Mail,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Sliders
} from "lucide-react";

export const PayrollModule = ({ initialEmployeeId, initialSubtab, currentRole }) => {
  const [subtab, setSubtab] = useState(initialSubtab || "payruns"); // payruns, payslips, structures, rules
  const [payruns, setPayruns] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [structures, setStructures] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Payrun for Processing View
  const [activePayrun, setActivePayrun] = useState(null);
  const [payrunDetailsLoading, setPayrunDetailsLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState("");

  // Selected Payslip for Detail View / Print
  const [activePayslip, setActivePayslip] = useState(null);

  // Payrun Wizard State (Requirement B5)
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    name: "September 2026 Payroll Batch",
    salaryStructure: "",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    selectedEmployees: []
  });
  const [eligibleStaff, setEligibleStaff] = useState([]);
  const [wizardLoading, setWizardLoading] = useState(false);
  const [wizardError, setWizardError] = useState("");

  // Rule / Structure Modals
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    name: "",
    code: "",
    sequence: 10,
    category: "ALLOWANCE",
    type: "EARNING",
    calculationType: "FIXED",
    amount: 0,
    percentage: 0,
    percentageOf: "BASE",
    formula: "",
    description: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prRes, psRes, strRes, rRes] = await Promise.all([
        api.getPayruns(),
        api.getPayslips({ employeeId: initialEmployeeId || undefined }),
        api.getSalaryStructures(),
        api.getSalaryRules()
      ]);

      if (prRes.success) setPayruns(prRes.data);
      if (psRes.success) setPayslips(psRes.data);
      if (strRes.success) {
        setStructures(strRes.data);
        if (!wizardData.salaryStructure && strRes.data.length > 0) {
          setWizardData((prev) => ({ ...prev, salaryStructure: strRes.data[0]._id }));
        }
      }
      if (rRes.success) setRules(rRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [subtab]);

  // Load single payrun details
  const openPayrunProcessing = async (payrunId) => {
    try {
      setPayrunDetailsLoading(true);
      setActionFeedback("");
      const res = await api.getPayrunById(payrunId);
      if (res.success) {
        setActivePayrun(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPayrunDetailsLoading(false);
    }
  };

  // Compute Payrun
  const handleCompute = async () => {
    if (!activePayrun) return;
    try {
      setActionFeedback("Computing payslips via Salary Rule Engine...");
      const res = await api.computePayrun(activePayrun._id);
      if (res.success) {
        setActivePayrun(res.data);
        setActionFeedback("Salary computation completed successfully!");
        loadData();
      }
    } catch (err) {
      setActionFeedback(`Compute failed: ${err.message}`);
    }
  };

  // Validate Payrun
  const handleValidate = async () => {
    if (!activePayrun) return;
    try {
      setActionFeedback("Validating payroll rules and operational constraints...");
      const res = await api.validatePayrun(activePayrun._id, "Checked and validated by payroll manager");
      if (res.success) {
        openPayrunProcessing(activePayrun._id);
        setActionFeedback("Payrun batch validated successfully!");
        loadData();
      }
    } catch (err) {
      setActionFeedback(`Validation failed: ${err.message}`);
    }
  };

  // Mark Paid
  const handleMarkPaid = async () => {
    if (!activePayrun) return;
    try {
      setActionFeedback("Disbursing salaries and recording payment timestamps...");
      const res = await api.markPayrunPaid(activePayrun._id);
      if (res.success) {
        openPayrunProcessing(activePayrun._id);
        setActionFeedback("Payrun batch marked as PAID! Direct deposits finalized.");
        loadData();
      }
    } catch (err) {
      setActionFeedback(`Payment failed: ${err.message}`);
    }
  };

  // Bulk Email Payslips
  const handleSendEmails = async () => {
    if (!activePayrun) return;
    try {
      setActionFeedback("Dispatching bulk employee payslip emails...");
      const res = await api.sendBulkPayslipEmails(activePayrun._id);
      if (res.success) {
        openPayrunProcessing(activePayrun._id);
        setActionFeedback(`Dispatched ${res.data.totalDispatched} email notifications to employees.`);
        loadData();
      }
    } catch (err) {
      setActionFeedback(`Email dispatch failed: ${err.message}`);
    }
  };

  // Payrun Creation Wizard Actions (Requirement B5)
  const openWizard = () => {
    setWizardStep(1);
    setWizardError("");
    setWizardData({
      name: `Payrun Batch - ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`,
      salaryStructure: structures[0]?._id || "",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
      selectedEmployees: []
    });
    setIsWizardOpen(true);
  };

  const proceedToStep2 = async () => {
    if (!wizardData.name || !wizardData.periodStart || !wizardData.periodEnd || !wizardData.salaryStructure) {
      setWizardError("Please complete all scope fields.");
      return;
    }

    try {
      setWizardLoading(true);
      setWizardError("");
      const res = await api.getEligibleEmployees({
        salaryStructureId: wizardData.salaryStructure,
        periodStart: wizardData.periodStart,
        periodEnd: wizardData.periodEnd
      });

      if (res.success) {
        setEligibleStaff(res.data);
        // Default select all eligible staff who have active contract
        const eligibleIds = res.data.filter((item) => item.hasActiveContract).map((item) => item.employee._id);
        setWizardData((prev) => ({ ...prev, selectedEmployees: eligibleIds }));
        setWizardStep(2);
      }
    } catch (err) {
      setWizardError(err.message);
    } finally {
      setWizardLoading(false);
    }
  };

  const handleFinishWizard = async () => {
    if (wizardData.selectedEmployees.length === 0) {
      setWizardError("Please select at least one employee for the payrun batch.");
      return;
    }

    try {
      setWizardLoading(true);
      setWizardError("");
      const res = await api.createPayrun({
        name: wizardData.name,
        periodStart: wizardData.periodStart,
        periodEnd: wizardData.periodEnd,
        salaryStructure: wizardData.salaryStructure,
        employees: wizardData.selectedEmployees
      });

      if (res.success) {
        setIsWizardOpen(false);
        loadData();
        // Immediately open the newly created payrun processing view!
        openPayrunProcessing(res.data._id);
      }
    } catch (err) {
      setWizardError(err.message);
    } finally {
      setWizardLoading(false);
    }
  };

  const toggleSelectEmployee = (empId) => {
    setWizardData((prev) => {
      const exists = prev.selectedEmployees.includes(empId);
      return {
        ...prev,
        selectedEmployees: exists
          ? prev.selectedEmployees.filter((id) => id !== empId)
          : [...prev.selectedEmployees, empId]
      };
    });
  };

  const handleSelectAllEmployees = () => {
    const allEligibleIds = eligibleStaff.filter((i) => i.hasActiveContract).map((i) => i.employee._id);
    setWizardData((prev) => ({
      ...prev,
      selectedEmployees: prev.selectedEmployees.length === allEligibleIds.length ? [] : allEligibleIds
    }));
  };

  // Rule Creation Action
  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      await api.createSalaryRule(ruleForm);
      setIsRuleModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const canManageStructures = currentRole === "ADMIN" || currentRole === "HR_PAYROLL_MANAGER";

  // ==================== VIEW: PAYRUN PROCESSING SCREEN (Requirement B6) ====================
  if (activePayrun) {
    const p = activePayrun;
    const warnings = p.warnings || [];
    const payslipsList = p.payslips || [];

    return (
      <div>
        {/* Back button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setActivePayrun(null);
              loadData();
            }}
          >
            ← Back to Payruns List
          </button>

          <span className={`badge badge-${p.status?.toLowerCase()}`} style={{ fontSize: 13, padding: "4px 12px" }}>
            Status: {p.status}
          </span>
        </div>

        {/* Processing Header Card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header" style={{ flexWrap: "wrap", gap: 14 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{p.name}</h2>
              <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                Batch #{p.payrunBatchNumber} • Structure: {p.salaryStructure?.name} • Period:{" "}
                {new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}
              </p>
            </div>

            {/* Processing Action Buttons (Requirement B6) */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {p.status !== "PAID" && (
                <button
                  className="btn btn-primary"
                  onClick={handleCompute}
                  title="Compute salary components for all selected staff using period contracts"
                >
                  <Play size={15} /> Compute Salary
                </button>
              )}

              {p.status === "COMPUTED" && (
                <button
                  className="btn btn-secondary"
                  onClick={handleValidate}
                  title="Validate warnings and lock salary calculations"
                >
                  <CheckCircle size={15} color="#10b981" /> Validate Batch
                </button>
              )}

              {p.status === "VALIDATED" && (
                <button
                  className="btn btn-success"
                  onClick={handleMarkPaid}
                  title="Mark batch as paid and finalize historical records"
                >
                  <CreditCard size={15} /> Mark as Paid
                </button>
              )}

              {p.status === "PAID" && (
                <button
                  className="btn btn-primary"
                  onClick={handleSendEmails}
                  title="Simulate bulk email distribution to employees"
                >
                  <Send size={15} /> Send Payslips (Bulk Email)
                </button>
              )}
            </div>
          </div>

          <div className="card-body">
            {/* Totals Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <div style={{ padding: 14, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>TOTAL GROSS EARNINGS</span>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                  ${Number(p.totalGross || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ padding: 14, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#991b1b" }}>TOTAL DEDUCTIONS</span>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#dc2626", marginTop: 2 }}>
                  ${Number(p.totalDeductions || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ padding: 14, background: "#eef2ff", borderRadius: 8, border: "1px solid #c7d2fe" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#3730a3" }}>TOTAL NET SALARY DISBURSED</span>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#4f46e5", marginTop: 2 }}>
                  ${Number(p.totalNet || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ padding: 14, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>BATCH STATUS & EMAILS</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginTop: 4 }}>
                  {p.emailCount > 0 ? `Sent to ${p.emailCount} staff` : "Emails not dispatched"}
                </div>
              </div>
            </div>

            {actionFeedback && (
              <div style={{ marginTop: 16, padding: 10, background: "#f1f5f9", borderRadius: 8, fontSize: 13, color: "#334155" }}>
                {actionFeedback}
              </div>
            )}
          </div>
        </div>

        {/* Operational Warnings Banner (Requirement B6) */}
        {warnings.length > 0 && (
          <div className="card" style={{ marginBottom: 20, borderLeft: "4px solid #f59e0b" }}>
            <div className="card-header" style={{ background: "#fffbeb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={18} color="#d97706" />
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "#92400e" }}>
                  Pre-Validation Warnings & Attention Items ({warnings.length})
                </h4>
              </div>
            </div>
            <div style={{ padding: "12px 24px", display: "flex", flexDirection: "column", gap: 6 }}>
              {warnings.map((w, idx) => (
                <div key={idx} style={{ fontSize: 13, color: "#334155", display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="badge badge-draft" style={{ fontSize: 10 }}>{w.type}</span>
                  <span>{w.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Payslips Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Generated Payslips ({payslipsList.length})</div>
              <div className="card-subtitle">Calculated breakdowns for employees in this payrun batch</div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Payslip #</th>
                  <th>Employee</th>
                  <th>Contract Wage</th>
                  <th>Gross Pay</th>
                  <th>Deductions</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payslipsList.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                      No payslips computed yet. Click "Compute Salary" above to execute calculation.
                    </td>
                  </tr>
                ) : (
                  payslipsList.map((ps) => (
                    <tr key={ps._id}>
                      <td><code>{ps.payslipNumber}</code></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {ps.employee?.firstName} {ps.employee?.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {ps.employee?.employeeId} • {ps.employee?.department}
                        </div>
                      </td>
                      <td>${Number(ps.basicSalary || 0).toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>${Number(ps.grossSalary || 0).toLocaleString()}</td>
                      <td style={{ color: "#dc2626" }}>-${Number(ps.totalDeductions || 0).toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: "#4f46e5", fontSize: 15 }}>
                        ${Number(ps.netSalary || 0).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge badge-${ps.status?.toLowerCase()}`}>{ps.status}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setActivePayslip(ps)}
                            title="View line item calculation breakdown"
                          >
                            <FileText size={13} /> View
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => generatePayslipPDF(ps)}
                            title="Download official PDF document"
                          >
                            <Printer size={13} /> PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN PAYROLL VIEW ====================
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>Payroll Management</h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>
            Two-step Payrun creation wizard, Salary computation engine, Payslip PDF generation & bulk email delivery
          </p>
        </div>

        {subtab === "payruns" && (
          <button className="btn btn-primary" onClick={openWizard}>
            <Plus size={16} /> New Payrun (Wizard)
          </button>
        )}

        {subtab === "rules" && canManageStructures && (
          <button className="btn btn-primary" onClick={() => setIsRuleModalOpen(true)}>
            <Plus size={16} /> New Salary Rule
          </button>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="subtabs-bar">
        <button
          className={`subtab-btn ${subtab === "payruns" ? "active" : ""}`}
          onClick={() => setSubtab("payruns")}
        >
          <DollarSign size={16} /> Payrun Batches ({payruns.length})
        </button>
        <button
          className={`subtab-btn ${subtab === "payslips" ? "active" : ""}`}
          onClick={() => setSubtab("payslips")}
        >
          <FileText size={16} /> All Payslips ({payslips.length})
        </button>
        <button
          className={`subtab-btn ${subtab === "structures" ? "active" : ""}`}
          onClick={() => setSubtab("structures")}
        >
          <Layers size={16} /> Salary Structures ({structures.length})
        </button>
        <button
          className={`subtab-btn ${subtab === "rules" ? "active" : ""}`}
          onClick={() => setSubtab("rules")}
        >
          <Sliders size={16} /> Salary Rules ({rules.length})
        </button>
      </div>

      {/* SUBTAB 1: PAYRUNS */}
      {subtab === "payruns" && (
        <div className="card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Batch #</th>
                  <th>Payrun Name</th>
                  <th>Period</th>
                  <th>Salary Structure</th>
                  <th>Staff Count</th>
                  <th>Total Net Pay</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: 30 }}>
                      Loading payruns...
                    </td>
                  </tr>
                ) : payruns.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                      No payrun batches created yet. Click "New Payrun (Wizard)" to launch batch setup.
                    </td>
                  </tr>
                ) : (
                  payruns.map((pr) => (
                    <tr key={pr._id}>
                      <td><code>{pr.payrunBatchNumber || pr._id.slice(-6)}</code></td>
                      <td style={{ fontWeight: 600 }}>{pr.name}</td>
                      <td>
                        {new Date(pr.periodStart).toLocaleDateString()} - {new Date(pr.periodEnd).toLocaleDateString()}
                      </td>
                      <td>{pr.salaryStructure?.name}</td>
                      <td>{pr.employees?.length || 0} employees</td>
                      <td style={{ fontWeight: 700, color: "#4f46e5" }}>
                        ${Number(pr.totalNet || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className={`badge badge-${pr.status?.toLowerCase()}`}>{pr.status}</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openPayrunProcessing(pr._id)}
                        >
                          Open Processing →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ALL PAYSLIPS */}
      {subtab === "payslips" && (
        <div className="card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Payslip #</th>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Gross Salary</th>
                  <th>Total Deductions</th>
                  <th>Net Payable</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((ps) => (
                  <tr key={ps._id}>
                    <td><code>{ps.payslipNumber}</code></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {ps.employee?.firstName} {ps.employee?.lastName}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {ps.employee?.employeeId} • {ps.employee?.department}
                      </div>
                    </td>
                    <td>
                      {new Date(ps.periodStart).toLocaleDateString()} - {new Date(ps.periodEnd).toLocaleDateString()}
                    </td>
                    <td>${Number(ps.grossSalary || 0).toLocaleString()}</td>
                    <td style={{ color: "#dc2626" }}>-${Number(ps.totalDeductions || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: "#4f46e5" }}>
                      ${Number(ps.netSalary || 0).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge badge-${ps.status?.toLowerCase()}`}>{ps.status}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setActivePayslip(ps)}
                          title="View detailed rule breakdowns"
                        >
                          <FileText size={13} /> View
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => generatePayslipPDF(ps)}
                          title="Generate printable PDF"
                        >
                          <Printer size={13} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SALARY STRUCTURES (Requirement A5) */}
      {subtab === "structures" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
          {structures.map((st) => (
            <div key={st._id} className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{st.name}</h3>
                  <code style={{ fontSize: 12, color: "#64748b" }}>{st.code}</code>
                </div>
                <span className="badge badge-active">Active</span>
              </div>
              <div className="card-body">
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>{st.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 14, borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
                  <span style={{ color: "#64748b" }}>Assigned Employees:</span>
                  <strong>{st.assignedEmployeesCount || 0} Staff</strong>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
                  Included Salary Rules ({st.rules?.length || 0}):
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {st.rules?.map((r) => (
                    <span
                      key={r._id}
                      className="badge"
                      style={{
                        background: r.type === "DEDUCTION" ? "#fef2f2" : "#eef2ff",
                        color: r.type === "DEDUCTION" ? "#991b1b" : "#4f46e5",
                        border: "1px solid #e2e8f0"
                      }}
                    >
                      {r.name} ({r.code})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 4: SALARY RULES (Requirement A6) */}
      {subtab === "rules" && (
        <div className="card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Seq</th>
                  <th>Rule Name</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Calculation Method</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r._id}>
                    <td><code>#{r.sequence}</code></td>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td><code>{r.code}</code></td>
                    <td>
                      <span className="badge badge-computed">{r.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${r.type === "EARNING" ? "badge-active" : "badge-refused"}`}>
                        {r.type}
                      </span>
                    </td>
                    <td>{r.calculationType}</td>
                    <td>
                      {r.calculationType === "FIXED" && `$${r.amount}`}
                      {r.calculationType === "PERCENTAGE" && `${r.percentage}% of ${r.percentageOf}`}
                      {r.calculationType === "FORMULA" && <code>{r.formula}</code>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== PAYRUN CREATION WIZARD (Requirement B5) ==================== */}
      {isWizardOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Payrun Setup Wizard</h3>
                <p style={{ fontSize: 12.5, color: "#64748b" }}>
                  Step-by-step batch configuration and employee eligibility screening
                </p>
              </div>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
                onClick={() => setIsWizardOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Stepper Indicator */}
            <div style={{ padding: "16px 24px 0" }}>
              <div className="wizard-stepper">
                <div className="wizard-step">
                  <div className={`step-circle ${wizardStep >= 1 ? "active" : ""}`}>1</div>
                  <div>
                    <strong style={{ fontSize: 13 }}>Scope & Period</strong>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Define payroll parameters</div>
                  </div>
                </div>

                <div style={{ flex: 1, height: 2, background: wizardStep >= 2 ? "#4f46e5" : "#e2e8f0", margin: "0 14px" }} />

                <div className="wizard-step">
                  <div className={`step-circle ${wizardStep >= 2 ? "active" : ""}`}>2</div>
                  <div>
                    <strong style={{ fontSize: 13 }}>Employee Selection</strong>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Filter eligible staff</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body">
              {wizardError && (
                <div style={{ padding: 12, background: "#fef2f2", color: "#991b1b", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                  {wizardError}
                </div>
              )}

              {/* STEP 1: SCOPE & PERIOD */}
              {wizardStep === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Payrun Batch Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. September 2026 Monthly Payroll"
                      value={wizardData.name}
                      onChange={(e) => setWizardData({ ...wizardData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Salary Structure</label>
                    <select
                      className="form-control"
                      required
                      value={wizardData.salaryStructure}
                      onChange={(e) => setWizardData({ ...wizardData, salaryStructure: e.target.value })}
                    >
                      {structures.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Period Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={wizardData.periodStart}
                        onChange={(e) => setWizardData({ ...wizardData, periodStart: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Period End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={wizardData.periodEnd}
                        onChange={(e) => setWizardData({ ...wizardData, periodEnd: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ELIGIBLE STAFF SELECTION */}
              {wizardStep === 2 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>
                      Selected <strong>{wizardData.selectedEmployees.length}</strong> of {eligibleStaff.length} employees
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleSelectAllEmployees}
                    >
                      Toggle Select All
                    </button>
                  </div>

                  <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 8 }}>
                    <table className="custom-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>Select</th>
                          <th>Employee</th>
                          <th>Active Contract</th>
                          <th>Wage</th>
                          <th>Bank Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eligibleStaff.map((item) => {
                          const isSelected = wizardData.selectedEmployees.includes(item.employee._id);
                          return (
                            <tr
                              key={item.employee._id}
                              style={{ background: isSelected ? "#f8fafc" : "white", cursor: "pointer" }}
                              onClick={() => toggleSelectEmployee(item.employee._id)}
                            >
                              <td>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                />
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>
                                  {item.employee.firstName} {item.employee.lastName}
                                </div>
                                <div style={{ fontSize: 12, color: "#64748b" }}>
                                  {item.employee.employeeId} • {item.employee.department}
                                </div>
                              </td>
                              <td>
                                {item.hasActiveContract ? (
                                  <span className="badge badge-active" style={{ fontSize: 11 }}>
                                    Active Contract
                                  </span>
                                ) : (
                                  <span className="badge badge-refused" style={{ fontSize: 11 }}>
                                    No Valid Contract
                                  </span>
                                )}
                              </td>
                              <td>
                                {item.contract ? `$${Number(item.contract.salary).toLocaleString()}` : "—"}
                              </td>
                              <td>
                                {item.bankComplete ? (
                                  <span style={{ fontSize: 12, color: "#059669" }}>Complete</span>
                                ) : (
                                  <span style={{ fontSize: 12, color: "#dc2626" }}>Missing Info</span>
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
            </div>

            <div className="modal-footer">
              {wizardStep === 1 ? (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsWizardOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={proceedToStep2}
                    disabled={wizardLoading}
                  >
                    {wizardLoading ? "Checking..." : "Continue to Employee Selection →"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setWizardStep(1)}
                  >
                    ← Back to Scope
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleFinishWizard}
                    disabled={wizardLoading}
                  >
                    {wizardLoading ? "Initializing..." : "Create Payrun & Open Processing"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== PAYSLIP DETAIL MODAL (Requirement B7, B8) ==================== */}
      {activePayslip && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                  Payslip Details ({activePayslip.payslipNumber})
                </h3>
                <p style={{ fontSize: 12.5, color: "#64748b" }}>
                  Full salary rule execution breakdown and employee compensation details
                </p>
              </div>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
                onClick={() => setActivePayslip(null)}
              >
                ✕
              </button>
            </div>

            <div className="card-body">
              {/* Employee Summary Card */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, background: "#f8fafc", padding: 14, borderRadius: 8, marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 12, color: "#64748b" }}>EMPLOYEE</span>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {activePayslip.employee?.firstName} {activePayslip.employee?.lastName}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    ID: {activePayslip.employee?.employeeId} • {activePayslip.employee?.jobTitle}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: "#64748b" }}>PAY PERIOD</span>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {new Date(activePayslip.periodStart).toLocaleDateString()} - {new Date(activePayslip.periodEnd).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    Worked Days: {activePayslip.workedDays || 22} / {activePayslip.totalWorkingDays || 22}
                  </div>
                </div>
              </div>

              {/* Line Items Breakdown Table */}
              <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#475569", marginBottom: 8 }}>
                Salary Computation Line Breakdown
              </h4>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
                <table className="custom-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Rule Code</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePayslip.lines?.map((line, idx) => (
                      <tr key={idx} style={{ background: line.type === "INFORMATIONAL" ? "#f8fafc" : "white" }}>
                        <td><code>{line.code}</code></td>
                        <td style={{ fontWeight: line.type === "INFORMATIONAL" ? 700 : 500 }}>
                          {line.name}
                        </td>
                        <td>
                          <span className={`badge ${line.type === "DEDUCTION" ? "badge-refused" : "badge-computed"}`} style={{ fontSize: 11 }}>
                            {line.category}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: line.type === "DEDUCTION" ? "#dc2626" : line.code === "NET" ? "#4f46e5" : "#0f172a" }}>
                          {line.type === "DEDUCTION" ? `-$${Number(line.amount).toLocaleString()}` : `$${Number(line.amount).toLocaleString()}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Net Pay Callout */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#eef2ff", border: "1px solid #c7d2fe", padding: "14px 18px", borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#3730a3" }}>FINAL NET PAYABLE AMOUNT</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Direct deposit into employee account</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#4f46e5" }}>
                  ${Number(activePayslip.netSalary || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => generatePayslipPDF(activePayslip)}
              >
                <Printer size={15} /> Print / Download PDF
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActivePayslip(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Salary Rule */}
      {isRuleModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Define Salary Rule</h3>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
                onClick={() => setIsRuleModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule}>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Rule Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Remote Work Allowance"
                      value={ruleForm.name}
                      onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Code</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. REMOTE_ALW"
                      value={ruleForm.code}
                      onChange={(e) => setRuleForm({ ...ruleForm, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Sequence #</label>
                    <input
                      type="number"
                      className="form-control"
                      value={ruleForm.sequence}
                      onChange={(e) => setRuleForm({ ...ruleForm, sequence: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={ruleForm.category}
                      onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })}
                    >
                      <option value="ALLOWANCE">ALLOWANCE</option>
                      <option value="DEDUCTION">DEDUCTION</option>
                      <option value="BASIC">BASIC</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-control"
                      value={ruleForm.type}
                      onChange={(e) => setRuleForm({ ...ruleForm, type: e.target.value })}
                    >
                      <option value="EARNING">EARNING</option>
                      <option value="DEDUCTION">DEDUCTION</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Calculation Method</label>
                    <select
                      className="form-control"
                      value={ruleForm.calculationType}
                      onChange={(e) => setRuleForm({ ...ruleForm, calculationType: e.target.value })}
                    >
                      <option value="FIXED">FIXED AMOUNT</option>
                      <option value="PERCENTAGE">PERCENTAGE (%)</option>
                      <option value="FORMULA">FORMULA EXPRESSION</option>
                    </select>
                  </div>

                  {ruleForm.calculationType === "FIXED" && (
                    <div className="form-group">
                      <label className="form-label">Amount ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={ruleForm.amount}
                        onChange={(e) => setRuleForm({ ...ruleForm, amount: Number(e.target.value) })}
                      />
                    </div>
                  )}

                  {ruleForm.calculationType === "PERCENTAGE" && (
                    <div className="form-group">
                      <label className="form-label">Percentage (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={ruleForm.percentage}
                        onChange={(e) => setRuleForm({ ...ruleForm, percentage: Number(e.target.value) })}
                      />
                    </div>
                  )}
                </div>

                {ruleForm.calculationType === "PERCENTAGE" && (
                  <div className="form-group">
                    <label className="form-label">Percentage Of</label>
                    <select
                      className="form-control"
                      value={ruleForm.percentageOf}
                      onChange={(e) => setRuleForm({ ...ruleForm, percentageOf: e.target.value })}
                    >
                      <option value="BASE">Base Wage</option>
                      <option value="GROSS">Gross Salary</option>
                    </select>
                  </div>
                )}

                {ruleForm.calculationType === "FORMULA" && (
                  <div className="form-group">
                    <label className="form-label">Formula Expression (e.g. base * 0.15)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={ruleForm.formula}
                      onChange={(e) => setRuleForm({ ...ruleForm, formula: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsRuleModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
