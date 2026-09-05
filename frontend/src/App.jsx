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
