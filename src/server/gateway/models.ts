// moonshotai/Kimi-K2.6 was the third family until 5 September 2026, when the gateway stopped
// serving it and began answering 400 for it. Two families is the floor, not a preference: one
// family cannot produce the two distinct readings a verdict requires. Issue #239.
export const MODELS = ['deepseek-ai/DeepSeek-V4-Flash-0731', 'MiniMaxAI/MiniMax-M2.7'] as const

export type ModelId = (typeof MODELS)[number]
