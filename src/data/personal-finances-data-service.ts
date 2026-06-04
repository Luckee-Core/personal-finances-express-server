import { Router } from 'express';
import { createAiPromptsRouter } from './ai-prompts/router';
import { createBankAccountsRouter } from './bank-accounts/router';
import { createCreditCardsRouter } from './credit-cards/router';
import { createCategoriesRouter } from './categories/router';
import { createTransactionsRouter } from './transactions/router';
import { createNotRecurringRouter } from './not-recurring/router';
import { createAnticipatedCostsRouter } from './anticipated-costs/router';
import { createRecurringPurchasesRouter } from './recurring-purchases/router';
import { createStatementImportsRouter } from './statement-imports/router';
import { createTransactionCategoryAssignAiExchangesRouter } from './transaction-category-assign-ai-exchanges/router';
import { createTransactionCategoryAssignAiRequestsRouter } from './transaction-category-assign-ai-requests/router';
import { createTransactionCategoryAssignAiResponsesRouter } from './transaction-category-assign-ai-responses/router';
import { createRecurringDetectAiExchangesRouter } from './recurring-detect-ai-exchanges/router';
import { createRecurringDetectAiRequestsRouter } from './recurring-detect-ai-requests/router';
import { createRecurringDetectAiResponsesRouter } from './recurring-detect-ai-responses/router';
import { createLoanVendorsRouter } from './loan-vendors/router';
import { createLoansRouter } from './loans/router';
import { createLlmModelsRouter } from './llm-models/router';
import { createTransactionSlugAssignAiExchangesRouter } from './transaction-slug-assign-ai-exchanges/router';
import { createTransactionSlugAssignAiRequestsRouter } from './transaction-slug-assign-ai-requests/router';
import { createTransactionSlugAssignAiResponsesRouter } from './transaction-slug-assign-ai-responses/router';

/**
 * Aggregates all personal finances data routers under /api/data.
 */
export const createPersonalFinancesDataService = (): Router => {
  const router = Router();
  router.use('/bank-accounts', createBankAccountsRouter());
  router.use('/credit-cards', createCreditCardsRouter());
  router.use('/categories', createCategoriesRouter());
  router.use('/transactions', createTransactionsRouter());
  router.use('/recurring-purchases', createRecurringPurchasesRouter());
  router.use('/anticipated-costs', createAnticipatedCostsRouter());
  router.use('/loan-vendors', createLoanVendorsRouter());
  router.use('/loans', createLoansRouter());
  router.use('/not-recurring', createNotRecurringRouter());
  router.use('/statement-imports', createStatementImportsRouter());
  router.use('/ai-prompts', createAiPromptsRouter());
  router.use('/llm-models', createLlmModelsRouter());
  router.use(
    '/transaction-slug-assign-ai-exchanges',
    createTransactionSlugAssignAiExchangesRouter(),
  );
  router.use(
    '/transaction-slug-assign-ai-requests',
    createTransactionSlugAssignAiRequestsRouter(),
  );
  router.use(
    '/transaction-slug-assign-ai-responses',
    createTransactionSlugAssignAiResponsesRouter(),
  );
  router.use(
    '/transaction-category-assign-ai-exchanges',
    createTransactionCategoryAssignAiExchangesRouter(),
  );
  router.use(
    '/transaction-category-assign-ai-requests',
    createTransactionCategoryAssignAiRequestsRouter(),
  );
  router.use(
    '/transaction-category-assign-ai-responses',
    createTransactionCategoryAssignAiResponsesRouter(),
  );
  router.use('/recurring-detect-ai-exchanges', createRecurringDetectAiExchangesRouter());
  router.use('/recurring-detect-ai-requests', createRecurringDetectAiRequestsRouter());
  router.use('/recurring-detect-ai-responses', createRecurringDetectAiResponsesRouter());
  return router;
};
