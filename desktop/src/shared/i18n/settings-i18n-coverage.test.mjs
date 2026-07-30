/**
 * Path coverage: settings cards flagged by TIA-423 QA must not ship
 * hard-coded English for user-visible labels / toast / dialog strings.
 * Also assert bilingual keys exist for those paths.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { messages, translate } from "./messages.ts";

const here = dirname(fileURLToPath(import.meta.url));
const desktopSrc = join(here, "../..");

const SETTINGS_PATHS = [
  "features/settings/ui/ChannelTemplatesSettingsCard.tsx",
  "features/settings/ui/MobilePairingCard.tsx",
  "features/settings/ui/HostedCommunitiesSettingsCard.tsx",
  "features/settings/ui/ModerationQueueCard.tsx",
  "features/settings/ui/SettingsPanels.tsx",
];

/** Strings QA listed as still hard-coded on exact 662d0464. */
const FORBIDDEN_LITERALS = [
  "Failed to duplicate",
  "Failed to delete",
  "Edit template",
  "Create template",
  "Update this channel template configuration.",
  "Save a reusable channel configuration.",
  "Pair mobile device",
  "Verify the security code matches your mobile device.",
  "Your mobile device is now paired.",
  "Securely sending your identity to the mobile app.",
  "Sign in with Builderlab",
  "Connect Buzz identity",
  "Switch to this device's identity",
  "Delete content",
  "Kick author",
  "Ban author",
  "Time out author",
  "Report dismissed",
  "Report resolved",
  "Failed to resolve the report",
  "Loading reports…",
  "Loading audit log…",
  "Checking access…",
  "Buzz Dark (Raft)",
  "Buzz (Raft)",
  "Could not load communities.",
  "Could not resolve the message author.",
  "Transfer ownership",
  "No templates yet. Create one to save a reusable channel configuration.",
  "Pairing took too long. Try again.",
  "Sign in to manage hosted communities",
];

const REQUIRED_KEYS = [
  "appearance.theme.buzzRaft",
  "appearance.theme.buzzDarkRaft",
  "appearance.shell.persona5max",
  "settings.channelTemplates.createTitle",
  "settings.channelTemplates.toast.duplicated",
  "settings.mobile.pairTitle",
  "settings.mobile.error.timeout",
  "settings.hosted.signInBuilderlab",
  "settings.hosted.connectIdentity",
  "settings.hosted.transferTitle",
  "settings.moderation.action.delete",
  "settings.moderation.toast.dismissed",
  "settings.moderation.err.noChannel",
];

describe("settings i18n path coverage (TIA-423)", () => {
  it("required path keys exist in en and zh with real translations", () => {
    // Brand/theme product names may stay identical across locales.
    const allowSame = new Set([
      "appearance.shell.persona5max",
      "appearance.shell.persona5",
    ]);
    for (const key of REQUIRED_KEYS) {
      assert.ok(key in messages.en, `missing en key ${key}`);
      assert.ok(key in messages.zh, `missing zh key ${key}`);
      if (!allowSame.has(key)) {
        assert.notEqual(
          messages.en[key],
          messages.zh[key],
          `en/zh must differ for ${key}`,
        );
      }
      assert.equal(translate(key, "en"), messages.en[key]);
      assert.equal(translate(key, "zh"), messages.zh[key]);
    }
  });

  it("flagged settings sources do not hard-code QA residual English", () => {
    for (const rel of SETTINGS_PATHS) {
      const src = readFileSync(join(desktopSrc, rel), "utf8");
      for (const literal of FORBIDDEN_LITERALS) {
        // Allow the forbidden English only if it appears inside a comment line.
        const lines = src.split("\n");
        const offenders = lines.filter(
          (line) =>
            line.includes(literal) &&
            !line.trimStart().startsWith("//") &&
            !line.trimStart().startsWith("*") &&
            !line.includes("FORBIDDEN"),
        );
        assert.equal(
          offenders.length,
          0,
          `${rel} still hard-codes ${JSON.stringify(literal)}:\n${offenders.join("\n")}`,
        );
      }
    }
  });

  it("flagged settings sources call useI18n / t for localization", () => {
    for (const rel of SETTINGS_PATHS) {
      const src = readFileSync(join(desktopSrc, rel), "utf8");
      assert.match(src, /useI18n/, `${rel} must use useI18n`);
      assert.match(src, /\bt\(/, `${rel} must call t(`);
    }
  });
});
