/**
 * Independent chrome themes for Buzz Desktop (not skins on Buzz Dark).
 *
 * Each entry is a full palette: content area, sidebar/rail, primary, borders,
 * muted, and sidebar chrome contrast tokens. Selecting one applies the whole
 * token set immediately and persists under `buzz-shell-style`.
 *
 * Visual source of truth: buzz-retro-preview (:18092) data-theme tokens.
 *
 * How to switch:
 * 1. Open Settings → Appearance
 * 2. Use a Buzz base theme (syntax pair)
 * 3. Pick an independent style (Raft / Persona 5 / multi-palette)
 */

import { getRaftShellVars } from "./raft-shell";

export type ShellStyleId =
  | "raft"
  | "persona5"
  | "persona5max"
  | "brutstack"
  | "limepunch"
  | "coralink"
  | "rosebrick"
  | "tealblock"
  | "violetpaper"
  | "skypost"
  | "inkmono";

export type ShellStyleVars = Record<string, string>;

/**
 * Chromatic role of the style:
 * - light: force light class; full light paper palette (not a dark skin)
 * - dark: force dark class; full dark palette
 * - pair: follow Buzz light/dark pair (Raft only)
 */
export type ShellChromeMode = "light" | "dark" | "pair";

export type ShellStyleDef = {
  id: ShellStyleId;
  /** Stable English label (UI may i18n separately) */
  label: string;
  /** Short blurb shown under the label (bilingual catalogs can override) */
  blurb: string;
  /** Swatch hex for picker UI */
  swatch: string;
  /** Preferred accent hex when this shell is active */
  accentHex: string;
  /** How light/dark class is resolved for this independent theme */
  chromeMode: ShellChromeMode;
  /** @deprecated use chromeMode === "dark" */
  forceDark?: boolean;
  getVars: (isDark: boolean) => ShellStyleVars;
};

