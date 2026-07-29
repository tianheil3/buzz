import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_SHELL_STYLE,
  SHELL_STYLES,
  SHELL_STYLE_STORAGE_KEY,
  getShellStyle,
  getShellStyleVars,
  isShellStyleId,
  resolveShellIsDark,
  shellSidebarReadable,
  hslContrastRatio,
} from "./shell-styles.ts";
import {
  RAFT_LIGHT_PRIMARY,
  RAFT_LIGHT_SIDEBAR,
  getRaftShellVars,
} from "./raft-shell.ts";

describe("shell styles catalog", () => {
  it("includes at least 6 styles with Persona5 and Max", () => {
    assert.ok(SHELL_STYLES.length >= 6);
    const ids = new Set(SHELL_STYLES.map((s) => s.id));
    assert.ok(ids.has("raft"));
    assert.ok(ids.has("persona5"));
    assert.ok(ids.has("persona5max"));
  });

  it("defaults to raft and validates ids", () => {
    assert.equal(DEFAULT_SHELL_STYLE, "raft");
    assert.equal(SHELL_STYLE_STORAGE_KEY, "buzz-shell-style");
    assert.equal(isShellStyleId("raft"), true);
    assert.equal(isShellStyleId("persona5max"), true);
    assert.equal(isShellStyleId("nope"), false);
  });

  it("raft shell matches raft-shell source of truth", () => {
    const light = getShellStyleVars("raft", false);
    const dark = getShellStyleVars("raft", true);
    assert.equal(light["--primary"], getRaftShellVars(false)["--primary"]);
    assert.equal(
      light["--sidebar-background"],
      getRaftShellVars(false)["--sidebar-background"],
    );
    assert.equal(dark["--primary"], getRaftShellVars(true)["--primary"]);
    assert.equal(light["--primary"], RAFT_LIGHT_PRIMARY);
    assert.equal(light["--sidebar-background"], RAFT_LIGHT_SIDEBAR);
  });

  it("persona5 and max force dark chrome with red primary", () => {
    const p5 = getShellStyle("persona5");
    const max = getShellStyle("persona5max");
    assert.equal(p5.chromeMode, "dark");
    assert.equal(max.chromeMode, "dark");
    assert.equal(resolveShellIsDark("persona5", false), true);
    assert.equal(resolveShellIsDark("persona5max", true), true);
    const p5Vars = getShellStyleVars("persona5", true);
    const maxVars = getShellStyleVars("persona5max", true);
    assert.match(p5Vars["--primary"], /^355 /);
    assert.match(maxVars["--primary"], /^348 /);
    assert.match(p5Vars["--sidebar-background"], /^0 0% [0-4]%/);
    assert.match(p5Vars["--sidebar-foreground"], /^0 0% 9/);
  });

  it("light-only palettes stay light even when Buzz Dark is selected", () => {
    assert.equal(resolveShellIsDark("limepunch", true), false);
    assert.equal(resolveShellIsDark("brutstack", true), false);
    assert.equal(resolveShellIsDark("coralink", false), false);
    // Raft pairs with Buzz light/dark
    assert.equal(resolveShellIsDark("raft", true), true);
    assert.equal(resolveShellIsDark("raft", false), false);
  });

  it("every shell has readable sidebar contrast (≥ 4.5:1)", () => {
    for (const style of SHELL_STYLES) {
      for (const dark of [false, true]) {
        const vars = getShellStyleVars(style.id, dark);
        assert.ok(
          shellSidebarReadable(vars),
          `${style.id} dark=${dark} sidebar contrast too low: ${hslContrastRatio(
            vars["--sidebar-background"],
            vars["--sidebar-foreground"],
          ).toFixed(2)}`,
        );
        // Sidebar accent hover uses a shade of the rail, not content muted
        const accentBg = vars["--sidebar-accent"];
        const accentFg = vars["--sidebar-accent-foreground"];
        assert.ok(
          hslContrastRatio(accentBg, accentFg) >= 3.5,
          `${style.id} dark=${dark} sidebar-accent contrast too low`,
        );
        // Chrome tokens present for theme.css
        assert.ok(vars["--buzz-muted-foreground"]);
        assert.ok(vars["--buzz-chrome-foreground"]);
        assert.ok(vars["--buzz-nav-fg"]);
      }
    }
  });

  it("each style returns independent copies", () => {
    for (const style of SHELL_STYLES) {
      const a = getShellStyleVars(style.id, false);
      const b = getShellStyleVars(style.id, false);
      a["--primary"] = "mutated";
      assert.notEqual(b["--primary"], "mutated");
      assert.ok(a["--sidebar-background"]);
      assert.ok(a["--primary"]);
      assert.ok(style.swatch.startsWith("#"));
      assert.ok(style.accentHex.startsWith("#"));
      assert.ok(
        style.chromeMode === "light" ||
          style.chromeMode === "dark" ||
          style.chromeMode === "pair",
      );
    }
  });
});
