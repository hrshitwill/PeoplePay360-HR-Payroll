import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-wrapper">
        <TopBar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
