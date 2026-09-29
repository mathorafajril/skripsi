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
import styles from "../styles/studentClassResultsStyles";
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

const StudentClassResultsPage = () => {
  const { class_id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classInfo, setClassInfo] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN_NAME);
      try {
        const res = await fetch(`${API_BASE_URL}/classes/${class_id}/student-results`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load results");
        const data = await res.json();
        setResults(data.results || []);
        // optional: extract class name from first result if needed
        if (data.results && data.results.length > 0 && data.results[0].class_name) {
          setClassInfo({ name: data.results[0].class_name });
        } else {
          setClassInfo({ name: "Class Results" });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [class_id]);

  // Prepare data for chart: only questions with released scores
  const chartData = results
    .filter((q) => q.score_released && q.score_ai !== null)
    .map((q, idx) => ({
      name: `Q${idx + 1}`,
      fullQuestion: q.question.length > 60 ? q.question.substring(0, 60) + "…" : q.question,
      score: q.score_ai,
      feedback: q.feedback || "No feedback",
    }));

  const getBarColor = (score) => {
    if (score >= 4) return "#38a169"; // green
    if (score >= 3) return "#ecc94b"; // yellow
    return "#e53e3e"; // red
  };

  const handleBack = () => navigate(`/classes/${class_id}`);

  if (loading) return <div style={styles.loadingContainer}>Loading your results...</div>;
  if (error) return <div style={styles.errorBox}>Error: {error}</div>;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={headerButtonStyle}>
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
          📊 {classInfo?.name || "My Results"}
        </div>
        <div style={headerActionsStyle}>
          <button style={headerButtonStyle} onClick={handleBack}>
            ← Back to Class
          </button>
        </div>
      </div>

      <div style={styles.container}>
        {chartData.length === 0 ? (
          <div style={styles.noResultsBox}>
            <div style={styles.noResultsIcon}>📭</div>
            <div style={styles.noResultsTitle}>No scores released yet</div>
            <div style={styles.noResultsText}>
              Your teacher hasn't released scores for this class.
            </div>
          </div>
        ) : (
          <>
            {/* Score Graph */}
            <div style={styles.graphCard}>
              <div style={styles.graphTitle}>📈 Your Scores Per Question</div>
              <div style={styles.graphSubtitle}>
                Each bar represents your AI score for a question (1-5)
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[1, 5]} label={{ value: "Score", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    formatter={(value, name, props) => [`${value} / 5`, "Score"]}
                    labelFormatter={(label, payload) => payload[0]?.payload.fullQuestion || label}
                  />
                  <Bar dataKey="score" name="Your Score">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed table of questions & answers */}
            <div style={styles.tableCard}>
              <div style={styles.tableTitle}>📝 Detailed Answers</div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Question</th>
                    <th style={styles.th}>Your Answer</th>
                    <th style={styles.th}>Score</th>
                    <th style={styles.th}>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((q, idx) => (
                    <tr key={q.question_id} style={styles.tr}>
                      <td style={styles.td}>{idx + 1}</td>
                      <td style={styles.td}>
                        {q.question.length > 100 ? q.question.substring(0, 100) + "…" : q.question}
                      </td>
                      <td style={styles.td}>
                        {q.answer ? (
                          q.answer.length > 120 ? q.answer.substring(0, 120) + "…" : q.answer
                        ) : (
                          <span style={styles.notAnswered}>Not answered</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {q.score_released && q.score_ai !== null ? (
                          <span style={styles.scoreBadge(q.score_ai)}>{q.score_ai}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={styles.td}>
                        {q.score_released && q.feedback ? q.feedback : "—"}
                      </td>
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

export default StudentClassResultsPage;