import React, { useState } from "react";
import {
  Search,
  Bell,
  LogOut,
  ChevronDown
} from "lucide-react";

export const Navbar = ({
  activeTab,
  currentUser,
  onOpenAuth,
  onSignOut,
  onSearchChange,
  searchQuery = ""
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const tabBreadcrumbs = {
    dashboard: "Dashboard",
    employees: "Employees",
    contracts: "Contracts",
    attendance: "Attendance",
    timeoff: "Time Off",
    payroll: "Payroll",
    payslips: "Payslips",
    reports: "Reports",
    schedules: "Reports"
  };

  const currentBreadcrumb = tabBreadcrumbs[activeTab] || "Dashboard";

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="top-header-bar">
      {/* Left: Breadcrumbs & Page Title */}
      <div className="top-header-left">
        <div className="top-header-breadcrumb">
          <span>Home</span>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-current">{currentBreadcrumb}</span>
        </div>
        <h1 className="top-header-title">{currentBreadcrumb}</h1>
      </div>

      {/* Center: Global Search Input */}
      <div className="top-header-search-box">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="top-header-search-input"
          placeholder="Search employees, payroll records, contracts..."
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
      </div>

      {/* Right: Notifications & Profile */}
      <div className="top-header-right">
        {/* Notification Bell */}
        <button className="top-header-bell-btn" title="Notifications">
          <Bell size={18} />
          <span className="bell-badge-dot" />
        </button>

        {/* User Profile Badge */}
        {currentUser ? (
          <div style={{ position: "relative" }}>
            <div
              className="top-header-user-badge"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="top-header-avatar">
                {getInitials(currentUser.name)}
              </div>
              <div className="top-header-user-info">
                <span className="top-header-name">{currentUser.name || "Admin User"}</span>
                <span className="top-header-role">
                  {currentUser.role === "ADMIN" ? "Admin" : currentUser.role?.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {showUserDropdown && (
              <div className="top-header-dropdown animate-scale-in">
                <div className="dropdown-header">
                  <div className="dropdown-name">{currentUser.name}</div>
                  <div className="dropdown-email">{currentUser.email}</div>
                </div>
                <button
                  className="dropdown-signout-btn"
                  onClick={() => {
                    setShowUserDropdown(false);
                    onSignOut();
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onOpenAuth}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
