import { useRegister } from "../hooks/useRegister";
import { Link } from "react-router-dom";
import { pageStyle, boxStyle, fieldStyle, inputStyle, showButtonStyle } from "../../../styles/authStyles";

export function RegisterForm() {
  const {
    name, setName,
    identifier, setIdentifier,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPass, setShowPass,
    showConfirmPass, setShowConfirmPass,
    loading,
    toast,
    handleSubmit,
  } = useRegister();

  return (
    <div style={pageStyle}>
      <div style={boxStyle}>
        <h2>Create an account</h2>
        <p>
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>

        {toast && <p>{toast.msg}</p>}

        <form onSubmit={handleSubmit} noValidate>

          {/* Full name */}
          <div style={fieldStyle}>
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              placeholder="Juan dela Cruz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              style={inputStyle}
            />
          </div>

          {/* Identifier */}
          <div style={fieldStyle}>
            <label htmlFor="identifier">Email or phone number</label>
            <input
              id="identifier"
              type="text"
              placeholder="you@example.com or 09XXXXXXXXX"
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
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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
          </div>

          {/* Confirm Password */}
          <div style={fieldStyle}>
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type={showConfirmPass ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass((v) => !v)}
              aria-label={showConfirmPass ? "Hide password" : "Show password"}
              style={showButtonStyle}
            >
              {showConfirmPass ? "Hide" : "Show"}
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>

        </form>
      </div>
    </div>
  );
}