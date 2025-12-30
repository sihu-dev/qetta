/**
 * Simple i18n hook for Qetta (Korean only)
 * Passthrough implementation - returns the key as-is
 */
export function useI18n() {
  return {
    t: (key: string) => key,
    locale: 'ko',
  };
}
