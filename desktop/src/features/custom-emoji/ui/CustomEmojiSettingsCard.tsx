import { ImagePlus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  useCustomEmojiQuery,
  useOwnCustomEmojiQuery,
  useRemoveCustomEmojiMutation,
  useSetCustomEmojiMutation,
} from "@/features/custom-emoji/hooks";
import {
  normalizeShortcode,
  suggestShortcodeFromFilename,
} from "@/shared/api/customEmoji";
import { pickAndUploadMedia } from "@/shared/api/tauri";
import { useI18n } from "@/shared/i18n";
import { rewriteRelayUrl } from "@/shared/lib/mediaUrl";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SettingsOptionGroup } from "@/features/settings/ui/SettingsOptionGroup";
import { SettingsSectionHeader } from "@/features/settings/ui/SettingsSectionHeader";

/**
 * Custom emoji management (NIP-30, kind:30030). Each member owns their own set:
 * adding uploads an image and republishes the caller's own 30030; removing only
 * touches the caller's own set. So this card edits "My emoji" — the only set the
 * caller can publish — and shows the community palette (the read-only union of
 * every member's set) separately, since a member cannot remove someone else's
 * emoji. When shortcodes collide across members, the palette shows one
 * deterministic winner (see `unionCustomEmoji`).
 */
