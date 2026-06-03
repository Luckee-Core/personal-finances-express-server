import Anthropic from '@anthropic-ai/sdk';

export type CompletionOptions = {
  systemPrompt: string;
  userMessage: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Anthropic request timeout in ms (default 90s). */
  timeoutMs?: number;
};

let managedClient: Anthropic | null = null;

const normalizeAnthropicApiKey = (raw: string | undefined): string | undefined => {
  if (raw === undefined || raw === null) return undefined;
  let key = String(raw).trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  return key.length > 0 ? key : undefined;
};

/**
 * Returns the singleton managed Anthropic client when ANTHROPIC_API_KEY is set.
 */
export const getManagedAnthropicClient = (): Anthropic | null => {
  if (managedClient) return managedClient;

  const apiKey = normalizeAnthropicApiKey(process.env.ANTHROPIC_API_KEY);
  if (!apiKey) {
    console.warn('❌ Managed Anthropic not configured (ANTHROPIC_API_KEY missing)');
    return null;
  }

  managedClient = new Anthropic({ apiKey });
  return managedClient;
};

/**
 * Initializes the managed Anthropic client at server startup.
 */
export const initializeAnthropicClient = (): void => {
  console.log('🚀 Initializing managed Anthropic client');
  const client = getManagedAnthropicClient();
  if (client) {
    console.log('✅ Managed Anthropic client ready');
  } else {
    console.warn('❌ Managed Anthropic client not configured');
  }
};

/**
 * Returns the managed Anthropic client or throws if not configured.
 */
export const createManagedAnthropicClient = (): Anthropic => {
  const client = getManagedAnthropicClient();
  if (!client) {
    throw new Error('Managed Anthropic not configured');
  }
  return client;
};

/**
 * Generates a single-turn completion with Anthropic Claude.
 */
export const generateCompletion = async (
  client: Anthropic,
  options: CompletionOptions,
): Promise<{ response: string; usage: { input_tokens: number; output_tokens: number } }> => {
  const {
    systemPrompt,
    userMessage,
    model = 'claude-haiku-4-5-20251001',
    temperature = 0,
    maxTokens = 256,
    timeoutMs = 90_000,
  } = options;

  console.log('🤖 generateCompletion', { model, timeout_ms: timeoutMs });
  const message = await client.messages.create(
    {
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    },
    { timeout: timeoutMs },
  );

  const textContent = message.content.find((block) => block.type === 'text');
  const response = textContent && textContent.type === 'text' ? textContent.text : '{}';

  return {
    response,
    usage: {
      input_tokens: message.usage.input_tokens,
      output_tokens: message.usage.output_tokens,
    },
  };
};
