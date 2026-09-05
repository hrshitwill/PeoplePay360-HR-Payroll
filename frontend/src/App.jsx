import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
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
import { CheckCircle } from "lucide-react";

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

  return (
    <div className="app-layout">
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(t) => {
          setNavParams({});
          setActiveTab(t);
        }}
        currentUser={currentUser}
        currentRole={currentRole}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area with Sticky Topbar */}
      <div className="app-main-wrapper">
        <Navbar
          activeTab={activeTab}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onSignOut={handleSignOut}
        />

      {/* Toast Notification */}
      {notification && (
        <div
          className="animate-fade-in"
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            background: "rgba(15, 23, 42, 0.94)",
            backdropFilter: "blur(8px)",
            color: "white",
            padding: "14px 22px",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 9999,
            fontSize: 13.5,
            fontWeight: 600,
            border: "1px solid rgba(255, 255, 255, 0.12)"
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <CheckCircle size={15} color="#10b981" />
          </div>
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
        {activeTab === "dashboard" && (
          <DashboardView
            onNavigateToModule={handleNavigateToModule}
            currentUser={currentUser}
          />
        )}

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

        {activeTab === "payslips" && (
          <PayrollModule
            initialEmployeeId={navParams.employeeId}
            initialSubtab="payslips"
            currentRole={currentRole}
          />
        )}

        {(activeTab === "schedules" || activeTab === "reports") && (
          <WorkingScheduleModule currentRole={currentRole} />
        )}
      </main>

      {/* Floating AI Workforce Assistant Button (as seen in reference design) */}
      <button
        className="floating-ai-assistant-btn"
        onClick={() => {
          setNotification("PeoplePay360 AI Assistant: Ready to summarize payroll and workforce metrics.");
          setTimeout(() => setNotification(""), 4000);
        }}
        title="PeoplePay360 AI Workforce Assistant"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" fill="url(#aiGrad)" />
          <path d="M19 16L20.2 18.8L23 20L20.2 21.2L19 24L17.8 21.2L15 20L17.8 18.8L19 16Z" fill="#a855f7" />
          <defs>
            <linearGradient id="aiGrad" x1="4" y1="2" x2="20" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b82f6" />
              <stop offset="0.5" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </button>
      </div>
    </div>
  );
}

export default App;
