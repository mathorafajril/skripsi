// src/styles/resultAnalysisStyles.js
// All existing style keys preserved — chart-specific keys added at the bottom.

const styles = {
  // ── Layout ──────────────────────────────────────────────────────────────────
  page: {
    minHeight: "100vh",
    backgroundColor: "#f7fafc",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "24px 20px 48px",
  },

  // ── Top bar ─────────────────────────────────────────────────────────────────
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  backButton: {
    background: "none",
    border: "1px solid #cbd5e0",
    borderRadius: "6px",
    padding: "8px 14px",
    fontSize: "14px",
    color: "#4a5568",
    cursor: "pointer",
  },

  actionButtons: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  // ── Release scores buttons ───────────────────────────────────────────────────
  releaseButton: {
    backgroundColor: "#2b6cb0",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 18px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  releaseButtonDisabled: {
    backgroundColor: "#90cdf4",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 18px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "not-allowed",
  },

  // ── Feedback banners ─────────────────────────────────────────────────────────
  successMessage: {
    backgroundColor: "#c6f6d5",
    color: "#276749",
    border: "1px solid #9ae6b4",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "14px",
    marginBottom: "16px",
  },

  errorMessage: {
    backgroundColor: "#fed7d7",
    color: "#9b2c2c",
    border: "1px solid #fc8181",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "14px",
    marginBottom: "16px",
  },

  // ── Question card ────────────────────────────────────────────────────────────
  questionCard: {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "20px 24px",
    marginBottom: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,.06)",
  },

  questionText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2d3748",
    margin: 0,
    lineHeight: "1.6",
  },

  // ── Status section card ──────────────────────────────────────────────────────
  statusSection: {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,.06)",
  },

  // ── Empty / pending states ───────────────────────────────────────────────────
  emptyState: {
    textAlign: "center",
    padding: "48px 20px",
    color: "#718096",
    fontSize: "15px",
  },

  pendingEvalState: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fffff0",
    border: "1px solid #f6e05e",
    borderRadius: "10px",
    padding: "16px 20px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "#744210",
    gap: "16px",
    flexWrap: "wrap",
  },

  // ── Evaluate buttons ─────────────────────────────────────────────────────────
  evaluateButton: {
    backgroundColor: "#38a169",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "9px 18px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  evaluateButtonDisabled: {
    backgroundColor: "#9ae6b4",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "9px 18px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "not-allowed",
    whiteSpace: "nowrap",
  },

  // ── Stats grid ───────────────────────────────────────────────────────────────
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },

  statCard: {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "16px",
    textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,.06)",
  },

  statValue: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#2d3748",
    margin: 0,
  },

  statLabel: {
    fontSize: "12px",
    color: "#718096",
    marginTop: "4px",
  },

  // ── Loading ──────────────────────────────────────────────────────────────────
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "60vh",
    color: "#718096",
    fontSize: "16px",
  },

  // ── Section card (wraps ResultsTable) ────────────────────────────────────────
  sectionCard: {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "20px 24px",
    marginBottom: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,.06)",
  },

  sectionTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#2d3748",
    margin: "0 0 16px 0",
    paddingBottom: "10px",
    borderBottom: "1px solid #edf2f7",
  },

  // ── ─────────────────────────────────────────────────────────────────────────
  // CHART STYLES (new)
  // ─────────────────────────────────────────────────────────────────────────────

  /** Pill button to show/hide charts */
  chartToggleButton: {
    backgroundColor: "#ebf8ff",
    color: "#2b6cb0",
    border: "1px solid #bee3f8",
    borderRadius: "20px",
    padding: "7px 18px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "16px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },

  /** White card wrapping each chart */
  chartCard: {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "24px 24px 20px",
    marginBottom: "20px",
    boxShadow: "0 1px 6px rgba(0,0,0,.07)",
  },

  /** Chart section heading */
  chartTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#2d3748",
    margin: "0 0 4px 0",
  },

  /** Muted description below chart title */
  chartSubtitle: {
    fontSize: "12px",
    color: "#a0aec0",
    margin: "0 0 20px 0",
  },
};

export default styles;