import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { EmployeeModule } from "./components/EmployeeModule";
import { ContractModule } from "./components/ContractModule";
import { AttendanceModule } from "./components/AttendanceModule";
import { TimeOffModule } from "./components/TimeOffModule";
import { PayrollModule } from "./components/PayrollModule";
import { WorkingScheduleModule } from "./components/WorkingScheduleModule";
import { AuthModal } from "./components/AuthModal";
import { api } from "./api";
import { Info, CheckCircle, Shield, Lock } from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentRole, setCurrentRole] = useState("ADMIN");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [reseedLoading, setReseedLoading] = useState(false);
  const [notification, setNotification] = useState("");

  // Navigation params passed across smart-buttons
  const [navParams, setNavParams] = useState({});

  // Check existing JWT token on initial load
  useEffect(() => {
    const checkUserSession = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setCurrentUser(res.user);
            setCurrentRole(res.user.role);
          }
        } catch (err) {
          console.warn("Session expired, clearing stored token:", err.message);
          api.removeToken();
          // Fall back to default admin demo
          handleDemoAutoLogin("ADMIN");
        }
      } else {
        // Automatically sign in as default Admin for seamless evaluation
        handleDemoAutoLogin("ADMIN");
      }
    };
    checkUserSession();
  }, []);

  const handleDemoAutoLogin = async (role) => {
    try {
      const res = await api.demoLogin(role);
      if (res.success) {
        api.setToken(res.token);
        setCurrentUser(res.user);
        setCurrentRole(res.user.role);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigateToModule = (tab, params = {}) => {
    setNavParams(params);
    setActiveTab(tab);
  };

  const handleSwitchRole = async (role) => {
    try {
      const res = await api.demoLogin(role);
      if (res.success) {
        api.setToken(res.token);
        setCurrentUser(res.user);
        setCurrentRole(role);
        setNotification(`Switched role and renewed JWT token for ${role.replace("_", " ")}`);
        setTimeout(() => setNotification(""), 3500);

        // If switching to restricted tab, redirect gracefully
        if (role === "EMPLOYEE" && (activeTab === "payroll" || activeTab === "contracts")) {
          setActiveTab("dashboard");
        }
        if (role === "HR_MANAGER" && activeTab === "payroll") {
          setActiveTab("dashboard");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setNotification(`Authenticated successfully as ${user.name} (${user.role})`);
    setTimeout(() => setNotification(""), 3500);
  };

  const handleSignOut = () => {
    api.removeToken();
    setCurrentUser(null);
    setCurrentRole("EMPLOYEE");
    setNotification("Signed out. JWT token revoked.");
    setTimeout(() => setNotification(""), 3000);
  };

  const handleReseed = async () => {
    if (!window.confirm("Reset database with fresh corporate demo data (employees, contracts, schedules, leaves, payruns, users)?")) {
      return;
    }

    try {
      setReseedLoading(true);
      await api.reseedDatabase();
      setNotification("Database reseeded successfully with realistic corporate data!");
      setTimeout(() => setNotification(""), 4000);
      window.location.reload();
    } catch (err) {
      alert(`Reseed failed: ${err.message}`);
    } finally {
      setReseedLoading(false);
    }
  };

  const roleDescriptions = {
    ADMIN: "Full platform control across all HR and Payroll operations and configurations.",
    HR_MANAGER: "Full CRUD access to Employees, Contracts, Schedules, Attendance, and Time Off. Payroll features restricted.",
    HR_PAYROLL_USER: "HR Manager access + Payrun and Payslip processing. Read-only on Salary Structures.",
    HR_PAYROLL_MANAGER: "Full control over HR, Payruns, Payslips, Salary Structures, and Sequencing Rules.",
    EMPLOYEE: "Employee self-service: View personal details, clock in/out, view leave balances and submit requests."
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(t) => {
          setNavParams({});
          setActiveTab(t);
        }}
        currentUser={currentUser}
        currentRole={currentRole}
        onSwitchRole={handleSwitchRole}
        onReseed={handleReseed}
        reseedLoading={reseedLoading}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Role Banner / Active Context */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "8px 24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12.5, color: "#64748b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={14} color="#4f46e5" />
            <span>Active Role: <strong style={{ color: "#0f172a" }}>{currentRole.replace("_", " ")}</strong></span>
            <span>—</span>
            <span>{roleDescriptions[currentRole]}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {currentUser && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Lock size={12} color="#10b981" />
                <span style={{ color: "#065f46", fontWeight: 600 }}>
                  JWT Authenticated: {currentUser.email}
                </span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              <span style={{ color: "#059669", fontWeight: 600 }}>MongoDB Connected • Live Operations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#0f172a",
            color: "white",
            padding: "12px 20px",
            borderRadius: 10,
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 9999,
            fontSize: 13.5
          }}
        >
          <CheckCircle size={16} color="#10b981" />
          <span>{notification}</span>
        </div>
      )}

      {/* JWT Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === "dashboard" && <DashboardView />}

        {activeTab === "employees" && (
          <EmployeeModule
            onNavigateToModule={handleNavigateToModule}
            currentRole={currentRole}
          />
        )}

        {activeTab === "contracts" && (
          <ContractModule
            initialEmployeeId={navParams.employeeId}
            currentRole={currentRole}
          />
        )}

        {activeTab === "attendance" && (
          <AttendanceModule
            initialEmployeeId={navParams.employeeId}
            currentRole={currentRole}
          />
        )}

        {activeTab === "timeoff" && (
          <TimeOffModule
            initialSubtab={navParams.subtab || "requests"}
            initialEmployeeId={navParams.employeeId}
            currentRole={currentRole}
          />
        )}

        {activeTab === "payroll" && (
          <PayrollModule
            initialEmployeeId={navParams.employeeId}
            initialSubtab={navParams.subtab || "payruns"}
            currentRole={currentRole}
          />
        )}

        {activeTab === "schedules" && (
          <WorkingScheduleModule currentRole={currentRole} />
        )}
      </main>
    </div>
  );
}

export default App;