export function CustomEmojiSettingsCard() {
  const { t } = useI18n();
  const { data: own = [], isLoading: ownLoading } = useOwnCustomEmojiQuery();
  const { data: community = [], isLoading: communityLoading } =
    useCustomEmojiQuery();
  const setEmoji = useSetCustomEmojiMutation();
  const removeEmoji = useRemoveCustomEmojiMutation();

  const [name, setName] = React.useState("");
  const [pendingUpload, setPendingUpload] = React.useState<{
    url: string;
    filename: string | null;
  } | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const normalized = normalizeShortcode(name);
  const nameInvalid = name.trim().length > 0 && normalized === null;
  // "Replace" only applies to MY set — that's the set the upload will rewrite.
  const ownDuplicate =
    normalized !== null && own.some((e) => e.shortcode === normalized);
  const canSubmit =
    pendingUpload !== null &&
    normalized !== null &&
    !isUploading &&
    !setEmoji.isPending;

  const handleUpload = React.useCallback(async () => {
    setIsUploading(true);
    try {
      const blobs = await pickAndUploadMedia();
      const blob = blobs[0];
      if (!blob?.url) {
        return;
      }
      if (!blob.type.startsWith("image/")) {
        toast.error(t("settings.customEmoji.toast.chooseImage"));
        return;
      }
      setPendingUpload({ url: blob.url, filename: blob.filename ?? null });
      const suggested = blob.filename
        ? suggestShortcodeFromFilename(blob.filename)
        : null;
      if (suggested && name.trim().length === 0) {
        setName(suggested);
      }
    } catch {
      toast.error(t("settings.customEmoji.toast.uploadFailed"));
    } finally {
      setIsUploading(false);
    }
  }, [name, t]);

  const handleAdd = React.useCallback(async () => {
    if (normalized === null || pendingUpload === null) return;
    try {
      const stored = await setEmoji.mutateAsync({
        shortcode: normalized,
        url: pendingUpload.url,
      });
      setName("");
      setPendingUpload(null);
      toast.success(t("settings.customEmoji.toast.added", { code: stored }));
    } catch {
      toast.error(t("settings.customEmoji.toast.addFailed"));
    }
  }, [normalized, pendingUpload, setEmoji, t]);

  const handleReset = React.useCallback(() => {
    setName("");
    setPendingUpload(null);
  }, []);

  const handleRemove = React.useCallback(
    async (shortcode: string) => {
      try {
        await removeEmoji.mutateAsync(shortcode);
        toast.success(
          t("settings.customEmoji.toast.removed", { code: shortcode }),
        );
      } catch {
        toast.error(t("settings.customEmoji.toast.removeFailed"));
      }
    },
    [removeEmoji, t],
  );

  // Community emoji owned by someone else (so the caller can't remove them).
  const ownShortcodes = new Set(own.map((e) => e.shortcode));
  const othersEmoji = community.filter((e) => !ownShortcodes.has(e.shortcode));

  return (
    <section className="min-w-0" data-testid="settings-custom-emoji">
      <SettingsSectionHeader
        title={t("settings.customEmoji.title")}
        description={t("settings.customEmoji.description")}
      />

      <div className="space-y-6">
        <form
          className="w-full"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) void handleAdd();
          }}
        >
          <SettingsOptionGroup>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0 flex-[1_1_22rem]">
                <h4 className="text-sm font-medium">
                  {t("settings.customEmoji.uploadTitle")}
                </h4>
                <p className="text-sm font-normal text-muted-foreground">
                  {t("settings.customEmoji.uploadDesc")}
                </p>
              </div>
              <div className="flex min-w-0 flex-[1_1_16rem] items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border bg-background">
                  {pendingUpload ? (
                    <img
                      alt={t("settings.customEmoji.previewAlt")}
                      src={rewriteRelayUrl(pendingUpload.url)}
                      className="h-14 w-14 object-contain"
                      draggable={false}
                    />
                  ) : (
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 space-y-2">
                  {pendingUpload?.filename ? (
                    <p className="max-w-full truncate text-sm font-normal text-muted-foreground">
                      {pendingUpload.filename}
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    data-testid="custom-emoji-upload"
                    onClick={() => void handleUpload()}
                    disabled={isUploading || setEmoji.isPending}
                    variant="outline"
                  >
                    {isUploading
                      ? t("settings.customEmoji.uploading")
                      : pendingUpload
                        ? t("settings.customEmoji.chooseDifferent")
                        : t("settings.customEmoji.uploadImage")}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0 flex-[1_1_22rem]">
                <h4 className="text-sm font-medium">
                  {t("settings.customEmoji.nameTitle")}
                </h4>
                <p className="text-sm font-normal text-muted-foreground">
                  {t("settings.customEmoji.nameDesc")}
                </p>
              </div>
              <div className="w-full min-w-0 max-w-sm flex-[1_1_20rem] space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    :
                  </span>
                  <Input
                    id="custom-emoji-name"
                    data-testid="custom-emoji-name-input"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="px-6"
                    placeholder={t("settings.customEmoji.namePlaceholder")}
                    spellCheck={false}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    :
                  </span>
                </div>
                {nameInvalid ? (
                  <p className="text-sm text-destructive">
                    {t("settings.customEmoji.nameInvalid")}
                  </p>
                ) : pendingUpload === null ? (
                  <p className="text-sm font-normal text-muted-foreground">
                    {t("settings.customEmoji.chooseImageFirst")}
                  </p>
                ) : ownDuplicate ? (
                  <p className="text-sm font-normal text-muted-foreground">
                    {t("settings.customEmoji.willReplace", {
                      code: normalized ?? "",
                    })}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end gap-2 px-4 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={
                  setEmoji.isPending || (name.length === 0 && !pendingUpload)
                }
              >
                {t("settings.customEmoji.clear")}
              </Button>
              <Button
                type="submit"
                data-testid="custom-emoji-add"
                disabled={!canSubmit}
              >
                {setEmoji.isPending
                  ? t("settings.customEmoji.saving")
                  : t("settings.customEmoji.saveEmoji")}
              </Button>
            </div>
          </SettingsOptionGroup>
        </form>

        <div className="space-y-3" data-testid="custom-emoji-mine">
          <h2 className="text-lg font-semibold tracking-tight">
            {own.length > 0
              ? t("settings.customEmoji.mineCount", { count: own.length })
              : t("settings.customEmoji.mine")}
          </h2>
          {ownLoading ? (
            <SettingsOptionGroup>
              <div className="px-4 py-3 text-sm font-normal text-muted-foreground">
                {t("common.loading")}
              </div>
            </SettingsOptionGroup>
          ) : own.length === 0 ? (
            <SettingsOptionGroup>
              <div className="px-4 py-3 text-sm font-normal text-muted-foreground">
                {t("settings.customEmoji.mineEmpty")}
              </div>
            </SettingsOptionGroup>
          ) : (
            <SettingsOptionGroup>
              {own.map((e) => (
                <div
                  key={e.shortcode}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <img
                    alt={`:${e.shortcode}:`}
                    src={rewriteRelayUrl(e.url)}
                    className="h-6 w-6 shrink-0 object-contain"
                    draggable={false}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    :{e.shortcode}:
                  </span>
                  <Button
                    aria-label={t("settings.customEmoji.removeAria", {
                      code: e.shortcode,
                    })}
                    size="icon"
                    variant="ghost"
                    onClick={() => void handleRemove(e.shortcode)}
                    disabled={removeEmoji.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </SettingsOptionGroup>
          )}
        </div>

        {!communityLoading && othersEmoji.length > 0 ? (
          <div className="space-y-3" data-testid="custom-emoji-community">
            <h2 className="text-lg font-semibold tracking-tight">
              {t("settings.customEmoji.community", {
                count: othersEmoji.length,
              })}
            </h2>
            <p className="text-sm font-normal text-muted-foreground">
              {t("settings.customEmoji.communityDesc")}
            </p>
            <SettingsOptionGroup>
              {othersEmoji.map((e) => (
                <div
                  key={e.shortcode}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <img
                    alt={`:${e.shortcode}:`}
                    src={rewriteRelayUrl(e.url)}
                    className="h-6 w-6 shrink-0 object-contain"
                    draggable={false}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    :{e.shortcode}:
                  </span>
                </div>
              ))}
            </SettingsOptionGroup>
          </div>
        ) : null}
      </div>
    </section>
  );
}
