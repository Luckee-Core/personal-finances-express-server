import {
  buildCrudEntityDocs,
  buildReadOnlyAuditDocs,
} from '../../utils/api-docs';
import type { ApiDocsCatalog, ApiDocsEndpoint, ApiDocsGroup } from './types';

const DEFAULT_PORT = 3011;

const successEnvelope = <T>(data: T) => ({ success: true, data });
const errorEnvelope = (error: string) => ({ success: false, error });

const auditExchangeExample = {
  id: 'uuid',
  slug: 'NETFLIX.COM',
  request_id: 'uuid',
  response_id: 'uuid',
  input_tokens: 1200,
  output_tokens: 80,
  status: 'completed',
  error_message: null,
  created_at: '2026-01-15T12:00:00.000Z',
  updated_at: '2026-01-15T12:00:01.000Z',
};

const buildOverviewGroup = (): ApiDocsGroup => ({
  name: 'Overview',
  description: [
    'REST API for the open-source Personal Finances app. Supabase stores accounts, transactions, categories, recurring bills, loans, and AI prompt config; this server exposes CRUD and AI workers over HTTP for the Next.js dashboard or any client.',
    'Route layout: `/api/data/*` — entity CRUD (bank accounts, transactions, …); `/api/ai/*` — AI orchestration (slug assign, category assign, recurring detect); `GET /api-docs.json` — this catalog. Standard entities use GET list, POST create, PATCH `/:id`, DELETE `/:id`. Exceptions (CSV upload, prompt activate, mark-not-recurring) are documented on their entity.',
    'Typical flow: create bank accounts and credit cards → upload CSV statement imports → transactions appear with `source: import` → run AI workers to assign merchant slugs and categories → review recurring purchases from slug patterns → track anticipated costs and loans on the dashboard.',
    'Amounts are integer cents. Dates use ISO 8601 (`YYYY-MM-DD` for `posted_on`, `due_on`). OSS default has no authentication — bind to localhost or add auth before exposing beyond a trusted machine. AI workers need `ANTHROPIC_API_KEY` on the server.',
  ].join('\n\n'),
  endpoints: [],
});

const buildHealthGroup = (): ApiDocsGroup => ({
  name: 'Health',
  description:
    'Liveness probe for load balancers and local dev. Returns plain JSON without the `{ success, data }` envelope.',
  endpoints: [
    {
      method: 'GET',
      path: '/api/health',
      summary: 'Health check',
      responses: [
        {
          status: 200,
          description: 'Server is running (no success wrapper)',
          example: {
            status: 'ok',
            service: 'personal-finances-express-server',
            timestamp: '2026-01-15T12:00:00.000Z',
            environment: 'development',
          },
        },
      ],
    },
  ],
});

const buildBankAccountsGroup = (): ApiDocsGroup => ({
  name: 'Bank accounts',
  description:
    'Checking and savings accounts that own transactions. Create accounts before manual entries or bank CSV imports. Each transaction links to exactly one bank account or credit card.',
  endpoints: buildCrudEntityDocs({
    entityName: 'bank account',
    basePath: '/api/data/bank-accounts',
    createBodyExample: { name: 'Checking', account_type: 'checking' },
    entityExample: {
      id: 'uuid',
      name: 'Checking',
      account_type: 'checking',
      created_at: '2026-01-15T12:00:00.000Z',
      updated_at: '2026-01-15T12:00:00.000Z',
    },
  }),
});

const buildCreditCardsGroup = (): ApiDocsGroup => ({
  name: 'Credit cards',
  description:
    'Credit card accounts for card-linked transactions and credit-card CSV imports. Used with statement imports when uploading card statements.',
  endpoints: buildCrudEntityDocs({
    entityName: 'credit card',
    basePath: '/api/data/credit-cards',
    createBodyExample: { name: 'Visa', issuer: 'Chase', last_four: '4242' },
    patchBodyExample: { name: 'Visa Platinum' },
    entityExample: {
      id: 'uuid',
      name: 'Visa',
      issuer: 'Chase',
      last_four: '4242',
      created_at: '2026-01-15T12:00:00.000Z',
      updated_at: '2026-01-15T12:00:00.000Z',
    },
  }),
});

