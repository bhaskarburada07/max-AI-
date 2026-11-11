import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Circuit breaker for quota exhaustion
let quotaExhaustedUntil: number = 0;
const modelExhaustedUntil = new Map<string, number>();

export function isGeminiAvailable(): boolean {
  if (!apiKey || apiKey.length < 5) return false;
  if (Date.now() < quotaExhaustedUntil) return false;
  return true;
}

const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-3.1-pro-preview',
];

export async function safeGenerateContent(params: {
  contents: any;
  config?: any;
}): Promise<string | null> {
  if (!isGeminiAvailable() || !ai) {
    return null;
  }

  const now = Date.now();
  const availableModels = CANDIDATE_MODELS.filter((m) => (modelExhaustedUntil.get(m) || 0) <= now);
  if (availableModels.length === 0) {
    return null;
  }

  for (const modelName of availableModels) {
    let timerId: NodeJS.Timeout | null = null;
    try {
      const timeoutPromise = new Promise<null>((resolve) => {
        timerId = setTimeout(() => resolve(null), 18000);
      });

      // Safely catch any background rejection so it never crashes the Node process
      const safeModelCall = ai.models
        .generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        })
        .catch((err) => {
          const errStr = String(err?.message || err);
          const isQuotaError =
            err?.status === 429 ||
            err?.status === 'RESOURCE_EXHAUSTED' ||
            errStr.includes('429') ||
            errStr.includes('RESOURCE_EXHAUSTED') ||
            errStr.includes('quota') ||
            errStr.includes('Quota exceeded');

          if (isQuotaError) {
            modelExhaustedUntil.set(modelName, now + 15 * 60 * 1000);
          } else {
            console.warn(`[CrossMind AI] Model ${modelName} error:`, err?.message || err);
          }
          return null;
        });

      const response: any = await Promise.race([safeModelCall, timeoutPromise]);
      if (timerId) clearTimeout(timerId);

      const text = response?.text?.trim() || null;
      if (text) return text;
    } catch (err: any) {
      if (timerId) clearTimeout(timerId);
      console.warn(`[CrossMind AI] Unexpected error calling ${modelName}:`, err?.message || err);
    }
  }

  return null;
}
