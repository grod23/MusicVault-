import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import Register from "./Register";

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
    from: vi.fn(),
  },
}));

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
});