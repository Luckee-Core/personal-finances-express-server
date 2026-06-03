const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$/;

export type ParsedAssignSlugResponse = {
  slug: string;
  matched_existing: boolean;
  confidence: string;
  reason: string;
};

const extractJsonObject = (raw: string): unknown => {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;
  return JSON.parse(candidate);
};

/**
 * Parses and validates the model JSON response for slug assignment.
 */
export const parseAssignSlugResponse = (raw: string): ParsedAssignSlugResponse => {
  const parsed = extractJsonObject(raw) as Record<string, unknown>;
  const slug = typeof parsed.slug === 'string' ? parsed.slug.trim().toLowerCase() : '';
  if (!slug || !SLUG_REGEX.test(slug)) {
    throw new Error(`Invalid slug in model response: ${slug || '(empty)'}`);
  }
  return {
    slug,
    matched_existing: Boolean(parsed.matched_existing),
    confidence: typeof parsed.confidence === 'string' ? parsed.confidence : 'medium',
    reason: typeof parsed.reason === 'string' ? parsed.reason : '',
  };
};
