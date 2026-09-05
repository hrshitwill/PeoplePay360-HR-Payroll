import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from "lucide-react";

export const Sidebar = ({
  activeTab,
  setActiveTab,
  currentUser,
  currentRole,
  onOpenAuth,
  onSignOut
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Role-based visibility
  const isEmployee = currentRole === "EMPLOYEE";
  const canAccessPayroll = currentRole !== "HR_MANAGER" && currentRole !== "EMPLOYEE";
  const canAccessFullHR = currentRole !== "EMPLOYEE";

  const navItems = isEmployee
    ? [
        { id: "dashboard", label: "My Dashboard", icon: LayoutDashboard },
        { id: "attendance", label: "My Attendance", icon: Clock },
        { id: "timeoff", label: "My Time Off", icon: Calendar },
        { id: "payslips", label: "My Payslips", icon: FileSpreadsheet }
      ]
    : [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "employees", label: "Employees", icon: Users },
        ...(canAccessFullHR ? [{ id: "contracts", label: "Contracts", icon: FileText }] : []),
        { id: "attendance", label: "Attendance", icon: Clock },
        { id: "timeoff", label: "Time Off", icon: Calendar },
        ...(canAccessPayroll ? [{ id: "payroll", label: "Payroll", icon: DollarSign }] : []),
        ...(canAccessPayroll ? [{ id: "payslips", label: "Payslips", icon: FileSpreadsheet }] : []),
        { id: "reports", label: "Reports", icon: BarChart3 }
      ];

  const handleNavClick = (item) => {
    setActiveTab(item.id);
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className={`app-sidebar-dark ${collapsed ? "collapsed" : ""}`}>
      {/* Brand Header */}
      <div className="sidebar-dark-brand" onClick={() => setActiveTab("dashboard")}>
        <div className="sidebar-brand-badge-360">360</div>
        {!collapsed && (
          <div className="sidebar-brand-dark-text">
            <h2>PeoplePay360</h2>
            <span>HR & PAYROLL</span>
          </div>
        )}
      </div>

      {/* Main Navigation Items */}
      <div className="sidebar-dark-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-dark-item ${isActive ? "active" : ""}`}
              onClick={() => handleNavClick(item)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} className="sidebar-dark-icon" />
              {!collapsed && <span className="sidebar-dark-label">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Bottom Auxiliary Links & User Profile */}
      <div className="sidebar-dark-footer">
        <button
          className="sidebar-dark-aux-item"
          onClick={onOpenAuth}
          title="Settings"
        >
          <Settings size={18} className="sidebar-dark-icon" />
          {!collapsed && <span>Settings</span>}
        </button>

        <button
          className="sidebar-dark-aux-item"
          onClick={onSignOut}
          title="Logout"
        >
          <LogOut size={18} className="sidebar-dark-icon" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* User Card */}
        <div className="sidebar-dark-user-profile">
          <div className="sidebar-dark-user-avatar">
            {getInitials(currentUser?.name)}
          </div>
          {!collapsed && (
            <div className="sidebar-dark-user-details">
              <div className="sidebar-dark-user-title">
                {currentUser?.name || "System Administrator"}
              </div>
              <div className="sidebar-dark-user-sub">
                <Shield size={12} color="#3b82f6" fill="#3b82f6" />
                <span>{currentRole === "ADMIN" ? "Admin Access" : currentRole.replace(/_/g, " ")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          className="sidebar-dark-collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={15} />
          ) : (
            <>
              <ChevronLeft size={15} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
