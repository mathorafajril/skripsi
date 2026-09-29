// src/features/dashboard/components/AdminDashboard.js

import { useNavigate } from "react-router-dom";
import {
  sectionStyle,
  sectionHeaderStyle,
  classGridStyle,
  classCardStyle,
  classCardTitleStyle,
  classCardDescStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "../../../styles/dashboardStyles";

export function AdminDashboard({ classes, loading }) {
  const navigate = useNavigate();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div>
      {/* Quick Actions */}
      <div style={sectionStyle}>
        <h2 style={{ marginBottom: "16px" }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            style={primaryButtonStyle}
            onClick={() => navigate("/create-class")}
          >
            + Create Class
          </button>
          <button
            style={secondaryButtonStyle}
            onClick={() => navigate("/create-question")}
          >
            + Create Question
          </button>
        </div>
      </div>

      {/* Manage Classes */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <h2>My Classes</h2>
        </div>

        {loading ? (
          <p>Loading classes...</p>
        ) : classes.length === 0 ? (
          <p style={{ color: "#777", fontSize: "14px" }}>
            No classes yet. Click "Create Class" to get started.
          </p>
        ) : (
          <div style={classGridStyle}>
            {classes.map((cls) => (
              <div 
                key={cls.class_id} 
                style={{...classCardStyle, cursor:'pointer'}}
                onClick={() => navigate(`/classes/${cls.class_id}`)}
              >
                <p style={classCardTitleStyle}>{cls.name}</p>
                <p style={classCardDescStyle}>
                  {cls.description || "No description provided."}
                </p>
                <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
                  {cls.is_active ? "Active" : "Inactive"}
                </p>

                {/* Join code badge */}
                <div style={{
                  marginTop:       "12px",
                  padding:         "8px 10px",
                  backgroundColor: "#f0f4ff",
                  borderRadius:    "6px",
                  border:          "1px dashed #7c9cdb",
                  display:         "flex",
                  alignItems:      "center",
                  justifyContent:  "space-between",
                  gap:             "8px",
                }}>
                  <div>
                    <p style={{ fontSize: "10px", color: "#666", marginBottom: "2px" }}>
                      JOIN CODE — share with students
                    </p>
                    <p style={{
                      fontSize:    "20px",
                      fontWeight:  "700",
                      letterSpacing: "4px",
                      color:       "#2c3e50",
                      fontFamily:  "monospace",
                    }}>
                      {cls.join_code}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(cls.join_code)}
                    title="Copy join code"
                    style={{
                      background:   "none",
                      border:       "1px solid #7c9cdb",
                      borderRadius: "4px",
                      cursor:       "pointer",
                      padding:      "4px 8px",
                      fontSize:     "11px",
                      color:        "#2c3e50",
                    }}
                  >
                    Copy
                  </button>
                </div>

                {/* Member count and status */}
                <div style={{
                  marginTop:  "8px",
                  display:    "flex",
                  justifyContent: "space-between",
                  fontSize:   "12px",
                  color:      "#888",
                }}>
                  <span>{cls.member_count || 0} member(s)</span>
                  <span style={{ color: cls.is_active ? "#27ae60" : "#c0392b" }}>
                    {cls.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}