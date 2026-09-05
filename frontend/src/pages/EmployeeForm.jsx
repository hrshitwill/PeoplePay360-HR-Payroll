import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Briefcase, Calendar, Clock, CreditCard } from 'lucide-react';
import { getEmployeeById, createEmployee, updateEmployee } from '../api/employee';
import './EmployeeForm.css';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== 'new';
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    jobTitle: '',
    jobPosition: '',
    employeeType: 'FULL_TIME',
    bankAccount: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (isEditMode) {
      fetchEmployee();
    }
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const res = await getEmployeeById(id);
      if (res.success) {
        // Format date for input field
        const employee = res.data;
        if (employee.joiningDate) {
          employee.joiningDate = employee.joiningDate.split('T')[0];
        }
        setFormData(employee);
      }
    } catch (err) {
      setError('Failed to fetch employee details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      if (isEditMode) {
        await updateEmployee(id, formData);
      } else {
        await createEmployee(formData);
      }
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving employee');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <button className="icon-btn" onClick={() => navigate('/employees')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{isEditMode ? `${formData.firstName} ${formData.lastName}` : 'New Employee'}</h1>
            <p className="page-subtitle">{isEditMode ? formData.jobTitle : 'Create a new employee record'}</p>
          </div>
        </div>
        
        {isEditMode && (
          <div className="smart-buttons">
            <button className="smart-btn glass-panel" onClick={() => navigate(`/contracts?employee=${id}`)}>
              <Briefcase size={20} />
              <span>Contracts</span>
            </button>
            <button className="smart-btn glass-panel" onClick={() => navigate(`/attendance?employee=${id}`)}>
              <Clock size={20} />
              <span>Attendance</span>
            </button>
            <button className="smart-btn glass-panel" onClick={() => navigate(`/timeoff?employee=${id}`)}>
              <Calendar size={20} />
              <span>Time Off</span>
            </button>
            <button className="smart-btn glass-panel" onClick={() => navigate(`/payroll?employee=${id}`)}>
              <CreditCard size={20} />
              <span>Payslips</span>
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="form-wrapper glass-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input required type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input required type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input required type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
            </div>
          </div>

          <hr className="divider" />

          <div className="form-section">
            <h3>Work Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Employee ID *</label>
                <input required type="text" className="form-control" name="employeeId" value={formData.employeeId} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" className="form-control" name="department" value={formData.department} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" className="form-control" name="jobTitle" value={formData.jobTitle} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Job Position</label>
                <input type="text" className="form-control" name="jobPosition" value={formData.jobPosition} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Employee Type</label>
                <select className="form-control" name="employeeType" value={formData.employeeType} onChange={handleChange}>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>
              <div className="form-group">
                <label>Joining Date *</label>
                <input required type="date" className="form-control" name="joiningDate" value={formData.joiningDate} onChange={handleChange} />
              </div>
            </div>
          </div>

          <hr className="divider" />

          <div className="form-section">
            <h3>Payroll & Status</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Bank Account Number</label>
                <input type="text" className="form-control" name="bankAccount" value={formData.bankAccount} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" name="status" value={formData.status} onChange={handleChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/employees')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
