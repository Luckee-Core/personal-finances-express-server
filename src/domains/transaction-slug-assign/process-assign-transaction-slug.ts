import type { SupabaseClient } from '@supabase/supabase-js';
import { AI_PROMPT_TYPE_TRANSACTION_SLUG_ASSIGN } from '../../constants/ai-prompt-types';
import {
  createTransactionSlugAssignAiExchange,
  updateTransactionSlugAssignAiExchange,
} from '../../data/transaction-slug-assign-ai-exchanges';
import {
  createTransactionSlugAssignAiRequest,
  updateTransactionSlugAssignAiRequest,
} from '../../data/transaction-slug-assign-ai-requests';
import { createTransactionSlugAssignAiResponse } from '../../data/transaction-slug-assign-ai-responses';
import { resolveTransactionAccountName } from '../../utils/transactions/resolve-transaction-account-name';
import {
  getDistinctTransactionSlugs,
  getTransactionById,
  updateTransaction,
} from '../../data/transactions';
import type { Transaction } from '../../data/transactions/types';
import { createManagedAnthropicClient, generateCompletion, getModelConfig } from '../../services/ai';
import { buildAssignSlugUserMessage } from './build-assign-slug-user-message';
import { parseAssignSlugResponse } from './parse-assign-slug-response';
import { resolveTransactionSlugAssignSystemPrompt } from './resolve-transaction-slug-assign-system-prompt';

export type AssignSlugAuditBundle = {
  exchange: Awaited<ReturnType<typeof createTransactionSlugAssignAiExchange>>;
  request: Awaited<ReturnType<typeof createTransactionSlugAssignAiRequest>>;
  response: Awaited<ReturnType<typeof createTransactionSlugAssignAiResponse>> | null;
};

export type AssignSlugResult = {
  transaction: Transaction;
  slug: string;
  matched_existing: boolean;
  confidence: string;
  reason: string;
  audit: AssignSlugAuditBundle | null;
  skipped: boolean;
};

export type ProcessAssignSlugOptions = {
  force?: boolean;
  existingSlugsOverride?: string[];
  systemPromptOverride?: string;
};

/**
 * Assigns a merchant slug to one transaction via Anthropic, persisting the three-table audit trail.
 */
export const processAssignTransactionSlug = async (
  supabase: SupabaseClient,
  transactionId: string,
  options: ProcessAssignSlugOptions = {},
): Promise<AssignSlugResult> => {
  const transaction = await getTransactionById(supabase, transactionId);
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.slug && !options.force) {
    return {
      transaction,
      slug: transaction.slug,
      matched_existing: true,
      confidence: 'high',
      reason: 'Slug already assigned',
      audit: null,
      skipped: true,
    };
  }

  const existingSlugs =
    options.existingSlugsOverride ?? (await getDistinctTransactionSlugs(supabase));
  const resolvedPrompt = await resolveTransactionSlugAssignSystemPrompt(supabase);
  const systemPrompt = options.systemPromptOverride?.trim() || resolvedPrompt.systemPrompt;
  const aiPromptId = resolvedPrompt.aiPromptId;
  const accountName = await resolveTransactionAccountName(supabase, transaction);
  const userMessage = buildAssignSlugUserMessage(
    transaction,
    existingSlugs,
    accountName,
  );
  const modelConfig = getModelConfig(AI_PROMPT_TYPE_TRANSACTION_SLUG_ASSIGN);
  const requestPayload = JSON.parse(userMessage) as Record<string, unknown>;

  const requestRow = await createTransactionSlugAssignAiRequest(supabase, {
    transaction_id: transaction.id,
    ai_prompt_id: aiPromptId,
    prompt_type: AI_PROMPT_TYPE_TRANSACTION_SLUG_ASSIGN,
    provider: 'anthropic',
    model: modelConfig.model,
    request_payload_json: requestPayload,
    system_prompt: systemPrompt,
    user_message: userMessage,
  });

  const exchangeRow = await createTransactionSlugAssignAiExchange(supabase, {
    transaction_id: transaction.id,
    request_id: requestRow.id,
    model_used: modelConfig.model,
  });

  await updateTransactionSlugAssignAiRequest(supabase, requestRow.id, {
    exchange_id: exchangeRow.id,
  });

  try {
    const client = createManagedAnthropicClient();
    const { response: rawResponse, usage } = await generateCompletion(client, {
      systemPrompt,
      userMessage,
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      maxTokens: modelConfig.maxTokens,
    });

    const parsed = parseAssignSlugResponse(rawResponse);

    const responseRow = await createTransactionSlugAssignAiResponse(supabase, {
      request_id: requestRow.id,
      model: modelConfig.model,
      status: 'success',
      raw_response: rawResponse,
      parsed_response_json: parsed as unknown as Record<string, unknown>,
      usage_input_tokens: usage.input_tokens,
      usage_output_tokens: usage.output_tokens,
    });

    const totalTokens = usage.input_tokens + usage.output_tokens;
    const updatedExchange = await updateTransactionSlugAssignAiExchange(supabase, exchangeRow.id, {
      response_id: responseRow.id,
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      total_tokens: totalTokens,
      status: 'completed',
    });

    const updatedRequest = await updateTransactionSlugAssignAiRequest(supabase, requestRow.id, {
      status: 'completed',
    });

    const updatedTransaction = await updateTransaction(supabase, transaction.id, {
      slug: parsed.slug,
      last_slug_assign_exchange_id: exchangeRow.id,
    });

    return {
      transaction: updatedTransaction,
      slug: parsed.slug,
      matched_existing: parsed.matched_existing,
      confidence: parsed.confidence,
      reason: parsed.reason,
      audit: {
        exchange: updatedExchange,
        request: updatedRequest,
        response: responseRow,
      },
      skipped: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const responseRow = await createTransactionSlugAssignAiResponse(supabase, {
      request_id: requestRow.id,
      model: modelConfig.model,
      status: 'error',
      error_message: message,
    });

    await updateTransactionSlugAssignAiExchange(supabase, exchangeRow.id, {
      response_id: responseRow.id,
      status: 'failed',
      error_message: message,
    });

    await updateTransactionSlugAssignAiRequest(supabase, requestRow.id, {
      status: 'failed',
    });

    throw new Error(`Slug assign failed: ${message}`);
  }
};
