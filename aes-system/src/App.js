
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage                from "./pages/LoginPage";
import RegisterPage             from "./pages/RegisterPage";
import DashboardPage            from "./pages/DashboardPage";
import CreateClassPage          from "./pages/CreateClassPage";
import CreateQuestionPage       from "./pages/CreateQuestionPage";
import ResultAnalysisPage       from "./pages/ResultAnalysisPage";
import ClassDetailPage          from './pages/ClassDetailPage';
import QuestionDetailPage       from './pages/QuestionDetailPage';
import AnswerQuestionPage       from "./pages/AnswerQuestionPage";
import ExamPage                 from "./pages/ExamPage";
import StudentClassResultsPage  from "./pages/StudentClassResultsPage";
import EditQuestionPage         from "./pages/EditQuestionPage";
import LeaderboardPage          from "./pages/LeaderboardPage";
import { ACCESS_TOKEN_NAME }    from "./features/auth";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem(ACCESS_TOKEN_NAME);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/create-class" element={
          <ProtectedRoute><CreateClassPage /></ProtectedRoute>
        } />
        <Route path="/create-question" element={
          <ProtectedRoute><CreateQuestionPage /></ProtectedRoute>
        } />
        <Route path="/questions/:question_id" element={
          <ProtectedRoute><QuestionDetailPage /></ProtectedRoute>
        } />
        <Route path="/questions/:question_id/results" element={
          <ProtectedRoute><ResultAnalysisPage /></ProtectedRoute>
        } />
        <Route path="/classes/:class_id" element={
          <ProtectedRoute><ClassDetailPage /></ProtectedRoute>
        } />
        <Route path="/questions/:question_id/answer" element={
          <ProtectedRoute><AnswerQuestionPage /></ProtectedRoute>
        } />
        <Route path="/classes/:class_id/exam" element={
          <ProtectedRoute><ExamPage /></ProtectedRoute>
        } />
        <Route path="/classes/:class_id/results" element={
          <ProtectedRoute><StudentClassResultsPage /></ProtectedRoute>
        } />
        <Route path="/edit-question/:question_id" element={
          <ProtectedRoute><EditQuestionPage /></ProtectedRoute>
        } />
        <Route path="/classes/:class_id/leaderboard" element={
          <ProtectedRoute><LeaderboardPage /></ProtectedRoute>
        } />
        {/* Placeholder */}
        <Route path="/profile" element={
          <ProtectedRoute><div style={{ padding: 32 }}>Profile — Coming Soon</div></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
