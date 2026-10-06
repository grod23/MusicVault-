import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Login from "../pages/Login.jsx";

describe("Login Page Rendering", () => {
  it("renders the main login elements", () => {
    render(<Login />);

    expect(
      screen.getByRole("heading", { name: /music vault/i })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/email/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/forgot password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/register/i)
    ).toBeInTheDocument();
  });
});