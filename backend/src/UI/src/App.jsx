import { useState } from "react";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [page, setPage] = useState("login");

  if (page === "register") {
    return (
      <Register
        goToLogin={() => setPage("login")}
      />
    );
  }

  return (
    <Login
      goToRegister={() => setPage("register")}
    />
  );
}

export default App;