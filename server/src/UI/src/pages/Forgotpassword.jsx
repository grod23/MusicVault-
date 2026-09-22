import { useState } from "react";

function ForgotPassword({ goToLogin }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleReset() {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    setMessage("Password reset link sent!");

    // Later:
    // Connect this to Supabase password reset
  }

  return (
    <div className="page">
      <div className="login-card">

        <div className="logo">♫</div>

        <h1>Forgot Password</h1>
        <p className="subtitle">
          Enter your email to reset your password
        </p>

        <div className="input-box">
          <span>✉</span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {message && (
          <p className="form-message">
            {message}
          </p>
        )}

        <button
          className="login-button"
          onClick={handleReset}
        >
          Send Reset Link
        </button>

        <button
          className="register-button"
          onClick={goToLogin}
        >
          Back to Login
        </button>

      </div>
    </div>
  );
}

export default ForgotPassword;