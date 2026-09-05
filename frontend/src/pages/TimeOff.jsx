import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getTimeOffRequests, createTimeOffRequest, approveTimeOffRequest, rejectTimeOffRequest } from '../api/operations';
import { getEmployees } from '../api/employee';
import './TimeOff.css';

const TimeOff = () => {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    employee: '',
    type: 'PAID',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: 'Personal leave'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resRequests, resEmp] = await Promise.all([
        getTimeOffRequests(),
        getEmployees()
      ]);
      setRequests(resRequests.data.data || []);
      const empList = resEmp.data.data || [];
      setEmployees(empList);
      if (empList.length > 0) setFormData(prev => ({ ...prev, employee: empList[0]._id }));
    } catch (err) {
      console.error("Failed to load timeoff data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTimeOffRequest(formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to create request", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveTimeOffRequest(id);
      fetchData();
    } catch (err) {
      console.error("Failed to approve leave", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectTimeOffRequest(id);
      fetchData();
    } catch (err) {
      console.error("Failed to reject leave", err);
    }
  };

  return (
    <div className="timeoff-container">
      <div className="timeoff-header">
        <div>
          <h1>Time Off & Leave Management</h1>
          <p>Request, approve, and track employee leave balances with automatic payroll integration.</p>
        </div>
        <button className="btn-add-leave" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Request
        </button>
      </div>

      <div className="timeoff-list-card">
        {loading ? (
          <div className="loading-state">Loading time off requests...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">No leave requests found.</div>
        ) : (
          <table className="timeoff-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r._id}>
                  <td><strong>{r.employee?.firstName} {r.employee?.lastName}</strong></td>
                  <td><span className="type-badge">{r.type || 'PAID'}</span></td>
                  <td>{new Date(r.startDate).toLocaleDateString()} - {new Date(r.endDate).toLocaleDateString()}</td>
                  <td>{r.days || 1} day(s)</td>
                  <td>{r.reason}</td>
                  <td><span className={`status-pill ${r.status?.toLowerCase()}`}>{r.status}</span></td>
                  <td>
                    {r.status === 'PENDING' && (
                      <div className="action-btns">
                        <button className="btn-approve" onClick={() => handleApprove(r._id)}>
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button className="btn-reject" onClick={() => handleReject(r._id)}>
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Submit Leave Request</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Employee</label>
                <select value={formData.employee} onChange={e => setFormData({ ...formData, employee: e.target.value })}>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Leave Type</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="PAID">Paid Time Off (PTO)</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Reason</label>
                <input type="text" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeOff;
