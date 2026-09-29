// src/features/dashboard/components/StudentDashboard.js
import { useNavigate } from "react-router-dom";

import {
  sectionStyle,
  sectionHeaderStyle,
  classGridStyle,
  classCardStyle,
  classCardTitleStyle,
  classCardDescStyle,
  primaryButtonStyle,
  overlayStyle,
  modalStyle,
} from "../../../styles/dashboardStyles";
import { inputStyle } from "../../../styles/authStyles";

export function StudentDashboard({
  classes,
  loading,
  showJoinModal,
  setShowJoinModal,
  classCode,
  setClassCode,
  joining,
  handleJoinClass,
}) {

  const navigate = useNavigate();
  return (
    <div>
      {/* My Classes */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <h2>My Classes</h2>
          <button style={primaryButtonStyle} onClick={() => setShowJoinModal(true)}>
            + Join Class
          </button>
        </div>

        {loading ? (
          <p>Loading classes...</p>
        ) : classes.length === 0 ? (
          <p style={{ color: "#777", fontSize: "14px" }}>
            You have not joined any classes yet. Click "Join Class" to get started.
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
                <p style={{ fontSize: "11px", color: "#aaa", marginTop: "8px" }}>
                  Joined {cls.joined_at ? new Date(cls.joined_at).toLocaleDateString() : "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ marginBottom: "16px" }}>Join a Class</h3>

            <form onSubmit={handleJoinClass} noValidate>
              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="classCode" style={{ display: "block", marginBottom: "6px", fontSize: "13px" }}>
                  Class Code
                </label>
                <input
                  id="classCode"
                  type="text"
                  placeholder="Enter class code"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  style={{
                    ...inputStyle,
                    textTransform: "uppercase",
                    letterSpacing: "4px",
                    fontSize:      "20px",
                    fontWeight:    "700",
                    textAlign:     "center",
                    fontFamily:    "monospace",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => { setShowJoinModal(false); setClassCode(""); }}
                  style={{ padding: "8px 14px", cursor: "pointer", borderRadius: "4px", border: "1px solid #bbb" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joining}
                  style={{ padding: "8px 14px", cursor: "pointer", borderRadius: "4px", border: "none", backgroundColor: "#2c3e50", color: "white" }}
                >
                  {joining ? "Joining..." : "Join"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}