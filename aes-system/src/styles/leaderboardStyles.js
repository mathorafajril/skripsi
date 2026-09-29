const leaderboardStyles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f7fafc",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "32px",
  },
  chartTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "20px",
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflowX: "auto",
  },
  tableTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px 8px",
    borderBottom: "2px solid #e2e8f0",
    fontWeight: "600",
  },
  td: {
    padding: "12px 8px",
    borderBottom: "1px solid #e2e8f0",
  },
  tr: {
    "&:hover": { backgroundColor: "#f7fafc" },
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "8px",
  },
  emptyText: {
    color: "#718096",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "18px",
  },
  errorBox: {
    backgroundColor: "#fed7d7",
    color: "#c53030",
    padding: "20px",
    borderRadius: "8px",
    margin: "20px",
    textAlign: "center",
  },
};

export default leaderboardStyles;