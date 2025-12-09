import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogoutButton } from "@/components/logout-button";
import * as authActions from "@/app/auth/actions";

vi.mock("@/app/auth/actions", () => ({
  logoutAction: vi.fn(),
}));

describe("LogoutButton", () => {
  it("should render with Log out text", () => {
    render(<LogoutButton />);
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("should call logoutAction on form submit", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    const button = screen.getByText("Log out");
    await user.click(button);

    expect(authActions.logoutAction).toHaveBeenCalled();
  });

  it("should have correct styles", () => {
    render(<LogoutButton />);
    const button = screen.getByText("Log out");
    expect(button).toHaveClass("border"); // variant="outline"
    expect(button).toHaveClass("h-9"); // size="sm"
  });
});

