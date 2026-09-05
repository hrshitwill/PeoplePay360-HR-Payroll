import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { EmployeeDashboard } from "./components/EmployeeDashboard";
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
  const [currentRole, setCurrentRole] = useState("EMPLOYEE");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [sessionChecking, setSessionChecking] = useState(true);

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
            setIsAuthOpen(false);
            setSessionChecking(false);
            return;
          }
        } catch (err) {
          console.warn("Session expired or invalid, clearing stored token:", err.message);
          api.removeToken();
        }
      }
      setCurrentUser(null);
      setIsAuthOpen(true);
      setSessionChecking(false);
    };
    checkUserSession();
  }, []);

  const handleNavigateToModule = (tab, params = {}) => {
    setNavParams(params);
    setActiveTab(tab);
  };

  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setIsAuthOpen(false);
    setActiveTab("dashboard");
    setNotification(`Authenticated successfully as ${user.name} (${user.role.replace(/_/g, " ")})`);
    setTimeout(() => setNotification(""), 4000);
  };

  const handleSignOut = () => {
    api.removeToken();
    setCurrentUser(null);
    setCurrentRole("EMPLOYEE");
    setIsAuthOpen(true);
    setNotification("Signed out successfully.");
    setTimeout(() => setNotification(""), 3000);
  };

  if (sessionChecking) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "Inter, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48,
            height: 48,
            border: "3px solid rgba(255,255,255,0.1)",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px"
          }} />
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Connecting to PeoplePay360...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthModal
        isOpen={true}
        forceOpen={true}
        onClose={() => {}}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

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
          {currentRole === "EMPLOYEE" ? (
            /* Dedicated Client Dashboard for Employee persona */
            <EmployeeDashboard
              currentUser={currentUser}
              activeTab={activeTab}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSignOut={handleSignOut}
            />
          ) : (
            /* Admin and HR Manager Modules */
            <>
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
