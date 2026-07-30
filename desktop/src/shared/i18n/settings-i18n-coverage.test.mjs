/**
 * Path coverage for TIA-423: every Settings section reachable from
 * `renderSettingsSection` must localize user-visible copy via useI18n/t(),
 * and required bilingual keys must exist.
 *
 * SETTINGS_RENDER_PATHS mirrors the imports + switch cases in SettingsPanels.tsx
 * rather than a hand-curated residual list.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { messages, translate } from "./messages.ts";

const here = dirname(fileURLToPath(import.meta.url));
const desktopSrc = join(here, "../..");

/**
 * All component entry files actually rendered by `renderSettingsSection`
 * (and nested Settings section children that ship owner-visible copy).
 */
const SETTINGS_RENDER_PATHS = [
  // renderSettingsSection direct targets
  "features/settings/ui/ProfileSettingsCard.tsx",
  "features/settings/ui/NotificationSettingsCard.tsx",
  "features/settings/ui/ExperimentalFeaturesCard.tsx",
  "features/settings/ui/PreventSleepSettingsCard.tsx",
  "features/settings/ui/HarnessesSettingsPanel.tsx",
  "features/settings/ui/AgentDefaultsSettingsCard.tsx",
  "features/agents/ui/AgentDefaultsEditor.tsx",
  "features/settings/ui/ChannelTemplatesSettingsCard.tsx",
  "features/mesh-compute/ui/MeshComputeSettingsCard.tsx",
  "features/settings/ui/SettingsPanels.tsx", // ThemeSettingsCard / appearance
  "features/settings/ui/KeyboardShortcutsCard.tsx",
  "features/settings/ui/HostedCommunitiesSettingsCard.tsx",
  "features/community-members/ui/CommunityMembersSettingsCard.tsx",
  "features/settings/ui/ModerationQueueCard.tsx",
  "features/custom-emoji/ui/CustomEmojiSettingsCard.tsx",
  "features/local-archive/ui/LocalArchiveSettingsCard.tsx",
  "features/settings/ui/MobilePairingCard.tsx",
  "features/settings/UpdateChecker.tsx",
  // nested settings UI
  "features/settings/ui/CustomHarnessForm.tsx",
  "features/settings/ui/HarnessCatalogDialog.tsx",
  "features/settings/ui/HarnessRow.tsx",
  "features/settings/ui/SignOutSection.tsx",
  "features/settings/ui/SendFeedbackDialog.tsx",
  "features/settings/UpdateIndicator.tsx",
  "features/settings/SidebarUpdateCard.tsx",
  "features/settings/ui/SoundPicker.tsx",
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
  // Round 2 residual
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
  // Round 3 residual (QA 18:13)
  "Keep addressed agents active",
  "Keep awake while agents are active",
  "Waiting for agents to start",
  "Sleep prevention expired after 1 hour",
  "Default harness",
  "Select a harness",
  "Save defaults",
  "Couldn't load agent defaults",
  "Couldn't save.",
  "Choose an image file for custom emoji.",
  "Failed to upload emoji image.",
  "Failed to add emoji.",
  "Failed to remove emoji.",
  "Custom emoji",
  "Upload an image",
  "Choose different image",
  "Upload image",
  "Give it a name",
  "Save emoji",
  "Local archive",
  "Save copies of relay messages to a local SQLite database",
  "Archive subscription created.",
  "Archive subscription removed.",
  "Observer feed archive enabled.",
  "Agent turn metric archive enabled.",
  "Share compute",
  "Share this machine with your relay",
  "Couldn't check shared compute",
  "Already installed on this machine:",
  "Manage members and community access.",
  "Search members",
  "Invite to community",
  "Made community admin",
  "Remove from community",
  "Couldn't update this community member.",
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
  // Round 3 paths
  "settings.agents.persistentAudience",
  "settings.agents.preventSleep",
  "settings.agentDefaults.defaultHarness",
  "settings.agentDefaults.saveDefaults",
  "settings.customEmoji.title",
  "settings.customEmoji.toast.chooseImage",
  "settings.localArchive.title",
  "settings.localArchive.toast.created",
  "settings.compute.title",
  "settings.compute.shareMachine",
  "settings.members.title",
  "settings.members.search",
  "settings.shortcuts.cat.Navigation",
  "settings.shortcuts.item.quick-search.label",
  "settings.experiments.feature.workflows.name",
  "settings.sound.previewAria",
];

function isCommentOrDocLine(line) {
  const trimmed = line.trimStart();
  return (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("/**")
  );
}

describe("settings i18n path coverage (TIA-423)", () => {
  it("required path keys exist in en and zh with real translations", () => {
    const allowSame = new Set([
      "appearance.shell.persona5max",
      "appearance.shell.persona5",
      "settings.customEmoji.namePlaceholder",
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

  it("renderSettingsSection entry sources do not hard-code QA residual English", () => {
    for (const rel of SETTINGS_RENDER_PATHS) {
      const src = readFileSync(join(desktopSrc, rel), "utf8");
      for (const literal of FORBIDDEN_LITERALS) {
        const lines = src.split("\n");
        const offenders = lines.filter(
          (line) =>
            line.includes(literal) &&
            !isCommentOrDocLine(line) &&
            !line.includes("FORBIDDEN") &&
            // English fallback map for non-UI export is allowed
            !line.includes("FEEDBACK_CATEGORY_LABELS") &&
            // Typed confirmation phrase constant is intentionally English
            !line.includes("SIGNOUT_CONFIRM_PHRASE") &&
            // settingsSections descriptor labels are not the live nav labels
            // (SettingsView uses SETTINGS_SECTION_LABEL_KEYS + t())
            !line.includes('label: "') &&
            // Kind group English labels remain as stable keys in data modules
            !rel.includes("localArchiveKinds"),
        );
        assert.equal(
          offenders.length,
          0,
          `${rel} still hard-codes ${JSON.stringify(literal)}:\n${offenders.join("\n")}`,
        );
      }
    }
  });

  it("renderSettingsSection entry sources call useI18n / t for localization", () => {
    // ThemeSettingsCard lives inside SettingsPanels and already uses useI18n.
    // Nested pure logic files are not in SETTINGS_RENDER_PATHS.
    for (const rel of SETTINGS_RENDER_PATHS) {
      const src = readFileSync(join(desktopSrc, rel), "utf8");
      assert.match(src, /useI18n/, `${rel} must use useI18n`);
      assert.match(src, /\bt\(/, `${rel} must call t(`);
    }
  });

  it("SettingsPanels renderSettingsSection switch covers declared sections", () => {
    const panels = readFileSync(
      join(desktopSrc, "features/settings/ui/SettingsPanels.tsx"),
      "utf8",
    );
    const sectionMatch = panels.match(
      /export type SettingsSection =\s*([\s\S]*?);/,
    );
    assert.ok(sectionMatch, "SettingsSection type present");
    const sectionIds = [...sectionMatch[1].matchAll(/"([^"]+)"/g)].map(
      (m) => m[1],
    );
    assert.ok(sectionIds.length >= 14, "expected full section set");
    for (const id of sectionIds) {
      assert.match(
        panels,
        new RegExp(`case "${id}"`),
        `renderSettingsSection missing case for ${id}`,
      );
    }
  });
});
