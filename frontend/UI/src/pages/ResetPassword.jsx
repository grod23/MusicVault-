
import { useState } from "react";
import { supabase } from "../lib/supabase";

function ResetPassword({ goToLogin }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function handleUpdatePassword() {
    if (!password || !confirmPassword) {
      setMessage("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setCompleted(true);
      setMessage("Password updated successfully!");
      await supabase.auth.signOut();
    } catch {
      setMessage("Unable to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="login-card">
        <div className="logo">♫</div>

        <h1>Reset Password</h1>
        <p className="subtitle">
          Enter your new MusicVault password
        </p>

        {!completed && (
          <>
            <div className="input-box">
              <span>🔒</span>
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />
            </div>

            <div className="input-box">
              <span>🔒</span>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
              />
            </div>

            <button
              className="login-button"
              onClick={handleUpdatePassword}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </>
        )}

        {message && (
          <p className="form-message" role="status">
            {message}
          </p>
        )}

        {completed && (
          <button
            className="register-button"
            onClick={goToLogin}
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
