import type { SupabaseClient } from '@supabase/supabase-js';
import { AI_PROMPT_TYPE_RECURRING_DETECT } from '../../constants/ai-prompt-types';
import { createRecurringPurchase, getAllRecurringPurchases } from '../../data/recurring-purchases';
import type { RecurringPurchase } from '../../data/recurring-purchases/types';
import {
  createRecurringDetectAiExchange,
  updateRecurringDetectAiExchange,
} from '../../data/recurring-detect-ai-exchanges';
import {
  createRecurringDetectAiRequest,
  updateRecurringDetectAiRequest,
} from '../../data/recurring-detect-ai-requests';
import { createRecurringDetectAiResponse } from '../../data/recurring-detect-ai-responses';
import { updateTransaction } from '../../data/transactions';
import type { Transaction } from '../../data/transactions/types';
import { isSupabaseMissingTableError } from '../../utils/supabase/is-supabase-missing-table-error';
import { createManagedAnthropicClient, generateCompletion, getModelConfig } from '../ai';
import { buildRecurringDetectUserMessage } from './build-recurring-detect-user-message';
import { medianAmountCents } from './median-amount-cents';
import { parseRecurringDetectResponse } from './parse-recurring-detect-response';
import type { ParsedRecurringDetectResponse } from './parse-recurring-detect-response';
import { resolveRecurringDetectSystemPrompt } from './resolve-recurring-detect-system-prompt';

export type DetectRecurringAuditBundle = {
  exchange: Awaited<ReturnType<typeof createRecurringDetectAiExchange>>;
  request: Awaited<ReturnType<typeof createRecurringDetectAiRequest>>;
  response: Awaited<ReturnType<typeof createRecurringDetectAiResponse>> | null;
};

export type DetectRecurringForSlugResult = {
  slug: string;
  transaction_ids: string[];
  is_recurring: boolean;
  billing_interval: string | null;
  interval_months: number | null;
  typical_amount_cents: number | null;
  suggested_name: string;
  confidence: string;
  reason: string;
  recurring_purchase_id: string | null;
  recurring_purchase: RecurringPurchase | null;
  audit: DetectRecurringAuditBundle | null;
  skipped: boolean;
  skip_reason: string | null;
};

export type ProcessDetectRecurringForSlugOptions = {
  create_recurring?: boolean;
  min_transactions?: number;
};

const linkRecurringPurchase = async (
  supabase: SupabaseClient,
  slug: string,
  transactions: Transaction[],
  parsed: ParsedRecurringDetectResponse,
  typicalAmount: number,
  createRecurring: boolean,
): Promise<{ recurringPurchase: RecurringPurchase | null; recurringPurchaseId: string | null }> => {
  if (!createRecurring || !parsed.is_recurring) {
    return { recurringPurchase: null, recurringPurchaseId: null };
  }

  const existing = (await getAllRecurringPurchases(supabase)).find(
    (r) => r.vendor?.trim().toLowerCase() === slug,
  );

  const recurringPurchase =
    existing ??
    (await createRecurringPurchase(supabase, {
      name: parsed.suggested_name,
      vendor: slug,
      amount_cents: typicalAmount,
      billing_interval: parsed.billing_interval ?? 'monthly',
      interval_months: parsed.interval_months ?? undefined,
      notes: parsed.reason || null,
    }));

  for (const txn of transactions) {
    if (!txn.recurring_purchase_id) {
      await updateTransaction(supabase, txn.id, {
        recurring_purchase_id: recurringPurchase.id,
      });
    }
  }

  return {
    recurringPurchase,
    recurringPurchaseId: recurringPurchase.id,
  };
};

const buildSlugResult = (
  slug: string,
  transactionIds: string[],
  parsed: ParsedRecurringDetectResponse,
  typicalAmount: number | null,
  recurringPurchase: RecurringPurchase | null,
  recurringPurchaseId: string | null,
  audit: DetectRecurringAuditBundle | null,
): DetectRecurringForSlugResult => ({
  slug,
  transaction_ids: transactionIds,
  is_recurring: parsed.is_recurring,
  billing_interval: parsed.billing_interval,
  interval_months: parsed.interval_months,
  typical_amount_cents: typicalAmount,
  suggested_name: parsed.suggested_name,
  confidence: parsed.confidence,
  reason: parsed.reason,
  recurring_purchase_id: recurringPurchaseId,
  recurring_purchase: recurringPurchase,
  audit,
  skipped: false,
  skip_reason: null,
});

