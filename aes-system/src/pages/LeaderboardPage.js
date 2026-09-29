import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import styles from "../styles/leaderboardStyles";
import {
  dashboardPageStyle,
  dashboardContentStyle,
  headerStyle,
  headerLogoStyle,
  headerActionsStyle,
  headerButtonStyle,
} from "../styles/dashboardStyles";
import { ACCESS_TOKEN_NAME } from "../features/auth";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const LeaderboardPage = () => {
  const { class_id } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [className, setClassName] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN_NAME);
      try {
        const res = await fetch(`${API_BASE_URL}/classes/${class_id}/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load leaderboard");
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        // Fetch class name
        const classRes = await fetch(`${API_BASE_URL}/classes/${class_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (classRes.ok) {
          const classData = await classRes.json();
          setClassName(classData.class?.name || "Class");
        } else {
          setClassName("Class");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [class_id]);

  const handleBack = () => navigate(`/classes/${class_id}`);

  // Prepare data for histogram (score distribution) – 1–5 scale
  const scoreDistribution = () => {
    const buckets = {
      "1.0–1.99": 0,
      "2.0–2.99": 0,
      "3.0–3.99": 0,
      "4.0–5.0": 0,
    };
    leaderboard.forEach((student) => {
      const avg = student.average_score;
      if (avg === null || avg === undefined) return;
      if (avg < 2) buckets["1.0–1.99"]++;
      else if (avg < 3) buckets["2.0–2.99"]++;
      else if (avg < 4) buckets["3.0–3.99"]++;
      else buckets["4.0–5.0"]++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  };

  if (loading) return <div style={styles.loadingContainer}>Loading leaderboard...</div>;
  if (error) return <div style={styles.errorBox}>Error: {error}</div>;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
          🏆 Leaderboard – {className}
        </div>
        <div style={headerActionsStyle}>
          <button style={headerButtonStyle} onClick={handleBack}>
            ← Back to Class
          </button>
        </div>
      </div>

      <div style={styles.container}>
        {leaderboard.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📊</div>
            <div style={styles.emptyTitle}>No scores released yet</div>
            <div style={styles.emptyText}>
              Once the teacher releases scores, the leaderboard will appear here.
            </div>
          </div>
        ) : (
          <>
            {/* Distribution histogram */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>📊 Score Distribution (1–5 scale)</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistribution()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis allowDecimals={false} label={{ value: "Number of students", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4299e1">
                    {scoreDistribution().map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.count > 0 ? "#4299e1" : "#e2e8f0"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Rank table */}
            <div style={styles.tableCard}>
              <div style={styles.tableTitle}>🏅 Student Rankings</div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Rank</th>
                    <th style={styles.th}>Student Code</th>
                    <th style={styles.th}>Avg Score</th>
                    <th style={styles.th}>Total Score</th>
                    <th style={styles.th}>Questions Scored</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((student) => (
                    <tr key={student.student_code} style={styles.tr}>
                      <td style={styles.td}>
                        {student.rank === 1 ? "🥇" : student.rank === 2 ? "🥈" : student.rank === 3 ? "🥉" : student.rank}
                      </td>
                      <td style={styles.td}>{student.student_code}</td>
                      <td style={styles.td}>
                        {student.average_score !== null && student.average_score !== undefined
                          ? `${Number(student.average_score).toFixed(2)} / 5.00`
                          : "—"}
                      </td>
                      <td style={styles.td}>
                        {student.total_score !== null && student.total_score !== undefined
                          ? Number(student.total_score).toFixed(2)
                          : "—"}
                      </td>
                      <td style={styles.td}>{student.answers_scored}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;