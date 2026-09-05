import React, { useState } from "react";
import { api } from "../api";
import { Shield, Lock, Mail, User, CheckCircle, AlertCircle, ArrowRight, UserPlus, LogIn } from "lucide-react";

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, forceOpen = false }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        }, 500);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(15, 23, 42, 0.75)" }}>
      <div className="modal-content" style={{ maxWidth: 520, borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0" }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "white",
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)"
            }}>
              {isRegister ? <UserPlus size={22} color="white" /> : <Lock size={22} color="white" />}
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "white" }}>
                {isRegister ? "Create Your Account" : "Sign In to PeoplePay360"}
              </h3>
              <p style={{ fontSize: 12.5, color: "#94a3b8", margin: "3px 0 0" }}>
                {isRegister ? "Register your unique ID and role" : "Enter your credentials to continue"}
              </p>
            </div>
          </div>
          {!forceOpen && onClose && (
            <button
              style={{
                border: "none",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#94a3b8",
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

        {/* Tab switch */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(""); setSuccessMsg(""); }}
            style={{
              flex: 1,
              padding: "14px",
              border: "none",
              borderBottom: !isRegister ? "2px solid #3b82f6" : "2px solid transparent",
              background: !isRegister ? "white" : "transparent",
              fontWeight: !isRegister ? 700 : 500,
              color: !isRegister ? "#1d4ed8" : "#64748b",
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s"
            }}
          >
            <LogIn size={16} />
            Sign In with User ID
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(""); setSuccessMsg(""); }}
            style={{
              flex: 1,
              padding: "14px",
              border: "none",
              borderBottom: isRegister ? "2px solid #3b82f6" : "2px solid transparent",
              background: isRegister ? "white" : "transparent",
              fontWeight: isRegister ? 700 : 500,
              color: isRegister ? "#1d4ed8" : "#64748b",
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s"
            }}
          >
            <UserPlus size={16} />
            Register New User ID
          </button>
        </div>

        <div className="card-body" style={{ padding: "24px 28px" }}>
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
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <User size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. John Doe"
                    style={{ paddingLeft: 40, borderRadius: 8, height: 42 }}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
                Email Address (Your User ID)
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@company.com"
                  style={{ paddingLeft: 40, borderRadius: 8, height: 42 }}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  style={{ paddingLeft: 40, borderRadius: 8, height: 42 }}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {isRegister && (
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Select Access Role</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ borderRadius: 8, height: 42, fontWeight: 500 }}
                >
                  <option value="EMPLOYEE">Employee (Client Dashboard with Clock-In/Out & Leaves)</option>
                  <option value="ADMIN">System Administrator (Full Access)</option>
                  <option value="HR_MANAGER">HR Manager (Employee Records, Leaves & Attendance)</option>
                  <option value="HR_PAYROLL_USER">HR Payroll User (Payrun Processing & Payslips)</option>
                  <option value="HR_PAYROLL_MANAGER">HR Payroll Manager (Salary Rules, Structures & Payroll)</option>
                </select>
                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 5 }}>
                  {role === "EMPLOYEE"
                    ? "✓ Registering as an Employee creates a personal client dashboard, active employment profile, and leave quota."
                    : `✓ Grants ${role.replace(/_/g, " ")} organizational permissions.`}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                marginTop: 6,
                height: 44,
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)"
              }}
            >
              {loading ? (
                "Processing..."
              ) : isRegister ? (
                <>
                  <span>Create Account & Log In</span>
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid #e2e8f0",
            textAlign: "center",
            fontSize: 12.5,
            color: "#64748b"
          }}>
            {isRegister ? (
              <span>
                Already registered?{" "}
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => { setIsRegister(false); setError(""); }}
                >
                  Sign in here
                </button>
              </span>
            ) : (
              <span>
                First time here?{" "}
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => { setIsRegister(true); setError(""); }}
                >
                  Create an account with your own ID
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
