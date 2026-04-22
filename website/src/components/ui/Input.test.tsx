import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Input from "./Input";

describe("Input", () => {
  it("renders a label when provided", () => {
    render(<Input label="Phone" />);
    expect(screen.getByText("Phone")).toBeInTheDocument();
  });

  it("renders required asterisk when required prop is passed", () => {
    render(<Input label="Phone" required />);
    const asterisk = screen.getByText("*");
    expect(asterisk).toBeInTheDocument();
  });

  it("does not render asterisk when required is not passed", () => {
    render(<Input label="Email" />);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("renders a $ prefix adornment when prefix='$' is passed", () => {
    const { container } = render(<Input label="Min Price" prefix="$" />);
    expect(container.querySelector("span[aria-hidden]")).toHaveTextContent("$");
  });

  it("does not render prefix wrapper when prefix is omitted", () => {
    const { container } = render(<Input label="City" />);
    expect(container.querySelector("span[aria-hidden]")).not.toBeInTheDocument();
  });

  it("renders hint text below the input", () => {
    render(<Input label="Email" hint="Optional" />);
    expect(screen.getByText("Optional")).toBeInTheDocument();
  });

  it("renders error text and hides hint when both are present", () => {
    render(<Input label="Phone" hint="Required" error="Invalid phone" />);
    expect(screen.getByText("Invalid phone")).toBeInTheDocument();
    expect(screen.queryByText("Required")).not.toBeInTheDocument();
  });

  it("associates label with input via id", () => {
    render(<Input label="City" />);
    const input = screen.getByRole("textbox");
    expect(input.id).toBe("input-city");
    expect(screen.getByLabelText("City")).toBe(input);
  });
});
