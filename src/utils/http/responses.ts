import type { Response } from 'express';
import { isValidationError } from './is-validation-error';

type SuccessBody<T> = {
  success: true;
  data: T;
};

type ErrorBody = {
  success: false;
  error: string;
};

/**
 * Sends a 200 success response with ADR-standard shape.
 */
export const sendSuccess = <T>(res: Response, data: T): void => {
  const body: SuccessBody<T> = { success: true, data };
  res.status(200).json(body);
};

/**
 * Sends a 400 client error response.
 */
export const sendClientError = (res: Response, error: string): void => {
  const body: ErrorBody = { success: false, error };
  res.status(400).json(body);
};

/**
 * Sends a 500 server error response.
 */
export const sendServerError = (res: Response, error: string): void => {
  const body: ErrorBody = { success: false, error };
  res.status(500).json(body);
};

/**
 * Maps caught errors to 400 vs 500 using validation heuristics.
 */
export const sendHandlerError = (res: Response, error: unknown, routeLabel: string): void => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`❌ ${routeLabel}:`, error);
  if (isValidationError(message)) {
    sendClientError(res, message);
    return;
  }
  sendServerError(res, message);
};
