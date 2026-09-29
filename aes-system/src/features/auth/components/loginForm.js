import { useLogin } from "../hooks/useLogin";
import { Link } from "react-router-dom";
import { pageStyle, boxStyle, fieldStyle, inputStyle, showButtonStyle, forgotLinkStyle } from "../../../styles/authStyles";

export function LoginForm() {
  const {
    identifier, setIdentifier,
    password, setPassword,
    showPass, setShowPass,
    remember, setRemember,
    loading,
    toast,
    handleSubmit,
  } = useLogin();

  return (
    <div style={pageStyle}>
      <div style={boxStyle}>
        <h2>Sign in</h2>
        <p>
          No account yet? <Link to="/register">Create one free →</Link>
        </p>

        {toast && <p>{toast.msg}</p>}

        <form onSubmit={handleSubmit} noValidate>

          {/* Identifier */}
          <div style={fieldStyle}>
            <label htmlFor="identifier">Email or username</label>
            <input
              id="identifier"
              type="text"
              placeholder="you@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              spellCheck={false}
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div style={fieldStyle}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? "Hide password" : "Show password"}
              style={showButtonStyle}
            >
              {showPass ? "Hide" : "Show"}
            </button>
            <Link to="/forgot-password" style={forgotLinkStyle}>Forgot password?</Link>
          </div>

          {/* Remember me */}
          <div style={{ marginBottom: "16px" }}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label htmlFor="remember"> Remember me for 30 days</label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

        </form>
      </div>
    </div>
  );
}