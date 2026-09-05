import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Clock, 
  Calendar, 
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './Layout.css';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const isHrOrAdmin = user?.role !== 'EMPLOYEE';
  const isPayrollUser = ['HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN'].includes(user?.role);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <div className="brand">PeoplePay360</div>}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {isHrOrAdmin ? (
          <>
            <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} end>
              <LayoutDashboard size={20} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
            <NavLink to="/employees" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              {!collapsed && <span>Employees</span>}
            </NavLink>
            <NavLink to="/contracts" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={20} />
              {!collapsed && <span>Contracts</span>}
            </NavLink>
          </>
        ) : (
          <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} end>
            <Users size={20} />
            {!collapsed && <span>My Profile</span>}
          </NavLink>
        )}

        <NavLink to="/attendance" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <Clock size={20} />
          {!collapsed && <span>Attendance</span>}
        </NavLink>
        <NavLink to="/timeoff" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          {!collapsed && <span>Time Off</span>}
        </NavLink>

        {(isPayrollUser || user?.role === 'EMPLOYEE') && (
          <NavLink to="/payroll" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <CreditCard size={20} />
            {!collapsed && <span>Payroll</span>}
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
