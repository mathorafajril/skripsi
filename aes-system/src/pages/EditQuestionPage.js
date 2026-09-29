import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { DashboardHeader } from "../features/dashboard/components/DashboardHeader";
import { ACCESS_TOKEN_NAME } from "../features/auth";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper to safely get user with name
const getSafeUser = () => {
  const stored = localStorage.getItem("user");
  if (!stored) return { name: "User", role: "student" };
  try {
    const parsed = JSON.parse(stored);
    return {
      name: parsed.name || "User",
      role: parsed.role || "student",
    };
  } catch {
    return { name: "User", role: "student" };
  }
};

// Styles (same as before)
const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f7fafc",
};
const containerStyle = {
  maxWidth: "800px",
  margin: "0 auto",
  padding: "32px 24px",
};
const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
  padding: "32px",
};
const titleStyle = {
  fontSize: "28px",
  fontWeight: "600",
  color: "#2d3748",
  marginBottom: "8px",
};
const formGroupStyle = {
  marginBottom: "24px",
};
const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: "500",
  color: "#4a5568",
  marginBottom: "8px",
};
const inputStyle = {
  width: "100%",
  padding: "12px",
  fontSize: "16px",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  outline: "none",
  transition: "border-color 0.2s",
  fontFamily: "inherit",
};
const textareaStyle = {
  ...inputStyle,
  minHeight: "150px",
  resize: "vertical",
};
const buttonGroupStyle = {
  display: "flex",
  gap: "16px",
  marginTop: "32px",
};
const submitButtonStyle = {
  backgroundColor: "#3182ce",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "10px 24px",
  fontSize: "16px",
  fontWeight: "500",
  cursor: "pointer",
};
const cancelButtonStyle = {
  backgroundColor: "#e2e8f0",
  color: "#4a5568",
  border: "none",
  borderRadius: "8px",
  padding: "10px 24px",
  fontSize: "16px",
  fontWeight: "500",
  cursor: "pointer",
};
const errorStyle = {
  backgroundColor: "#fed7d7",
  color: "#c53030",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "20px",
};
const successStyle = {
  backgroundColor: "#c6f6d5",
  color: "#276749",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "20px",
};

export default function EditQuestionPage() {
  const { question_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [questionText, setQuestionText] = useState("");
  const [keyAnswer, setKeyAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [classId, setClassId] = useState(null);

  const user = getSafeUser();
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Pre-fill from router state if available
  useEffect(() => {
    if (location.state?.question) {
      const q = location.state.question;
      setQuestionText(q.question || "");
      setKeyAnswer(q.key_answer || "");
      setClassId(location.state.classId);
      setLoading(false);
    } else {
      const fetchQuestion = async () => {
        try {
          const token = localStorage.getItem(ACCESS_TOKEN_NAME);
          const res = await fetch(`${API_BASE_URL}/classes/questions/${question_id}/results`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("Failed to load question");
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const q = data.results[0];
            setQuestionText(q.question || "");
            setKeyAnswer(q.key_answer || "");
            setClassId(q.class_id);
          } else {
            throw new Error("Question not found");
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchQuestion();
    }
  }, [question_id, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim() || !keyAnswer.trim()) {
      setError("Both question and key answer are required");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_NAME);
      const res = await fetch(`${API_BASE_URL}/classes/questions/${question_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: questionText, key_answer: keyAnswer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setSuccess("Question updated successfully!");
      setTimeout(() => {
        navigate(`/classes/${classId}`);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <DashboardHeader user={user} onLogout={handleLogout} />
        <div style={containerStyle}>
          <div style={cardStyle}>Loading question...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <DashboardHeader user={user} onLogout={handleLogout} />
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Edit Question</h1>
          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}
          <form onSubmit={handleSubmit}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Question Text</label>
              <textarea
                style={textareaStyle}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Key Answer (used for scoring)</label>
              <textarea
                style={textareaStyle}
                value={keyAnswer}
                onChange={(e) => setKeyAnswer(e.target.value)}
                rows={6}
                required
              />
            </div>
            <div style={buttonGroupStyle}>
              <button type="submit" style={submitButtonStyle} disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" style={cancelButtonStyle} onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}