import { Archive, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  createSaveSubscription,
  deleteSaveSubscription,
  listSaveSubscriptions,
  mergeSaveSubscriptionKinds,
  removeSaveSubscriptionKind,
  type SaveSubscription,
  type ScopeType,
} from "@/shared/api/tauriArchive";
import {
  KIND_AGENT_OBSERVER_FRAME,
  KIND_AGENT_TURN_METRIC,
} from "@/shared/constants/kinds";
import { useChannelsQuery } from "@/features/channels/hooks";
import { useIdentityQuery } from "@/shared/api/hooks";
import { type MsgKey, useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Switch } from "@/shared/ui/switch";
import {
  SettingsOptionGroup,
  SettingsOptionRow,
} from "@/features/settings/ui/SettingsOptionGroup";
import { SettingsSectionHeader } from "@/features/settings/ui/SettingsSectionHeader";
import { observerArchiveDefaultEnabled } from "@/shared/api/tauriArchive";
import { setExplicitAgentMetricArchiveChoice } from "../agentMetricArchivePreference";

import {
  buildSubscriptionRequest,
  isGroupFullyChecked,
  isGroupIndeterminate,
  KIND_GROUPS,
  parseCustomKinds,
  toggleGroup,
  toggleKind,
} from "./localArchiveKinds";

// ── Helpers ───────────────────────────────────────────────────────────────────

type Translate = (key: MsgKey, vars?: Record<string, string | number>) => string;

function scopeLabel(
  sub: SaveSubscription,
  channelNameById: Map<string, string>,
  t: Translate,
): string {
  if (sub.scopeType === "channel_h") {
    return channelNameById.get(sub.scopeValue) ?? sub.scopeValue;
  }
  if (sub.scopeType === "owner_p") {
    if (sub.kinds.includes(KIND_AGENT_TURN_METRIC)) {
      return t("settings.localArchive.scope.metrics");
    }
    return t("settings.localArchive.scope.frames");
  }
  return sub.scopeValue;
}

function kindSummary(kinds: number[], t: Translate): string {
  if (kinds.length === 0) return t("settings.localArchive.kindSummaryNone");
  if (kinds.length <= 4) return kinds.join(", ");
  return t("settings.localArchive.kindSummaryMore", {
    head: kinds.slice(0, 3).join(", "),
    n: kinds.length - 3,
  });
}

const GROUP_LABEL_KEYS: Record<string, MsgKey> = {
  "Messages & posts": "settings.localArchive.group.messages",
  "Reactions, edits & deletions": "settings.localArchive.group.aux",
  "Huddle events": "settings.localArchive.group.huddle",
  "System messages": "settings.localArchive.group.system",
};

const KIND_LABEL_KEYS: Record<string, MsgKey> = {
  "Message diffs (kind 40008)": "settings.localArchive.kind.messageDiffs",
  "Huddle started": "settings.localArchive.kind.huddleStarted",
  "Participant joined": "settings.localArchive.kind.participantJoined",
  "Participant left": "settings.localArchive.kind.participantLeft",
  "Huddle ended": "settings.localArchive.kind.huddleEnded",
  "System messages (kind 40099)": "settings.localArchive.kind.systemMessages",
  "Event deletions (kind 5)": "settings.localArchive.kind.deletions",
  "Reactions (kind 7)": "settings.localArchive.kind.reactions",
  "Stream messages (kind 9)": "settings.localArchive.kind.streamMessages",
  "Buzz-native deletions (kind 9005)": "settings.localArchive.kind.buzzDeletions",
  "Stream messages v2 (kind 40002)": "settings.localArchive.kind.streamV2",
  "Message edits (kind 40003)": "settings.localArchive.kind.messageEdits",
  "Forum posts (kind 45001)": "settings.localArchive.kind.forumPosts",
  "Forum comments (kind 45003)": "settings.localArchive.kind.forumComments",
};

function translateGroupLabel(label: string, t: Translate): string {
  const key = GROUP_LABEL_KEYS[label];
  return key ? t(key) : label;
}

