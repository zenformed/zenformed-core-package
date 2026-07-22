export {
  PRESENCE_STATUS_MODES,
  PRESENCE_EFFECTIVE_STATUSES,
  PRESENCE_AWAY_AFTER_MS,
  PRESENCE_ACTIVITY_THROTTLE_MS,
  PRESENCE_TRACK_THROTTLE_MS,
  PRESENCE_RECONNECT_GRACE_MS,
  PRESENCE_STATUS_MODE_LABELS,
  PRESENCE_EFFECTIVE_STATUS_LABELS,
  isPresenceStatusMode,
  parsePresenceStatusMode,
  deriveEffectiveStatusFromPreference,
  organizationPresenceTopic,
  createPresenceClientId,
} from './types';
export type {
  PresenceStatusMode,
  PresenceEffectiveStatus,
  PresenceAutomaticState,
  PresenceClientState,
} from './types';

export {
  aggregateUserPresence,
  aggregatePresenceByUserId,
  parsePresenceClientState,
} from './aggregateUserPresence';

export { createPresenceActivityController } from './activityDetection';
export type { PresenceActivityController } from './activityDetection';

export {
  fetchPresenceStatusMode,
  savePresenceStatusMode,
} from './presencePreferenceApi';

export {
  ZenformedPresenceProvider,
  useZenformedPresence,
  useZenformedPresenceOptional,
  useOrganizationPresence,
  useUserPresence,
} from './ZenformedPresenceProvider';
export type {
  ZenformedPresenceProviderProps,
  ZenformedPresenceContextValue,
} from './ZenformedPresenceProvider';

export { ZenformedPresenceDot } from './ZenformedPresenceDot';
export type { ZenformedPresenceDotProps } from './ZenformedPresenceDot';

export { ZenformedPresenceAvatarBadge } from './ZenformedPresenceAvatarBadge';
export type { ZenformedPresenceAvatarBadgeProps } from './ZenformedPresenceAvatarBadge';

export { ZenformedPresenceStatusSelector } from './ZenformedPresenceStatusSelector';
export type { ZenformedPresenceStatusSelectorProps } from './ZenformedPresenceStatusSelector';
