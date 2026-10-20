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

describe("Login Page Navigation", () => {
  it("navigates to Register when Register is clicked", () => {
    const goToRegister = vi.fn();

    render(<Login goToRegister={goToRegister} />);

    fireEvent.click(
      screen.getByRole("button", { name: /register/i })
    );

    expect(goToRegister).toHaveBeenCalledOnce();
  });

  it("navigates to Forgot Password when clicked", () => {
    const goToForgotPassword = vi.fn();

    render(
      <Login goToForgotPassword={goToForgotPassword} />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /forgot password/i })
    );

    expect(goToForgotPassword).toHaveBeenCalledOnce();
  });
});