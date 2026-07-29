import { AgentDefaultsEditor } from "@/features/agents/ui/AgentDefaultsEditor";
import { useI18n } from "@/shared/i18n";
import { SectionHeader } from "@/shared/ui/PageHeader";

export function AgentDefaultsSettingsCard() {
  const { t } = useI18n();
  return (
    <section
      className="min-w-0 space-y-4"
      data-testid="settings-global-agent-config"
    >
      <SectionHeader
        title={t("settings.agentDefaults.title")}
        description={t("settings.agents.description")}
      />
      <AgentDefaultsEditor />
    </section>
  );
}
