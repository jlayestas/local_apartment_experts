import type { ReactNode } from "react";

type Spacing = "sm" | "md" | "lg";
type Bg = "white" | "muted";

type Props = {
  children: ReactNode;
  /**
   * sm — py-10/12  — tight utility sections (filters bar, breadcrumb zones)
   * md — py-14/16  — standard content sections
   * lg — py-20/28  — hero and primary landing sections
   */
  spacing?: Spacing;
  /** white — #fff  |  muted — gray-50 (alternating section backgrounds) */
  bg?: Bg;
  className?: string;
  /** Forward an id for anchor links */
  id?: string;
};

const SPACING_CLASSES: Record<Spacing, string> = {
  sm: "py-10 sm:py-12",
  md: "py-14 sm:py-16",
  lg: "py-20 sm:py-28",
};

const BG_CLASSES: Record<Bg, string> = {
  white: "bg-white",
  muted: "bg-gray-50",
};

export default function Section({
  children,
  spacing = "md",
  bg = "white",
  className = "",
  id,
}: Props) {
  return (
    <section
      id={id}
      className={[SPACING_CLASSES[spacing], BG_CLASSES[bg], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}
