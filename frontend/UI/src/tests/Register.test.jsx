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

import Register from "../pages/Register.jsx";
import { supabase } from "../lib/supabase";

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
    from: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Register page", () => {

  // Test 1: Empty registration fields
  test("shows an error when fields are empty", () => {
    render(<Register goToLogin={() => {}} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /create account/i,
      })
    );

    expect(
      screen.getByText("Please fill out all fields.")
    ).toBeTruthy();

    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  // Test 2: Password mismatch
  test("shows an error when passwords do not match", () => {
    render(<Register goToLogin={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "testuser" },
    });

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password123" },
    });

    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "Different123" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /create account/i,
      })
    );

    expect(
      screen.getByText("Passwords do not match.")
    ).toBeTruthy();

    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  test("successfully registers a user and creates a profile", async () => {
  const testUserId = "123e4567-e89b-42d3-a456-426614174000";

  vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
    data: {
      user: { id: testUserId },
      session: { access_token: "mock-token" },
    },
    error: null,
  });

  const insertMock = vi.fn().mockResolvedValue({
    error: null,
  });

  vi.mocked(supabase.from).mockReturnValueOnce({
    insert: insertMock,
  });

  render(<Register goToLogin={() => {}} />);

  fireEvent.change(screen.getByPlaceholderText("Username"), {
    target: { value: "testuser" },
  });

  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "test@example.com" },
  });

  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: "Password123" },
  });

  fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
    target: { value: "Password123" },
  });

  fireEvent.click(
    screen.getByRole("button", {
      name: /create account/i,
    })
  );

  expect(
    await screen.findByText("Account created successfully!")
  ).toBeTruthy();

  expect(supabase.auth.signUp).toHaveBeenCalledWith({
    email: "test@example.com",
    password: "Password123",
  });

  expect(supabase.from).toHaveBeenCalledWith("Music Vault");

  expect(insertMock).toHaveBeenCalledWith({
    id: testUserId,
    username: "testuser",
  });
});

  // Test 3: Supabase registration failure
  test("shows an error when Supabase registration fails", async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Registration failed" },
    });

    render(<Register goToLogin={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "testuser" },
    });

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password123" },
    });

    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "Password123" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /create account/i,
      })
    );

    expect(
      await screen.findByText("Registration failed")
    ).toBeTruthy();

    expect(supabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@example.com",
        password: "Password123",
      })
    );

    expect(supabase.from).not.toHaveBeenCalled();
  });

});