/** Relative luminance of an HSL triple string "H S% L%" (0–1). */
export function hslTripleLuminance(hsl: string): number {
  const m = /^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/.exec(hsl.trim());
  if (!m) return 0.5;
  const h = Number(m[1]) / 360;
  const s = Number(m[2]) / 100;
  const l = Number(m[3]) / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio between two HSL triples. */
export function hslContrastRatio(a: string, b: string): number {
  const la = hslTripleLuminance(a);
  const lb = hslTripleLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** True when sidebar text contrast against sidebar bg is at least 4.5:1. */
export function shellSidebarReadable(vars: ShellStyleVars): boolean {
  const bg = vars["--sidebar-background"] ?? vars["--sidebar"] ?? "0 0% 50%";
  const fg = vars["--sidebar-foreground"] ?? "0 0% 100%";
  return hslContrastRatio(bg, fg) >= 4.5;
}

/**
 * Build a complete shell palette. Sidebar accent is derived from the sidebar
 * surface (never from content-area muted), so hover never becomes light-on-light
 * or dark-on-dark.
 */
function shell(opts: {
  primary: string;
  primaryFg: string;
  bg: string;
  fg: string;
  card: string;
  sidebar: string;
  sidebarFg: string;
  /** Slightly lighter/darker than sidebar for hover rows */
  sidebarAccent: string;
  border: string;
  muted: string;
  mutedFg: string;
  accent: string;
  accentFg: string;
  /** Optional solid gradient stops (hex) painted under Buzz chrome */
  gradientTop?: string;
  gradientBottom?: string;
}): ShellStyleVars {
  const {
    primary,
    primaryFg,
    bg,
    fg,
    card,
    sidebar,
    sidebarFg,
    sidebarAccent,
    border,
    muted,
    mutedFg,
    accent,
    accentFg,
    gradientTop,
    gradientBottom,
  } = opts;

  const sideLum = hslTripleLuminance(sidebar);
  const darkRail = sideLum < 0.45;
  // Chrome overlays on the rail: white translucency on dark rails, black on light.
  const chromeFg = darkRail ? "rgb(250 250 249 / 92%)" : "rgb(28 25 23 / 88%)";
  const chromeMuted = darkRail
    ? "rgb(250 250 249 / 72%)"
    : "rgb(28 25 23 / 62%)";
  const hoverSurface = darkRail
    ? "rgb(255 255 255 / 10%)"
    : "rgb(0 0 0 / 6%)";
  const searchSurface = darkRail
    ? "rgb(255 255 255 / 8%)"
    : "rgb(0 0 0 / 5%)";

  const vars: ShellStyleVars = {
    "--radius": "0rem",
    "--background": bg,
    "--foreground": fg,
    "--card": card,
    "--card-foreground": fg,
    "--popover": card,
    "--popover-foreground": fg,
    "--primary": primary,
    "--primary-foreground": primaryFg,
    "--secondary": muted,
    "--secondary-foreground": fg,
    "--muted": muted,
    "--muted-foreground": mutedFg,
    "--accent": accent,
    "--accent-foreground": accentFg,
    "--destructive": "347 77% 50%",
    "--destructive-foreground": "0 0% 100%",
    "--border": border,
    "--input": border,
    "--ring": primary,
    "--sidebar": sidebar,
    "--sidebar-background": sidebar,
    "--sidebar-foreground": sidebarFg,
    "--sidebar-primary": primary,
    "--sidebar-primary-foreground": primaryFg,
    "--sidebar-active": primary,
    "--sidebar-active-foreground": primaryFg,
    "--sidebar-accent": sidebarAccent,
    "--sidebar-accent-foreground": sidebarFg,
    "--sidebar-border": border,
    "--sidebar-ring": primary,
    // Buzz chrome tokens (consumed by theme.css under data-buzz-sidebar)
    "--buzz-muted-foreground": chromeMuted,
    "--buzz-chrome-foreground": chromeFg,
    "--buzz-nav-fg": chromeFg,
    "--buzz-channel-fg": chromeFg,
    "--buzz-dm-fg": chromeFg,
    "--buzz-search-surface": searchSurface,
    "--buzz-hover-surface": hoverSurface,
    "--buzz-sidebar-scrollbar-thumb": darkRail
      ? "rgb(255 255 255 / 18%)"
      : "rgb(0 0 0 / 14%)",
    "--buzz-active-fill": primary,
    "--buzz-active-surface": darkRail
      ? "color-mix(in srgb, hsl(var(--primary)) 32%, transparent)"
      : "color-mix(in srgb, hsl(var(--primary)) 28%, transparent)",
    "--buzz-active-foreground": primaryFg,
  };

  if (gradientTop) {
    vars["--buzz-gradient-light-top"] = gradientTop;
    vars["--buzz-gradient-dark-top"] = gradientTop;
  }
  if (gradientBottom) {
    vars["--buzz-gradient-light-bottom"] = gradientBottom;
    vars["--buzz-gradient-dark-bottom"] = gradientBottom;
  }

  return vars;
}

/** Persona 5 — red / black / white (preview: persona5) */
const P5 = shell({
  primary: "355 100% 45%",
  primaryFg: "0 0% 100%",
  bg: "0 0% 4%",
  fg: "0 0% 96%",
  card: "0 0% 7%",
  sidebar: "0 0% 0%",
  sidebarFg: "0 0% 96%",
  sidebarAccent: "0 0% 12%",
  border: "0 0% 96%",
  muted: "0 0% 10%",
  mutedFg: "0 0% 64%",
  accent: "355 100% 45%",
  accentFg: "0 0% 100%",
  gradientTop: "#1a0003",
  gradientBottom: "#0a0a0a",
});

/** Persona 5 Max — hotter red (preview: persona5max) */
const P5_MAX = shell({
  primary: "348 100% 50%",
  primaryFg: "0 0% 100%",
  bg: "0 0% 0%",
  fg: "0 0% 100%",
  card: "0 0% 4%",
  sidebar: "0 0% 0%",
  sidebarFg: "0 0% 100%",
  sidebarAccent: "348 80% 12%",
  border: "0 0% 100%",
  muted: "0 0% 7%",
  mutedFg: "0 0% 80%",
  accent: "348 100% 50%",
  accentFg: "0 0% 100%",
  gradientTop: "#2a0010",
  gradientBottom: "#000000",
});

/** Brutstack — cool slate + electric blue (preview: brutstack) */
const BRUTSTACK = shell({
  primary: "217 91% 60%",
  primaryFg: "0 0% 100%",
  bg: "226 100% 97%",
  fg: "222 47% 11%",
  card: "0 0% 100%",
  sidebar: "215 28% 17%",
  sidebarFg: "210 40% 98%",
  sidebarAccent: "215 28% 24%",
  border: "222 47% 11%",
  muted: "214 32% 91%",
  mutedFg: "215 16% 37%",
  accent: "214 95% 93%",
  accentFg: "222 47% 11%",
  gradientTop: "#f0f4ff",
  gradientBottom: "#e2e8f0",
});

const BRUTSTACK_DARK = shell({
  primary: "217 91% 60%",
  primaryFg: "0 0% 100%",
  bg: "222 47% 11%",
  fg: "210 40% 98%",
  card: "217 33% 17%",
  sidebar: "222 47% 8%",
  sidebarFg: "210 40% 98%",
  sidebarAccent: "217 33% 16%",
  border: "217 33% 25%",
  muted: "217 33% 20%",
  mutedFg: "215 20% 65%",
  accent: "217 33% 22%",
  accentFg: "210 40% 98%",
  gradientTop: "#0f172a",
  gradientBottom: "#020617",
});

/** LimePunch — paper + acid green */
const LIME = shell({
  primary: "84 81% 44%",
  primaryFg: "142 76% 12%",
  bg: "80 89% 95%",
  fg: "142 76% 16%",
  card: "0 0% 100%",
  sidebar: "142 64% 18%",
  sidebarFg: "80 89% 95%",
  sidebarAccent: "142 64% 24%",
  border: "142 64% 18%",
  muted: "80 60% 90%",
  mutedFg: "142 40% 28%",
  accent: "80 70% 82%",
  accentFg: "142 64% 18%",
  gradientTop: "#f7fee7",
  gradientBottom: "#ecfccb",
});

/** CoralInk */
const CORAL = shell({
  primary: "25 95% 53%",
  primaryFg: "0 0% 100%",
  bg: "33 100% 96%",
  fg: "15 75% 24%",
  card: "0 0% 100%",
  sidebar: "15 70% 28%",
  sidebarFg: "33 100% 96%",
  sidebarAccent: "15 70% 34%",
  border: "15 70% 24%",
  muted: "33 80% 90%",
  mutedFg: "15 50% 32%",
  accent: "30 100% 85%",
  accentFg: "15 70% 24%",
  gradientTop: "#fff7ed",
  gradientBottom: "#ffedd5",
});

/** RoseBrick */
const ROSE = shell({
  primary: "347 89% 60%",
  primaryFg: "0 0% 100%",
  bg: "355 100% 97%",
  fg: "340 70% 26%",
  card: "0 0% 100%",
  sidebar: "340 65% 30%",
  sidebarFg: "355 100% 97%",
  sidebarAccent: "340 65% 36%",
  border: "340 65% 26%",
  muted: "355 80% 92%",
  mutedFg: "340 45% 36%",
  accent: "350 100% 90%",
  accentFg: "340 65% 26%",
  gradientTop: "#fff1f2",
  gradientBottom: "#ffe4e6",
});

/** TealBlock */
const TEAL = shell({
  primary: "173 80% 40%",
  primaryFg: "175 84% 8%",
  bg: "166 76% 97%",
  fg: "175 70% 18%",
  card: "0 0% 100%",
  sidebar: "175 60% 20%",
  sidebarFg: "166 76% 97%",
  sidebarAccent: "175 60% 26%",
  border: "175 60% 18%",
  muted: "166 55% 90%",
  mutedFg: "175 40% 28%",
  accent: "166 60% 80%",
  accentFg: "175 60% 18%",
  gradientTop: "#f0fdfa",
  gradientBottom: "#ccfbf1",
});

/** VioletPaper */
const VIOLET = shell({
  primary: "258 90% 66%",
  primaryFg: "0 0% 100%",
  bg: "250 100% 98%",
  fg: "263 70% 30%",
  card: "0 0% 100%",
  sidebar: "263 55% 32%",
  sidebarFg: "250 100% 98%",
  sidebarAccent: "263 55% 38%",
  border: "263 55% 30%",
  muted: "250 80% 94%",
  mutedFg: "263 40% 38%",
  accent: "250 100% 90%",
  accentFg: "263 55% 30%",
  gradientTop: "#f5f3ff",
  gradientBottom: "#ede9fe",
});

/** SkyPost */
const SKY = shell({
  primary: "199 89% 48%",
  primaryFg: "0 0% 100%",
  bg: "204 100% 97%",
  fg: "201 90% 20%",
  card: "0 0% 100%",
  sidebar: "201 75% 24%",
  sidebarFg: "204 100% 97%",
  sidebarAccent: "201 75% 30%",
  border: "201 75% 22%",
  muted: "204 80% 92%",
  mutedFg: "201 55% 30%",
  accent: "204 90% 86%",
  accentFg: "201 75% 22%",
  gradientTop: "#f0f9ff",
  gradientBottom: "#e0f2fe",
});

/** InkMono */
const INK = shell({
  primary: "0 0% 4%",
  primaryFg: "0 0% 98%",
  bg: "0 0% 98%",
  fg: "0 0% 4%",
  card: "0 0% 100%",
  sidebar: "0 0% 6%",
  sidebarFg: "0 0% 98%",
  sidebarAccent: "0 0% 14%",
  border: "0 0% 4%",
  muted: "0 0% 94%",
  mutedFg: "0 0% 32%",
  accent: "0 0% 90%",
  accentFg: "0 0% 4%",
  gradientTop: "#fafafa",
  gradientBottom: "#e5e5e5",
});

const INK_DARK = shell({
  primary: "0 0% 98%",
  primaryFg: "0 0% 4%",
  bg: "0 0% 4%",
  fg: "0 0% 98%",
  card: "0 0% 8%",
  sidebar: "0 0% 0%",
  sidebarFg: "0 0% 98%",
  sidebarAccent: "0 0% 12%",
  border: "0 0% 30%",
  muted: "0 0% 12%",
  mutedFg: "0 0% 64%",
  accent: "0 0% 16%",
  accentFg: "0 0% 98%",
  gradientTop: "#0a0a0a",
  gradientBottom: "#000000",
});

/** Raft light/dark via raft-shell + chrome contrast tokens. */
function raftVars(isDark: boolean): ShellStyleVars {
  const base = getRaftShellVars(isDark);
  const side = base["--sidebar-background"] ?? "24 10% 16%";
  const sideLum = hslTripleLuminance(side);
  const darkRail = sideLum < 0.45;
  return {
    ...base,
    "--buzz-muted-foreground": darkRail
      ? "rgb(250 250 249 / 72%)"
      : "rgb(28 25 23 / 62%)",
    "--buzz-chrome-foreground": darkRail
      ? "rgb(250 250 249 / 90%)"
      : "rgb(28 25 23 / 88%)",
    "--buzz-nav-fg": darkRail
      ? "rgb(250 250 249 / 92%)"
      : "rgb(28 25 23 / 90%)",
    "--buzz-channel-fg": darkRail
      ? "rgb(250 250 249 / 92%)"
      : "rgb(28 25 23 / 90%)",
    "--buzz-dm-fg": darkRail
      ? "rgb(250 250 249 / 92%)"
      : "rgb(28 25 23 / 90%)",
    "--buzz-search-surface": darkRail
      ? "rgb(255 255 255 / 8%)"
      : "rgb(0 0 0 / 5%)",
    "--buzz-hover-surface": darkRail
      ? "rgb(255 255 255 / 10%)"
      : "rgb(0 0 0 / 6%)",
    "--buzz-sidebar-scrollbar-thumb": darkRail
      ? "rgb(255 255 255 / 18%)"
      : "rgb(0 0 0 / 14%)",
    "--buzz-active-fill": base["--primary"] ?? "43 96% 56%",
    "--buzz-active-surface": "color-mix(in srgb, #fbbf24 28%, transparent)",
    "--buzz-active-foreground": base["--primary-foreground"] ?? "24 10% 10%",
    "--buzz-gradient-light-top": "#fff8f0",
    "--buzz-gradient-light-bottom": "#f5f0e8",
    "--buzz-gradient-dark-top": "#292524",
    "--buzz-gradient-dark-bottom": "#1c1917",
  };
}

export const SHELL_STYLES: ShellStyleDef[] = [
  {
    id: "raft",
    label: "Raft",
    blurb: "奶油 + 琥珀黄（home_portal）",
    swatch: "#fbbf24",
    accentHex: "#fbbf24",
    chromeMode: "pair",
    getVars: (dark) => raftVars(dark),
  },
  {
    id: "persona5",
    label: "Persona 5",
    blurb: "红黑白 · 锐角",
    swatch: "#e60012",
    accentHex: "#e60012",
    chromeMode: "dark",
    forceDark: true,
    getVars: () => ({ ...P5 }),
  },
  {
    id: "persona5max",
    label: "Persona 5 Max",
    blurb: "全红 · 漫画分镜感",
    swatch: "#ff0033",
    accentHex: "#ff0033",
    chromeMode: "dark",
    forceDark: true,
    getVars: () => ({ ...P5_MAX }),
  },
  {
    id: "brutstack",
    label: "Brutstack",
    blurb: "冷灰 + 电蓝",
    swatch: "#3b82f6",
    accentHex: "#3b82f6",
    chromeMode: "light",
    getVars: (dark) => (dark ? { ...BRUTSTACK_DARK } : { ...BRUTSTACK }),
  },
  {
    id: "limepunch",
    label: "LimePunch",
    blurb: "纸白 + 酸绿",
    swatch: "#84cc16",
    accentHex: "#84cc16",
    chromeMode: "light",
    getVars: () => ({ ...LIME }),
  },
  {
    id: "coralink",
    label: "CoralInk",
    blurb: "浅桃 + 珊瑚橙",
    swatch: "#f97316",
    accentHex: "#f97316",
    chromeMode: "light",
    getVars: () => ({ ...CORAL }),
  },
  {
    id: "rosebrick",
    label: "RoseBrick",
    blurb: "米白 + 玫红",
    swatch: "#f43f5e",
    accentHex: "#f43f5e",
    chromeMode: "light",
    getVars: () => ({ ...ROSE }),
  },
  {
    id: "tealblock",
    label: "TealBlock",
    blurb: "薄荷 + 青绿",
    swatch: "#14b8a6",
    accentHex: "#14b8a6",
    chromeMode: "light",
    getVars: () => ({ ...TEAL }),
  },
  {
    id: "violetpaper",
    label: "VioletPaper",
    blurb: "浅紫 + 紫罗兰",
    swatch: "#8b5cf6",
    accentHex: "#8b5cf6",
    chromeMode: "light",
    getVars: () => ({ ...VIOLET }),
  },
  {
    id: "skypost",
    label: "SkyPost",
    blurb: "天空纸 + 天蓝",
    swatch: "#0ea5e9",
    accentHex: "#0ea5e9",
    chromeMode: "light",
    getVars: () => ({ ...SKY }),
  },
  {
    id: "inkmono",
    label: "InkMono",
    blurb: "高对比黑白",
    swatch: "#0a0a0a",
    accentHex: "#0a0a0a",
    chromeMode: "light",
    getVars: (dark) => (dark ? { ...INK_DARK } : { ...INK }),
  },
];

export const DEFAULT_SHELL_STYLE: ShellStyleId = "raft";
export const SHELL_STYLE_STORAGE_KEY = "buzz-shell-style";

export function isShellStyleId(value: string): value is ShellStyleId {
  return SHELL_STYLES.some((s) => s.id === value);
}

export function getShellStyle(id: ShellStyleId): ShellStyleDef {
  return SHELL_STYLES.find((s) => s.id === id) ?? SHELL_STYLES[0];
}

/**
 * Resolve whether the document should use the dark class for a shell.
 * Independent themes own their mode; Raft pairs with Buzz light/dark.
 */
export function resolveShellIsDark(
  id: ShellStyleId,
  buzzThemeIsDark: boolean,
): boolean {
  const style = getShellStyle(id);
  if (style.chromeMode === "dark" || style.forceDark) return true;
  if (style.chromeMode === "light") return false;
  return buzzThemeIsDark;
}

export function getShellStyleVars(
  id: ShellStyleId,
  isDark: boolean,
): ShellStyleVars {
  return getShellStyle(id).getVars(isDark);
}
