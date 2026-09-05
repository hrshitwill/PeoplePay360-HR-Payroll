import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Clock, Plus, Edit2, Calendar } from "lucide-react";

export const WorkingScheduleModule = ({ currentRole }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "Standard 40h Office Hours",
    type: "STANDARD",
    description: "Monday to Friday 9am to 6pm with 1h lunch",
    lines: [
      { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "18:00", breakHours: 1, dailyHours: 8 },
      { dayOfWeek: "TUESDAY", startTime: "09:00", endTime: "18:00", breakHours: 1, dailyHours: 8 },
      { dayOfWeek: "WEDNESDAY", startTime: "09:00", endTime: "18:00", breakHours: 1, dailyHours: 8 },
      { dayOfWeek: "THURSDAY", startTime: "09:00", endTime: "18:00", breakHours: 1, dailyHours: 8 },
      { dayOfWeek: "FRIDAY", startTime: "09:00", endTime: "18:00", breakHours: 1, dailyHours: 8 }
    ]
  });

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const res = await api.getSchedules();
      if (res.success) setSchedules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const calculateTotalWeeklyHours = (lines) => {
    let sum = 0;
    lines.forEach((l) => {
      if (l.startTime && l.endTime) {
        const [sh, sm] = l.startTime.split(":").map(Number);
        const [eh, em] = l.endTime.split(":").map(Number);
        const diff = (eh * 60 + em - (sh * 60 + sm)) / 60 - (l.breakHours || 0);
        sum += Math.max(0, diff);
      }
    });
    return Number(sum.toFixed(2));
  };

  const handleLineChange = (index, field, value) => {
    const updatedLines = [...formData.lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };

    // Auto recalculate dailyHours for this line
    const l = updatedLines[index];
    if (l.startTime && l.endTime) {
      const [sh, sm] = l.startTime.split(":").map(Number);
      const [eh, em] = l.endTime.split(":").map(Number);
      const diff = (eh * 60 + em - (sh * 60 + sm)) / 60 - (Number(l.breakHours) || 0);
      l.dailyHours = Math.max(0, Number(diff.toFixed(2)));
    }

    setFormData({ ...formData, lines: updatedLines });
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await api.updateSchedule(formData._id, formData);
      } else {
        await api.createSchedule(formData);
      }
      setIsModalOpen(false);
      loadSchedules();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalCalculated = calculateTotalWeeklyHours(formData.lines);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>Working Schedule Setup</h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>
            Weekly shift patterns with automated weekly hours calculation
          </p>
        </div>

        {currentRole !== "EMPLOYEE" && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({
                name: "New Custom Schedule",
                type: "STANDARD",
                description: "Weekly schedule pattern",
                lines: [
                  { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00", breakHours: 1, dailyHours: 7 },
                  { dayOfWeek: "TUESDAY", startTime: "09:00", endTime: "17:00", breakHours: 1, dailyHours: 7 },
                  { dayOfWeek: "WEDNESDAY", startTime: "09:00", endTime: "17:00", breakHours: 1, dailyHours: 7 },
                  { dayOfWeek: "THURSDAY", startTime: "09:00", endTime: "17:00", breakHours: 1, dailyHours: 7 },
                  { dayOfWeek: "FRIDAY", startTime: "09:00", endTime: "17:00", breakHours: 1, dailyHours: 7 }
                ]
              });
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> New Working Schedule
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
        {schedules.map((sch) => (
          <div key={sch._id} className="card">
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{sch.name}</h3>
                <span className="badge badge-computed" style={{ fontSize: 11 }}>{sch.type}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#4f46e5" }}>
                  {sch.totalWeeklyHours || 40} hrs
                </span>
                <div style={{ fontSize: 11, color: "#64748b" }}>per week</div>
              </div>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
                {sch.description || "Active working schedule"}
              </p>

              <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", marginBottom: 8 }}>
                Shift Schedule Pattern:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                {sch.lines?.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      background: "#f8fafc",
                      borderRadius: 6,
                      border: "1px solid #f1f5f9"
                    }}
                  >
                    <strong>{line.dayOfWeek}</strong>
                    <span style={{ color: "#64748b" }}>
                      {line.startTime} - {line.endTime} ({line.dailyHours}h, {line.breakHours}h break)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Define Working Schedule</h3>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule}>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Schedule Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="STANDARD">STANDARD</option>
                      <option value="FLEXIBLE">FLEXIBLE</option>
                      <option value="SHIFT">SHIFT</option>
                      <option value="PART_TIME">PART TIME</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                      Weekly Working Days Pattern
                    </span>
                    <span style={{ fontSize: 13, color: "#4f46e5", fontWeight: 700 }}>
                      Auto Calculated: {totalCalculated} hrs / week
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {formData.lines.map((l, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "120px 1fr 1fr 90px 80px",
                          gap: 10,
                          alignItems: "center",
                          background: "#f8fafc",
                          padding: "8px 12px",
                          borderRadius: 6
                        }}
                      >
                        <strong style={{ fontSize: 12.5 }}>{l.dayOfWeek}</strong>
                        <input
                          type="time"
                          className="form-control"
                          value={l.startTime}
                          onChange={(e) => handleLineChange(idx, "startTime", e.target.value)}
                        />
                        <input
                          type="time"
                          className="form-control"
                          value={l.endTime}
                          onChange={(e) => handleLineChange(idx, "endTime", e.target.value)}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            className="form-control"
                            value={l.breakHours}
                            onChange={(e) => handleLineChange(idx, "breakHours", Number(e.target.value))}
                          />
                          <span style={{ fontSize: 11, color: "#64748b" }}>brk</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", textAlign: "right" }}>
                          {l.dailyHours}h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Working Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
