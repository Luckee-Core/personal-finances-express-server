import type { SupabaseClient } from '@supabase/supabase-js';
import { AI_PROMPT_TYPE_RECURRING_DETECT } from '../../constants/ai-prompt-types';
import { getAllNotRecurring } from '../../data/not-recurring';
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
import { getAllTransactions, updateTransaction } from '../../data/transactions';
import type { Transaction } from '../../data/transactions/types';
import { isSupabaseMissingTableError } from '../../utils/supabase/is-supabase-missing-table-error';
import { createManagedAnthropicClient, generateCompletion, getModelConfig } from '../ai';
import { buildRecurringDetectAllUserMessage } from './build-recurring-detect-all-user-message';
import type { DetectRecurringAuditBundle } from './process-detect-recurring-for-slug';
import {
  parseRecurringDetectAllResponse,
  type ParsedRecurringCharge,
} from './parse-recurring-detect-all-response';
import { resolveRecurringDetectSystemPrompt } from './resolve-recurring-detect-system-prompt';

export const RECURRING_DETECT_ALL_SLUG = 'all-transactions';

export type DetectRecurringChargeResult = {
  slug: string;
  suggested_name: string;
  billing_interval: string;
  typical_amount_cents: number;
  amount_min_cents: number | null;
  amount_max_cents: number | null;
  transaction_ids: string[];
  recurring_purchase_id: string | null;
  recurring_purchase: RecurringPurchase | null;
  confidence: string;
  reason: string;
};

export type DetectRecurringAllInput = {
  slugs?: string[];
  min_transactions?: number;
  only_unlinked?: boolean;
  create_recurring?: boolean;
};

export type DetectRecurringAllResult = {
  transaction_count: number;
  recurring_found: number;
  recurring_purchases_created: number;
  results: DetectRecurringChargeResult[];
  audit: DetectRecurringAuditBundle | null;
};

const formatAmountRangeNote = (charge: ParsedRecurringCharge): string | null => {
  const { amount_min_cents: min, amount_max_cents: max, typical_amount_cents: typical } = charge;
  if (min === null && max === null) return null;
  if (min !== null && max !== null && min !== max) {
    return `Typical ${typical}¢; observed range ${min}–${max}¢`;
  }
  if (min !== null && max === null) return `Typical ${typical}¢; min observed ${min}¢`;
  if (max !== null) return `Typical ${typical}¢; max observed ${max}¢`;
  return null;
};

const resolveTransactionIdsForCharge = (
  charge: ParsedRecurringCharge,
  bySlug: Map<string, Transaction[]>,
  byId: Map<string, Transaction>,
  minTransactions: number,
): string[] => {
  const fromModel = charge.transaction_ids.filter((id) => {
    const txn = byId.get(id);
    return txn?.slug?.trim().toLowerCase() === charge.slug;
  });

  if (fromModel.length >= minTransactions) {
    return fromModel;
  }

  const slugTxns = bySlug.get(charge.slug) ?? [];
  if (slugTxns.length < minTransactions) {
    return [];
  }

  return slugTxns.map((t) => t.id);
};

