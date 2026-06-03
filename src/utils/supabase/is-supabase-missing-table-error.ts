/**
 * True when PostgREST reports a table missing from the schema cache (migration not applied).
 */
export const isSupabaseMissingTableError = (
  error: unknown,
  tableNameFragment?: string,
): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.includes('Could not find the table')) {
    return false;
  }
  if (!tableNameFragment) {
    return true;
  }
  return message.includes(tableNameFragment);
};
