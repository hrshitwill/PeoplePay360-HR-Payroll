import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, CreditCard, AlertTriangle, Calendar, Clock, TrendingUp 
} from 'lucide-react';
import { getDashboardData } from '../api/dashboard';
import './Dashboard.css';

const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    periodStart: '',
    periodEnd: '',
    department: '',
    employeeType: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getDashboardData(filters);
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading && !data) return <div className="page-container">Loading Dashboard...</div>;
  if (!data) return <div className="page-container">Error loading data.</div>;

  // Format data for charts
  const salaryByDeptData = Object.entries(data.salaryByDepartment || {}).map(([name, vals]) => ({
    name,
    Gross: vals.gross,
    Net: vals.net
  }));

  const monthlyTrendsData = Object.entries(data.monthlyTrends || {})
    .map(([month, vals]) => ({
      name: month,
      Net: vals.net,
      Gross: vals.gross
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const employeeTypesData = Object.entries(data.employeeTypes || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value
  }));

  return (
    <div className="page-container dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll Dashboard</h1>
          <p className="page-subtitle">Overview of HR and Payroll metrics</p>
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-filters glass-panel">
        <div className="filter-group">
          <label>Department</label>
          <select name="department" value={filters.department} onChange={handleFilterChange} className="form-control">
            <option value="">All Departments</option>
            {data.departments?.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Period Start</label>
          <input type="date" name="periodStart" value={filters.periodStart} onChange={handleFilterChange} className="form-control" />
        </div>
        <div className="filter-group">
          <label>Period End</label>
          <input type="date" name="periodEnd" value={filters.periodEnd} onChange={handleFilterChange} className="form-control" />
        </div>
        <div className="filter-group filter-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => setFilters({periodStart:'', periodEnd:'', department:'', employeeType:''})}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card glass-panel">
          <div className="kpi-icon total"><CreditCard /></div>
          <div className="kpi-content">
            <h3>Total Net Salary</h3>
            <div className="kpi-value">${data.kpis.totalNetSalary.toLocaleString()}</div>
          </div>
        </div>
        <div className="kpi-card glass-panel">
          <div className="kpi-icon active"><Users /></div>
          <div className="kpi-content">
            <h3>Active Employees</h3>
            <div className="kpi-value">{data.kpis.activeEmployees} <span className="kpi-sub">/ {data.kpis.totalEmployees} total</span></div>
          </div>
        </div>
        <div className="kpi-card glass-panel">
          <div className="kpi-icon avg"><TrendingUp /></div>
          <div className="kpi-content">
            <h3>Average Net Salary</h3>
            <div className="kpi-value">${data.kpis.avgSalary.toLocaleString()}</div>
          </div>
        </div>
        <div className="kpi-card glass-panel">
          <div className="kpi-icon time"><Clock /></div>
          <div className="kpi-content">
            <h3>Attendance Rate</h3>
            <div className="kpi-value">{data.attendance.coverage}%</div>
          </div>
        </div>
      </div>

      {/* Warnings & Alerts */}
      {data.warnings && data.warnings.length > 0 && (
        <div className="warnings-section">
          <h2 className="section-title"><AlertTriangle className="icon-alert" /> Required Actions & Warnings</h2>
          <div className="warnings-grid">
            {data.warnings.map((w, idx) => (
              <div key={idx} className={`warning-card glass-panel ${w.severity.toLowerCase()}`}>
                <strong>{w.type.replace('_', ' ')}:</strong> {w.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="charts-grid">
        <div className="chart-card glass-panel">
          <h3>Salary Cost by Department</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryByDeptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e3342" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d24', borderColor: '#2e3342', color: '#f8fafc' }}
                />
                <Legend />
                <Bar dataKey="Net" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gross" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-card glass-panel">
          <h3>Monthly Salary Trends</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e3342" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d24', borderColor: '#2e3342', color: '#f8fafc' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Net" stroke="#22c55e" strokeWidth={3} />
                <Line type="monotone" dataKey="Gross" stroke="#eab308" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid thirds">
        <div className="chart-card glass-panel">
          <h3>Workforce Distribution</h3>
          <div className="chart-wrapper pie">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={employeeTypesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {employeeTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d24', borderColor: '#2e3342', color: '#f8fafc' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-card-col glass-panel">
          <h3><Calendar size={20}/> Time Off Overview</h3>
          <div className="stat-list">
            <div className="stat-item">
              <span>Approved Leave Days</span>
              <strong>{data.timeOff.approvedDays}</strong>
            </div>
            <div className="stat-item">
              <span>Pending Requests</span>
              <strong className="text-warning">{data.timeOff.pendingRequests}</strong>
            </div>
            <div className="stat-item">
              <span>Total Allocated</span>
              <strong>{data.timeOff.totalAllocated}</strong>
            </div>
            <div className="stat-item">
              <span>Remaining Balance</span>
              <strong className="text-success">{data.timeOff.totalRemaining}</strong>
            </div>
          </div>
        </div>

        <div className="stat-card-col glass-panel">
          <h3><Clock size={20}/> Attendance Snapshot</h3>
          <div className="stat-list">
            <div className="stat-item">
              <span>Present</span>
              <strong className="text-success">{data.attendance.present}</strong>
            </div>
            <div className="stat-item">
              <span>Absent</span>
              <strong className="text-danger">{data.attendance.absent}</strong>
            </div>
            <div className="stat-item">
              <span>Late</span>
              <strong className="text-warning">{data.attendance.late}</strong>
            </div>
            <div className="stat-item">
              <span>Missing Checkouts</span>
              <strong className="text-warning">{data.attendance.missingCheckouts}</strong>
            </div>
            <div className="stat-item">
              <span>Total Overtime (hrs)</span>
              <strong>{data.attendance.totalOvertime}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
