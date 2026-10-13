import { useState } from "react";
import { supabase } from "../lib/supabase";

function Login({ goToRegister, goToForgotPassword, goToDashboard }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
  if (!email.trim() || !password) {
    setMessage("Please enter your email and password.");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    goToDashboard();
  } catch (error) {
    setMessage("Unable to log in. Please try again.");
    console.error("Login error:", error);
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="page">
      <div className="login-card">

        <div className="logo">♫</div>

        <h1>Music Vault</h1>
        <p className="subtitle">Music for You</p>

        {/* Email Input */}
        <div className="input-box">
          <span>✉</span>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {/* Password Input */}
        <div className="input-box">
          <span>🔒</span>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {/* Remember Login / Forgot Password */}
        <div className="options">
          <label>
            <input type="checkbox" />
            Remember me
          </label>

          <button 
          className="forgot-button" 
          onClick={goToForgotPassword}>
            Forgot password?
          </button>
        </div>

        {/* Login Button */}
        <button
          className="login-button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {message && <p className="form-message" role="alert">{message}</p>}

        {/* Register Button */}
        <button
          className="register-button"
          onClick={goToRegister}
        >
          Register
        </button>

      </div>
    </div>
  );
}

export default Login;