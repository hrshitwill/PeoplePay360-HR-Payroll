import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const TopBar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-search">
        {/* Placeholder for search */}
      </div>
      <div className="topbar-actions">
        <div className="user-profile">
          <div className="avatar">
            <UserIcon size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role?.replace(/_/g, ' ')}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
