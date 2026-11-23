import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ColdCallNotice, NOTICE_STORAGE_KEY } from "@/components/home/ColdCallNotice";

let markerTop = 500;
beforeEach(() => {
  window.localStorage.clear();
  markerTop = 500;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({ top: markerTop, bottom: markerTop, left: 0, right: 0, width: 0, height: 0, x: 0, y: markerTop, toJSON: () => ({}) }));
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => { callback(0); return 1; });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function leaveHero() {
  markerTop = 0;
  act(() => { window.dispatchEvent(new Event("scroll")); });
}

describe("Cold-call notice visit rules", () => {
  it("opens only when the visitor leaves the hero", () => {
    render(<ColdCallNotice />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    leaveHero();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("close dismisses it for this visit but a new visit shows it again", () => {
    const first = render(<ColdCallNotice />);
    leaveHero();
    fireEvent.click(screen.getByRole("button", { name: "Close notice" }));
    leaveHero();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    first.unmount();
    render(<ColdCallNotice />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("Don't show this again suppresses future visits", () => {
    const first = render(<ColdCallNotice />);
    leaveHero();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "I Understand" }));
    expect(window.localStorage.getItem(NOTICE_STORAGE_KEY)).toBe("true");
    first.unmount();
    render(<ColdCallNotice />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});