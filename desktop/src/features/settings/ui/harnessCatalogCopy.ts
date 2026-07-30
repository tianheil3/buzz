/**
 * Curated one-line descriptions for harness catalog entries.
 *
 * Values are i18n message keys (settings.harness.desc.*). Callers must
 * translate via t()/translate. Content policy: one neutral vendor-sourced
 * category sentence per entry.
 */

const HARNESS_DESCRIPTION_KEYS: Record<string, string> = {
  "buzz-agent": "settings.harness.desc.buzz-agent",
  claude: "settings.harness.desc.claude",
  codex: "settings.harness.desc.codex",
  goose: "settings.harness.desc.goose",
  cursor: "settings.harness.desc.cursor",
  omp: "settings.harness.desc.omp",
  grok: "settings.harness.desc.grok",
  opencode: "settings.harness.desc.opencode",
  kimi: "settings.harness.desc.kimi",
  amp: "settings.harness.desc.amp",
  hermes: "settings.harness.desc.hermes",
  openclaw: "settings.harness.desc.openclaw",
};

/**
 * i18n key for the harness description, or null for uncurated ids.
 */
export function harnessDescription(id: string): string | null {
  return HARNESS_DESCRIPTION_KEYS[id.trim().toLowerCase()] ?? null;
}