const buildCategoriesGroup = (): ApiDocsGroup => ({
  name: 'Categories',
  description:
    'Spending labels (Groceries, Utilities, etc.) assigned to transactions manually or via AI category workers. Also referenced by anticipated costs.',
  endpoints: buildCrudEntityDocs({
    entityName: 'category',
    basePath: '/api/data/categories',
    createBodyExample: { name: 'Groceries', color: '#22c55e' },
    entityExample: {
      id: 'uuid',
      name: 'Groceries',
      color: '#22c55e',
      created_at: '2026-01-15T12:00:00.000Z',
      updated_at: '2026-01-15T12:00:00.000Z',
    },
  }),
});

const buildTransactionsGroup = (): ApiDocsGroup => {
  const transactionExample = {
    id: 'uuid',
    bank_account_id: 'uuid',
    credit_card_id: null,
    category_id: 'uuid',
    posted_on: '2026-01-10',
    amount_cents: -4599,
    description: 'WHOLE FOODS',
    source: 'import',
    slug: 'WHOLEFOODS',
    created_at: '2026-01-15T12:00:00.000Z',
    updated_at: '2026-01-15T12:00:00.000Z',
  };

  const crud = buildCrudEntityDocs({
    entityName: 'transaction',
    basePath: '/api/data/transactions',
    includeGetById: true,
    createBodyExample: {
      bank_account_id: 'uuid',
      posted_on: '2026-01-10',
      amount_cents: -2500,
      description: 'Coffee shop',
      source: 'manual',
    },
    patchBodyExample: { category_id: 'uuid', description: 'Updated' },
    entityExample: transactionExample,
  });

  const listEndpoint = crud[0];
  listEndpoint.queryParams = [
    { name: 'bankAccountId', description: 'Filter by bank account id' },
    { name: 'categoryId', description: 'Filter by category id' },
    { name: 'source', description: 'manual or import' },
    { name: 'fromDate', description: 'ISO date lower bound (posted_on)' },
    { name: 'toDate', description: 'ISO date upper bound (posted_on)' },
  ];

  return {
    name: 'Transactions',
    description:
      'Ledger entries from manual entry or CSV import. Negative `amount_cents` = outflow. Filter list by account, category, date range, or `source` (`manual` | `import`). Merchant `slug` normalizes descriptions for recurring detection and AI assignment.',
    endpoints: crud,
  };
};

const buildRecurringPurchasesGroup = (): ApiDocsGroup => {
  const entityExample = {
    id: 'uuid',
    name: 'Netflix',
    amount_cents: 1599,
    billing_interval: 'monthly',
    slug: 'NETFLIX.COM',
    created_at: '2026-01-15T12:00:00.000Z',
    updated_at: '2026-01-15T12:00:00.000Z',
  };

  const crud = buildCrudEntityDocs({
    entityName: 'recurring purchase',
    basePath: '/api/data/recurring-purchases',
    createBodyExample: {
      name: 'Netflix',
      amount_cents: 1599,
      billing_interval: 'monthly',
    },
    entityExample,
  });

  const markNotRecurring: ApiDocsEndpoint = {
    method: 'POST',
    path: '/api/data/recurring-purchases/:id/mark-not-recurring',
    summary: 'Mark recurring purchase as not recurring',
    description: 'Deletes the recurring purchase and records its slug in not_recurring.',
    responses: [
      {
        status: 200,
        description: 'Slug recorded',
        example: successEnvelope({
          not_recurring: { id: 'uuid', slug: 'NETFLIX.COM', notes: null },
          slug: 'NETFLIX.COM',
        }),
      },
      {
        status: 400,
        description: 'Invalid id',
        example: errorEnvelope('Invalid id'),
      },
      {
        status: 500,
        description: 'Server error',
        example: errorEnvelope('Internal server error'),
      },
    ],
  };

  return {
    name: 'Recurring purchases',
    description:
      'Subscriptions and repeating bills (Netflix, rent) with amount, billing interval, and optional next due date. AI recurring detection creates these from transaction slug patterns. Use `mark-not-recurring` to dismiss a false positive and block future detection for that slug.',
    endpoints: [...crud, markNotRecurring],
  };
};

