/**
 * Path coverage: Settings sections for TIA-423 must not ship hard-coded
 * English for user-visible labels / toast / dialog strings, and required
 * bilingual keys must exist.
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
  "features/settings/ui/NotificationSettingsCard.tsx",
  "features/settings/ui/ProfileSettingsCard.tsx",
  "features/settings/ui/SignOutSection.tsx",
  "features/settings/ui/SendFeedbackDialog.tsx",
  "features/settings/ui/HarnessesSettingsPanel.tsx",
  "features/settings/ui/CustomHarnessForm.tsx",
  "features/settings/ui/HarnessCatalogDialog.tsx",
  "features/settings/ui/HarnessRow.tsx",
  "features/settings/UpdateChecker.tsx",
  "features/settings/UpdateIndicator.tsx",
  "features/settings/SidebarUpdateCard.tsx",
];

/** Residual English QA flagged across rework rounds (must not appear live). */
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
  // Round 2 residual (9e26c293 QA)
  "Desktop alerts",
  "Notify while viewing",
  "Home badge",
  "Requesting...",
  "Check for Updates",
  "Checking for updates...",
  "You're on the latest version.",
  "Update Now",
  "Download Update",
  "Update available",
  "Ready to update!",
  "Send feedback",
  "Attach diagnostics",
  "Attach image",
  "Sign out and wipe all data?",
  "Delete My Data",
  "I have saved my private key somewhere safe.",
  "Profile info",
  "Edit profile photo",
  "Add runtimes",
  "System prerequisites",
  "Your runtimes",
  "Check again",
  "Found on PATH",
  "Not found on PATH",
  "Edit harness",
  "Add custom harness",
  "Custom harness",
  "No runtimes match.",
  "Already set up",
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
  "settings.notifications.desktopAlerts",
  "settings.notifications.slot.dm",
  "settings.profile.profileInfo",
  "settings.signOut.deleteData",
  "settings.feedback.send",
  "settings.harness.addRuntimes",
  "settings.updates.check",
  "settings.updates.sidebar.readyTitle",
];

describe("settings i18n path coverage (TIA-423)", () => {
  it("required path keys exist in en and zh with real translations", () => {
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

  it("en/zh message tables have matching keys", () => {
    const enKeys = Object.keys(messages.en).sort();
    const zhKeys = Object.keys(messages.zh).sort();
    assert.deepEqual(enKeys, zhKeys, "en/zh key parity");
  });

  it("flagged settings sources do not hard-code QA residual English", () => {
    for (const rel of SETTINGS_PATHS) {
      const src = readFileSync(join(desktopSrc, rel), "utf8");
      for (const literal of FORBIDDEN_LITERALS) {
        const lines = src.split("\n");
        const offenders = lines.filter(
          (line) =>
            line.includes(literal) &&
            !line.trimStart().startsWith("//") &&
            !line.trimStart().startsWith("*") &&
            !line.includes("FORBIDDEN") &&
            // English fallback map for non-UI export is allowed
            !line.includes("FEEDBACK_CATEGORY_LABELS") &&
            // Typed confirmation phrase constant is intentionally English
            !line.includes("SIGNOUT_CONFIRM_PHRASE"),
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
