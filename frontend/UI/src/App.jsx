/*App.jsx*/
import { useState } from "react";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";

function App() {
  const [page, setPage] = useState("login");

  if (page === "register") {
    return (
      <Register
        goToLogin={() => setPage("login")}
      />
    );
  }

    if (page === "forgot-password") {
    return (
      <ForgotPassword
        goToLogin={() => setPage("login")}
      />
    );
  }

  // Main dashboard
  if (page === "dashboard") {
    return (
      <Dashboard
        goToLogin={() => setPage("login")}
      />
    );
  }

  return (
    <Login
      goToRegister={() => setPage("register")}
      goToForgotPassword={() => setPage("forgot-password")}
      goToDashboard={() => setPage("dashboard")}
    />
  );
}

export default App;