const buildAnticipatedCostsGroup = (): ApiDocsGroup => ({
  name: 'Anticipated costs',
  description:
    'Planned or upcoming expenses with due date and status (`planned`, `completed`, `cancelled`). Powers the dashboard upcoming-costs view. Optional category and recurring timeframe fields for multi-payment plans.',
  endpoints: buildCrudEntityDocs({
    entityName: 'anticipated cost',
    basePath: '/api/data/anticipated-costs',
    createBodyExample: {
      name: 'Car insurance',
      amount_cents: 12000,
      due_on: '2026-03-01',
      status: 'planned',
    },
    entityExample: {
      id: 'uuid',
      name: 'Car insurance',
      amount_cents: 12000,
      due_on: '2026-03-01',
      status: 'planned',
      created_at: '2026-01-15T12:00:00.000Z',
      updated_at: '2026-01-15T12:00:00.000Z',
    },
  }),
});

const buildLoanVendorsGroup = (): ApiDocsGroup => ({
  name: 'Loan vendors',
  description:
    'Lenders and servicers (SoFi, Navient, etc.). Reference entity for loans — optional on each loan record.',
  endpoints: buildCrudEntityDocs({
    entityName: 'loan vendor',
    basePath: '/api/data/loan-vendors',
    createBodyExample: { name: 'SoFi' },
    entityExample: {
      id: 'uuid',
      name: 'SoFi',
      created_at: '2026-01-15T12:00:00.000Z',
      updated_at: '2026-01-15T12:00:00.000Z',
    },
  }),
});

const buildLoansGroup = (): ApiDocsGroup => ({
  name: 'Loans',
  description:
    'Debt tracking with current balance and monthly payment. Link to a loan vendor for grouping. Active flag controls dashboard visibility.',
  endpoints: buildCrudEntityDocs({
    entityName: 'loan',
    basePath: '/api/data/loans',
    createBodyExample: {
      name: 'Student loan',
      balance_cents: 2500000,
      monthly_payment_cents: 35000,
      loan_vendor_id: 'uuid',
    },
    entityExample: {
      id: 'uuid',
      name: 'Student loan',
      balance_cents: 2500000,
      monthly_payment_cents: 35000,
      loan_vendor_id: 'uuid',
      created_at: '2026-01-15T12:00:00.000Z',
      updated_at: '2026-01-15T12:00:00.000Z',
    },
  }),
});

const buildNotRecurringGroup = (): ApiDocsGroup => ({
  name: 'Not recurring',
  description:
    'Slugs marked as one-time purchases so recurring detection skips them. Read-only list — records are created when you call `POST /recurring-purchases/:id/mark-not-recurring`.',
  endpoints: buildCrudEntityDocs({
    entityName: 'not recurring slug',
    basePath: '/api/data/not-recurring',
    includeMutations: false,
    entityExample: {
      id: 'uuid',
      slug: 'ONEOFF.COM',
      notes: null,
      created_at: '2026-01-15T12:00:00.000Z',
    },
  }),
});

const buildStatementImportsGroup = (): ApiDocsGroup => ({
  name: 'Statement imports',
  description:
    'Upload bank or credit card CSV statements. Creates transactions in bulk with `source: import`. Multipart upload (max 5 MB); exactly one of `bank_account_id` or `credit_card_id` required.',
  endpoints: [
    {
      method: 'GET',
      path: '/api/data/statement-imports',
      summary: 'List statement imports',
      responses: [
        {
          status: 200,
          description: 'Import history',
          example: successEnvelope([
            {
              id: 'uuid',
              bank_account_id: 'uuid',
              credit_card_id: null,
              status: 'completed',
              created_at: '2026-01-15T12:00:00.000Z',
            },
          ]),
        },
      ],
    },
    {
      method: 'GET',
      path: '/api/data/statement-imports/:id',
      summary: 'Get statement import by id',
      responses: [
        {
          status: 200,
          description: 'Single import',
          example: successEnvelope({
            id: 'uuid',
            bank_account_id: 'uuid',
            status: 'completed',
          }),
        },
      ],
    },
    {
      method: 'POST',
      path: '/api/data/statement-imports',
      summary: 'Upload CSV statement',
      description:
        'multipart/form-data with field `file` (CSV, max 5 MB). Exactly one of bank_account_id or credit_card_id required.',
      requestBody: {
        contentType: 'multipart/form-data',
        example: {
          file: '(CSV file)',
          bank_account_id: 'uuid',
        },
      },
      responses: [
        {
          status: 200,
          description: 'Import result',
          example: successEnvelope({
            import: { id: 'uuid', status: 'completed' },
            createdCount: 42,
            skippedCount: 3,
            errors: [],
          }),
        },
        {
          status: 400,
          description: 'Validation error',
          example: errorEnvelope('file is required'),
        },
      ],
    },
  ],
});