const runModelAndApply = async (
  supabase: SupabaseClient,
  slug: string,
  transactions: Transaction[],
  options: ProcessDetectRecurringForSlugOptions,
  audit: DetectRecurringAuditBundle | null,
): Promise<DetectRecurringForSlugResult> => {
  const transactionIds = transactions.map((t) => t.id);
  const { systemPrompt, aiPromptId } = await resolveRecurringDetectSystemPrompt(supabase);
  const userMessage = buildRecurringDetectUserMessage(slug, transactions);
  const modelConfig = getModelConfig(AI_PROMPT_TYPE_RECURRING_DETECT);

  const client = createManagedAnthropicClient();
  const { response: rawResponse, usage } = await generateCompletion(client, {
    systemPrompt,
    userMessage,
    model: modelConfig.model,
    temperature: modelConfig.temperature,
    maxTokens: modelConfig.maxTokens,
  });

  const parsed = parseRecurringDetectResponse(rawResponse);
  const fallbackAmount = medianAmountCents(transactions.map((t) => Math.abs(t.amount_cents)));
  const typicalAmount =
    parsed.typical_amount_cents ?? (parsed.is_recurring ? fallbackAmount : null);

  if (audit) {
    const responseRow = await createRecurringDetectAiResponse(supabase, {
      request_id: audit.request.id,
      model: modelConfig.model,
      status: 'success',
      raw_response: rawResponse,
      parsed_response_json: parsed as unknown as Record<string, unknown>,
      usage_input_tokens: usage.input_tokens,
      usage_output_tokens: usage.output_tokens,
    });

    const totalTokens = usage.input_tokens + usage.output_tokens;
    const updatedExchange = await updateRecurringDetectAiExchange(supabase, audit.exchange.id, {
      response_id: responseRow.id,
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      total_tokens: totalTokens,
      status: 'completed',
    });

    const updatedRequest = await updateRecurringDetectAiRequest(supabase, audit.request.id, {
      status: 'completed',
    });

    audit = {
      exchange: updatedExchange,
      request: updatedRequest,
      response: responseRow,
    };
  }

  const typicalForLink = typicalAmount ?? fallbackAmount;
  const { recurringPurchase, recurringPurchaseId } = await linkRecurringPurchase(
    supabase,
    slug,
    transactions,
    parsed,
    typicalForLink,
    Boolean(options.create_recurring),
  );

  return buildSlugResult(
    slug,
    transactionIds,
    parsed,
    typicalAmount,
    recurringPurchase,
    recurringPurchaseId,
    audit,
  );
};

/**
 * Runs recurring detection AI for one slug group and optionally creates/links a recurring purchase.
 */
export const processDetectRecurringForSlug = async (
  supabase: SupabaseClient,
  slug: string,
  transactions: Transaction[],
  options: ProcessDetectRecurringForSlugOptions = {},
): Promise<DetectRecurringForSlugResult> => {
  const minTransactions = options.min_transactions ?? 2;
  const transactionIds = transactions.map((t) => t.id);

  if (transactions.length < minTransactions) {
    return {
      slug,
      transaction_ids: transactionIds,
      is_recurring: false,
      billing_interval: null,
      interval_months: null,
      typical_amount_cents: null,
      suggested_name: '',
      confidence: 'low',
      reason: `Need at least ${minTransactions} transactions to detect a pattern`,
      recurring_purchase_id: null,
      recurring_purchase: null,
      audit: null,
      skipped: true,
      skip_reason: 'insufficient_transactions',
    };
  }

  const { systemPrompt, aiPromptId } = await resolveRecurringDetectSystemPrompt(supabase);
  const userMessage = buildRecurringDetectUserMessage(slug, transactions);
  const modelConfig = getModelConfig(AI_PROMPT_TYPE_RECURRING_DETECT);
  const requestPayload = JSON.parse(userMessage) as Record<string, unknown>;

  let audit: DetectRecurringAuditBundle | null = null;

  try {
    const requestRow = await createRecurringDetectAiRequest(supabase, {
      slug,
      ai_prompt_id: aiPromptId,
      prompt_type: AI_PROMPT_TYPE_RECURRING_DETECT,
      provider: 'anthropic',
      model: modelConfig.model,
      request_payload_json: requestPayload,
      system_prompt: systemPrompt,
      user_message: userMessage,
    });

    const exchangeRow = await createRecurringDetectAiExchange(supabase, {
      slug,
      request_id: requestRow.id,
      model_used: modelConfig.model,
    });

    await updateRecurringDetectAiRequest(supabase, requestRow.id, {
      exchange_id: exchangeRow.id,
    });

    audit = { exchange: exchangeRow, request: requestRow, response: null };
    return await runModelAndApply(supabase, slug, transactions, options, audit);
  } catch (error) {
    if (isSupabaseMissingTableError(error, 'recurring_detect_ai')) {
      console.warn(
        '📊 processDetectRecurringForSlug audit tables missing (run docs/supabase/008_recurring_detect_ai_audit.sql); detecting without audit',
      );
      return await runModelAndApply(supabase, slug, transactions, options, null);
    }

    if (audit) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const responseRow = await createRecurringDetectAiResponse(supabase, {
        request_id: audit.request.id,
        model: modelConfig.model,
        status: 'error',
        error_message: message,
      }).catch(() => null);

      await updateRecurringDetectAiExchange(supabase, audit.exchange.id, {
        response_id: responseRow?.id ?? null,
        status: 'failed',
        error_message: message,
      }).catch(() => undefined);

      await updateRecurringDetectAiRequest(supabase, audit.request.id, {
        status: 'failed',
      }).catch(() => undefined);
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Recurring detect failed: ${message}`);
  }
};
