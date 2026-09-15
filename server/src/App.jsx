/*App.jsx*/
import "./App.css";

function App() {
  return (
    <div className="page">
      <div className="login-card">

        <div className="logo">♫</div>

        <h1>Music Vault</h1>
        <p className="subtitle">Music for You</p>
{/* Email input */}
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
{/* Remember Login */}
        <div className="options">
          <label>
            <input type="checkbox" />
            Remember me
          </label>
{/* Forgot Password */}
          <button className="forgot-button">
            Forgot password?
          </button>
        </div>

        <button className="login-button">
          Login
        </button>

        <button className="register-button">
          Register
        </button>

      </div>
    </div>
  );
}

export default App;