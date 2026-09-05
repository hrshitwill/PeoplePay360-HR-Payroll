import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { getContracts, createContract } from '../api/operations';
import { getEmployees } from '../api/employee';
import './Contracts.css';

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    employee: '',
    contractType: 'FULL_TIME',
    startDate: new Date().toISOString().split('T')[0],
    wage: 50000,
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resContracts, resEmp] = await Promise.all([
        getContracts(),
        getEmployees()
      ]);
      setContracts(resContracts.data.data || []);
      const empList = resEmp.data.data || [];
      setEmployees(empList);
      if (empList.length > 0) setFormData(prev => ({ ...prev, employee: empList[0]._id }));
    } catch (err) {
      console.error("Failed to load contracts data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createContract(formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to create contract", err);
    }
  };

  return (
    <div className="contracts-container">
      <div className="contracts-header">
        <div>
          <h1>Employee Employment Contracts</h1>
          <p>Manage active salary contracts, wage structures, and employment terms.</p>
        </div>
        <button className="btn-add-contract" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Contract
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading contracts...</div>
      ) : contracts.length === 0 ? (
        <div className="empty-state">No contracts found. Click "New Contract" to assign standard wages to employees.</div>
      ) : (
        <div className="contracts-grid">
          {contracts.map(c => (
            <div key={c._id} className="contract-card">
              <div className="card-top">
                <div className="emp-avatar">
                  {c.employee?.firstName?.[0]}{c.employee?.lastName?.[0]}
                </div>
                <div>
                  <h3>{c.employee?.firstName} {c.employee?.lastName}</h3>
                  <span className="job-title">{c.jobPosition || c.employee?.jobTitle || 'Software Engineer'}</span>
                </div>
                <span className={`status-badge ${c.status.toLowerCase()}`}>{c.status}</span>
              </div>
              <div className="card-body">
                <div className="detail-row">
                  <span>Contract Type</span>
                  <strong>{c.contractType}</strong>
                </div>
                <div className="detail-row">
                  <span>Start Date</span>
                  <strong>{new Date(c.startDate).toLocaleDateString()}</strong>
                </div>
                <div className="detail-row highlight">
                  <span>Monthly Base Salary</span>
                  <strong className="wage-amount">₹{c.wage?.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Contract</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Employee</label>
                <select value={formData.employee} onChange={e => setFormData({ ...formData, employee: e.target.value })}>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contract Type</label>
                  <select value={formData.contractType} onChange={e => setFormData({ ...formData, contractType: e.target.value })}>
                    <option value="FULL_TIME">FULL_TIME</option>
                    <option value="PART_TIME">PART_TIME</option>
                    <option value="CONTRACT">CONTRACT</option>
                    <option value="INTERN">INTERN</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Monthly Base Wage (₹)</label>
                  <input type="number" value={formData.wage} onChange={e => setFormData({ ...formData, wage: parseFloat(e.target.value) })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Contract</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;