function translateKindLabel(label: string, t: Translate): string {
  const key = KIND_LABEL_KEYS[label];
  if (key) return t(key);
  const m = /^Kind (\d+)$/.exec(label);
  if (m) return t("settings.localArchive.kind.generic", { kind: m[1] });
  return label;
}

// ── Observer-feed archive section ─────────────────────────────────────────────

type ObserverSectionProps = {
  enabled: boolean;
  policy: boolean | undefined;
  toggling: boolean;
  onToggle: (checked: boolean) => void;
};

function ObserverArchiveSection({
  enabled,
  policy,
  toggling,
  onToggle,
}: ObserverSectionProps) {
  const { t } = useI18n();
  const toggleDisabled = toggling || policy === undefined || policy === true;
  return (
    <div className="space-y-3" data-testid="local-archive-observer-section">
      <h2 className="text-lg font-semibold tracking-tight">
        {t("settings.localArchive.observerTitle")}
      </h2>
      <SettingsOptionGroup>
        <SettingsOptionRow>
          <div className="min-w-0 flex-1">
            <label
              className="text-sm font-medium"
              htmlFor="local-archive-observer-toggle"
            >
              {t("settings.localArchive.observerLabel")}
            </label>
            <p className="text-sm font-normal text-muted-foreground">
              {policy === true
                ? t("settings.localArchive.observerDescAlways", {
                    kind: KIND_AGENT_OBSERVER_FRAME,
                  })
                : t("settings.localArchive.observerDesc", {
                    kind: KIND_AGENT_OBSERVER_FRAME,
                  })}
            </p>
          </div>
          <Switch
            checked={enabled}
            data-testid="local-archive-observer-toggle"
            disabled={toggleDisabled}
            id="local-archive-observer-toggle"
            onCheckedChange={onToggle}
          />
        </SettingsOptionRow>
      </SettingsOptionGroup>
    </div>
  );
}

// ── Agent-turn-metric archive section ────────────────────────────────────────

type AgentMetricSectionProps = {
  enabled: boolean;
  toggling: boolean;
  onToggle: (checked: boolean) => void;
};

function AgentMetricArchiveSection({
  enabled,
  toggling,
  onToggle,
}: AgentMetricSectionProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-3" data-testid="local-archive-agent-metric-section">
      <h2 className="text-lg font-semibold tracking-tight">
        {t("settings.localArchive.metricTitle")}
      </h2>
      <SettingsOptionGroup>
        <SettingsOptionRow>
          <div className="min-w-0 flex-1">
            <label
              className="text-sm font-medium"
              htmlFor="local-archive-agent-metric-toggle"
            >
              {t("settings.localArchive.metricLabel")}
            </label>
            <p className="text-sm font-normal text-muted-foreground">
              {t("settings.localArchive.metricDesc", {
                kind: KIND_AGENT_TURN_METRIC,
              })}
            </p>
          </div>
          <Switch
            checked={enabled}
            data-testid="local-archive-agent-metric-toggle"
            disabled={toggling}
            id="local-archive-agent-metric-toggle"
            onCheckedChange={onToggle}
          />
        </SettingsOptionRow>
      </SettingsOptionGroup>
    </div>
  );
}

// ── Add-subscription form ─────────────────────────────────────────────────────

type KindChecklistProps = {
  checkedKinds: ReadonlySet<number>;
  onChange: (next: Set<number>) => void;
};

