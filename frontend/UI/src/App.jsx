
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
  const [page, setPage] = useState("home");
  const [checkingRecovery, setCheckingRecovery] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;

    // Detect errors returned by Supabase recovery links.
    if (hash.includes("error=")) {
      setPage("forgot-password");
      window.history.replaceState(
        null,
        "",
        window.location.pathname
      );
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPage("reset-password");
      }
    });

    setCheckingRecovery(false);

    return () => subscription.unsubscribe();
  }, []);

  if (checkingRecovery) {
    return <p>Checking authentication...</p>;
  }

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
