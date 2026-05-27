export type ThemeMode = "dark" | "light";

export interface ThemeColors {
  background: string;
  cardBackground: string;
  primary: string;
  secondary: string;
  gray: string;
  text: string;
  border: string;
  hover: string;
}

const darkTheme: ThemeColors = {
  background: "#1E1E1E",
  cardBackground: "#2D2D2D",
  primary: "#77DD77",
  secondary: "#CBC3E3",
  gray: "#333333",
  text: "#E0E0E0",
  border: "#404040",
  hover: "#3D3D3D",
};

const lightTheme: ThemeColors = {
  background: "#FFFFFF",
  cardBackground: "#F5F5F5",
  primary: "#4CAF50",
  secondary: "#9C27B0",
  gray: "#E0E0E0",
  text: "#333333",
  border: "#D0D0D0",
  hover: "#E8E8E8",
};

export function getThemeColors(mode: ThemeMode): ThemeColors {
  return mode === "dark" ? darkTheme : lightTheme;
}

export function detectTheme(): ThemeMode {
  const isDark = document.body.classList.contains("theme-dark");
  return isDark ? "dark" : "light";
}

export function applyTheme(container: HTMLElement, mode: ThemeMode): void {
  container.setAttribute("data-theme", mode);
}
