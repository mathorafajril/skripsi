
import {
  DashboardHeader,
  StudentDashboard,
  AdminDashboard,
  useDashboard,
} from "../features/dashboard";
import {
  dashboardPageStyle,
  dashboardContentStyle,
} from "../styles/dashboardStyles";

export default function DashboardPage() {
  const {
    user,
    role,
    classes,
    loading,
    toast,
    showJoinModal, setShowJoinModal,
    classCode, setClassCode,
    joining,
    handleJoinClass,
    handleLogout,
  } = useDashboard();

  return (
    <div style={dashboardPageStyle}>

      {/* Header */}
      <DashboardHeader user={user} onLogout={handleLogout} />

      {/* Main content */}
      <main style={dashboardContentStyle}>
        <h1 style={{ marginBottom: "24px" }}>Dashboard</h1>

        {/* Toast notification */}
        {toast && (
          <p style={{
            marginBottom: "16px",
            padding: "10px 14px",
            borderRadius: "6px",
            backgroundColor: toast.type === "error" ? "#fdecea" : "#eafaf1",
            color: toast.type === "error" ? "#c0392b" : "#27ae60",
            fontSize: "14px",
          }}>
            {toast.msg}
          </p>
        )}

        {/* Role-based dashboard view */}
        {role === "admin" ? (
          <AdminDashboard
            classes={classes}
            loading={loading}
          />
        ) : (
          <StudentDashboard
            classes={classes}
            loading={loading}
            showJoinModal={showJoinModal}
            setShowJoinModal={setShowJoinModal}
            classCode={classCode}
            setClassCode={setClassCode}
            joining={joining}
            handleJoinClass={handleJoinClass}
          />
        )}
      </main>

    </div>
  );
}