const applyRecurringCharges = async (
  supabase: SupabaseClient,
  charges: ParsedRecurringCharge[],
  bySlug: Map<string, Transaction[]>,
  byId: Map<string, Transaction>,
  options: DetectRecurringAllInput,
): Promise<{ results: DetectRecurringChargeResult[]; purchasesCreated: number }> => {
  const minTransactions = options.min_transactions ?? 2;
  const slugFilter = options.slugs?.length
    ? new Set(options.slugs.map((s) => s.trim().toLowerCase()))
    : null;
  const createRecurring = Boolean(options.create_recurring);
  const onlyUnlinked = Boolean(options.only_unlinked);

  const existingPurchases = createRecurring ? await getAllRecurringPurchases(supabase) : [];
  const results: DetectRecurringChargeResult[] = [];
  let purchasesCreated = 0;

  for (const charge of charges) {
    if (slugFilter && !slugFilter.has(charge.slug)) {
      continue;
    }

    const transactionIds = resolveTransactionIdsForCharge(
      charge,
      bySlug,
      byId,
      minTransactions,
    );
    if (transactionIds.length < minTransactions) {
      continue;
    }

    const rangeNote = formatAmountRangeNote(charge);
    const notes = [charge.reason, rangeNote].filter(Boolean).join(' · ') || null;

    let recurringPurchase: RecurringPurchase | null = null;
    let recurringPurchaseId: string | null = null;

    if (createRecurring) {
      const existing = existingPurchases.find(
        (r) => r.vendor?.trim().toLowerCase() === charge.slug,
      );

      if (existing) {
        recurringPurchase = existing;
        recurringPurchaseId = existing.id;
      } else {
        try {
          recurringPurchase = await createRecurringPurchase(supabase, {
            name: charge.suggested_name,
            vendor: charge.slug,
            amount_cents: charge.typical_amount_cents,
            billing_interval: charge.billing_interval,
            interval_months: charge.interval_months ?? undefined,
            notes,
          });
          recurringPurchaseId = recurringPurchase.id;
          existingPurchases.push(recurringPurchase);
          purchasesCreated += 1;
        } catch (createError) {
          const message =
            createError instanceof Error ? createError.message : 'Unknown create error';
          console.warn('📊 processDetectRecurringAll', {
            step: 'create skipped',
            slug: charge.slug,
            interval: charge.billing_interval,
            message,
          });
        }
      }

      if (recurringPurchaseId) {
        for (const id of transactionIds) {
          const txn = byId.get(id);
          if (!txn) continue;
          if (onlyUnlinked && txn.recurring_purchase_id) continue;
          await updateTransaction(supabase, id, {
            recurring_purchase_id: recurringPurchaseId,
          });
        }
      }
    }

    results.push({
      slug: charge.slug,
      suggested_name: charge.suggested_name,
      billing_interval: charge.billing_interval,
      typical_amount_cents: charge.typical_amount_cents,
      amount_min_cents: charge.amount_min_cents,
      amount_max_cents: charge.amount_max_cents,
      transaction_ids: transactionIds,
      recurring_purchase_id: recurringPurchaseId,
      recurring_purchase: recurringPurchase,
      confidence: charge.confidence,
      reason: charge.reason,
    });
  }

  return { results, purchasesCreated };
};

/**
 * One AI exchange over all slugged transactions to detect recurring charges.
 */
