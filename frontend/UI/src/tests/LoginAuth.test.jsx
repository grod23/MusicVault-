import "@testing-library/jest-dom/vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from "@testing-library/react";

import {
  describe,
  test,
  expect,
  vi,
  afterEach,
} from "vitest";

import Login from "../pages/Login.jsx";
import { supabase } from "../lib/supabase";

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("Login authentication", () => {
  test("rejects missing credentials", () => {
    const goToDashboard = vi.fn();

    render(<Login goToDashboard={goToDashboard} />);

    fireEvent.click(
      screen.getByRole("button", { name: /^login$/i })
    );

    expect(
      screen.getByText("Please enter your email and password.")
    ).toBeInTheDocument();

    expect(supabase.auth.signInWithPassword)
      .not.toHaveBeenCalled();

    expect(goToDashboard).not.toHaveBeenCalled();
  });

  test("displays an error for invalid credentials", async () => {
    const goToDashboard = vi.fn();

    vi.mocked(
      supabase.auth.signInWithPassword
    ).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });

    render(<Login goToDashboard={goToDashboard} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "WrongPassword123" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /^login$/i })
    );

    expect(
      await screen.findByText("Invalid login credentials")
    ).toBeInTheDocument();

    expect(supabase.auth.signInWithPassword)
      .toHaveBeenCalledWith({
        email: "test@example.com",
        password: "WrongPassword123",
      });

    expect(goToDashboard).not.toHaveBeenCalled();
  });

  test("navigates to dashboard after successful login", async () => {
    const goToDashboard = vi.fn();

    vi.mocked(
      supabase.auth.signInWithPassword
    ).mockResolvedValueOnce({
      data: {
        user: { id: "test-user-123" },
        session: { access_token: "mock-token" },
      },
      error: null,
    });

    render(<Login goToDashboard={goToDashboard} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password123" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /^login$/i })
    );

    expect(
      await screen.findByRole("button", { name: /^login$/i })
    ).toBeEnabled();

    expect(supabase.auth.signInWithPassword)
      .toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123",
      });

    expect(goToDashboard).toHaveBeenCalledTimes(1);
  });
});