const buildAiPromptsGroup = (): ApiDocsGroup => {
  const promptExample = {
    id: 'uuid',
    type: 'transaction_slug_assign',
    name: 'Default slug prompt',
    content: 'Assign a merchant slug...',
    isActive: true,
    createdAt: '2026-01-15T12:00:00.000Z',
    updatedAt: '2026-01-15T12:00:00.000Z',
  };

  const crud = buildCrudEntityDocs({
    entityName: 'AI prompt',
    basePath: '/api/data/ai-prompts',
    includeGetById: true,
    createBodyExample: {
      type: 'transaction_slug_assign',
      name: 'Default slug prompt',
      content: 'Assign a merchant slug...',
      makeActive: true,
    },
    entityExample: promptExample,
  });

  const activate: ApiDocsEndpoint = {
    method: 'POST',
    path: '/api/data/ai-prompts/:id/activate',
    summary: 'Activate AI prompt for its type',
    responses: [
      {
        status: 200,
        description: 'Activated prompt',
        example: successEnvelope(promptExample),
      },
      {
        status: 400,
        description: 'Invalid id',
        example: errorEnvelope('Invalid id'),
      },
    ],
  };

  return {
    name: 'AI prompts',
    description:
      'Versioned prompt templates for AI workers (`transaction_slug_assign`, `transaction_category_assign`, `recurring_detect`). One active prompt per type — use activate to switch. Content is JSON (typically `{ systemPrompt: "..." }`).',
    endpoints: [...crud, activate],
  };
};

const buildLlmModelsGroup = (): ApiDocsGroup => ({
  name: 'LLM models',
  description:
    'Read-only pricing catalog (input/output cost per million tokens). Used with AI audit records to compute spend in the dashboard.',
  endpoints: buildCrudEntityDocs({
    entityName: 'LLM model',
    basePath: '/api/data/llm-models',
    includeMutations: false,
    entityExample: {
      id: 'uuid',
      model_id: 'claude-sonnet-4-20250514',
      display_name: 'Claude Sonnet 4',
      input_cost_per_million: 3,
      output_cost_per_million: 15,
    },
  }),
});

const buildAiAuditGroup = (): ApiDocsGroup => {
  const auditPaths = [
    '/api/data/transaction-slug-assign-ai-exchanges',
    '/api/data/transaction-slug-assign-ai-requests',
    '/api/data/transaction-slug-assign-ai-responses',
    '/api/data/transaction-category-assign-ai-exchanges',
    '/api/data/transaction-category-assign-ai-requests',
    '/api/data/transaction-category-assign-ai-responses',
    '/api/data/recurring-detect-ai-exchanges',
    '/api/data/recurring-detect-ai-requests',
    '/api/data/recurring-detect-ai-responses',
  ];

  const endpoints = auditPaths.flatMap((basePath) =>
    buildReadOnlyAuditDocs('AI audit record', basePath, auditExchangeExample),
  );

  return {
    name: 'AI audit (read-only)',
    description:
      'Exchange, request, and response rows for every AI call (slug assign, category assign, recurring detect). GET list and GET by id only — use for cost tracking, token usage, and debugging worker output.',
    endpoints,
  };
};

