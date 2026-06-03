/**
 * Returns true when an error message indicates client validation failure.
 */
export const isValidationError = (message: string): boolean =>
  message.includes('required') ||
  message.includes('Invalid') ||
  message.includes('cannot be empty') ||
  message.includes('must be') ||
  message.includes('not found');
