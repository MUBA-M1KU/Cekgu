import type { RecordDetail } from '../../shared/types'
import { env } from '../env'
import { askGemini } from './gemini'
import { askGonka } from './gonka'
import type { AgentAnswer, ToolReporter } from './prompt'

// The one place CHAT_PROVIDER decides anything. Both paths run the same prompt and the same tools
// from prompt.ts, so switching provider changes who phrases the answer and nothing about what the
// answer is allowed to say.

export function agentUnavailable(): boolean {
  return env.chat.provider === 'gemini' && env.gemini === null
}

export function ask(
  record: RecordDetail,
  question: string,
  history: string[],
  onTool?: ToolReporter
): Promise<AgentAnswer> {
  const run = env.chat.provider === 'gonka' ? askGonka : askGemini
  return run(record, question, history, onTool)
}
