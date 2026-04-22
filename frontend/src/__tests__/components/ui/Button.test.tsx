import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "@/components/ui/Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Save Lead</Button>);
    expect(screen.getByRole("button", { name: "Save Lead" })).toBeInTheDocument();
  });

  it("defaults to primary variant", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-indigo-600");
  });

  it("applies secondary variant classes", () => {
    render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-white");
  });

  it("applies danger variant classes", () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-red-600");
  });

  it("applies ghost variant classes", () => {
    render(<Button variant="ghost">Close</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-transparent");
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Submit</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when isLoading is true", () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows Spinner when isLoading", () => {
    const { container } = render(<Button isLoading>Submit</Button>);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("does not show Spinner when not loading", () => {
    const { container } = render(<Button>Submit</Button>);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeInTheDocument();
  });

  it("calls onClick handler when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("does not call onClick when isLoading", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button isLoading onClick={handleClick}>Loading</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies custom className", () => {
    render(<Button className="w-full">Wide</Button>);
    expect(screen.getByRole("button")).toHaveClass("w-full");
  });

  it("submits form when type=submit", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Submit Form</Button>
      </form>
    );
    screen.getByRole("button").click();
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("renders sm size classes", () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-xs");
  });

  it("renders md size classes by default", () => {
    render(<Button>Default</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-sm");
  });
});
