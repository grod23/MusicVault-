import { useState } from "react";

function Register({ goToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleRegister() {
    if (!username || !email || !password || !confirmPassword) {
      setMessage("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
  }

  return (
    <div className="page">
      <div className="login-card">

        <div className="logo">♫</div>

        <h1>Create Account</h1>
        <p className="subtitle">Join Music Vault</p>

        <div className="input-box">
          <span>👤</span>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div className="input-box">
          <span>✉</span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="input-box">
          <span>🔒</span>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="input-box">
          <span>🔒</span>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        {message && <p className="form-message">{message}</p>}

        <button
          className="login-button"
          onClick={handleRegister}
        >
          Create Account
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

export default Register;