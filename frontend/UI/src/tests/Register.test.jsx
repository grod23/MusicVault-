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
  test("shows an error when fields are empty", () => {
    render(<Register goToLogin={() => {}} />);

    const createButton = screen.getByRole("button", {
      name: /create account/i,
    });

    fireEvent.click(createButton);

    expect(
      screen.getByText("Please fill out all fields.")
    ).toBeTruthy();
  });

    test("shows an error when passwords do not match", () => {
    vi.mocked(supabase.auth.signUp).mockClear();

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
});