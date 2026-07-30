import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import type {
  DesktopNotificationPermissionState,
  NotificationSettings,
} from "@/features/notifications/hooks";
import {
  COMING_SOON_SLOTS,
  RECOMMENDED_SOUND_BY_SLOT,
  SOUND_SLOTS,
  type SoundName,
  type SoundSlot,
} from "@/features/notifications/lib/sound";
import { useI18n, type MsgKey } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { SettingsOptionGroup, SettingsOptionRow } from "./SettingsOptionGroup";
import { SettingsSectionHeader } from "./SettingsSectionHeader";
import { SoundPicker } from "./SoundPicker";

const SLOT_LABEL_KEYS: Record<SoundSlot, MsgKey> = {
  dm: "settings.notifications.slot.dm",
  mention: "settings.notifications.slot.mention",
  thread_reply: "settings.notifications.slot.thread_reply",
  needs_action: "settings.notifications.slot.needs_action",
  job_accepted: "settings.notifications.slot.job_accepted",
  job_progress: "settings.notifications.slot.job_progress",
  job_result: "settings.notifications.slot.job_result",
  job_error: "settings.notifications.slot.job_error",
};

const SLOT_DESC_KEYS: Record<SoundSlot, MsgKey> = {
  dm: "settings.notifications.slotDesc.dm",
  mention: "settings.notifications.slotDesc.mention",
  thread_reply: "settings.notifications.slotDesc.thread_reply",
  needs_action: "settings.notifications.slotDesc.needs_action",
  job_accepted: "settings.notifications.slotDesc.job_accepted",
  job_progress: "settings.notifications.slotDesc.job_progress",
  job_result: "settings.notifications.slotDesc.job_result",
  job_error: "settings.notifications.slotDesc.job_error",
};


