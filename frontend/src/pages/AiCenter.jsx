import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Calculator, RefreshCw, FileText, ArrowUpRight, CheckCircle2, Bot } from 'lucide-react';
import { getPayrollAnomalies, runPayrollSimulation } from '../api/ai';
import { api } from '../api';
import './AiCenter.css';

const AiCenter = () => {
  const [activeTab, setActiveTab] = useState('anomalies');
  
  // Anomalies state
  const [anomalies, setAnomalies] = useState([]);
  const [loadingAnomalies, setLoadingAnomalies] = useState(true);

  // Simulation state
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [proposedSalary, setProposedSalary] = useState(60000);
  const [bonusPct, setBonusPct] = useState(10);
  const [newAllowance, setNewAllowance] = useState(5000);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchAnomalies();
    fetchEmployeeOptions();
  }, []);

  const fetchAnomalies = async () => {
    try {
      setLoadingAnomalies(true);
      const res = await getPayrollAnomalies();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setAnomalies(list);
    } catch (err) {
      console.error("Failed to fetch AI anomalies", err);
    } finally {
      setLoadingAnomalies(false);
    }
  };

  const fetchEmployeeOptions = async () => {
    try {
      const res = await api.getEmployees();
      const empList = res.data || res.employees || (Array.isArray(res) ? res : []);
      setEmployees(empList);
      if (empList.length > 0) setSelectedEmp(empList[0]._id);
    } catch (err) {
      console.error("Failed to load employees for simulation", err);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    try {
      setSimulating(true);
      const res = await runPayrollSimulation({
        employeeId: selectedEmp,
        proposedSalary,
        bonusPercentage: bonusPct,
        newAllowance
      });
      setSimulationResult(res?.simulation || res?.data?.simulation || null);
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="ai-center-container">
      <div className="ai-header">
        <div className="ai-title-badge">
          <Sparkles className="icon-glow" size={24} />
          <div>
            <h1>PeoplePay360 AI Engine</h1>
            <p>Smart anomaly detection, salary simulation, and explainable payroll insights</p>
          </div>
        </div>
      </div>

      <div className="ai-tabs">
        <button 
          className={`ai-tab-btn ${activeTab === 'anomalies' ? 'active' : ''}`}
          onClick={() => setActiveTab('anomalies')}
        >
          <AlertTriangle size={18} />
          AI Anomaly Detection ({anomalies.length})
        </button>
        <button 
          className={`ai-tab-btn ${activeTab === 'simulation' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulation')}
        >
          <Calculator size={18} />
          Payroll Simulation Engine
        </button>
      </div>

      {activeTab === 'anomalies' && (
        <div className="ai-content-card">
          <div className="card-header-actions">
            <h2><Bot size={20} /> Detected Payroll Warnings & Deviations</h2>
            <button className="btn-refresh" onClick={fetchAnomalies} disabled={loadingAnomalies}>
              <RefreshCw className={loadingAnomalies ? 'spin' : ''} size={16} /> Re-analyze
            </button>
          </div>

          {loadingAnomalies ? (
            <div className="ai-loading">Analyzing payruns & historical contracts...</div>
          ) : anomalies.length === 0 ? (
            <div className="ai-empty-state">
              <CheckCircle2 size={48} color="#10B981" />
              <h3>All clear! No payroll anomalies detected.</h3>
              <p>All salary calculations fall within standard contract variances.</p>
            </div>
          ) : (
            <div className="anomaly-list">
              {anomalies.map((item, idx) => (
                <div key={idx} className={`anomaly-card ${item.severity.toLowerCase()}`}>
                  <div className="anomaly-header">
                    <span className="employee-name">{item.employee.name} ({item.employee.code})</span>
                    <span className={`badge-severity ${item.severity.toLowerCase()}`}>{item.severity} SEVERITY</span>
                  </div>
                  <p className="anomaly-msg">{item.message}</p>
                  <div className="anomaly-footer">
                    <span className="anomaly-type">Type: {item.type}</span>
                    <button className="btn-link" onClick={() => window.location.href = `/payslips`}>
                      Inspect Payslip <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'simulation' && (
        <div className="ai-simulation-grid">
          <div className="ai-content-card sim-form-card">
            <h2><Calculator size={20} /> Salary Increase / Contract Simulator</h2>
            <form onSubmit={handleSimulate}>
              <div className="form-group">
                <label>Target Employee</label>
                <select value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.department || 'N/A'})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Proposed Base Salary (₹/month)</label>
                <input 
                  type="number" 
                  value={proposedSalary} 
                  onChange={(e) => setProposedSalary(e.target.value)} 
                  step="1000"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Performance Bonus (%)</label>
                  <input 
                    type="number" 
                    value={bonusPct} 
                    onChange={(e) => setBonusPct(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>New Monthly Allowance (₹)</label>
                  <input 
                    type="number" 
                    value={newAllowance} 
                    onChange={(e) => setNewAllowance(e.target.value)} 
                  />
                </div>
              </div>

              <button type="submit" className="btn-simulate" disabled={simulating}>
                {simulating ? 'Calculating Projection...' : 'Run Compensation Projection'}
              </button>
            </form>
          </div>

          <div className="ai-content-card sim-results-card">
            <h2><FileText size={20} /> Simulation Breakdown</h2>
            {!simulationResult ? (
              <div className="ai-empty-state">
                <Bot size={40} color="#6366F1" />
                <p>Select employee and set parameters to run instant payroll simulation without altering active database state.</p>
              </div>
            ) : (
              <div className="sim-summary">
                <div className="sim-metrics">
                  <div className="metric-box">
                    <span className="label">Current Net</span>
                    <span className="val">₹{simulationResult.baseline.estimatedNet.toLocaleString()}</span>
                  </div>
                  <div className="metric-box highlight">
                    <span className="label">Simulated Net</span>
                    <span className="val">₹{simulationResult.projected.simulatedNet.toLocaleString()}</span>
                  </div>
                  <div className="metric-box positive">
                    <span className="label">Net Increase</span>
                    <span className="val">+₹{simulationResult.projected.netDifference.toLocaleString()} ({simulationResult.projected.percentageIncrease}%)</span>
                  </div>
                </div>

                <h3>Computed Rule Breakdown</h3>
                <div className="sim-table-wrap">
                  <table className="sim-table">
                    <thead>
                      <tr>
                        <th>Rule / Structure Component</th>
                        <th>Type</th>
                        <th>Projected Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResult.breakdown.map((row, i) => (
                        <tr key={i}>
                          <td>{row.rule}</td>
                          <td><span className={`badge-type ${row.type.toLowerCase()}`}>{row.type}</span></td>
                          <td className={row.type === 'EARNING' ? 'earning-val' : 'deduction-val'}>
                            {row.type === 'EARNING' ? '+' : '-'}₹{row.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiCenter;
