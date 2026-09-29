
import { useNavigate }          from "react-router-dom";
import { useCreateQuestion }    from "../features/questions/hooks/useCreateQuestion";
import { DashboardHeader }      from "../features/dashboard";
import {
  dashboardPageStyle,
  dashboardContentStyle,
  sectionStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "../styles/dashboardStyles";
import { fieldStyle, inputStyle } from "../styles/authStyles";

const textareaStyle = {
  ...inputStyle,
  height:     "100px",
  resize:     "vertical",
  fontFamily: "inherit",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
};

export default function CreateQuestionPage() {
  const navigate = useNavigate();
  const {
    classes,
    classId, setClassId,
    question, setQuestion,
    keyAnswer, setKeyAnswer,
    isPublished, setIsPublished,
    loading, toast,
    handleSubmit,
  } = useCreateQuestion();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div style={dashboardPageStyle}>
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main style={dashboardContentStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button
            style={{ ...secondaryButtonStyle, fontSize: "12px" }}
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
          <h1>Create New Question</h1>
        </div>

        <div style={{ ...sectionStyle, maxWidth: "600px" }}>
          {toast && (
            <p style={{
              marginBottom:    "16px",
              padding:         "10px 14px",
              borderRadius:    "6px",
              backgroundColor: toast.type === "error" ? "#fdecea" : "#eafaf1",
              color:           toast.type === "error" ? "#c0392b" : "#27ae60",
              fontSize:        "14px",
            }}>
              {toast.msg}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Class selector */}
            <div style={fieldStyle}>
              <label htmlFor="classId" style={{ marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>
                Class <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <select
                id="classId"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                style={selectStyle}
              >
                <option value="">-- Select a class --</option>
                {classes.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              {classes.length === 0 && (
                <p style={{ fontSize: "12px", color: "#e67e22", marginTop: "4px" }}>
                  No classes found. Please create a class first.
                </p>
              )}
            </div>

            {/* Question */}
            <div style={fieldStyle}>
              <label htmlFor="question" style={{ marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>
                Question <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <textarea
                id="question"
                placeholder="Write your essay question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                style={textareaStyle}
              />
            </div>

            {/* Key Answer */}
            <div style={fieldStyle}>
              <label htmlFor="keyAnswer" style={{ marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>
                Key Answer <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <p style={{ fontSize: "12px", color: "#777", marginBottom: "6px" }}>
                This is the reference answer used by the CRNN model for scoring. Students will never see this.
              </p>
              <textarea
                id="keyAnswer"
                placeholder="Write the ideal/key answer here..."
                value={keyAnswer}
                onChange={(e) => setKeyAnswer(e.target.value)}
                style={{ ...textareaStyle, height: "120px" }}
              />
            </div>

            {/* Publish toggle */}
            <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <label htmlFor="isPublished" style={{ fontSize: "13px", cursor: "pointer" }}>
                Publish immediately (students can see and answer this question right away)
              </label>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" style={primaryButtonStyle} disabled={loading}>
                {loading ? "Creating..." : "Create Question"}
              </button>
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
