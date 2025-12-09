import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("should render with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should call onClick on click", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled=true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText("Disabled");
    expect(button).toBeDisabled();
  });

  it("should apply variant default", () => {
    render(<Button variant="default">Default</Button>);
    const button = screen.getByText("Default");
    expect(button).toHaveClass("from-sky-500");
  });

  it("should apply variant outline", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByText("Outline");
    expect(button).toHaveClass("border");
  });

  it("should apply variant ghost", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByText("Ghost");
    expect(button).toHaveClass("hover:bg-muted");
  });

  it("should apply size sm", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByText("Small");
    expect(button).toHaveClass("h-9");
  });

  it("should apply size lg", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByText("Large");
    expect(button).toHaveClass("h-12");
  });

  it("should apply custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByText("Custom");
    expect(button).toHaveClass("custom-class");
  });

  it("should pass other props", () => {
    render(<Button type="submit" data-testid="submit-btn">Submit</Button>);
    const button = screen.getByTestId("submit-btn");
    expect(button).toHaveAttribute("type", "submit");
  });
});

