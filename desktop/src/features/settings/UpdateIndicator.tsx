import { openUrl } from "@tauri-apps/plugin-opener";
import type { ComponentType } from "react";
import { ExternalLink, RefreshCcw, RotateCw } from "lucide-react";

import { useI18n, type MsgKey } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

import { useUpdaterContext } from "./hooks/UpdaterProvider";
import type { UpdateStatus } from "./hooks/use-updater";

const indicatorButtonClass =
  "relative text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground";

type IndicatorIcon = ComponentType<{
  "aria-hidden"?: boolean;
  className?: string;
}>;

type VariantKey =
  | "available"
  | "downloading"
  | "installing"
  | "manual-required"
  | "ready";

const VARIANT_META: Record<
  VariantKey,
  {
    Icon: IndicatorIcon;
    iconClassName?: string;
    labelKey: MsgKey;
    badgeColor: string;
  }
> = {
  available: {
    Icon: RefreshCcw,
    labelKey: "settings.updates.indicator.available",
    badgeColor: "bg-primary",
  },
  downloading: {
    Icon: Spinner,
    iconClassName: "h-4 w-4 border-2",
    labelKey: "settings.updates.indicator.downloading",
    badgeColor: "bg-primary",
  },
  installing: {
    Icon: Spinner,
    iconClassName: "h-4 w-4 border-2",
    labelKey: "settings.updates.indicator.installing",
    badgeColor: "bg-primary",
  },
  "manual-required": {
    Icon: ExternalLink,
    labelKey: "settings.updates.indicator.manual",
    badgeColor: "bg-primary",
  },
  ready: {
    Icon: RotateCw,
    labelKey: "settings.updates.indicator.ready",
    badgeColor: "bg-emerald-500",
  },
};

function getVariantKey(state: UpdateStatus["state"]): VariantKey | null {
  if (
    state === "available" ||
    state === "downloading" ||
    state === "installing" ||
    state === "manual-required" ||
    state === "ready"
  ) {
    return state;
  }
  return null;
}

export function UpdateIndicator({ className }: { className?: string }) {
  const { t } = useI18n();
  const { status, installAndRelaunch } = useUpdaterContext();
  const variantKey = getVariantKey(status.state);

  if (!variantKey) {
    return null;
  }

  const {
    Icon,
    iconClassName = "h-4 w-4",
    labelKey,
    badgeColor,
  } = VARIANT_META[variantKey];
  const label = t(labelKey);
  const isActionable =
    status.state === "ready" || status.state === "manual-required";
  const handleClick =
    status.state === "ready"
      ? installAndRelaunch
      : status.state === "manual-required"
        ? () => {
            void openUrl(status.releaseUrl);
          }
        : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          className={`${indicatorButtonClass} ${className ?? ""}`}
          disabled={!isActionable}
          onClick={() => {
            if (handleClick) {
              void handleClick();
            }
          }}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Icon aria-hidden className={iconClassName} />
          <span
            className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${badgeColor} animate-pulse`}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
