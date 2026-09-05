import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  Calendar,
  DollarSign,
  Shield,
  RotateCw,
  ChevronDown,
  LogOut,
  User as UserIcon,
  LogIn
} from "lucide-react";

export const Navbar = ({
  activeTab,
  setActiveTab,
  currentUser,
  currentRole,
  onSwitchRole,
  onReseed,
  reseedLoading,
  onOpenAuth,
  onSignOut
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const roles = [
    { id: "ADMIN", label: "Admin", badgeClass: "role-admin" },
    { id: "HR_MANAGER", label: "HR Manager", badgeClass: "role-hr-manager" },
    { id: "HR_PAYROLL_USER", label: "HR Payroll User", badgeClass: "role-hr-payroll-user" },
    { id: "HR_PAYROLL_MANAGER", label: "HR Payroll Manager", badgeClass: "role-hr-payroll-manager" },
    { id: "EMPLOYEE", label: "Employee", badgeClass: "role-employee" },
  ];

  const currentRoleObj = roles.find((r) => r.id === currentRole) || roles[0];

  // Role-based visibility of tabs
  const canAccessPayroll = currentRole !== "HR_MANAGER" && currentRole !== "EMPLOYEE";
  const canAccessFullHR = currentRole !== "EMPLOYEE";

  return (
    <header className="header-nav">
      <div className="nav-wrapper">
        <div className="logo-area">
          <div className="logo-badge">P</div>
          <div className="logo-text">
            <h1>PeoplePay360</h1>
            <span>HR & Payroll Ops</span>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={17} />
            Dashboard
          </button>

          <button
            className={`nav-item ${activeTab === "employees" ? "active" : ""}`}
            onClick={() => setActiveTab("employees")}
          >
            <Users size={17} />
            Employees
          </button>

          {canAccessFullHR && (
            <button
              className={`nav-item ${activeTab === "contracts" ? "active" : ""}`}
              onClick={() => setActiveTab("contracts")}
            >
              <FileText size={17} />
              Contracts
            </button>
          )}

          {canAccessFullHR && (
            <button
              className={`nav-item ${activeTab === "schedules" ? "active" : ""}`}
              onClick={() => setActiveTab("schedules")}
            >
              <Clock size={17} />
              Schedules
            </button>
          )}

          <button
            className={`nav-item ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            <Clock size={17} />
            Attendance
          </button>

          <button
            className={`nav-item ${activeTab === "timeoff" ? "active" : ""}`}
            onClick={() => setActiveTab("timeoff")}
          >
            <Calendar size={17} />
            Time Off
          </button>

          {canAccessPayroll && (
            <button
              className={`nav-item ${activeTab === "payroll" ? "active" : ""}`}
              onClick={() => setActiveTab("payroll")}
            >
              <DollarSign size={17} />
              Payroll
            </button>
          )}
        </nav>

        <div className="nav-actions">
          {/* Quick Reseed Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onReseed}
            disabled={reseedLoading}
            title="Reset to fresh realistic demo data"
          >
            <RotateCw size={13} className={reseedLoading ? "spin" : ""} />
            {reseedLoading ? "Resetting..." : "Reset Data"}
          </button>

          {/* Role Switcher Pill */}
          <div style={{ position: "relative" }}>
            <div
              className="role-pill"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            >
              <Shield size={14} color="#4f46e5" />
              <span className={`role-badge ${currentRoleObj.badgeClass}`}>
                {currentRoleObj.label}
              </span>
              <ChevronDown size={14} color="#64748b" />
            </div>

            {showRoleDropdown && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: 6,
                  background: "white",
                  borderRadius: 12,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  border: "1px solid #e2e8f0",
                  padding: 8,
                  width: 260,
                  zIndex: 100,
                }}
              >
                <div style={{ padding: "6px 12px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Switch Role / Persona
                </div>
                {roles.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      onSwitchRole(r.id);
                      setShowRoleDropdown(false);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 13,
                      background: currentRole === r.id ? "#f1f5f9" : "transparent",
                      fontWeight: currentRole === r.id ? 600 : 400
                    }}
                  >
                    <span>{r.label}</span>
                    <span className={`role-badge ${r.badgeClass}`}>{r.id === currentRole ? "Active" : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Auth Profile / Login Button */}
          {currentUser ? (
            <div style={{ position: "relative" }}>
              <div
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: 8,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0"
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#4f46e5",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700
                  }}
                >
                  {currentUser.name?.[0] || "U"}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                  {currentUser.name?.split(" ")[0]}
                </span>
                <ChevronDown size={13} color="#64748b" />
              </div>

              {showUserDropdown && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: 6,
                    background: "white",
                    borderRadius: 12,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    border: "1px solid #e2e8f0",
                    padding: 8,
                    width: 230,
                    zIndex: 100
                  }}
                >
                  <div style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{currentUser.name}</div>
                    <div style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {currentUser.email}
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setShowUserDropdown(false);
                      onSignOut();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      marginTop: 4,
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 13,
                      color: "#dc2626"
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out (Clear JWT)</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onOpenAuth}>
              <LogIn size={14} /> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
