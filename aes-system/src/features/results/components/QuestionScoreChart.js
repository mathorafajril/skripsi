// src/features/results/components/QuestionScoreChart.js
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
  ReferenceLine,
} from "recharts";

// ─── Colour helpers ────────────────────────────────────────────────────────────
function barColor(score) {
  if (score === null || score === undefined) return "#cbd5e0";
  if (score >= 4) return "#38a169"; // green
  if (score >= 3) return "#3182ce"; // blue
  if (score >= 2) return "#d69e2e"; // yellow
  return "#e53e3e";                  // red
}

// ─── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { student, score } = payload[0].payload;
  return (
    <div style={tooltipStyle}>
      <p style={{ margin: 0, fontWeight: 600, color: "#2d3748" }}>{student}</p>
      <p style={{ margin: "4px 0 0", color: barColor(score) }}>
        Score: <strong>{score !== null ? score.toFixed(2) : "—"}</strong>
      </p>
    </div>
  );
}

const tooltipStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "10px 14px",
  boxShadow: "0 4px 12px rgba(0,0,0,.10)",
  fontSize: "13px",
};

// ─── Legend row ────────────────────────────────────────────────────────────────
function LegendRow() {
  const items = [
    { color: "#38a169", label: "Excellent (4.0–5.0)" },
    { color: "#3182ce", label: "Good (3.0–3.99)" },
    { color: "#d69e2e", label: "Partial (2.0–2.99)" },
    { color: "#e53e3e", label: "Weak (1.0–1.99)" },
  ];
  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "12px", justifyContent: "center" }}>
      {items.map(({ color, label }) => (
        <span key={label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#718096" }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: color, display: "inline-block" }} />
          {label}
        </span>
      ))}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function QuestionScoreChart({ answers = [], avgScore = null }) {
  const scored = answers.filter(
    (a) => a.score_ai !== null && a.score_ai !== undefined
  );

  if (scored.length === 0) {
    return (
      <div style={emptyStyle}>
        <span style={{ fontSize: "28px" }}>📊</span>
        <p style={{ margin: "8px 0 0", color: "#718096", fontSize: "14px" }}>
          No scored answers yet — run AI Evaluation first.
        </p>
      </div>
    );
  }

  // Keep score with 2 decimals for display
  const data = scored.map((a) => ({
    student: a.student_code ?? "?",
    score:   Number(a.score_ai), // already numeric, keep as is
  }));

  const chartMinWidth = Math.max(300, data.length * 52);

  return (
    <div>
      <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
        <div style={{ minWidth: chartMinWidth }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 24, right: 20, left: 0, bottom: 48 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" vertical={false} />
              <XAxis
                dataKey="student"
                tick={{ fontSize: 11, fill: "#718096" }}
                angle={-35}
                textAnchor="end"
                interval={0}
                height={56}
              />
              <YAxis 
                domain={[1, 5]} 
                ticks={[1, 2, 3, 4, 5]} 
                tickFormatter={(tick) => tick.toFixed(1)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ebf8ff" }} />
              {avgScore !== null && (
                <ReferenceLine
                  y={avgScore}
                  stroke="#805ad5"
                  strokeDasharray="5 4"
                  label={{
                    value: `Avg: ${avgScore.toFixed(2)}`,
                    position: "insideTopRight",
                    fill: "#805ad5",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              )}
              <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={56}>
                <LabelList
                  dataKey="score"
                  position="top"
                  style={{ fontSize: 11, fontWeight: 600, fill: "#4a5568" }}
                  formatter={(v) => v.toFixed(1)}
                />
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={barColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <LegendRow />
    </div>
  );
}

const emptyStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 0",
  color: "#a0aec0",
};