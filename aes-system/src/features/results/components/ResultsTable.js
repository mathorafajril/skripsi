// src/features/results/components/ResultsTable.js

export function ResultsTable({ results, role }) {
  if (!Array.isArray(results) || results.length === 0) {
    return (
      <p style={{ color: "#777", fontSize: "14px" }}>
        No results available yet. Run evaluation first.
      </p>
    );
  }

  const scoreColor = (score) => {
    if (score === null || score === undefined) return "#999";
    if (score >= 4) return "#27ae60";
    if (score >= 2) return "#f39c12";
    return "#c0392b";
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ backgroundColor: "#bbb", textAlign: "left" }}>
            {role === "admin" && <th style={thStyle}>Student Code</th>}
            <th style={thStyle}>Answer</th>
            <th style={thStyle}>AI Score</th>
            <th style={thStyle}>Feedback</th>
            <th style={thStyle}>Submitted</th>
            {role === "admin" && <th style={thStyle}>Released</th>}
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={r.answer_id} style={{ backgroundColor: i % 2 === 0 ? "white" : "#f5f5f5" }}>
              {role === "admin" && <td style={tdStyle}>{r.student_code}</td>}
              <td style={{ ...tdStyle, maxWidth: "220px", wordBreak: "break-word" }}>{r.answer}</td>
              <td style={{ ...tdStyle, fontWeight: "700", color: scoreColor(r.score_ai) }}>
                {r.score_ai !== null && r.score_ai !== undefined ? `${r.score_ai} / 5` : "—"}
              </td>
              <td style={{ ...tdStyle, maxWidth: "220px", wordBreak: "break-word" }}>
                {r.feedback || "—"}
              </td>
              <td style={tdStyle}>
                {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—"}
              </td>
              {role === "admin" && (
                <td style={tdStyle}>{r.score_released ? "✅" : "❌"}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: "10px 14px", fontWeight: "600",
  fontSize: "13px", borderBottom: "2px solid #aaa",
};

const tdStyle = {
  padding: "10px 14px", borderBottom: "1px solid #ddd", verticalAlign: "top",
};
