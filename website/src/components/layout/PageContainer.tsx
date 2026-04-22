import type { ReactNode } from "react";

type Width = "narrow" | "default" | "wide";

type Props = {
  children: ReactNode;
  /**
   * narrow  — max-w-2xl  — contact forms, focused reading content
   * default — max-w-6xl  — standard page content, detail pages
   * wide    — max-w-7xl  — listing grids, full-width layouts
   */
  width?: Width;
  className?: string;
};

const WIDTH_CLASSES: Record<Width, string> = {
  narrow:  "max-w-2xl",
  default: "max-w-6xl",
  wide:    "max-w-7xl",
};

export default function PageContainer({ children, width = "default", className = "" }: Props) {
  return (
    <div
      className={[
        "mx-auto w-full",
        WIDTH_CLASSES[width],
        "px-4 sm:px-6 lg:px-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
