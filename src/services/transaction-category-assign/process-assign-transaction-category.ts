import type { SupabaseClient } from '@supabase/supabase-js';
import { AI_PROMPT_TYPE_TRANSACTION_CATEGORY_ASSIGN } from '../../constants/ai-prompt-types';
import { resolveTransactionAccountName } from '../../utils/transactions/resolve-transaction-account-name';
import { createCategory, getAllCategories } from '../../data/categories';
import type { Category } from '../../data/categories/types';
import {
  createTransactionCategoryAssignAiExchange,
  updateTransactionCategoryAssignAiExchange,
} from '../../data/transaction-category-assign-ai-exchanges';
import {
  createTransactionCategoryAssignAiRequest,
  updateTransactionCategoryAssignAiRequest,
} from '../../data/transaction-category-assign-ai-requests';
import { createTransactionCategoryAssignAiResponse } from '../../data/transaction-category-assign-ai-responses';
import { getTransactionById, updateTransaction } from '../../data/transactions';
import type { Transaction } from '../../data/transactions/types';
import { createManagedAnthropicClient, generateCompletion, getModelConfig } from '../ai';
import { buildAssignCategoryUserMessage } from './build-assign-category-user-message';
import { parseAssignCategoryResponse } from './parse-assign-category-response';
import { resolveTransactionCategoryAssignSystemPrompt } from './resolve-transaction-category-assign-system-prompt';

export type AssignCategoryAuditBundle = {
  exchange: Awaited<ReturnType<typeof createTransactionCategoryAssignAiExchange>>;
  request: Awaited<ReturnType<typeof createTransactionCategoryAssignAiRequest>>;
  response: Awaited<ReturnType<typeof createTransactionCategoryAssignAiResponse>> | null;
};

export type AssignCategoryResult = {
  transaction: Transaction;
  category_id: string;
  category_name: string;
  category_created: boolean;
  matched_existing: boolean;
  confidence: string;
  reason: string;
  audit: AssignCategoryAuditBundle | null;
  skipped: boolean;
};

export type ProcessAssignCategoryOptions = {
  force?: boolean;
  existingCategoriesOverride?: Category[];
  /** One-off prompt for this run; does not update the stored active prompt. */
  systemPromptOverride?: string;
};

const truncate = (value: string, max = 120): string =>
  value.length <= max ? value : `${value.slice(0, max)}…`;

const findCategoryByName = (
  existingCategories: Category[],
  name: string,
): Category | undefined => {
  const normalized = name.trim().toLowerCase();
  return existingCategories.find((c) => c.name.trim().toLowerCase() === normalized);
};

const resolveCategoryFromParsed = async (
  supabase: SupabaseClient,
  parsed: ReturnType<typeof parseAssignCategoryResponse>,
  existingCategories: Category[],
): Promise<{ categoryId: string; categoryName: string; categoryCreated: boolean }> => {
  if (parsed.matched_existing) {
    if (parsed.category_id) {
      const byId = existingCategories.find((c) => c.id === parsed.category_id);
      if (byId) {
        return {
          categoryId: byId.id,
          categoryName: byId.name,
          categoryCreated: false,
        };
      }
    }
    if (parsed.category_name) {
      const byName = findCategoryByName(existingCategories, parsed.category_name);
      if (byName) {
        return {
          categoryId: byName.id,
          categoryName: byName.name,
          categoryCreated: false,
        };
      }
    }
    throw new Error(
      `Could not resolve existing category from model response (id=${parsed.category_id ?? 'none'}, name=${parsed.category_name || 'none'})`,
    );
  }

  const normalizedNew = parsed.category_name.trim();
  const byName = findCategoryByName(existingCategories, normalizedNew);
  if (byName) {
    return {
      categoryId: byName.id,
      categoryName: byName.name,
      categoryCreated: false,
    };
  }

  const created = await createCategory(supabase, { name: normalizedNew });
  return {
    categoryId: created.id,
    categoryName: created.name,
    categoryCreated: true,
  };
};

