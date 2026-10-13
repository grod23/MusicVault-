import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import Login from "../pages/Login.jsx";

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

afterEach(() => {
  cleanup();
});

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

describe("Login Page User Input", () => {
  it("allows users to type an email", () => {
    render(<Login />);

    const emailInput = screen.getByPlaceholderText(/email/i);

    fireEvent.change(emailInput, {
      target: { value: "test@example.com" }
    });

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("allows users to type a password", () => {
    render(<Login />);

    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(passwordInput, {
      target: { value: "password123" }
    });

    expect(passwordInput).toHaveValue("password123");
  });

  it("hides password input by default", () => {
    render(<Login />);

    const passwordInput = screen.getByPlaceholderText(/password/i);

    expect(passwordInput).toHaveAttribute("type", "password");
  });
});