/**
 * Parses a single string route param id or returns null when invalid.
 */
export const parseRouteId = (raw: string | string[] | undefined): string | null => {
  if (!raw || Array.isArray(raw)) return null;
  const id = raw.trim();
  return id.length > 0 ? id : null;
};
