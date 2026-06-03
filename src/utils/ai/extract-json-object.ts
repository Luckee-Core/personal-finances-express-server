/**
 * Parses model text into a JSON value (handles markdown fences and surrounding prose).
 */
export const extractJsonObject = (raw: string): unknown => {
  let text = raw.trim();

  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '');
    text = text.replace(/\s*```\s*$/i, '').trim();
  }

  const tryParse = (candidate: string): unknown => JSON.parse(candidate);

  try {
    return tryParse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return tryParse(text.slice(start, end + 1));
    }
    throw new Error('Model response did not contain a JSON object');
  }
};
