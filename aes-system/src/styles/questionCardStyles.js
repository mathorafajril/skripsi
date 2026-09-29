// src/styles/questionCardStyles.js
// Styles for QuestionCard component

export const cardBaseStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "20px 24px",
  marginBottom: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  cursor: "pointer",
  transition: "box-shadow 0.2s, border-color 0.2s",
};

export const cardHoveredStyle = {
  ...cardBaseStyle,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  borderColor: "#a0aec0",
};

export const cardRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "16px",
  flex: 1,
  minWidth: 0,
};

export const indexBadgeStyle = {
  minWidth: "32px",
  height: "32px",
  borderRadius: "50%",
  background: "#ebf4ff",
  color: "#3182ce",
  fontWeight: "700",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

export const cardTextWrapperStyle = {
  flex: 1,
  minWidth: 0,
};

export const cardQuestionTextStyle = {
  margin: "0 0 6px 0",
  fontSize: "15px",
  fontWeight: "500",
  color: "#2d3748",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const cardDateStyle = {
  margin: 0,
  fontSize: "12px",
  color: "#a0aec0",
};

export const cardActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexShrink: 0,
};

// Admin badges
export const publishedBadgeStyle = {
  fontSize: "11px",
  fontWeight: "600",
  padding: "3px 10px",
  borderRadius: "20px",
  background: "#c6f6d5",
  color: "#276749",
  whiteSpace: "nowrap",
};

export const draftBadgeStyle = {
  fontSize: "11px",
  fontWeight: "600",
  padding: "3px 10px",
  borderRadius: "20px",
  background: "#fed7d7",
  color: "#c53030",
  whiteSpace: "nowrap",
};

// Student badges
export const answeredBadgeStyle = {
  fontSize: "11px",
  fontWeight: "600",
  padding: "3px 10px",
  borderRadius: "20px",
  background: "#c6f6d5",
  color: "#276749",
  whiteSpace: "nowrap",
};

export const notAnsweredBadgeStyle = {
  fontSize: "11px",
  fontWeight: "600",
  padding: "3px 10px",
  borderRadius: "20px",
  background: "#fefcbf",
  color: "#744210",
  whiteSpace: "nowrap",
};

export const chevronStyle = {
  fontSize: "20px",
  color: "#a0aec0",
  lineHeight: 1,
};