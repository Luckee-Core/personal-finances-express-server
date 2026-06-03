export type ParsedAssignCategoryResponse = {
  category_id: string | null;
  category_name: string;
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
 * Parses and validates the model JSON response for category assignment.
 */
export const parseAssignCategoryResponse = (raw: string): ParsedAssignCategoryResponse => {
  const parsed = extractJsonObject(raw) as Record<string, unknown>;
  const matchedExisting = Boolean(parsed.matched_existing);
  const categoryId =
    typeof parsed.category_id === 'string' && parsed.category_id.trim()
      ? parsed.category_id.trim()
      : null;
  const categoryName =
    typeof parsed.category_name === 'string' && parsed.category_name.trim()
      ? parsed.category_name.trim()
      : '';

  if (matchedExisting && !categoryId && !categoryName) {
    throw new Error(
      'category_id or category_name is required when matched_existing is true',
    );
  }
  if (!matchedExisting && !categoryName) {
    throw new Error('category_name is required when matched_existing is false');
  }

  return {
    category_id: categoryId,
    category_name: categoryName,
    matched_existing: matchedExisting,
    confidence: typeof parsed.confidence === 'string' ? parsed.confidence : 'medium',
    reason: typeof parsed.reason === 'string' ? parsed.reason : '',
  };
};
