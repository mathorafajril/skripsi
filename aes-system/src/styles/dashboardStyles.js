// src/styles/dashboardStyles.js
// Shared styles for dashboard pages

// ── Layout ────────────────────────────────────────────────────────────────────

export const dashboardPageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f0f0f0",
  display: "flex",
  flexDirection: "column",
};

export const dashboardContentStyle = {
  padding: "32px",
  flex: 1,
};

// ── Header ────────────────────────────────────────────────────────────────────

export const headerStyle = {
  backgroundColor: "#d9d9d9",
  padding: "0 32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "60px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

export const headerLogoStyle = {
  fontWeight: "700",
  fontSize: "20px",
  letterSpacing: "-0.5px",
};

export const headerActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

export const headerButtonStyle = {
  padding: "6px 14px",
  borderRadius: "4px",
  border: "1px solid #bbb",
  backgroundColor: "white",
  cursor: "pointer",
  fontSize: "13px",
};

export const headerLogoutButtonStyle = {
  padding: "6px 14px",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#c0392b",
  color: "white",
  cursor: "pointer",
  fontSize: "13px",
};

// ── Section ───────────────────────────────────────────────────────────────────

export const sectionStyle = {
  backgroundColor: "#d9d9d9",
  borderRadius: "8px",
  padding: "24px",
  marginBottom: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

export const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
};

// ── Cards ─────────────────────────────────────────────────────────────────────

export const classGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "16px",
};

export const classCardStyle = {
  backgroundColor: "white",
  borderRadius: "6px",
  padding: "16px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

export const classCardTitleStyle = {
  fontWeight: "600",
  marginBottom: "6px",
  fontSize: "15px",
};

export const classCardDescStyle = {
  fontSize: "13px",
  color: "#555",
};

// ── Buttons ───────────────────────────────────────────────────────────────────

export const primaryButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "#2c3e50",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "13px",
};

export const secondaryButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "white",
  color: "#2c3e50",
  border: "1px solid #2c3e50",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "13px",
};

// ── Join class modal ──────────────────────────────────────────────────────────

export const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 100,
};

export const modalStyle = {
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "32px",
  width: "100%",
  maxWidth: "360px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
};