export const processDetectRecurringAll = async (
  supabase: SupabaseClient,
  input: DetectRecurringAllInput = {},
): Promise<DetectRecurringAllResult> => {
  const all = await getAllTransactions(supabase, {});
  let notRecurringSlugs: string[] = [];
  try {
    const notRecurringRows = await getAllNotRecurring(supabase);
    notRecurringSlugs = notRecurringRows.map((r) => r.slug);
  } catch (notRecurringError) {
    if (!isSupabaseMissingTableError(notRecurringError, 'not_recurring')) {
      throw notRecurringError;
    }
    console.warn(
      '📊 processDetectRecurringAll not_recurring table missing; run docs/supabase/015_not_recurring.sql',
    );
  }

  const excludedSlugs = new Set(notRecurringSlugs.map((s) => s.trim().toLowerCase()));
  const slugged = all.filter((t) => {
    const slug = t.slug?.trim().toLowerCase();
    return slug && !excludedSlugs.has(slug);
  });
  const userMessage = buildRecurringDetectAllUserMessage(slugged, notRecurringSlugs);

  if (slugged.length === 0) {
    return {
      transaction_count: 0,
      recurring_found: 0,
      recurring_purchases_created: 0,
      results: [],
      audit: null,
    };
  }

  const bySlug = new Map<string, Transaction[]>();
  const byId = new Map<string, Transaction>();
  for (const txn of slugged) {
    const slug = txn.slug!.trim().toLowerCase();
    byId.set(txn.id, txn);
    const list = bySlug.get(slug) ?? [];
    list.push(txn);
    bySlug.set(slug, list);
  }

  const { systemPrompt, aiPromptId } = await resolveRecurringDetectSystemPrompt(supabase);
  const modelConfig = getModelConfig(AI_PROMPT_TYPE_RECURRING_DETECT);
  const requestPayload = JSON.parse(userMessage) as Record<string, unknown>;

  console.log('🚀 processDetectRecurringAll', {
    transactions: slugged.length,
    not_recurring_slugs: excludedSlugs.size,
    slug_groups: bySlug.size,
    user_message_chars: userMessage.length,
    model: modelConfig.model,
    max_tokens: modelConfig.maxTokens,
  });

  const runModel = async (): Promise<{
    rawResponse: string;
    usage: { input_tokens: number; output_tokens: number };
    charges: ParsedRecurringCharge[];
  }> => {
    const client = createManagedAnthropicClient();
    const { response: rawResponse, usage } = await generateCompletion(client, {
      systemPrompt,
      userMessage,
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      maxTokens: modelConfig.maxTokens,
      timeoutMs: 180_000,
    });
    let charges: ParsedRecurringCharge[];
    try {
      charges = parseRecurringDetectAllResponse(rawResponse);
    } catch (parseError) {
      const message =
        parseError instanceof Error ? parseError.message : 'Invalid JSON in model response';
      console.error('❌ processDetectRecurringAll', {
        step: 'parse failed',
        message,
        raw_preview: rawResponse.slice(0, 400),
        raw_tail: rawResponse.slice(-200),
      });
      throw new Error(
        `${message}. Response may be truncated — try again or reduce transaction count.`,
      );
    }
    return { rawResponse, usage, charges };
  };

  let audit: DetectRecurringAuditBundle | null = null;

  try {
    const requestRow = await createRecurringDetectAiRequest(supabase, {
      slug: RECURRING_DETECT_ALL_SLUG,
      ai_prompt_id: aiPromptId,
      prompt_type: AI_PROMPT_TYPE_RECURRING_DETECT,
      provider: 'anthropic',
      model: modelConfig.model,
      request_payload_json: requestPayload,
      system_prompt: systemPrompt,
      user_message: userMessage,
    });

    const exchangeRow = await createRecurringDetectAiExchange(supabase, {
      slug: RECURRING_DETECT_ALL_SLUG,
      request_id: requestRow.id,
      model_used: modelConfig.model,
    });

    await updateRecurringDetectAiRequest(supabase, requestRow.id, {
      exchange_id: exchangeRow.id,
    });

    audit = { exchange: exchangeRow, request: requestRow, response: null };

    const { rawResponse, usage, charges } = await runModel();

    console.log('🤖 processDetectRecurringAll', {
      step: 'model done',
      recurring_charges: charges.length,
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
    });

    const responseRow = await createRecurringDetectAiResponse(supabase, {
      request_id: requestRow.id,
      model: modelConfig.model,
      status: 'success',
      raw_response: rawResponse,
      parsed_response_json: { recurring_charges: charges } as unknown as Record<string, unknown>,
      usage_input_tokens: usage.input_tokens,
      usage_output_tokens: usage.output_tokens,
    });

    const totalTokens = usage.input_tokens + usage.output_tokens;
    const updatedExchange = await updateRecurringDetectAiExchange(supabase, exchangeRow.id, {
      response_id: responseRow.id,
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      total_tokens: totalTokens,
      status: 'completed',
    });

    const updatedRequest = await updateRecurringDetectAiRequest(supabase, requestRow.id, {
      status: 'completed',
    });

    audit = {
      exchange: updatedExchange,
      request: updatedRequest,
      response: responseRow,
    };

    const filteredCharges = charges.filter((c) => !excludedSlugs.has(c.slug));
    const { results, purchasesCreated } = await applyRecurringCharges(
      supabase,
      filteredCharges,
      bySlug,
      byId,
      input,
    );

    console.log('✅ processDetectRecurringAll', {
      recurring_found: results.length,
      purchases_created: purchasesCreated,
    });

    return {
      transaction_count: slugged.length,
      recurring_found: results.length,
      recurring_purchases_created: purchasesCreated,
      results,
      audit,
    };
  } catch (error) {
    if (isSupabaseMissingTableError(error, 'recurring_detect_ai')) {
      console.warn('📊 processDetectRecurringAll audit tables missing; detecting without audit');
      const { charges } = await runModel();
      const filteredCharges = charges.filter((c) => !excludedSlugs.has(c.slug));
      const { results, purchasesCreated } = await applyRecurringCharges(
        supabase,
        filteredCharges,
        bySlug,
        byId,
        input,
      );
      return {
        transaction_count: slugged.length,
        recurring_found: results.length,
        recurring_purchases_created: purchasesCreated,
        results,
        audit: null,
      };
    }

    if (audit) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await createRecurringDetectAiResponse(supabase, {
        request_id: audit.request.id,
        model: modelConfig.model,
        status: 'error',
        error_message: message,
      }).catch(() => null);
      await updateRecurringDetectAiExchange(supabase, audit.exchange.id, {
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
