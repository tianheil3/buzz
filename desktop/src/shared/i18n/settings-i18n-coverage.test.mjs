/**
 * Path coverage for TIA-423: every Settings section reachable from
 * `renderSettingsSection` must localize user-visible copy via useI18n/t(),
 * and required bilingual keys must exist.
 *
 * SETTINGS_RENDER_PATHS mirrors the imports + switch cases in SettingsPanels.tsx
 * plus nested Settings UI that ships owner-visible copy.
 *
 * In addition to residual forbidden-literal lists, this suite scans each entry
 * for direct UI string attributes / JSX text / raw error.message leaks.
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
  // Round 4 residual (QA 20:26) — full UI phrases only (avoid key-id false positives)
  "Add argument",
  "Add env var",
  "north-star",
  "npub1…",
  "my-runtime",
  "my-agent-bin",
  "https://example.com/docs",
  "npm install -g my-harness",
];

const REQUIRED_KEYS = [
  "appearance.theme.buzzRaft",
  "appearance.theme.buzzDarkRaft",
  "appearance.shell.persona5max",
  "appearance.accent.neutral",
  "appearance.accent.blue",
  "settings.channelTemplates.createTitle",
  "settings.channelTemplates.toast.duplicated",
  "settings.mobile.pairTitle",
  "settings.mobile.error.timeout",
  "settings.hosted.signInBuilderlab",
  "settings.hosted.connectIdentity",
  "settings.hosted.transferTitle",
  "settings.hosted.namePlaceholder",
  "settings.hosted.npubPlaceholder",
  "settings.moderation.action.delete",
  "settings.moderation.toast.dismissed",
  "settings.moderation.err.noChannel",
  "settings.moderation.err.loadReports",
  "settings.moderation.err.loadAudit",
  "settings.notifications.desktopAlerts",
  "settings.notifications.slot.dm",
  "settings.profile.profileInfo",
  "settings.profile.err.load",
  "settings.profile.err.save",
  "settings.signOut.deleteData",
  "settings.feedback.send",
  "settings.harness.addRuntimes",
  "settings.harness.addArgument",
  "settings.harness.addEnvVar",
  "settings.harness.argPlaceholder",
  "settings.harness.installingAria",
  "settings.harness.connectingAria",
  "settings.harness.err.load",
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
  "settings.members.err.load",
  "settings.shortcuts.cat.Navigation",
  "settings.shortcuts.item.quick-search.label",
  "settings.experiments.feature.workflows.name",
  "settings.sound.previewAria",
];

/** Keys whose en/zh values are intentionally identical (brand / protocol samples). */
const ALLOW_SAME_EN_ZH = new Set([
  "appearance.shell.persona5max",
  "appearance.shell.persona5",
  "settings.customEmoji.namePlaceholder",
  "settings.hosted.namePlaceholder",
  "settings.hosted.npubPlaceholder",
  "settings.harness.idPlaceholder",
  "settings.harness.commandPlaceholder",
  "settings.harness.docsUrlPlaceholder",
  "settings.harness.installHintPlaceholder",
]);

function isCommentOrDocLine(line) {
  const trimmed = line.trimStart();
  return (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("/**")
  );
}

function isAllowedHardcodedAttr(line) {
  return (
    line.includes("data-testid") ||
    line.includes("data-") ||
    line.includes("SIGNOUT_CONFIRM_PHRASE") ||
    line.includes("FORBIDDEN") ||
    line.includes("FEEDBACK_CATEGORY_LABELS") ||
    // typed confirmation / stable test ids may keep English constants
    line.includes("htmlFor=") ||
    line.includes("id=") ||
    line.includes("type=") ||
    line.includes("name=") ||
    line.includes("autoComplete=") ||
    line.includes("role=") ||
    line.includes("href=") ||
    line.includes("src=") ||
    line.includes("to=") ||
    line.includes("key=")
  );
}

/**
 * Detect direct user-visible string attributes that bypass t().
 * Catches: placeholder="…", title="…", aria-label="…", and
 * template-literal forms without t( such as `arg ${i}`.
 */
