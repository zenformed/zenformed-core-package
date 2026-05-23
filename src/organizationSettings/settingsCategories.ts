export type SettingsCategoryId = 'organization' | 'account' | 'notifications' | 'appsBilling';

export const SETTINGS_CATEGORY_ORDER: readonly SettingsCategoryId[] = [
  'organization',
  'account',
  'notifications',
  'appsBilling',
] as const;
