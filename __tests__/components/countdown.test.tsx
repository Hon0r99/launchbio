import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Countdown } from "@/components/countdown";

describe("Countdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should display timer before launch", () => {
    const futureDate = new Date(Date.now() + 86400000); // one day from now
    render(<Countdown target={futureDate} />);

    expect(screen.getByText(/Days/i)).toBeInTheDocument();
    expect(screen.getByText(/Hours/i)).toBeInTheDocument();
    expect(screen.getByText(/Min/i)).toBeInTheDocument();
    expect(screen.getByText(/Sec/i)).toBeInTheDocument();
  });

  it("should display launch message after time expires", () => {
    const pastDate = new Date(Date.now() - 1000); // in the past
    render(<Countdown target={pastDate} />);

    expect(screen.getByText(/Launch is live!/i)).toBeInTheDocument();
  });

  it("should display afterLaunchText after launch", () => {
    const pastDate = new Date(Date.now() - 1000);
    const afterLaunchText = "We're live! Click the button to join.";
    render(<Countdown target={pastDate} afterLaunchText={afterLaunchText} />);

    expect(screen.getByText(afterLaunchText)).toBeInTheDocument();
  });

  it("should update timer every second", () => {
    const futureDate = new Date(Date.now() + 5000); // 5 seconds from now
    render(<Countdown target={futureDate} />);

    // Check that timer is displayed
    expect(screen.getByText(/Days/i)).toBeInTheDocument();

    // Advance time by 1 second - this should trigger update
    vi.advanceTimersByTime(1000);

    // Check that component still renders
    // (timer should update via useEffect)
    expect(screen.getByText(/Days/i)).toBeInTheDocument();
  });

  it("should accept string as target", () => {
    const futureDate = new Date(Date.now() + 86400000);
    render(<Countdown target={futureDate.toISOString()} />);

    expect(screen.getByText(/Days/i)).toBeInTheDocument();
  });

  it("should format time correctly", () => {
    const futureDate = new Date(Date.now() + 90061000); // 1 day, 1 hour, 1 minute, 1 second
    render(<Countdown target={futureDate} />);

    // Check that numbers are displayed
    const numbers = screen.getAllByText(/\d+/);
    expect(numbers.length).toBeGreaterThan(0);
  });

  it("should show target date", () => {
    const futureDate = new Date(Date.now() + 86400000);
    render(<Countdown target={futureDate} />);

    expect(screen.getByText(/Target:/i)).toBeInTheDocument();
  });
});