export function NotificationSettingsCard({
  isUpdatingDesktopNotifications,
  notificationErrorMessage,
  notificationPermission,
  notificationSettings,
  onSetDesktopNotificationsEnabled,
  onSetAllSlotAlertsEnabled,
  onSetHomeBadgeEnabled,
  onSetSlotAlertsEnabled,
  onSetNotifyWhileViewing,
  onSetSoundForSlot,
}: {
  isUpdatingDesktopNotifications: boolean;
  notificationErrorMessage: string | null;
  notificationPermission: DesktopNotificationPermissionState;
  notificationSettings: NotificationSettings;
  onSetDesktopNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
  onSetAllSlotAlertsEnabled: (enabled: boolean) => void;
  onSetHomeBadgeEnabled: (enabled: boolean) => void;
  onSetSlotAlertsEnabled: (slot: SoundSlot, enabled: boolean) => void;
  onSetNotifyWhileViewing: (enabled: boolean) => void;
  onSetSoundForSlot: (slot: SoundSlot, name: SoundName) => void;
}) {
  const { t } = useI18n();
  const permissionBlocked =
    notificationPermission === "denied" ||
    notificationPermission === "unsupported";
  // The parent Sound switch derives from its children: on when any live
  // event row is on, and toggling it bulk-sets every live row.
  const anyAlertsOn = SOUND_SLOTS.some(
    (slot) =>
      !COMING_SOON_SLOTS.has(slot) &&
      notificationSettings.slotAlertsEnabled[slot],
  );
  const [showComingSoon, setShowComingSoon] = useState(false);
  const visibleSlots = SOUND_SLOTS.filter(
    (slot) => showComingSoon || !COMING_SOON_SLOTS.has(slot),
  );

  return (
    <section className="min-w-0" data-testid="settings-notifications">
      <SettingsSectionHeader
        title={t("settings.notifications.title")}
        description={t("settings.notifications.description")}
      />

      <span className="sr-only" data-testid="notifications-desktop-state">
        {notificationPermission === "unsupported"
          ? t("settings.notifications.state.unavailable")
          : notificationPermission === "denied"
            ? t("settings.notifications.state.blocked")
            : notificationSettings.desktopEnabled
              ? t("settings.notifications.state.on")
              : t("settings.notifications.state.off")}
      </span>

      <div className="flex flex-col gap-4">
        <SettingsOptionGroup>
          <SettingsOptionRow>
            <div className="min-w-0">
              <label
                className="text-sm font-medium"
                htmlFor="desktop-alerts-switch"
              >
                {isUpdatingDesktopNotifications
                  ? t("settings.notifications.requesting")
                  : t("settings.notifications.desktopAlerts")}
              </label>
              <p className="text-sm font-normal text-muted-foreground">
                {notificationSettings.desktopEnabled
                  ? t("settings.notifications.desktopEnabledDesc")
                  : t("settings.notifications.desktopDisabledDesc")}
              </p>
            </div>
            <Switch
              checked={notificationSettings.desktopEnabled}
              data-testid="notifications-desktop-toggle"
              disabled={isUpdatingDesktopNotifications}
              id="desktop-alerts-switch"
              onCheckedChange={(checked) => {
                void onSetDesktopNotificationsEnabled(checked);
              }}
            />
          </SettingsOptionRow>

          <SettingsOptionRow>
            <div className="min-w-0">
              <label
                className="text-sm font-medium"
                htmlFor="notify-while-viewing-switch"
              >
                {t("settings.notifications.notifyWhileViewing")}
              </label>
              <p className="text-sm font-normal text-muted-foreground">
                {t("settings.notifications.notifyWhileViewingDesc")}
              </p>
            </div>
            <Switch
              checked={
                notificationSettings.desktopEnabled &&
                notificationSettings.notifyWhileViewing
              }
              data-testid="notifications-notify-while-viewing-toggle"
              disabled={!notificationSettings.desktopEnabled}
              id="notify-while-viewing-switch"
              onCheckedChange={(checked) => {
                onSetNotifyWhileViewing(checked);
              }}
            />
          </SettingsOptionRow>
        </SettingsOptionGroup>

        {notificationSettings.desktopEnabled ? (
          <>
            <SettingsOptionGroup>
              <SettingsOptionRow>
                <div className="min-w-0">
                  <label
                    className="text-sm font-medium"
                    htmlFor="notification-sound-switch"
                  >
                    {t("settings.notifications.sound")}
                  </label>
                  <p className="text-sm font-normal text-muted-foreground">
                    {t("settings.notifications.soundDesc")}
                  </p>
                </div>
                <Switch
                  checked={anyAlertsOn}
                  data-testid="notifications-sound-toggle"
                  id="notification-sound-switch"
                  onCheckedChange={(checked) => {
                    onSetAllSlotAlertsEnabled(checked);
                  }}
                />
              </SettingsOptionRow>
            </SettingsOptionGroup>

            {anyAlertsOn ? (
              <>
                <SettingsOptionGroup>
                  {visibleSlots.map((slot) => {
                    const comingSoon = COMING_SOON_SLOTS.has(slot);
                    const alertsOn =
                      notificationSettings.slotAlertsEnabled[slot];
                    return (
                      <SettingsOptionRow
                        aria-disabled={comingSoon || undefined}
                        className={cn(
                          comingSoon && "cursor-not-allowed opacity-40",
                        )}
                        key={slot}
                      >
                        <div className="min-w-0">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            {t(SLOT_LABEL_KEYS[slot])}
                            {comingSoon ? (
                              <span className="rounded-full bg-muted/70 px-2 py-0.5 text-2xs font-normal uppercase tracking-wide text-muted-foreground">
                                {t("settings.notifications.comingSoon")}
                              </span>
                            ) : null}
                          </span>
                          <p className="text-sm font-normal text-muted-foreground">
                            {t(SLOT_DESC_KEYS[slot])}
                          </p>
                        </div>
                        <span className="flex items-center gap-3">
                          <span
                            className={cn(
                              "transition-opacity duration-200",
                              !alertsOn && "pointer-events-none opacity-40",
                            )}
                          >
                            <SoundPicker
                              disabled={comingSoon || !alertsOn}
                              onChange={(next) => onSetSoundForSlot(slot, next)}
                              recommended={RECOMMENDED_SOUND_BY_SLOT[slot]}
                              value={notificationSettings.sounds[slot]}
                            />
                          </span>
                          <Switch
                            checked={alertsOn && !comingSoon}
                            data-testid={`notifications-alerts-enabled-${slot}`}
                            disabled={comingSoon}
                            id={`alerts-enabled-${slot}-switch`}
                            onCheckedChange={(checked) => {
                              onSetSlotAlertsEnabled(slot, checked);
                            }}
                          />
                        </span>
                      </SettingsOptionRow>
                    );
                  })}
                </SettingsOptionGroup>

                <div className="flex justify-center">
                  <Button
                    data-testid="notifications-toggle-coming-soon"
                    onClick={() => setShowComingSoon((current) => !current)}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    {showComingSoon ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        {t("settings.notifications.showLess")}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        {t("settings.notifications.viewAll")}
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : null}
          </>
        ) : null}

        <SettingsOptionGroup>
          <SettingsOptionRow>
            <div className="min-w-0">
              <label
                className="text-sm font-medium"
                htmlFor="home-badge-switch"
              >
                {t("settings.notifications.homeBadge")}
              </label>
              <p className="text-sm font-normal text-muted-foreground">
                {t("settings.notifications.homeBadgeDesc")}
              </p>
            </div>
            <Switch
              checked={notificationSettings.homeBadgeEnabled}
              data-testid="notifications-home-badge-toggle"
              id="home-badge-switch"
              onCheckedChange={(checked) => {
                onSetHomeBadgeEnabled(checked);
              }}
            />
          </SettingsOptionRow>
        </SettingsOptionGroup>
      </div>

      {permissionBlocked && (
        <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {notificationPermission === "unsupported"
            ? t("settings.notifications.unsupported")
            : t("settings.notifications.blockedSystem")}
        </p>
      )}

      {notificationErrorMessage ? (
        <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {notificationErrorMessage}
        </p>
      ) : null}
    </section>
  );
}
