import React, { useState } from "react";
import { api } from "../api";
import { Shield, Lock, Mail, User, CheckCircle, AlertCircle, ArrowRight, UserPlus, LogIn, KeyRound, RefreshCw } from "lucide-react";

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, forceOpen = false }) => {
  // Modes: 'login' | 'register' | 'forgot' | 'reset'
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("EMPLOYEE");

  // Forgot / Reset Password states
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const resetMessages = () => {
    setError("");
    setSuccessMsg("");
  };

  const handleLoginRegister = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      let res;
      if (authMode === "register") {
        if (!name.trim()) {
          throw new Error("Please enter your full name.");
        }
        res = await api.register(name, email, password, role);
        setSuccessMsg("Account registered successfully in database! Logging you in...");
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      if (!email.trim()) throw new Error("Please enter your email address.");
      const res = await api.forgotPassword(email);
      if (res.success) {
        setGeneratedToken(res.resetToken);
        setResetToken(res.resetToken);
        setSuccessMsg(`Reset code generated! Use PIN code: ${res.resetToken} to set your new password.`);
        setAuthMode("reset");
      }
    } catch (err) {
      setError(err.message || "Could not process password reset request.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      if (!email.trim() || !resetToken.trim() || !newPassword) {
        throw new Error("Please enter your email, 6-digit reset code, and new password.");
      }
      const res = await api.resetPassword(email, resetToken, newPassword);
      if (res.success) {
        setSuccessMsg("Password reset successfully! Logging you in with your new password...");
        api.setToken(res.token);
        setTimeout(() => {
          onAuthSuccess(res.user, res.token);
          if (onClose) onClose();
        }, 800);
      }
    } catch (err) {
      setError(err.message || "Failed to reset password. Check your reset code.");
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
              {authMode === "register" ? (
                <UserPlus size={22} color="white" />
              ) : authMode === "forgot" || authMode === "reset" ? (
                <KeyRound size={22} color="white" />
              ) : (
                <Lock size={22} color="white" />
              )}
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "white" }}>
                {authMode === "register" && "Create Your Account"}
                {authMode === "login" && "Sign In to PeoplePay360"}
                {authMode === "forgot" && "Forgot Password?"}
                {authMode === "reset" && "Reset Your Password"}
              </h3>
              <p style={{ fontSize: 12.5, color: "#94a3b8", margin: "3px 0 0" }}>
                {authMode === "register" && "Register your unique credentials in database"}
                {authMode === "login" && "Enter your email & password to continue"}
                {authMode === "forgot" && "Enter your email address to receive a reset code"}
                {authMode === "reset" && "Enter reset PIN code and set your new password"}
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

        {/* Tab switch for Sign In vs Register */}
        {(authMode === "login" || authMode === "register") && (
          <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
            <button
              type="button"
              onClick={() => { setAuthMode("login"); resetMessages(); }}
              style={{
                flex: 1,
                padding: "14px",
                border: "none",
                borderBottom: authMode === "login" ? "2px solid #3b82f6" : "2px solid transparent",
                background: authMode === "login" ? "white" : "transparent",
                fontWeight: authMode === "login" ? 700 : 500,
                color: authMode === "login" ? "#1d4ed8" : "#64748b",
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
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("register"); resetMessages(); }}
              style={{
                flex: 1,
                padding: "14px",
                border: "none",
                borderBottom: authMode === "register" ? "2px solid #3b82f6" : "2px solid transparent",
                background: authMode === "register" ? "white" : "transparent",
                fontWeight: authMode === "register" ? 700 : 500,
                color: authMode === "register" ? "#1d4ed8" : "#64748b",
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
              Register New User
            </button>
          </div>
        )}

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

          {/* Form: LOGIN / REGISTER */}
          {(authMode === "login" || authMode === "register") && (
            <form onSubmit={handleLoginRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {authMode === "register" && (
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
                  Email Address (User ID)
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Password</label>
                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={() => { setAuthMode("forgot"); resetMessages(); }}
                      style={{ background: "none", border: "none", color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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

              {authMode === "register" && (
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
                      ? "✓ Registering as an Employee stores profile in DB and creates personal client dashboard."
                      : `✓ Stores new user in DB with ${role.replace(/_/g, " ")} organizational permissions.`}
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
                ) : authMode === "register" ? (
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
          )}

          {/* Form: FORGOT PASSWORD */}
          {authMode === "forgot" && (
            <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
                  Registered Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="your.email@company.com"
                    style={{ paddingLeft: 40, borderRadius: 8, height: 42 }}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 5 }}>
                  Enter your registered account email to generate a secure 6-digit password reset PIN.
                </div>
              </div>

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
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                }}
              >
                {loading ? "Generating Code..." : "Get Password Reset Code"}
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode("login"); resetMessages(); }}
                style={{ background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", marginTop: 4 }}
              >
                ← Back to Sign In
              </button>
            </form>
          )}

          {/* Form: RESET PASSWORD */}
          {authMode === "reset" && (
            <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Email Address</label>
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
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>6-Digit Reset Code (PIN)</label>
                <div style={{ position: "relative" }}>
                  <KeyRound size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 123456"
                    style={{ paddingLeft: 40, borderRadius: 8, height: 42, letterSpacing: 2, fontWeight: 700 }}
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>New Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="At least 6 characters"
                    style={{ paddingLeft: 40, borderRadius: 8, height: 42 }}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

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
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)"
                }}
              >
                {loading ? "Resetting Password..." : "Reset Password & Log In"}
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode("login"); resetMessages(); }}
                style={{ background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", marginTop: 4 }}
              >
                ← Back to Sign In
              </button>
            </form>
          )}

          {/* Footer toggle link */}
          {(authMode === "login" || authMode === "register") && (
            <div style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid #e2e8f0",
              textAlign: "center",
              fontSize: 12.5,
              color: "#64748b"
            }}>
              {authMode === "register" ? (
                <span>
                  Already registered?{" "}
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => { setAuthMode("login"); resetMessages(); }}
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
                    onClick={() => { setAuthMode("register"); resetMessages(); }}
                  >
                    Create an account with your own ID
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
