
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";

import DiscoverMusic from "../pages/DiscoverMusic";

// Mock recommendation data returned by the backend
const mockRecommendations = [
  {
    id: 2,
    title: "Believer",
    artist: "Imagine Dragons",
    genre: "rock",
    mood: "energetic",
    popularity: 50,
    score: 95,
  },
  {
    id: 5,
    title: "Numb",
    artist: "Linkin Park",
    genre: "rock",
    mood: "energetic",
    popularity: 50,
    score: 95,
  },
];

describe("Discover Music", () => {

  // Mock fetch before every test
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  // Clean up rendered components and mocks after every test
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // TEST 1: Verify the recommendation interface renders
  it("renders genre and mood selectors", () => {
    render(<DiscoverMusic />);

    expect(screen.getByLabelText("Genre")).toBeTruthy();
    expect(screen.getByLabelText("Mood")).toBeTruthy();

    expect(
      screen.getByRole("button", {
        name: "Generate Recommendations",
      })
    ).toBeTruthy();
  });

  // TEST 2: Verify users can change their preferences
  it("allows users to change genre and mood", () => {
    render(<DiscoverMusic />);

    fireEvent.change(screen.getByLabelText("Genre"), {
      target: { value: "jazz" },
    });

    fireEvent.change(screen.getByLabelText("Mood"), {
      target: { value: "calm" },
    });

    expect(screen.getByLabelText("Genre").value).toBe("jazz");
    expect(screen.getByLabelText("Mood").value).toBe("calm");
  });

  // TEST 3: Verify the correct API request is generated
  it("calls the recommendation API with selected preferences", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        recommendations: mockRecommendations,
        total: 2,
      }),
    });

    render(<DiscoverMusic />);

    fireEvent.change(screen.getByLabelText("Genre"), {
      target: { value: "jazz" },
    });

    fireEvent.change(screen.getByLabelText("Mood"), {
      target: { value: "calm" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Generate Recommendations",
      })
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    const requestUrl = fetch.mock.calls[0][0];
    const url = new URL(requestUrl);

    expect(url.pathname).toBe("/api/v1/recommendations");
    expect(url.searchParams.get("genre")).toBe("jazz");
    expect(url.searchParams.get("mood")).toBe("calm");
    expect(url.searchParams.get("limit")).toBe("10");
  });

  // TEST 4: Verify recommendations display correctly
  it("displays recommended songs and artists", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        recommendations: mockRecommendations,
        total: 2,
      }),
    });

    render(<DiscoverMusic />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Generate Recommendations",
      })
    );

    expect(await screen.findByText("Believer")).toBeTruthy();
    expect(screen.getByText("Imagine Dragons")).toBeTruthy();
    expect(screen.getByText("Numb")).toBeTruthy();
    expect(screen.getByText("Linkin Park")).toBeTruthy();

    expect(
      screen.getByText("2 recommendations found")
    ).toBeTruthy();
  });

  // TEST 5: Verify API failures are handled
  it("displays an error when the API request fails", async () => {
    fetch.mockRejectedValue(
      new Error("Failed to fetch")
    );

    render(<DiscoverMusic />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Generate Recommendations",
      })
    );

    const errorMessage = await screen.findByRole("alert");

    expect(errorMessage.textContent).toContain(
      "Failed to fetch"
    );
  });

  // TEST 6: Verify empty results are handled
  it("handles empty recommendation results", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        recommendations: [],
        total: 0,
      }),
    });

    render(<DiscoverMusic />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Generate Recommendations",
      })
    );

    expect(
      await screen.findByText(
        "No matching songs found. Try another genre or mood."
      )
    ).toBeTruthy();
  });
});
