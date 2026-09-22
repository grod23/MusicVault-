function Login({ goToRegister }) {
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
          />
        </div>

        {/* Password Input */}
        <div className="input-box">
          <span>🔒</span>
          <input
            type="password"
            placeholder="Password"
          />
        </div>

        {/* Remember Login / Forgot Password */}
        <div className="options">
          <label>
            <input type="checkbox" />
            Remember me
          </label>

          <button className="forgot-button">
            Forgot password?
          </button>
        </div>

        {/* Login Button */}
        <button className="login-button">
          Login
        </button>

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