const buildAiWorkersGroup = (): ApiDocsGroup => ({
  name: 'AI workers',
  description:
    'Orchestration under `/api/ai`. Calls Anthropic using the active prompt for each operation. Batch or single-transaction slug and category assignment; recurring detection from slug groups. Requires `ANTHROPIC_API_KEY` on the server.',
  endpoints: [
    {
      method: 'POST',
      path: '/api/ai/transactions/assign-slugs',
      summary: 'Batch assign transaction slugs',
      requestBody: {
        contentType: 'application/json',
        example: {
          transaction_ids: ['uuid'],
          only_unslagged: true,
          force: false,
          limit: 50,
        },
      },
      responses: [
        {
          status: 200,
          description: 'Batch result',
          example: successEnvelope({
            processed: 10,
            succeeded: 9,
            failed: 1,
            skipped: 0,
            total_matching: 10,
            remaining: 0,
            results: [],
            errors: [],
          }),
        },
      ],
    },
    {
      method: 'POST',
      path: '/api/ai/transactions/:id/assign-slug',
      summary: 'Assign slug to one transaction',
      requestBody: {
        contentType: 'application/json',
        example: { force: false },
      },
      responses: [
        {
          status: 200,
          description: 'Assignment result',
          example: successEnvelope({
            transaction: { id: 'uuid', slug: 'MERCHANT' },
            slug: 'MERCHANT',
            matched_existing: true,
            confidence: 0.95,
            reason: 'Matched known slug',
            audit: { exchange_id: 'uuid' },
            skipped: false,
          }),
        },
      ],
    },
    {
      method: 'POST',
      path: '/api/ai/transactions/assign-categories',
      summary: 'Batch assign transaction categories',
      requestBody: {
        contentType: 'application/json',
        example: {
          only_uncategorized: true,
          force: false,
          limit: 50,
        },
      },
      responses: [
        {
          status: 200,
          description: 'Batch result',
          example: successEnvelope({
            processed: 5,
            succeeded: 5,
            failed: 0,
            categories_created: 1,
            results: [],
          }),
        },
      ],
    },
    {
      method: 'POST',
      path: '/api/ai/transactions/:id/assign-category',
      summary: 'Assign category to one transaction',
      requestBody: {
        contentType: 'application/json',
        example: { force: false },
      },
      responses: [
        {
          status: 200,
          description: 'Assignment result',
          example: successEnvelope({
            transaction: { id: 'uuid' },
            category_id: 'uuid',
            category_name: 'Groceries',
            category_created: false,
            audit: { exchange_id: 'uuid' },
          }),
        },
      ],
    },
    {
      method: 'POST',
      path: '/api/ai/recurring/detect',
      summary: 'Detect recurring purchases from transaction slugs',
      requestBody: {
        contentType: 'application/json',
        example: {
          slugs: ['NETFLIX.COM'],
          min_transactions: 3,
          only_unlinked: true,
          create_recurring: true,
        },
      },
      responses: [
        {
          status: 200,
          description: 'Detection result',
          example: successEnvelope({
            transaction_count: 120,
            recurring_found: 4,
            recurring_purchases_created: 2,
            results: [],
            audit: { exchange_id: 'uuid' },
          }),
        },
      ],
    },
  ],
});

/**
 * Builds the full API documentation catalog for this server.
 */
export const buildApiDocsCatalog = (): ApiDocsCatalog => {
  const portFromEnv = Number(process.env.PORT);
  const port =
    Number.isFinite(portFromEnv) && portFromEnv > 0 ? portFromEnv : DEFAULT_PORT;
  const baseUrl = process.env.PUBLIC_API_URL?.trim() || `http://localhost:${port}`;

  return {
    version: '1.0.0',
    baseUrl,
    responseEnvelope: '{ success: true, data } | { success: false, error }',
    groups: [
      buildOverviewGroup(),
      buildHealthGroup(),
      buildBankAccountsGroup(),
      buildCreditCardsGroup(),
      buildCategoriesGroup(),
      buildTransactionsGroup(),
      buildRecurringPurchasesGroup(),
      buildAnticipatedCostsGroup(),
      buildLoanVendorsGroup(),
      buildLoansGroup(),
      buildNotRecurringGroup(),
      buildStatementImportsGroup(),
      buildAiPromptsGroup(),
      buildLlmModelsGroup(),
      buildAiWorkersGroup(),
      buildAiAuditGroup(),
    ],
  };
};
