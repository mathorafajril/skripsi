// src/features/dashboard/components/DashboardHeader.js

import { useNavigate } from "react-router-dom";
import {
  headerStyle,
  headerLogoStyle,
  headerActionsStyle,
  headerButtonStyle,
  headerLogoutButtonStyle,
} from "../../../styles/dashboardStyles";

export function DashboardHeader({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <header style={headerStyle}>
      {/* App name / logo */}
      <span style={headerLogoStyle}>AES System</span>

      {/* Right side actions */}
      <div style={headerActionsStyle}>
        <span style={{ fontSize: "13px", color: "#555" }}>
          Hello, <strong>{user.name || "User"}</strong>
          &nbsp;({user.role})
        </span>

        <button
          style={headerButtonStyle}
          onClick={() => navigate("/profile")}
        >
          My Profile
        </button>

        <button
          style={headerLogoutButtonStyle}
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}