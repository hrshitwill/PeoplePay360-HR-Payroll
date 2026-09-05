import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, CheckCircle, AlertCircle } from 'lucide-react';
import { getAttendances, checkIn, checkOut } from '../api/operations';
import './Attendance.css';

const Attendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await getAttendances();
      const list = res.data.data || [];
      setAttendances(list);

      // Check if there is an active check-in (no check-out) for today
      const openSession = list.find(a => !a.checkOut);
      if (openSession) {
        setCheckedInToday(true);
        setActiveSession(openSession);
      } else {
        setCheckedInToday(false);
        setActiveSession(null);
      }
    } catch (err) {
      console.error("Failed to load attendance", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkIn();
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut();
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    }
  };

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <div>
          <h1>Attendance & Time Tracking</h1>
          <p>Real-time server-timestamped check-in / check-out logging for accurate payroll worked hours calculation.</p>
        </div>
      </div>

      <div className="attendance-action-card">
        <div className="status-display">
          <Clock className="icon-clock" size={32} />
          <div>
            <h3>Current Attendance Status</h3>
            <p>{checkedInToday ? `Checked In since ${new Date(activeSession?.checkIn).toLocaleTimeString()}` : 'Not Checked In'}</p>
          </div>
        </div>

        <div className="action-buttons">
          {!checkedInToday ? (
            <button className="btn-checkin" onClick={handleCheckIn}>
              <Play size={18} /> Clock In Now
            </button>
          ) : (
            <button className="btn-checkout" onClick={handleCheckOut}>
              <Square size={18} /> Clock Out Now
            </button>
          )}
        </div>
      </div>

      <div className="attendance-list-card">
        <h2>Attendance Logs</h2>
        {loading ? (
          <div className="loading-state">Loading logs...</div>
        ) : attendances.length === 0 ? (
          <div className="empty-state">No attendance records found.</div>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Worked Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map(a => (
                <tr key={a._id}>
                  <td><strong>{a.employee?.firstName} {a.employee?.lastName}</strong></td>
                  <td>{new Date(a.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(a.checkIn).toLocaleTimeString()}</td>
                  <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : <span className="in-progress">In Progress</span>}</td>
                  <td>{a.workedHours ? `${a.workedHours.toFixed(2)} hrs` : '--'}</td>
                  <td>
                    <span className={`badge-status ${a.checkOut ? 'completed' : 'active'}`}>
                      {a.checkOut ? 'Completed' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Attendance;
