import React, { useState } from "react";
import { api } from "../api";
import { Shield, Lock, Mail, User, CheckCircle, AlertCircle, ArrowRight, Zap } from "lucide-react";

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await api.register(name, email, password, role);
      } else {
        res = await api.login(email, password);
      }
      if (res.success) {
        api.setToken(res.token);
        onAuthSuccess(res.user, res.token);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole) => {
    setError("");
    setLoading(true);
    try {
      const res = await api.demoLogin(demoRole);
      if (res.success) {
        api.setToken(res.token);
        onAuthSuccess(res.user, res.token);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: "ADMIN", title: "Admin User", email: "admin@peoplepay360.com", badge: "role-admin", desc: "Full platform permissions" },
    { role: "HR_MANAGER", title: "Sarah Jenkins", email: "sarah.jenkins@peoplepay360.com", badge: "role-hr-manager", desc: "HR, Contracts, Attendance, Leaves" },
    { role: "HR_PAYROLL_USER", title: "David Kim", email: "david.kim@peoplepay360.com", badge: "role-hr-payroll-user", desc: "Payruns & Payslips processing" },
    { role: "HR_PAYROLL_MANAGER", title: "Elena Rostova", email: "elena.rostova@peoplepay360.com", badge: "role-hr-payroll-manager", desc: "Full HR + Salary Structures & Rules" },
    { role: "EMPLOYEE", title: "Alex Morgan", email: "alex.morgan@peoplepay360.com", badge: "role-employee", desc: "Personal Hub, Clock in/out, Leaves" },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                {isRegister ? "Create PeoplePay360 Account" : "Sign In to PeoplePay360"}
              </h3>
              <p style={{ fontSize: 12.5, color: "#64748b" }}>Secure JWT Token Authentication</p>
            </div>
          </div>
          <button
            style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="card-body">
          {error && (
            <div style={{ padding: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#991b1b", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Quick 1-Click Demo Login Bar */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Zap size={15} color="#f59e0b" />
              <strong style={{ fontSize: 12.5, textTransform: "uppercase", letterSpacing: 0.5, color: "#475569" }}>
                1-Click Instant Demo Login (For Evaluators)
              </strong>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDemoLogin(acc.role)}
                  disabled={loading}
                  style={{
                    padding: "8px 10px",
                    background: "white",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#4f46e5")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{acc.title}</span>
                    <span className={`role-badge ${acc.badge}`} style={{ fontSize: 9 }}>{acc.role.split("_")[0]}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{acc.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", position: "relative", margin: "16px 0" }}>
            <span style={{ background: "white", padding: "0 12px", color: "#94a3b8", fontSize: 12, position: "relative", zIndex: 1 }}>
              OR SIGN IN WITH CREDENTIALS
            </span>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "#e2e8f0" }} />
          </div>

          {/* Standard Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: "relative" }}>
                  <User size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Jane Doe"
                    style={{ paddingLeft: 38 }}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="admin@peoplepay360.com"
                  style={{ paddingLeft: 38 }}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  style={{ paddingLeft: 38 }}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {isRegister && (
              <div className="form-group">
                <label className="form-label">Assign Role</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="EMPLOYEE">Employee (Self-Service)</option>
                  <option value="HR_MANAGER">HR Manager</option>
                  <option value="HR_PAYROLL_USER">HR Payroll User</option>
                  <option value="HR_PAYROLL_MANAGER">HR Payroll Manager</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ marginTop: 6 }}
            >
              {loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In with JWT"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#64748b" }}>
            {isRegister ? (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#4f46e5", fontWeight: 600, cursor: "pointer" }}
                  onClick={() => setIsRegister(false)}
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Need a new user account?{" "}
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#4f46e5", fontWeight: 600, cursor: "pointer" }}
                  onClick={() => setIsRegister(true)}
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
};
