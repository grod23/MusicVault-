
import { useEffect, useState } from "react";
import "./App.css";

import { supabase } from "./lib/supabase";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";

function App() {
const [page, setPage] = useState(() => {
  const hash = window.location.hash;

  return hash.includes("error=")
    ? "forgot-password"
    : "home";
});

useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      setPage("reset-password");
    }
  });

  return () => subscription.unsubscribe();
}, []);

  if (page === "home") {
    return <Home goToLogin={() => setPage("login")} />;
  }

  if (page === "register") {
    return (
      <Register goToLogin={() => setPage("login")} />
    );
  }

  if (page === "forgot-password") {
    return (
      <ForgotPassword
        goToLogin={() => setPage("login")}
      />
    );
  }

  if (page === "reset-password") {
    return (
      <ResetPassword
        goToLogin={() => setPage("login")}
      />
    );
  }

  if (page === "dashboard") {
    return (
      <Dashboard goToLogin={() => setPage("login")} />
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
