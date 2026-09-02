export const MODELS = ['deepseek-ai/DeepSeek-V4-Flash-0731', 'MiniMaxAI/MiniMax-M2.7', 'moonshotai/Kimi-K2.6'] as const

export type ModelId = (typeof MODELS)[number]
