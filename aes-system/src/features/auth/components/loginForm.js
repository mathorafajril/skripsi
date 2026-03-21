// this is ui only
import { useLogin } from "../hooks/useLogin";

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
    <div>
      <h2>Sign in</h2>
      <p>
        No account yet? <a href="#">Create one free →</a>
      </p>

      {toast && <p>{toast.msg}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="identifier">Email or username</label>
          <br />
          <input
            id="identifier"
            type="text"
            placeholder="you@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            spellCheck={false}
          />
        </div>

        <br />

        <div>
          <label htmlFor="password">Password</label>
          &nbsp;
          <a href="#">Forgot password?</a>
          <br />
          <input
            id="password"
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>

        <br />

        <div>
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <label htmlFor="remember"> Remember me for 30 days</label>
        </div>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <br />
      <p>or continue with</p>

      <div>
        <button type="button">Google</button>
        &nbsp;
        <button type="button">GitHub</button>
      </div>
    </div>
  );
}
