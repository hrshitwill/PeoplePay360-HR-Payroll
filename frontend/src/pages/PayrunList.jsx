import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Play, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { getPayruns, createPayrun, computePayrun, validatePayrun, markPayrunPaid } from '../api/payroll';
import './PayrunList.css';

const PayrunList = () => {
  const [payruns, setPayruns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: `Payroll - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
    periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPayruns();
  }, []);

  const fetchPayruns = async () => {
    try {
      setLoading(true);
      const res = await getPayruns();
      setPayruns(res.data.data || []);
    } catch (err) {
      console.error("Failed to load payruns", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createPayrun(formData);
      setShowModal(false);
      fetchPayruns();
    } catch (err) {
      console.error("Failed to create payrun", err);
    }
  };

  const handleCompute = async (id) => {
    try {
      await computePayrun(id);
      fetchPayruns();
    } catch (err) {
      alert(err.response?.data?.message || "Compute failed");
    }
  };

  const handleValidate = async (id) => {
    try {
      await validatePayrun(id);
      fetchPayruns();
    } catch (err) {
      alert(err.response?.data?.message || "Validation failed");
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await markPayrunPaid(id);
      fetchPayruns();
    } catch (err) {
      alert(err.response?.data?.message || "Mark as paid failed");
    }
  };

  return (
    <div className="payruns-container">
      <div className="payruns-header">
        <div>
          <h1>Payroll Processing (Payruns)</h1>
          <p>4-Stage Payroll Workflow: DRAFT → COMPUTED → VALIDATED → PAID</p>
        </div>
        <button className="btn-add-payrun" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Payrun Batch
        </button>
      </div>

      <div className="payruns-list-card">
        {loading ? (
          <div className="loading-state">Loading payruns...</div>
        ) : payruns.length === 0 ? (
          <div className="empty-state">No payrun batches found. Click "New Payrun Batch" to generate payroll.</div>
        ) : (
          <table className="payruns-table">
            <thead>
              <tr>
                <th>Payrun Name</th>
                <th>Period</th>
                <th>Employees</th>
                <th>Gross Total</th>
                <th>Deductions</th>
                <th>Net Total</th>
                <th>Workflow Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payruns.map(p => (
                <tr key={p._id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}</td>
                  <td>{p.employees?.length || 0}</td>
                  <td>₹{p.totalGross?.toLocaleString() || 0}</td>
                  <td>₹{p.totalDeductions?.toLocaleString() || 0}</td>
                  <td><strong className="text-highlight">₹{p.totalNet?.toLocaleString() || 0}</strong></td>
                  <td>
                    <span className={`stage-badge ${p.status?.toLowerCase()}`}>{p.status}</span>
                  </td>
                  <td>
                    <div className="action-btns">
                      {p.status === 'DRAFT' && (
                        <button className="btn-stage compute" onClick={() => handleCompute(p._id)}>
                          <Play size={14} /> Compute
                        </button>
                      )}
                      {p.status === 'COMPUTED' && (
                        <button className="btn-stage validate" onClick={() => handleValidate(p._id)}>
                          <CheckCircle size={14} /> Validate
                        </button>
                      )}
                      {p.status === 'VALIDATED' && (
                        <button className="btn-stage pay" onClick={() => handleMarkPaid(p._id)}>
                          <CreditCard size={14} /> Mark Paid
                        </button>
                      )}
                      {p.status === 'PAID' && (
                        <span className="paid-done">Done</span>
                      )}
                    </div>
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
            <h2>Create New Payrun Batch</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Payrun Batch Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Period Start</label>
                  <input type="date" value={formData.periodStart} onChange={e => setFormData({ ...formData, periodStart: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Period End</label>
                  <input type="date" value={formData.periodEnd} onChange={e => setFormData({ ...formData, periodEnd: e.target.value })} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Create Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrunList;
