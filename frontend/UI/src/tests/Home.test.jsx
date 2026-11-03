import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import Home from "../pages/Home.jsx";

afterEach(() => {
  cleanup();
});

describe("Homepage Rendering", () => {
  it("displays the Music Vault branding", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /music vault/i })
    ).toBeInTheDocument();

    expect(screen.getByText("♫")).toBeInTheDocument();
  });

  it("displays the homepage subtitle", () => {
    render(<Home />);

    expect(
      screen.getByText(
        /discover music beyond the usual recommendations/i
      )
    ).toBeInTheDocument();
  });

  it("displays the homepage description", () => {
    render(<Home />);

    expect(
      screen.getByText(
        /music vault helps you explore personalized songs/i
      )
    ).toBeInTheDocument();
  });

  it("renders the primary homepage buttons", () => {
    render(<Home />);

    expect(
      screen.getByRole("button", { name: /connect to spotify/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /continue with music vault/i })
    ).toBeInTheDocument();
  });
});

describe("Homepage Interactions", () => {
  it("allows users to click Connect to Spotify", () => {
    render(<Home />);

    const spotifyButton = screen.getByRole("button", {
      name: /connect to spotify/i,
    });

    expect(spotifyButton).toBeEnabled();

    fireEvent.click(spotifyButton);

    expect(spotifyButton).toBeInTheDocument();
  });

  it("navigates to Login when Continue with Music Vault is clicked", () => {
    const goToLogin = vi.fn();

    render(<Home goToLogin={goToLogin} />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue with music vault/i })
    );

    expect(goToLogin).toHaveBeenCalledOnce();
  });
});