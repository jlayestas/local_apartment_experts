import { render, type RenderOptions } from "@testing-library/react";
import { type ReactElement } from "react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: Wrapper, ...options });
}