function findHardcodedUiAttrs(src) {
  const offenders = [];
  const lines = src.split("\n");
  const attrRe =
    /\b(placeholder|title|aria-label|aria-description|aria-placeholder)\s*=\s*(["'`])([\s\S]*?)\2/g;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isCommentOrDocLine(line) || isAllowedHardcodedAttr(line)) continue;
    // static quoted attribute
    for (const m of line.matchAll(
      /\b(placeholder|title|aria-label|aria-description)\s*=\s*(["'])([^"']+)\2/g,
    )) {
      const value = m[3].trim();
      if (!value) continue;
      // pure symbols / numbers / CSS-ish only
      if (!/[A-Za-z\u4e00-\u9fff]/.test(value)) continue;
      offenders.push(`${i + 1}: ${line.trim()}`);
    }
    // template literal without t( on the same line — e.g. `arg ${i+1}`
    if (
      /\b(placeholder|title|aria-label|aria-description)\s*=\s*\{`/.test(line) &&
      !line.includes("t(")
    ) {
      offenders.push(`${i + 1}: ${line.trim()}`);
    }
    void attrRe;
  }
  return offenders;
}

/**
 * Detect JSX text children that look like English UI sentences/buttons.
 * e.g. >Add argument</Button>
 */
function findHardcodedJsxText(src) {
  const offenders = [];
  const lines = src.split("\n");
  const re = />([A-Z][A-Za-z0-9][A-Za-z0-9 ,.'’!?:;()/%+\-]{1,})</g;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isCommentOrDocLine(line)) continue;
    // skip type annotations / generics noise
    if (line.includes("extends ") || line.includes("import ")) continue;
    for (const m of line.matchAll(re)) {
      const text = m[1].trim();
      // skip short technical tokens (IDs, single words that are keys)
      if (text.length < 3) continue;
      if (/^[A-Z][a-z]+[A-Z]/.test(text)) continue; // CamelCase identifiers
      if (/^(Error|React|HTML|URL|JSON|ACP|PATH|ID)$/.test(text)) continue;
      offenders.push(`${i + 1}: ${line.trim()}`);
    }
  }
  return offenders;
}

/** Raw Error.message must not be rendered as Settings UI copy. */
function findErrorMessageLeaks(src) {
  const offenders = [];
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isCommentOrDocLine(line)) continue;
    // allow reading message for control-flow mapping (includes / startsWith) only
    // when not used as UI value — still ban common UI patterns.
    if (
      /\.error\.message\b/.test(line) ||
      (/\berror\.message\b/.test(line) &&
        (line.includes("toast.") ||
          line.includes("setError") ||
          line.includes("setInstall") ||
          line.includes("{error.message}") ||
          line.includes("? error.message") ||
          line.includes(": error.message")))
    ) {
      // timeout mapping that only inspects message is OK if not returned
      if (
        line.includes(".includes(") ||
        line.includes(".toLowerCase()") ||
        line.includes("message.toLowerCase")
      ) {
        continue;
      }
      offenders.push(`${i + 1}: ${line.trim()}`);
    }
  }
  return offenders;
}

describe("settings i18n path coverage (TIA-423)", () => {
  it("required path keys exist in en and zh with real translations", () => {
    for (const key of REQUIRED_KEYS) {
      assert.ok(key in messages.en, `missing en key ${key}`);
      assert.ok(key in messages.zh, `missing zh key ${key}`);
      if (!ALLOW_SAME_EN_ZH.has(key)) {
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
            !rel.includes("localArchiveKinds") &&
            // message table values live only in messages.ts, not here
            !line.includes("messages."),
        );
        assert.equal(
          offenders.length,
          0,
          `${rel} still hard-codes ${JSON.stringify(literal)}:\n${offenders.join("\n")}`,
        );
      }
    }
  });

  it("nested Settings UI has no direct hardcoded UI attributes", () => {
    for (const rel of SETTINGS_RENDER_PATHS) {
      const src = readFileSync(join(desktopSrc, rel), "utf8");
      const offenders = findHardcodedUiAttrs(src);
      assert.equal(
        offenders.length,
        0,
        `${rel} has hardcoded UI attrs (use t()):\n${offenders.join("\n")}`,
      );
    }
  });

  it("nested Settings UI has no direct English JSX text children", () => {
    for (const rel of SETTINGS_RENDER_PATHS) {
      const src = readFileSync(join(desktopSrc, rel), "utf8");
      const offenders = findHardcodedJsxText(src);
      assert.equal(
        offenders.length,
        0,
        `${rel} has hardcoded JSX text (use t()):\n${offenders.join("\n")}`,
      );
    }
  });

  it("Settings paths do not surface raw error.message as UI copy", () => {
    for (const rel of SETTINGS_RENDER_PATHS) {
      const src = readFileSync(join(desktopSrc, rel), "utf8");
      const offenders = findErrorMessageLeaks(src);
      assert.equal(
        offenders.length,
        0,
        `${rel} leaks error.message into UI (use t() fallback):\n${offenders.join("\n")}`,
      );
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
