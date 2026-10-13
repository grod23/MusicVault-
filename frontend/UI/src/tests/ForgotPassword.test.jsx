import "@testing-library/jest-dom/vitest";

import {
  render,
  screen,
  fireEvent,
  cleanup
} from "@testing-library/react";

import { describe, it, expect, vi, afterEach } from "vitest";
import ForgotPassword from "../pages/ForgotPassword.jsx";

afterEach(() => {
  cleanup();
});

// Mock Supabase so no real password reset email is sent
vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn().mockResolvedValue({
        data: {},
        error: null
      })
    }
  }
}));

describe("Forgot Password Page Rendering", () => {
  it("renders the main forgot password elements", () => {
    render(<ForgotPassword goToLogin={() => {}} />);

    expect(
      screen.getByPlaceholderText(/email/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /back to login/i })
    ).toBeInTheDocument();
  });
});

describe("Forgot Password Page Navigation", () => {
  it("navigates back to Login when clicked", () => {
    const goToLogin = vi.fn();

    render(<ForgotPassword goToLogin={goToLogin} />);

    fireEvent.click(
      screen.getByRole("button", { name: /back to login/i })
    );

    expect(goToLogin).toHaveBeenCalledOnce();
  });
});

describe("Forgot Password Page Functionality", () => {
  it("displays an error when email is empty", async () => {
    render(<ForgotPassword goToLogin={() => {}} />);

    fireEvent.click(
      screen.getByRole("button", { name: /send reset link/i })
    );

    expect(
      await screen.findByText("Please enter your email.")
    ).toBeInTheDocument();
  });

  it("displays success when email is entered", async () => {
    render(<ForgotPassword goToLogin={() => {}} />);

    const emailInput = screen.getByPlaceholderText(/email/i);

    fireEvent.change(emailInput, {
      target: { value: "test@example.com" }
    });

    fireEvent.click(
      screen.getByRole("button", { name: /send reset link/i })
    );

    expect(
      await screen.findByText("Password reset link sent!")
    ).toBeInTheDocument();
  });
});