import { setAgentManagedProfiles } from "@/shared/api/tauri";
import { desktopFeatures, useFeatureToggle } from "@/shared/features";
import type { FeatureDefinition } from "@/shared/features";
import { type MsgKey, useI18n } from "@/shared/i18n";
import { Switch } from "@/shared/ui/switch";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

function featureNameKey(id: string): MsgKey {
  return `settings.experiments.feature.${id}.name` as MsgKey;
}

function featureDescKey(id: string): MsgKey {
  return `settings.experiments.feature.${id}.desc` as MsgKey;
}

function FeatureRow({ feature }: { feature: FeatureDefinition }) {
  const { t } = useI18n();
  const [enabled, toggle] = useFeatureToggle(feature.id);
  const switchId = `feature-toggle-${feature.id}`;
  const nameKey = featureNameKey(feature.id);
  const descKey = featureDescKey(feature.id);

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/70 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium" id={`${switchId}-label`}>
          {t(nameKey)}
        </p>
        <p className="text-xs text-muted-foreground">{t(descKey)}</p>
      </div>
      <Switch
        aria-labelledby={`${switchId}-label`}
        checked={enabled}
        data-testid={switchId}
        onCheckedChange={(value) => {
          toggle(value);
          if (feature.id === "agentManagedProfiles") {
            void setAgentManagedProfiles(value).catch((error) => {
              console.error(
                "Failed to apply agent-managed profiles setting:",
                error,
              );
            });
          }
        }}
      />
    </div>
  );
}

export function ExperimentalFeaturesCard() {
  const { t } = useI18n();
  // Manifest is preview-only by definition; every desktop entry is a preview
  // feature.
  const previewFeatures = desktopFeatures;

  return (
    <section className="min-w-0" data-testid="settings-experimental">
      <SettingsSectionHeader
        title={t("settings.experiments.title")}
        description={t("settings.experiments.description")}
      />

      <div className="flex flex-col gap-2">
        {previewFeatures.map((f) => (
          <FeatureRow feature={f} key={f.id} />
        ))}
      </div>
    </section>
  );
}
