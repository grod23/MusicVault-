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

  it("renders the primary homepage controls", () => {
    render(<Home />);

    expect(
      screen.getByRole("link", { name: /connect to spotify/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /continue with music vault/i })
    ).toBeInTheDocument();
  });
});

describe("Homepage Interactions", () => {
  it("provides the correct Spotify authorization link", () => {
    render(<Home />);

    const spotifyLink = screen.getByRole("link", {
      name: /connect to spotify/i,
    });

    expect(spotifyLink).toHaveAttribute(
      "href",
      "http://127.0.0.1:3001/api/auth/spotify"
    );
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