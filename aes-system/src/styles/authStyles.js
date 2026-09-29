// src/styles/authStyles.js
// Shared styles for all auth pages (Login, Register, etc.)

export const pageStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#f0f0f0",
};

export const boxStyle = {
  backgroundColor: "#d9d9d9",
  padding: "40px",
  borderRadius: "8px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  textAlign: "center",       // centers headings and paragraph text
};

export const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",  // labels and inputs aligned to the left
  marginBottom: "16px",
  width: "100%",             // ensures fields stretch full box width
};

export const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  fontSize: "14px",
  borderRadius: "4px",
  border: "1px solid #bbb",
  boxSizing: "border-box",
};

export const showButtonStyle = {
  marginTop: "6px",
  cursor: "pointer",
};

export const forgotLinkStyle = {
  display: "block",
  marginTop: "6px",
  fontSize: "13px",
};