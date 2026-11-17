/*Forgotpassword.jsx*/
import { useState } from "react";
import { supabase } from "../lib/supabase";

function ForgotPassword({ goToLogin }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

async function handleReset() {
  if (!email.trim()) {
    setMessage("Please enter your email.");
    return;
  }

  setMessage("");

  try {
    console.log("Starting password recovery request");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/`,      }
    );

    console.log("Recovery response:", {
      success: !error,
      errorCode: error?.code ?? null,
    });

    if (error) {
      setMessage("Unable to send reset link. Please try again.");
      return;
    }

    setMessage("Password reset link sent!");
  } catch (error) {
    console.error("Password recovery request failed:", error);
    setMessage("Unable to send reset link. Please try again.");
  }
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