function KindChecklist({ checkedKinds, onChange }: KindChecklistProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      {KIND_GROUPS.map((group) => {
        const fullyChecked = isGroupFullyChecked(group, checkedKinds);
        const indeterminate = isGroupIndeterminate(group, checkedKinds);
        return (
          <div key={group.label}>
            {/* Group header */}
            <div className="mb-1.5 flex items-center gap-2">
              <Checkbox
                checked={indeterminate ? "indeterminate" : fullyChecked}
                data-testid={`local-archive-group-${group.label}`}
                id={`local-archive-group-${group.label}`}
                onCheckedChange={() =>
                  onChange(toggleGroup(group, checkedKinds))
                }
              />
              <label
                className="cursor-pointer text-sm font-medium"
                htmlFor={`local-archive-group-${group.label}`}
              >
                {translateGroupLabel(group.label, t)}
              </label>
            </div>
            {/* Individual kind checkboxes */}
            <div className="ml-6 space-y-1.5">
              {group.items.map(({ kind, label }) => (
                <div key={kind} className="flex items-center gap-2">
                  <Checkbox
                    checked={checkedKinds.has(kind)}
                    data-testid={`local-archive-kind-${kind}`}
                    id={`local-archive-kind-${kind}`}
                    onCheckedChange={() =>
                      onChange(toggleKind(kind, checkedKinds))
                    }
                  />
                  <label
                    className="cursor-pointer text-sm text-muted-foreground"
                    htmlFor={`local-archive-kind-${kind}`}
                  >
                    {translateKindLabel(label, t)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Custom kinds input ────────────────────────────────────────────────────────

type CustomKindsInputProps = {
  value: string;
  onChange: (raw: string) => void;
};

function CustomKindsInput({ value, onChange }: CustomKindsInputProps) {
  const { t } = useI18n();
  const { invalid } = parseCustomKinds(value);
  const hasInvalid = invalid.length > 0;
  return (
    <div>
      <label
        className="mb-1.5 block text-sm font-medium"
        htmlFor="local-archive-custom-kinds"
      >
        {t("settings.localArchive.customKinds")}
      </label>
      <input
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-testid="local-archive-custom-kinds"
        id="local-archive-custom-kinds"
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("settings.localArchive.customKindsPlaceholder")}
        type="text"
        value={value}
      />
      <p className="mt-1 text-xs text-muted-foreground">
        {t("settings.localArchive.customKindsHint")}
      </p>
      {hasInvalid && (
        <p
          className="mt-1 text-xs text-destructive"
          data-testid="local-archive-custom-kinds-error"
        >
          {t("settings.localArchive.customKindsInvalid")}{" "}
          {invalid.map((tok, i) => (
            <React.Fragment key={tok}>
              {i > 0 && ", "}
              <code className="font-mono">{tok}</code>
            </React.Fragment>
          ))}
        </p>
      )}
    </div>
  );
}

// ── Add-subscription form (Steps 1 + 2) ──────────────────────────────────────

type AddFormProps = {
  channels: Array<{ id: string; name: string }>;
  onSaved: () => void;
  onCancel: () => void;
};

function AddSubscriptionForm({ channels, onSaved, onCancel }: AddFormProps) {
  const { t } = useI18n();
  const [selectedChannelId, setSelectedChannelId] = React.useState("");
  const [checkedKinds, setCheckedKinds] = React.useState<Set<number>>(
    new Set(),
  );
  const [customKindsRaw, setCustomKindsRaw] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);

  const { valid: customKinds } = parseCustomKinds(customKindsRaw);
  const request = buildSubscriptionRequest(
    "channel_h",
    selectedChannelId,
    checkedKinds,
    customKinds,
  );
  const canAdd = request !== null;

  const handleAdd = React.useCallback(async () => {
    if (request === null) return;

    setIsAdding(true);
    try {
      await createSaveSubscription(
        request.scopeType,
        request.scopeValue,
        request.kinds,
      );
      onSaved();
      toast.success(t("settings.localArchive.toast.created"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("settings.localArchive.toast.createFailed"),
      );
    } finally {
      setIsAdding(false);
    }
  }, [request, onSaved, t]);

  const handleCancel = () => {
    setSelectedChannelId("");
    setCheckedKinds(new Set());
    setCustomKindsRaw("");
    onCancel();
  };

  return (
    <SettingsOptionGroup>
      <div className="space-y-5 px-4 py-4">
        {/* Channel picker */}
        <div>
          <label
            className="mb-1.5 block text-sm font-medium"
            htmlFor="local-archive-channel-select"
          >
            {t("settings.localArchive.channel")}
          </label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-testid="local-archive-channel-select"
            id="local-archive-channel-select"
            onChange={(e) => setSelectedChannelId(e.target.value)}
            value={selectedChannelId}
          >
            <option value="">{t("settings.localArchive.selectChannel")}</option>
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name}
              </option>
            ))}
          </select>
        </div>

        {/* Event types (per-kind checklist) */}
        <div>
          <p className="mb-3 text-sm font-medium">{t("settings.localArchive.eventTypes")}</p>
          <KindChecklist
            checkedKinds={checkedKinds}
            onChange={setCheckedKinds}
          />
        </div>

        {/* Advanced: custom kinds */}
        <CustomKindsInput onChange={setCustomKindsRaw} value={customKindsRaw} />

        <div className="flex justify-end gap-2">
          <Button
            disabled={isAdding}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            {t("common.cancel")}
          </Button>
          <Button
            data-testid="local-archive-confirm-add"
            disabled={isAdding || !canAdd}
            onClick={() => void handleAdd()}
            type="button"
          >
            {isAdding ? t("settings.channelTemplates.saving") : t("common.save")}
          </Button>
        </div>
      </div>
    </SettingsOptionGroup>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function LocalArchiveSettingsCard() {
  const { t } = useI18n();
  const identityQuery = useIdentityQuery();
  const channelsQuery = useChannelsQuery();
  const [subs, setSubs] = React.useState<SaveSubscription[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deletingKey, setDeletingKey] = React.useState<string | null>(null);
  const [isAddingOpen, setIsAddingOpen] = React.useState(false);
  const [observerToggling, setObserverToggling] = React.useState(false);
  const [metricToggling, setMetricToggling] = React.useState(false);
  const [observerPolicy, setObserverPolicy] = React.useState<
    boolean | undefined
  >(undefined);

  React.useEffect(() => {
    observerArchiveDefaultEnabled()
      .then((on) => setObserverPolicy(on))
      .catch(() => {
        // Fail closed: leave as undefined so toggle stays disabled.
      });
  }, []);

  const pubkey = identityQuery.data?.pubkey ?? "";

  const channelNameById = React.useMemo<Map<string, string>>(() => {
    const map = new Map<string, string>();
    for (const ch of channelsQuery.data ?? []) {
      map.set(ch.id, ch.name);
    }
    return map;
  }, [channelsQuery.data]);

  const joinedChannels = React.useMemo(
    () => (channelsQuery.data ?? []).filter((ch) => ch.isMember),
    [channelsQuery.data],
  );

  const reload = React.useCallback(async () => {
    try {
      const rows = await listSaveSubscriptions();
      setSubs(rows);
    } catch (err) {
      console.warn("[LocalArchiveSettingsCard] list failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const handleDelete = React.useCallback(
    async (scopeType: ScopeType, scopeValue: string) => {
      const key = `${scopeType}:${scopeValue}`;
      setDeletingKey(key);
      try {
        await deleteSaveSubscription(scopeType, scopeValue);
        await reload();
        toast.success(t("settings.localArchive.toast.removed"));
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : t("settings.localArchive.toast.removeFailed"),
        );
      } finally {
        setDeletingKey(null);
      }
    },
    [reload, t],
  );

  const observerEnabled = subs.some(
    (s) =>
      s.scopeType === "owner_p" && s.kinds.includes(KIND_AGENT_OBSERVER_FRAME),
  );
  const metricEnabled = subs.some(
    (s) =>
      s.scopeType === "owner_p" && s.kinds.includes(KIND_AGENT_TURN_METRIC),
  );

  const handleObserverToggle = React.useCallback(
    async (checked: boolean) => {
      if (!pubkey) return;
      if (!checked && observerPolicy !== false) return;
      setObserverToggling(true);
      try {
        if (checked) {
          await mergeSaveSubscriptionKinds(KIND_AGENT_OBSERVER_FRAME);
        } else {
          await removeSaveSubscriptionKind(KIND_AGENT_OBSERVER_FRAME);
        }
        toast.success(
          checked
            ? t("settings.localArchive.toast.observerOn")
            : t("settings.localArchive.toast.observerOff"),
        );
        await reload();
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : t("settings.localArchive.toast.observerFailed"),
        );
      } finally {
        setObserverToggling(false);
      }
    },
    [pubkey, observerPolicy, reload, t],
  );

  const handleMetricToggle = React.useCallback(
    async (checked: boolean) => {
      if (!pubkey) return;
      setMetricToggling(true);
      try {
        if (checked) {
          await mergeSaveSubscriptionKinds(KIND_AGENT_TURN_METRIC);
        } else {
          await removeSaveSubscriptionKind(KIND_AGENT_TURN_METRIC);
        }
        setExplicitAgentMetricArchiveChoice(pubkey, checked);
        toast.success(
          checked
            ? t("settings.localArchive.toast.metricOn")
            : t("settings.localArchive.toast.metricOff"),
        );
        await reload();
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : t("settings.localArchive.toast.metricFailed"),
        );
      } finally {
        setMetricToggling(false);
      }
    },
    [pubkey, reload, t],
  );

  // Non-owner_p subscriptions shown in the active-subscriptions list.
  // observer (24200) and metric (44200) owner_p subs each have their own
  // dedicated section above.
  const channelSubs = subs.filter((s) => s.scopeType !== "owner_p");

  return (
    <section className="min-w-0" data-testid="settings-local-archive">
      <SettingsSectionHeader
        title={t("settings.localArchive.title")}
        description={t("settings.localArchive.description")}
      />

      <div className="space-y-6">
        {/* Observer-feed archive — dedicated first-class section */}
        <ObserverArchiveSection
          enabled={observerEnabled}
          onToggle={(checked) => void handleObserverToggle(checked)}
          policy={observerPolicy}
          toggling={observerToggling}
        />

        {/* Agent-turn-metric archive — dedicated first-class section */}
        <AgentMetricArchiveSection
          enabled={metricEnabled}
          onToggle={(checked) => void handleMetricToggle(checked)}
          toggling={metricToggling}
        />

        {/* Channel subscriptions */}
        <div className="space-y-3" data-testid="local-archive-subscriptions">
          <h2 className="text-lg font-semibold tracking-tight">
            {channelSubs.length > 0
              ? t("settings.localArchive.channelSubsCount", {
                  count: channelSubs.length,
                })
              : t("settings.localArchive.channelSubs")}
          </h2>
          {isLoading ? (
            <SettingsOptionGroup>
              <div className="px-4 py-3 text-sm font-normal text-muted-foreground">
                {t("common.loading")}
              </div>
            </SettingsOptionGroup>
          ) : channelSubs.length === 0 ? (
            <SettingsOptionGroup>
              <div className="px-4 py-3 text-sm font-normal text-muted-foreground">
                {t("settings.localArchive.noChannelSubs")}
              </div>
            </SettingsOptionGroup>
          ) : (
            <SettingsOptionGroup>
              {channelSubs.map((sub) => {
                const key = `${sub.scopeType}:${sub.scopeValue}`;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 px-4 py-3"
                    data-testid={`local-archive-sub-${key}`}
                  >
                    <Archive className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {scopeLabel(sub, channelNameById, t)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("settings.localArchive.kindsLine", {
                          scopeType: sub.scopeType,
                          kinds: kindSummary(sub.kinds, t),
                        })}
                      </p>
                    </div>
                    <Button
                      aria-label={t("settings.localArchive.removeAria", {
                        name: scopeLabel(sub, channelNameById, t),
                      })}
                      disabled={deletingKey === key}
                      onClick={() =>
                        void handleDelete(sub.scopeType, sub.scopeValue)
                      }
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </SettingsOptionGroup>
          )}
        </div>

        {/* Add channel subscription */}
        <div className="space-y-3" data-testid="local-archive-add">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("settings.localArchive.addChannelSub")}
          </h2>
          {isAddingOpen ? (
            <AddSubscriptionForm
              channels={joinedChannels}
              onCancel={() => setIsAddingOpen(false)}
              onSaved={() => {
                setIsAddingOpen(false);
                void reload();
              }}
            />
          ) : (
            <SettingsOptionGroup>
              <SettingsOptionRow>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {t("settings.localArchive.subscribeTitle")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("settings.localArchive.subscribeDesc")}
                  </p>
                </div>
                <Button
                  data-testid="local-archive-open-add"
                  onClick={() => setIsAddingOpen(true)}
                  size="sm"
                  variant="outline"
                >
                  {t("settings.localArchive.add")}
                </Button>
              </SettingsOptionRow>
            </SettingsOptionGroup>
          )}
        </div>
      </div>
    </section>
  );
}
