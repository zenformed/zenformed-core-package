export type SettingsCategoryId =
  | 'account'
  | 'organization'
  | 'teamMembers'
  | 'notifications'
  | 'appsBilling';

export const SETTINGS_CATEGORY_ORDER: readonly SettingsCategoryId[] = [
  'account',
  'organization',
  'teamMembers',
  'notifications',
  'appsBilling',
] as const;
