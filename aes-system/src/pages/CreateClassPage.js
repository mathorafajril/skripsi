
import { useNavigate }      from "react-router-dom";
import { useCreateClass }   from "../features/classes/hooks/useCreateClass";
import { DashboardHeader }  from "../features/dashboard";
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
  height:     "80px",
  resize:     "vertical",
  fontFamily: "inherit",
};

export default function CreateClassPage() {
  const navigate = useNavigate();
  const {
    name, setName,
    description, setDescription,
    loading, toast,
    handleSubmit,
  } = useCreateClass();

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
          <h1>Create New Class</h1>
        </div>

        <div style={{ ...sectionStyle, maxWidth: "560px" }}>
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

            <div style={fieldStyle}>
              <label htmlFor="name" style={{ marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>
                Class Name <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Introduction to Biology"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={fieldStyle}>
              <label htmlFor="description" style={{ marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>
                Description <span style={{ color: "#999", fontWeight: "400" }}>(optional)</span>
              </label>
              <textarea
                id="description"
                placeholder="Brief description of the class..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={textareaStyle}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button type="submit" style={primaryButtonStyle} disabled={loading}>
                {loading ? "Creating..." : "Create Class"}
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
