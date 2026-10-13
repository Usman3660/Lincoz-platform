/**
 * Lincoz Enterprise - AI & LLM Security Gateway
 * AI & LLM RULES:
 * 1. Server-side proxy only; API key never sent to browser.
 * 2. Sanitize user input to prevent prompt injection.
 * 3. Enforce max_tokens limit and user token budgets.
 * 4. Sanitize generated output before delivery.
 */

import { env } from '../../config/env.js';
import { logger } from '../../infrastructure/logger/logger.js';

// In-memory token budget tracking (in production, backed by Redis)
const userTokenUsageLedger = new Map();

/**
 * Checks and updates per-user token quotas.
 * @param {string} userId
 * @param {number} estimatedTokens
 */
function verifyUserTokenBudget(userId, estimatedTokens = 100) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `${userId}:${today}`;
  const currentUsage = userTokenUsageLedger.get(key) || 0;

  if (currentUsage + estimatedTokens > env.DAILY_TOKEN_BUDGET_PER_USER) {
    throw new Error(`Daily AI token budget exceeded (${currentUsage}/${env.DAILY_TOKEN_BUDGET_PER_USER} tokens used).`);
  }

  return { key, currentUsage };
}

/**
 * Sanitizes input text to neutralize prompt injection attempts.
 * @param {string} prompt
 * @returns {string}
 */
export function sanitizePromptInput(prompt) {
  if (typeof prompt !== 'string') return '';
  
  return prompt
    // Strip control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Neutralize common delimiter injection attempts
    .replace(/```(system|assistant|user)/gi, '```')
    // Length restriction
    .slice(0, 2000)
    .trim();
}

/**
 * Secure proxy to generate project/task summaries or financial reviews.
 * @param {string} userId
 * @param {string} userPrompt
 * @param {string} systemContext
 * @returns {Promise<{ result: string, tokensUsed: number }>}
 */
export async function executeSecureAiPrompt(userId, userPrompt, systemContext = 'You are an internal enterprise project management assistant. Generate clear, professional summaries.') {
  if (!env.GEMINI_API_KEY) {
    return {
      result: 'AI assistance unavailable: Server GEMINI_API_KEY is not configured.',
      tokensUsed: 0,
    };
  }

  // 1. Verify user token budget
  const { key, currentUsage } = verifyUserTokenBudget(userId);

  // 2. Sanitize user input against prompt injection
  const cleanInput = sanitizePromptInput(userPrompt);

  try {
    // 3. Make server-side call using official Google Gen AI endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemContext}\n\nTask details to summarize:\n${cleanInput}` }],
          },
        ],
        generationConfig: {
          maxOutputTokens: env.MAX_AI_TOKENS_PER_REQUEST, // Hard ceiling to prevent cost attacks
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      logger.error('Gemini API call returned non-200', { status: response.status, errBody });
      throw new Error('AI generation service encountered a temporary error.');
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const totalTokens = data.usageMetadata?.totalTokenCount || 150;

    // 4. Update usage ledger
    userTokenUsageLedger.set(key, currentUsage + totalTokens);
    logger.info('AI proxy request completed', { userId, tokensUsed: totalTokens });

    // 5. Sanitize output to prevent generated XSS injection
    const safeOutput = generatedText
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

    return {
      result: safeOutput,
      tokensUsed: totalTokens,
    };
  } catch (error) {
    logger.error('AI Proxy execution failure', { userId, error });
    throw error;
  }
}
