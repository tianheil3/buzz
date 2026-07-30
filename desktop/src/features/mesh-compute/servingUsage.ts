import type { MeshServingUsage } from "@/shared/api/tauriMesh";

/**
 * Pure projection of host-side serving usage into a small, politely-worded
 * indicator model for the Share compute card.
 *
 * Returns i18n keys + vars so the settings UI can render bilingual copy.
 * Kept pure/total (accepts null = not yet fetched) and defensive.
 */
export type MeshServingIndicator = {
  /** Whether to show anything at all (only while actively sharing). */
  show: boolean;
  /** Someone is being served right now. */
  active: boolean;
  /** A non-local member is (or has been) consuming this machine's compute. */
  hasRemoteConsumers: boolean;
  /** One-line status key suitable for the card. */
  labelKey: string;
  labelVars?: Record<string, string | number>;
  /** Longer detail key for a tooltip / secondary line. */
  detailKey: string | null;
  detailVars?: Record<string, string | number>;
};

/**
 * @param usage  latest snapshot from `meshServingUsage`, or null if not fetched
 * @param isSharing  whether this machine is currently in serve mode (card owns
 *                   this from the toggle model). Usage is only meaningful while
 *                   sharing.
 */
export function deriveServingIndicator(
  usage: MeshServingUsage | null,
  isSharing: boolean,
): MeshServingIndicator {
  const hidden: MeshServingIndicator = {
    show: false,
    active: false,
    hasRemoteConsumers: false,
    labelKey: "",
    detailKey: null,
  };
  if (!isSharing || !usage) {
    return hidden;
  }

  const hasRemoteConsumers =
    usage.remoteAttempts > 0 || usage.endpointAttempts > 0;
  const active = usage.inflight > 0;

  // Remote consumer present (or seen) — the headline case the user asked for.
  if (hasRemoteConsumers) {
    const remote = usage.remoteAttempts + usage.endpointAttempts;
    const labelKey = active
      ? "settings.compute.serve.inUse"
      : "settings.compute.serve.usedBy";
    const labelVars: Record<string, string | number> = active
      ? { count: usage.inflight }
      : {
          count: remote,
          requestWord: remote === 1 ? "request" : "requests",
        };
    const detailKey =
      usage.peers > 0
        ? "settings.compute.serve.peersDetail"
        : "settings.compute.serve.tps";
    const detailVars: Record<string, string | number> =
      usage.peers > 0
        ? {
            peers: usage.peers,
            peerWord: usage.peers === 1 ? "peer" : "peers",
            tps: Math.round(usage.tokensPerSecond),
          }
        : { tps: Math.round(usage.tokensPerSecond) };
    return {
      show: true,
      active,
      hasRemoteConsumers: true,
      labelKey,
      labelVars,
      detailKey,
      detailVars,
    };
  }

  // Only local (this machine's own agents) — show softly as activity.
  if (active) {
    return {
      show: true,
      active: true,
      hasRemoteConsumers: false,
      labelKey: "settings.compute.serve.yourAgent",
      labelVars: { count: usage.inflight },
      detailKey: "settings.compute.serve.tps",
      detailVars: { tps: Math.round(usage.tokensPerSecond) },
    };
  }
  if (usage.requestsServed > 0) {
    return {
      show: true,
      active: false,
      hasRemoteConsumers: false,
      labelKey: "settings.compute.serve.idleNow",
      detailKey: "settings.compute.serve.servedSession",
      detailVars: {
        count: usage.requestsServed,
        requestWord:
          usage.requestsServed === 1 ? "request" : "requests",
      },
    };
  }

  // Sharing but nothing served yet.
  return {
    show: true,
    active: false,
    hasRemoteConsumers: false,
    labelKey: "settings.compute.serve.idleYet",
    detailKey: null,
  };
}
