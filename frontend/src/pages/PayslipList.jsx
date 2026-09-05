import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, Download, Eye, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { getPayslips, getPayslipById, getPayslipPDF } from '../api/payroll';
import { getExplainPayslip } from '../api/ai';
import './PayslipList.css';

const PayslipList = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const res = await getPayslips();
      setPayslips(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch payslips", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSlip = async (id) => {
    try {
      const res = await getPayslipById(id);
      setSelectedSlip(res?.data || res?.payslip || res);
      setExplanation(null);
    } catch (err) {
      console.error("Failed to load payslip detail", err);
    }
  };

  const handleExplain = async (id) => {
    try {
      setExplaining(true);
      const res = await getExplainPayslip(id);
      setExplanation(res?.data || res);
    } catch (err) {
      console.error("Failed to explain payslip", err);
    } finally {
      setExplaining(false);
    }
  };

  const handleDownloadPDF = (slip) => {
    // Generate simple printable payslip window / download simulation
    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html>
        <head>
          <title>Payslip - ${slip.employee?.firstName} ${slip.employee?.lastName}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #111; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .meta { margin: 20px 0; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background: #f4f4f4; }
            .total { font-weight: bold; font-size: 16px; background: #eef2ff; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>PEOPLEPAY360 - SALARY PAYSLIP</h2>
            <p>Period: ${new Date(slip.periodStart).toLocaleDateString()} to ${new Date(slip.periodEnd).toLocaleDateString()}</p>
          </div>
          <div class="meta">
            <div>
              <strong>Employee:</strong> ${slip.employee?.firstName} ${slip.employee?.lastName}<br/>
              <strong>Employee ID:</strong> ${slip.employee?.employeeId}<br/>
              <strong>Department:</strong> ${slip.employee?.department || 'N/A'}
            </div>
            <div>
              <strong>Contract Base:</strong> ₹${slip.contractSalary?.toLocaleString()}<br/>
              <strong>Status:</strong> ${slip.status}
            </div>
          </div>
          <h3>Earnings</h3>
          <table>
            <tr><th>Component</th><th>Amount</th></tr>
            ${slip.earnings?.map(e => `<tr><td>${e.name}</td><td>+₹${e.amount.toLocaleString()}</td></tr>`).join('')}
            <tr class="total"><td>Gross Earnings</td><td>₹${slip.gross?.toLocaleString()}</td></tr>
          </table>
          <h3>Deductions</h3>
          <table>
            <tr><th>Component</th><th>Amount</th></tr>
            ${slip.deductions?.map(d => `<tr><td>${d.name}</td><td>-₹${d.amount.toLocaleString()}</td></tr>`).join('')}
            <tr class="total"><td>Total Deductions</td><td>₹${slip.totalDeductions?.toLocaleString()}</td></tr>
          </table>
          <div style="margin-top: 30px; font-size: 18px; font-weight: bold; text-align: right;">
            NET SALARY PAID: ₹${slip.net?.toLocaleString()}
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 500);
  };

  return (
    <div className="payslips-container">
      <div className="payslips-header">
        <div>
          <h1>Employee Payslips & Explanations</h1>
          <p>View computed earnings, download official PDF payslips, or generate AI summaries.</p>
        </div>
      </div>

      <div className="payslips-layout">
        <div className="payslips-list-card">
          {loading ? (
            <div className="loading-state">Loading payslips...</div>
          ) : payslips.length === 0 ? (
            <div className="empty-state">No computed payslips found.</div>
          ) : (
            <table className="payslips-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Gross</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map(slip => (
                  <tr key={slip._id} className={selectedSlip?._id === slip._id ? 'active-row' : ''}>
                    <td>
                      <div className="emp-info">
                        <strong>{slip.employee?.firstName} {slip.employee?.lastName}</strong>
                        <span>{slip.employee?.employeeId}</span>
                      </div>
                    </td>
                    <td>{new Date(slip.periodStart).toLocaleDateString()}</td>
                    <td className="text-green">+₹{slip.gross?.toLocaleString()}</td>
                    <td className="text-red">-₹{slip.totalDeductions?.toLocaleString()}</td>
                    <td><strong className="text-highlight">₹{slip.net?.toLocaleString()}</strong></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon" onClick={() => handleViewSlip(slip._id)} title="View Calculation">
                          <Eye size={16} />
                        </button>
                        <button className="btn-icon pdf" onClick={() => handleDownloadPDF(slip)} title="Download Printable PDF">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected Payslip Detail Section */}
        {selectedSlip && (
          <div className="payslip-detail-card">
            <div className="detail-header">
              <h2>Payslip Details: {selectedSlip.employee?.firstName} {selectedSlip.employee?.lastName}</h2>
            </div>

            <div className="salary-summary-pills">
              <div className="pill">
                <span>Gross Salary</span>
                <strong>₹{selectedSlip.gross?.toLocaleString()}</strong>
              </div>
              <div className="pill">
                <span>Total Deductions</span>
                <strong>₹{selectedSlip.totalDeductions?.toLocaleString()}</strong>
              </div>
              <div className="pill highlight">
                <span>Net Salary</span>
                <strong>₹{selectedSlip.net?.toLocaleString()}</strong>
              </div>
            </div>

            {explanation && (
              <div className="ai-explanation-box">
                <div className="explanation-title">
                  <Sparkles size={18} color="#818cf8" />
                  <h3>AI Salary Breakdown Explanation</h3>
                </div>
                <pre className="explanation-text">{explanation.explanation}</pre>
              </div>
            )}

            <div className="breakdown-grid">
              <div className="breakdown-col">
                <h4>Earnings</h4>
                <ul>
                  {selectedSlip.earnings?.map((item, idx) => (
                    <li key={idx}>
                      <span>{item.name} ({item.code})</span>
                      <strong className="text-green">+₹{item.amount?.toLocaleString()}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="breakdown-col">
                <h4>Deductions</h4>
                <ul>
                  {selectedSlip.deductions?.length === 0 ? <li><span>No deductions</span></li> : selectedSlip.deductions?.map((item, idx) => (
                    <li key={idx}>
                      <span>{item.name} ({item.code})</span>
                      <strong className="text-red">-₹{item.amount?.toLocaleString()}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayslipList;