/**
 * Assigns a category to one transaction via Anthropic, reusing or creating categories as needed.
 */
export const processAssignTransactionCategory = async (
  supabase: SupabaseClient,
  transactionId: string,
  options: ProcessAssignCategoryOptions = {},
): Promise<AssignCategoryResult> => {
  console.log('🚀 processAssignTransactionCategory', {
    transaction_id: transactionId,
    force: Boolean(options.force),
    has_system_prompt_override: Boolean(options.systemPromptOverride?.trim()),
    override_chars: options.systemPromptOverride?.length ?? 0,
  });

  const transaction = await getTransactionById(supabase, transactionId);
  if (!transaction) {
    console.error('❌ processAssignTransactionCategory', {
      transaction_id: transactionId,
      message: 'transaction not found',
    });
    throw new Error('Transaction not found');
  }

  console.log('📊 processAssignTransactionCategory', {
    step: 'loaded transaction',
    posted_on: transaction.posted_on,
    amount_cents: transaction.amount_cents,
    description: truncate(transaction.description),
    slug: transaction.slug,
    category_id: transaction.category_id,
  });

  if (transaction.category_id && !options.force) {
    const existingCategories =
      options.existingCategoriesOverride ?? (await getAllCategories(supabase));
    const current = existingCategories.find((c) => c.id === transaction.category_id);
    console.log('✅ processAssignTransactionCategory', {
      step: 'skipped',
      reason: 'already categorized, force=false',
      category_name: current?.name ?? 'Unknown',
    });
    return {
      transaction,
      category_id: transaction.category_id,
      category_name: current?.name ?? 'Unknown',
      category_created: false,
      matched_existing: true,
      confidence: 'high',
      reason: 'Category already assigned',
      audit: null,
      skipped: true,
    };
  }

  const existingCategories =
    options.existingCategoriesOverride ?? (await getAllCategories(supabase));
  const previousCategory = transaction.category_id
    ? existingCategories.find((c) => c.id === transaction.category_id)
    : undefined;
  const resolvedPrompt = await resolveTransactionCategoryAssignSystemPrompt(supabase);
  const systemPrompt = options.systemPromptOverride?.trim() || resolvedPrompt.systemPrompt;
  const aiPromptId = resolvedPrompt.aiPromptId;
  const accountName = await resolveTransactionAccountName(supabase, transaction);
  const buildUserMessage = (recategorizeNote?: string | null) =>
    buildAssignCategoryUserMessage(transaction, existingCategories, {
      bankAccountName: accountName,
      recategorize: Boolean(options.force),
      previousCategoryName: previousCategory?.name,
      recategorizeNote,
    });

  const modelConfig = getModelConfig(AI_PROMPT_TYPE_TRANSACTION_CATEGORY_ASSIGN);
  let userMessage = buildUserMessage();
  let requestPayload = JSON.parse(userMessage) as Record<string, unknown>;

  console.log('🤖 processAssignTransactionCategory', {
    step: 'calling model',
    bank_account_name: accountName,
    previous_category_name: previousCategory?.name ?? null,
    assignment_mode: options.force ? 'recategorize' : 'assign',
    existing_category_names: existingCategories.map((c) => c.name),
    prompt_source: options.systemPromptOverride?.trim() ? 'override' : 'active_db_or_default',
    system_prompt_chars: systemPrompt.length,
    user_message_chars: userMessage.length,
    user_message_preview: truncate(userMessage, 400),
    model: modelConfig.model,
    max_tokens: modelConfig.maxTokens,
  });

  const requestRow = await createTransactionCategoryAssignAiRequest(supabase, {
    transaction_id: transaction.id,
    ai_prompt_id: aiPromptId,
    prompt_type: AI_PROMPT_TYPE_TRANSACTION_CATEGORY_ASSIGN,
    provider: 'anthropic',
    model: modelConfig.model,
    request_payload_json: requestPayload,
    system_prompt: systemPrompt,
    user_message: userMessage,
  });

  const exchangeRow = await createTransactionCategoryAssignAiExchange(supabase, {
    transaction_id: transaction.id,
    request_id: requestRow.id,
    model_used: modelConfig.model,
  });

  await updateTransactionCategoryAssignAiRequest(supabase, requestRow.id, {
    exchange_id: exchangeRow.id,
  });

  try {
    const client = createManagedAnthropicClient();

    const callModel = async (message: string, attempt: number) => {
      console.log('🤖 processAssignTransactionCategory', {
        step: 'model attempt',
        attempt,
        user_message_chars: message.length,
        user_message_preview: truncate(message, 400),
      });
      const { response: rawResponse, usage } = await generateCompletion(client, {
        systemPrompt,
        userMessage: message,
        model: modelConfig.model,
        temperature: modelConfig.temperature,
        maxTokens: modelConfig.maxTokens,
      });
      console.log('🤖 processAssignTransactionCategory', {
        step: 'model response',
        attempt,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        raw_preview: truncate(rawResponse, 300),
      });
      const parsed = parseAssignCategoryResponse(rawResponse);
      const resolved = await resolveCategoryFromParsed(supabase, parsed, existingCategories);
      return { rawResponse, usage, parsed, resolved };
    };

    const { rawResponse, usage, parsed, resolved } = await callModel(userMessage, 1);

    console.log('📊 processAssignTransactionCategory', {
      step: 'parsed assignment',
      matched_existing: parsed.matched_existing,
      category_id: resolved.categoryId,
      category_name: resolved.categoryName,
      category_created: resolved.categoryCreated,
      confidence: parsed.confidence,
      reason: parsed.reason,
      unchanged_from_previous: resolved.categoryId === transaction.category_id,
    });

    const responseRow = await createTransactionCategoryAssignAiResponse(supabase, {
      request_id: requestRow.id,
      model: modelConfig.model,
      status: 'success',
      raw_response: rawResponse,
      parsed_response_json: {
        ...parsed,
        category_id: resolved.categoryId,
        category_name: resolved.categoryName,
        category_created: resolved.categoryCreated,
      } as unknown as Record<string, unknown>,
      usage_input_tokens: usage.input_tokens,
      usage_output_tokens: usage.output_tokens,
    });

    const totalTokens = usage.input_tokens + usage.output_tokens;
    const updatedExchange = await updateTransactionCategoryAssignAiExchange(
      supabase,
      exchangeRow.id,
      {
        response_id: responseRow.id,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        total_tokens: totalTokens,
        status: 'completed',
      },
    );

    const updatedRequest = await updateTransactionCategoryAssignAiRequest(supabase, requestRow.id, {
      status: 'completed',
    });

    const updatedTransaction = await updateTransaction(supabase, transaction.id, {
      category_id: resolved.categoryId,
      last_category_assign_exchange_id: exchangeRow.id,
    });

    console.log('✅ processAssignTransactionCategory', {
      transaction_id: updatedTransaction.id,
      category_id: updatedTransaction.category_id,
      category_name: resolved.categoryName,
      exchange_id: exchangeRow.id,
    });

    return {
      transaction: updatedTransaction,
      category_id: resolved.categoryId,
      category_name: resolved.categoryName,
      category_created: resolved.categoryCreated,
      matched_existing: parsed.matched_existing && !resolved.categoryCreated,
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
    console.error('❌ processAssignTransactionCategory', {
      transaction_id: transactionId,
      message,
      error,
    });
    const responseRow = await createTransactionCategoryAssignAiResponse(supabase, {
      request_id: requestRow.id,
      model: modelConfig.model,
      status: 'error',
      error_message: message,
    });

    await updateTransactionCategoryAssignAiExchange(supabase, exchangeRow.id, {
      response_id: responseRow.id,
      status: 'failed',
      error_message: message,
    });

    await updateTransactionCategoryAssignAiRequest(supabase, requestRow.id, {
      status: 'failed',
    });

    throw new Error(`Category assign failed: ${message}`);
  }
};
