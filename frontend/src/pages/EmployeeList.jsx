import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, List, Grid, MoreVertical } from 'lucide-react';
import { getEmployees } from '../api/employee';
import './EmployeeList.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await getEmployees();
      if (res.success) {
        setEmployees(res.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadgeClass = (status) => {
    return status === 'ACTIVE' ? 'badge success' : 'badge danger';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage your workforce</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/employees/new')}>
            <Plus size={18} />
            New Employee
          </button>
        </div>
      </div>

      <div className="toolbar glass-panel">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search employees..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="view-toggles">
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List size={18} />
          </button>
          <button 
            className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
            title="Kanban View"
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading employees...</div>
      ) : filteredEmployees.length === 0 ? (
        <div className="empty-state glass-panel">
          <Users size={48} className="empty-icon" />
          <h3>No employees found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          {viewMode === 'kanban' ? (
            <div className="kanban-grid">
              {filteredEmployees.map(emp => (
                <div 
                  key={emp._id} 
                  className="kanban-card glass-panel"
                  onClick={() => navigate(`/employees/${emp._id}`)}
                >
                  <div className="card-header">
                    <span className={getStatusBadgeClass(emp.status)}>{emp.status}</span>
                    <button className="icon-btn" onClick={(e) => { e.stopPropagation(); }}><MoreVertical size={16} /></button>
                  </div>
                  <div className="card-body">
                    <div className="avatar-lg">
                      {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                    </div>
                    <h3>{emp.firstName} {emp.lastName}</h3>
                    <p className="job-title">{emp.jobTitle || 'No Title'}</p>
                    <p className="department">{emp.department || 'No Department'}</p>
                  </div>
                  <div className="card-footer">
                    <span className="emp-id">{emp.employeeId}</span>
                    <span className="emp-type">{emp.employeeType.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="list-view glass-panel">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Job Title</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <tr key={emp._id} onClick={() => navigate(`/employees/${emp._id}`)}>
                      <td>{emp.employeeId}</td>
                      <td>
                        <div className="table-user">
                          <div className="avatar-sm">
                            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                          </div>
                          <span>{emp.firstName} {emp.lastName}</span>
                        </div>
                      </td>
                      <td>{emp.department || '-'}</td>
                      <td>{emp.jobTitle || '-'}</td>
                      <td>{emp.employeeType.replace('_', ' ')}</td>
                      <td><span className={getStatusBadgeClass(emp.status)}>{emp.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeList;
