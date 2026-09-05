import React, { useState } from "react";
import { api } from "../api";
import {
  Shield,
  Lock,
  Mail,
  User,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  Zap,
  X,
  TrendingUp,
  Users,
  DollarSign,
  PieChart,
  CheckSquare,
  HelpCircle
} from "lucide-react";

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, forceOpen = false }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotType, setForgotType] = useState("");

  if (!isOpen) return null;

  // Evaluator demo accounts
  const demoUsers = [
    {
      name: "Admin User",
      roleBadge: "ADMIN",
      email: "admin@peoplepay360.com",
      password: "admin123"
    },
    {
      name: "Sarah Jenkins",
      roleBadge: "HR",
      email: "sarah.jenkins@peoplepay360.com",
      password: "sarah123"
    },
    {
      name: "David Kim",
      roleBadge: "HR",
      email: "david.kim@peoplepay360.com",
      password: "david123"
    },
    {
      name: "Elena Rostova",
      roleBadge: "HR",
      email: "elena.rostova@peoplepay360.com",
      password: "elena123"
    },
    {
      name: "Alex Morgan",
      roleBadge: "EMPLOYEE",
      email: "alex.morgan@peoplepay360.com",
      password: "alex123"
    }
  ];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      let res;
      if (isRegister) {
        if (!name.trim()) {
          throw new Error("Please enter your full name.");
        }
        res = await api.register(name, email, password, role);
        setSuccessMsg("Account registered successfully! Logging you in...");
      } else {
        res = await api.login(email, password);
      }
      if (res.success) {
        api.setToken(res.token);
        setTimeout(() => {
          onAuthSuccess(res.user, res.token);
          if (onClose) onClose();
        }, 400);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsRegister(false);
    setError("");
    setLoading(true);
    try {
      const res = await api.login(demoEmail, demoPass);
      if (res.success) {
        api.setToken(res.token);
        setSuccessMsg(`Authenticated as ${res.user.name}`);
        setTimeout(() => {
          onAuthSuccess(res.user, res.token);
          if (onClose) onClose();
        }, 400);
      }
    } catch (err) {
      setError(err.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  // 100vh Split-Screen Sellora Template Layout (Zero Vertical Scroll required)
  const renderSplitScreenPage = () => {
    return (
      <div style={{
        height: "100vh",
        width: "100vw",
        display: "grid",
        gridTemplateColumns: "minmax(420px, 1fr) 1fr",
        backgroundColor: "#ffffff",
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
        color: "#0f172a",
        overflow: "hidden"
      }}>
        {/* Left Column: Form & Navigation */}
        <div style={{
          padding: "32px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflowY: "auto",
          maxHeight: "100vh"
        }}>
          {/* Top Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)"
            }}>
              <Shield size={22} color="#ffffff" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
              People<span style={{ color: "#2563eb" }}>Pay360</span>
            </span>
          </div>

          {/* Form Content Container */}
          <div style={{ maxWidth: 440, width: "100%", margin: "20px 0" }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              margin: "0 0 6px 0"
            }}>
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p style={{
              fontSize: 14,
              color: "#64748b",
              margin: "0 0 20px 0"
            }}>
              {isRegister ? "Fill in your details to get started with PeoplePay360." : "Enter your email and password to access your account."}
            </p>

            {/* 1-Click Instant Demo Login (For Evaluators) */}
            {!isRegister && (
              <div style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "10px 12px",
                marginBottom: 16
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#64748b",
                  letterSpacing: "0.04em",
                  marginBottom: 8,
                  textTransform: "uppercase"
                }}>
                  <Zap size={13} color="#f59e0b" fill="#f59e0b" />
                  <span>1-Click Evaluator Demo Login</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {demoUsers.map((user) => (
                    <button
                      key={user.email}
                      type="button"
                      onClick={() => handleDemoSelect(user.email, user.password)}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        padding: "5px 9px",
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "#1e293b",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#2563eb";
                        e.currentTarget.style.color = "#2563eb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#cbd5e1";
                        e.currentTarget.style.color = "#1e293b";
                      }}
                    >
                      <span>{user.name}</span>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: "1px 4px",
                        borderRadius: 4,
                        background: user.roleBadge === "ADMIN" ? "#fef3c7" : user.roleBadge === "EMPLOYEE" ? "#dcfce7" : "#e0e7ff",
                        color: user.roleBadge === "ADMIN" ? "#92400e" : user.roleBadge === "EMPLOYEE" ? "#166534" : "#3730a3"
                      }}>
                        {user.roleBadge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                color: "#991b1b",
                fontSize: 13,
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                <div>{error}</div>
              </div>
            )}

            {successMsg && (
              <div style={{
                padding: "10px 14px",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                borderRadius: 8,
                color: "#065f46",
                fontSize: 13,
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                <CheckCircle size={16} color="#059669" style={{ flexShrink: 0 }} />
                <div>{successMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {isRegister && (
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 5 }}>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      height: 44,
                      padding: "0 14px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 5 }}>Email</label>
                <input
                  type="email"
                  placeholder="admin@peoplepay360.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    height: 44,
                    padding: "0 14px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: 14,
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 5 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      height: 44,
                      padding: "0 40px 0 14px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#94a3b8"
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 5 }}>Select Access Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      width: "100%",
                      height: 44,
                      padding: "0 14px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: 14,
                      outline: "none"
                    }}
                  >
                    <option value="EMPLOYEE">Employee (Client Dashboard with Clock-In/Out & Leaves)</option>
                    <option value="ADMIN">System Administrator (Full Access)</option>
                    <option value="HR_MANAGER">HR Manager (Employee Records, Leaves & Attendance)</option>
                    <option value="HR_PAYROLL_USER">HR Payroll User (Payrun Processing & Payslips)</option>
                    <option value="HR_PAYROLL_MANAGER">HR Payroll Manager (Salary Rules, Structures & Payroll)</option>
                  </select>
                </div>
              )}

              {!isRegister && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 13
                }}>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#475569",
                    cursor: "pointer"
                  }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{
                        width: 16,
                        height: 16,
                        accentColor: "#2563eb",
                        borderRadius: 4,
                        cursor: "pointer"
                      }}
                    />
                    Remember Me
                  </label>

                  <button
                    type="button"
                    onClick={() => { setForgotType("password"); setShowForgotModal(true); }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Forgot Your Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 46,
                  borderRadius: 8,
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                  transition: "background-color 0.15s ease",
                  marginTop: 4
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#1d4ed8")}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "#2563eb")}
              >
                {loading ? "Processing..." : isRegister ? "Register User" : "Sign In with JWT"}
              </button>
            </form>

            <div style={{
              marginTop: 18,
              textAlign: "center",
              fontSize: 13.5,
              color: "#64748b"
            }}>
              {isRegister ? (
                <span>
                  Already Have An Account?{" "}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(false); setError(""); }}
                    style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer" }}
                  >
                    Sign In Now.
                  </button>
                </span>
              ) : (
                <span>
                  Don't Have An Account?{" "}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(true); setError(""); }}
                    style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer" }}
                  >
                    Register Now.
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            color: "#94a3b8",
            paddingTop: 12
          }}>
            <span>Copyright © 2026 PeoplePay360 Enterprise LTD.</span>
            <span style={{ cursor: "pointer", color: "#64748b" }}>Privacy Policy</span>
          </div>
        </div>

        {/* Right Column: Visual Graphic Banner Card (Sellora Style) */}
        <div style={{ padding: 16, height: "100%" }}>
          <div style={{
            height: "100%",
            borderRadius: 20,
            background: "linear-gradient(145deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)",
            position: "relative",
            overflow: "hidden",
            padding: "48px 44px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "#ffffff"
          }}>
            {/* Background Geometric Rings */}
            <div style={{
              position: "absolute",
              top: "-10%",
              right: "-10%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              border: "40px solid rgba(255, 255, 255, 0.05)",
              pointerEvents: "none"
            }} />
            <div style={{
              position: "absolute",
              bottom: "-15%",
              left: "-15%",
              width: 500,
              height: 500,
              borderRadius: "50%",
              border: "60px solid rgba(255, 255, 255, 0.04)",
              pointerEvents: "none"
            }} />

            {/* Top Text Block */}
            <div style={{ maxWidth: 520, position: "relative", zIndex: 2 }}>
              <h2 style={{
                fontSize: 34,
                fontWeight: 700,
                lineHeight: 1.25,
                color: "#ffffff",
                letterSpacing: "-0.01em",
                margin: "0 0 12px 0"
              }}>
                Effortlessly manage your team and operations.
              </h2>
              <p style={{
                fontSize: 16,
                color: "rgba(255, 255, 255, 0.88)",
                lineHeight: 1.5,
                margin: 0
              }}>
                Log in to access your enterprise HR & Payroll dashboard, manage payruns, track attendance, and approve leave requests.
              </p>
            </div>

            {/* Middle Preview Visual UI Mockup (Sellora Dashboard Card) */}
            <div style={{
              position: "relative",
              zIndex: 2,
              margin: "30px 0",
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              color: "#0f172a",
              backdropFilter: "blur(12px)"
            }}>
              {/* Header Stats inside card */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 14, marginBottom: 18 }}>
                <div style={{ background: "#eff6ff", borderRadius: 10, padding: "12px 14px", border: "1px solid #dbeafe" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#2563eb", marginBottom: 4 }}>Total Payroll</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#1e3a8a" }}>$189,374</div>
                  <div style={{ fontSize: 10, color: "#166534", fontWeight: 700, marginTop: 2 }}>↑ 7.5% vs last month</div>
                </div>

                <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 14px", border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", marginBottom: 4 }}>Attendance Rate</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#14532d" }}>99.2%</div>
                  <div style={{ fontSize: 10, color: "#15803d", fontWeight: 700, marginTop: 2 }}>✓ 400 Active Staff</div>
                </div>

                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Payruns Processed</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>6,248 Units</div>
                  <div style={{ fontSize: 10, color: "#2563eb", fontWeight: 700, marginTop: 2 }}>Monthly Disbursement</div>
                </div>
              </div>

              {/* Sample Table Snippet */}
              <div style={{ fontSize: 12, borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontWeight: 600, marginBottom: 8, fontSize: 11 }}>
                  <span>Recent Activity</span>
                  <span>Status</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>#PAY-9901 Admin Payrun Disbursement</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "#166534", background: "#dcfce7", padding: "2px 8px", borderRadius: 12 }}>● Paid</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>#ATT-2045 Sarah Jenkins Attendance Verified</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "#1e40af", background: "#dbeafe", padding: "2px 8px", borderRadius: 12 }}>● Clocked In</span>
                </div>
              </div>
            </div>

            {/* Bottom Brand Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 2 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={16} color="#ffffff" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255, 255, 255, 0.9)" }}>PeoplePay360 Enterprise HR Solution</span>
            </div>
          </div>
        </div>

        {/* Forgot Password / Username Modal */}
        {showForgotModal && (
          <div style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20
          }}>
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              maxWidth: 440,
              width: "100%",
              padding: 28,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              position: "relative"
            }}>
              <button
                onClick={() => setShowForgotModal(false)}
                style={{ position: "absolute", top: 16, right: 16, border: "none", background: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HelpCircle size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Reset Password</h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>PeoplePay360 Account Recovery</p>
                </div>
              </div>
              <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.5, marginBottom: 20 }}>
                Enter your registered email address below. We'll send you instructions to reset your account password.
              </p>
              <input
                type="text"
                placeholder="Work Email Address"
                style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 6, border: "1px solid #cbd5e1", marginBottom: 16, fontSize: 14 }}
              />
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setSuccessMsg(`Recovery link dispatched! Please check your inbox.`);
                  setTimeout(() => setSuccessMsg(""), 5000);
                }}
                style={{ width: "100%", height: 42, borderRadius: 6, background: "#2563eb", color: "#ffffff", border: "none", fontWeight: 600, cursor: "pointer" }}
              >
                Send Recovery Link
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Standard Modal Overlay matching past system screenshot when forceOpen is false
  if (!forceOpen) {
    return (
      <div className="modal-overlay" style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(15, 23, 42, 0.75)", zIndex: 9999 }}>
        <div className="modal-content" style={{ maxWidth: 560, borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
          {/* Past System Modal Header */}
          <div style={{
            background: "#ffffff",
            color: "#0f172a",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f1f5f9"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.35)"
              }}>
                <Lock size={22} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  {isRegister ? "Register New User Account" : "Sign In to PeoplePay360"}
                </h3>
                <p style={{ fontSize: 12.5, color: "#64748b", margin: "2px 0 0" }}>
                  {isRegister ? "Create credentials for employee or admin access" : "Secure JWT Token Authentication"}
                </p>
              </div>
            </div>
            {onClose && (
              <button
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  color: "#64748b",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16
                }}
                onClick={onClose}
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ padding: "24px 28px" }}>
            {/* 1-Click Instant Demo Login cards */}
            {!isRegister && (
              <div style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 16,
                marginBottom: 20
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#475569",
                  letterSpacing: "0.04em",
                  marginBottom: 12,
                  textTransform: "uppercase"
                }}>
                  <Zap size={14} color="#f59e0b" fill="#f59e0b" />
                  <span>1-Click Instant Demo Login (For Evaluators)</span>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 10
                }}>
                  {demoUsers.map((user) => (
                    <button
                      key={user.email}
                      type="button"
                      onClick={() => handleDemoSelect(user.email, user.password)}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 10,
                        padding: "10px 12px",
                        textAlign: "left",
                        cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{user.name}</span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          backgroundColor: user.roleBadge === "ADMIN" ? "#fef3c7" : user.roleBadge === "EMPLOYEE" ? "#dcfce7" : "#e0e7ff",
                          color: user.roleBadge === "ADMIN" ? "#92400e" : user.roleBadge === "EMPLOYEE" ? "#166534" : "#3730a3"
                        }}>
                          {user.roleBadge}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{user.email}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isRegister && (
              <div style={{
                display: "flex",
                alignItems: "center",
                margin: "18px 0",
                color: "#94a3b8",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em"
              }}>
                <div style={{ flex: 1, height: 1, backgroundColor: "#e2e8f0" }} />
                <span style={{ padding: "0 12px" }}>OR SIGN IN WITH CREDENTIALS</span>
                <div style={{ flex: 1, height: 1, backgroundColor: "#e2e8f0" }} />
              </div>
            )}

            {error && (
              <div style={{
                padding: "12px 16px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                color: "#991b1b",
                fontSize: 13,
                marginBottom: 18,
                display: "flex",
                alignItems: "center",
                gap: 10
              }}>
                <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                <div>{error}</div>
              </div>
            )}

            {successMsg && (
              <div style={{
                padding: "12px 16px",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                borderRadius: 10,
                color: "#065f46",
                fontSize: 13,
                marginBottom: 18,
                display: "flex",
                alignItems: "center",
                gap: 10
              }}>
                <CheckCircle size={18} color="#059669" style={{ flexShrink: 0 }} />
                <div>{successMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {isRegister && (
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Full Name</label>
                  <div style={{ position: "relative" }}>
                    <User size={18} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{ width: "100%", height: 44, paddingLeft: 42, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={18} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="email"
                    placeholder="admin@peoplepay360.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: "100%", height: 44, paddingLeft: 42, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={18} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: "100%", height: 44, paddingLeft: 42, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
                  />
                </div>
              </div>

              {isRegister && (
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Select Access Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
                  >
                    <option value="EMPLOYEE">Employee (Client Dashboard with Clock-In/Out & Leaves)</option>
                    <option value="ADMIN">System Administrator (Full Access)</option>
                    <option value="HR_MANAGER">HR Manager (Employee Records, Leaves & Attendance)</option>
                    <option value="HR_PAYROLL_USER">HR Payroll User (Payrun Processing & Payslips)</option>
                    <option value="HR_PAYROLL_MANAGER">HR Payroll Manager (Salary Rules, Structures & Payroll)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 8,
                  height: 46,
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)"
                }}
              >
                {loading ? "Processing..." : isRegister ? "Register New User" : "Sign In with JWT"}
              </button>
            </form>

            <div style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid #f1f5f9",
              textAlign: "center",
              fontSize: 13,
              color: "#64748b"
            }}>
              {isRegister ? (
                <span>
                  Already registered?{" "}
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "#4f46e5", fontWeight: 700, cursor: "pointer" }}
                    onClick={() => { setIsRegister(false); setError(""); }}
                  >
                    Sign In with User ID
                  </button>
                </span>
              ) : (
                <span>
                  Need a new user account?{" "}
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "#4f46e5", fontWeight: 700, cursor: "pointer" }}
                    onClick={() => { setIsRegister(true); setError(""); }}
                  >
                    Register New User
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return renderSplitScreenPage();
};
