// src/features/results/components/ClassScoreDistributionChart.js
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
} from "recharts";

// ─── Colour helper ─────────────────────────────────────────────────────────────
function barColor(avg) {
  if (avg === null || avg === undefined) return "#cbd5e0";
  if (avg >= 4) return "#38a169";
  if (avg >= 3) return "#3182ce";
  if (avg >= 2) return "#d69e2e";
  return "#e53e3e";
}

// ─── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipStyle}>
      <p style={{ margin: 0, fontWeight: 600, color: "#2d3748", maxWidth: 220, fontSize: 12 }}>
        {d.label}
      </p>
      <div style={{ marginTop: 6, fontSize: 12 }}>
        <Row label="Avg Score"    value={d.avg !== null ? d.avg.toFixed(2) : "—"}       color={barColor(d.avg)} />
        <Row label="Min"          value={d.min !== null ? d.min.toFixed(2) : "—"} />
        <Row label="Max"          value={d.max !== null ? d.max.toFixed(2) : "—"} />
        <Row label="Scored"       value={`${d.scored} / ${d.total}`} />
      </div>
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <p style={{ margin: "2px 0", color: color ?? "#718096" }}>
      {label}: <strong>{value}</strong>
    </p>
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

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ClassScoreDistributionChart({ classResults = [] }) {
  const data = classResults
    .filter((q) => Number(q.scored_count) > 0)
    .map((q, i) => ({
      name:   `Q${q.question_number ?? i + 1}`,
      label:  q.question_short ?? q.question ?? `Question ${i + 1}`,
      avg:    q.avg_score !== null ? Number(q.avg_score) : null,
      min:    q.min_score !== null ? Number(q.min_score) : null,
      max:    q.max_score !== null ? Number(q.max_score) : null,
      total:  Number(q.total_answers),
      scored: Number(q.scored_count),
    }));

  if (data.length === 0) {
    const hasQuestions = classResults.length > 0;
    return (
      <div style={emptyStyle}>
        <span style={{ fontSize: "28px" }}>📈</span>
        <p style={{ margin: "8px 0 0", color: "#718096", fontSize: "14px" }}>
          {hasQuestions
            ? "No questions have been evaluated yet."
            : "No questions found for this class."}
        </p>
      </div>
    );
  }

  const chartMinWidth = Math.max(320, data.length * 80);

  return (
    <div>
      {/* Summary badges */}
      <div style={summaryRow}>
        {data.map((d) => (
          <div key={d.name} style={{ ...summaryBadge, borderColor: barColor(d.avg) }}>
            <span style={{ fontSize: 11, color: "#718096" }}>{d.name}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: barColor(d.avg) }}>
              {d.avg !== null ? d.avg.toFixed(1) : "—"}
            </span>
            <span style={{ fontSize: 10, color: "#a0aec0" }}>avg</span>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
        <div style={{ minWidth: chartMinWidth }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 24, right: 20, left: 0, bottom: 12 }}
              barCategoryGap="35%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#4a5568", fontWeight: 600 }}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 11, fill: "#718096" }}
                tickFormatter={(v) => v.toFixed(1)}
                width={36}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ebf8ff" }} />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={72}>
                <LabelList
                  dataKey="avg"
                  position="top"
                  style={{ fontSize: 12, fontWeight: 700, fill: "#4a5568" }}
                  formatter={(v) => (v !== null ? v.toFixed(1) : "—")}
                />
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={barColor(entry.avg)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Question index legend */}
      <div style={legendList}>
        {data.map((d) => (
          <div key={d.name} style={legendItem}>
            <span style={{ fontWeight: 700, color: "#4a5568", minWidth: 28 }}>{d.name}:</span>
            <span style={{ color: "#718096", fontSize: 12 }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const emptyStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 0",
  color: "#a0aec0",
};

const summaryRow = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const summaryBadge = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "8px 14px",
  background: "#f7fafc",
  border: "2px solid",
  borderRadius: "10px",
  minWidth: "60px",
};

const legendList = {
  marginTop: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  borderTop: "1px solid #edf2f7",
  paddingTop: "12px",
};

const legendItem = {
  display: "flex",
  gap: "8px",
  fontSize: "12px",
  color: "#718096",
  lineHeight: "1.5",
};