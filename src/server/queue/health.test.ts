import { beforeEach, describe, expect, test } from 'bun:test'
import { MODELS } from '../gateway/models'
import { healthyOrder, recordOutcome, resetHealth, stats } from './health'

const [DEEPSEEK, MINIMAX] = MODELS
const NOW = Date.UTC(2026, 8, 3, 12, 0, 0)

beforeEach(resetHealth)

describe('stats', () => {
  test('a model nobody has called reads as healthy with no latency', () => {
    const all = stats(NOW)

    expect(all).toHaveLength(2)
    expect(all.every((model) => model.healthy)).toBe(true)
    expect(all.every((model) => model.medianLatencyMs === null)).toBe(true)
  })

  test('the success rate counts only calls inside the window', () => {
    recordOutcome(DEEPSEEK, false, 90_000, NOW - 16 * 60_000)
    recordOutcome(DEEPSEEK, true, 12_000, NOW)

    const deepseek = stats(NOW).find((model) => model.model === DEEPSEEK)
    expect(deepseek?.successes).toBe(1)
    expect(deepseek?.failures).toBe(0)
    expect(deepseek?.successRate).toBe(1)
  })

  test('median latency uses successes only, so a 90 second timeout does not skew it', () => {
    recordOutcome(MINIMAX, true, 10_000, NOW)
    recordOutcome(MINIMAX, true, 20_000, NOW)
    recordOutcome(MINIMAX, false, 90_000, NOW)

    expect(stats(NOW).find((model) => model.model === MINIMAX)?.medianLatencyMs).toBe(15_000)
  })

  test('three failures with nothing successful marks a family down', () => {
    for (let i = 0; i < 3; i += 1) recordOutcome(DEEPSEEK, false, 1_200, NOW)

    expect(stats(NOW).find((model) => model.model === DEEPSEEK)?.healthy).toBe(false)
  })

  test('two failures is a bad minute, not a family down', () => {
    recordOutcome(DEEPSEEK, false, 1_200, NOW)
    recordOutcome(DEEPSEEK, false, 1_200, NOW)

    expect(stats(NOW).find((model) => model.model === DEEPSEEK)?.healthy).toBe(true)
  })

  test('one success keeps a family in even after three failures', () => {
    recordOutcome(DEEPSEEK, true, 12_000, NOW)
    for (let i = 0; i < 3; i += 1) recordOutcome(DEEPSEEK, false, 1_200, NOW)

    expect(stats(NOW).find((model) => model.model === DEEPSEEK)?.healthy).toBe(true)
  })
})

describe('healthyOrder', () => {
  // With two configured families the exclusion branch can never fire, and that is the correct
  // behaviour rather than a gap: dropping the failing one leaves a single candidate, and one
  // candidate cannot produce the two distinct readings a verdict requires. The round is better
  // served attempting a family that has been failing than guaranteeing itself an Unverified.
  test('a failing family is kept, because dropping it would leave one candidate', () => {
    for (let i = 0; i < 3; i += 1) recordOutcome(DEEPSEEK, false, 1_200, NOW)

    const order = healthyOrder(NOW)
    expect(order).toHaveLength(2)
    expect(order).toContain(DEEPSEEK)
    expect(order[0]).toBe(MINIMAX)
  })

  // Found on production, 3 September: MiniMax was the only healthy family, so the round had one
  // candidate and every item came back Unverified without a second call being attempted — while
  // both excluded families were answering ordinary prompts in under 25 seconds.
  test('a demoted family comes back when fewer than two are healthy', () => {
    for (let i = 0; i < 3; i += 1) recordOutcome(DEEPSEEK, false, 1_200, NOW)
    recordOutcome(MINIMAX, true, 12_000, NOW)

    const order = healthyOrder(NOW)
    expect(order).toHaveLength(2)
    expect(order[0]).toBe(MINIMAX)
    expect(order.slice(1)).toContain(DEEPSEEK)
  })

  test('a demoted family never outranks a healthy one', () => {
    for (let i = 0; i < 3; i += 1) recordOutcome(DEEPSEEK, false, 1_200, NOW)
    recordOutcome(MINIMAX, true, 12_000, NOW)

    expect(healthyOrder(NOW)[0]).toBe(MINIMAX)
  })

  test('better success rate comes first', () => {
    recordOutcome(DEEPSEEK, true, 50_000, NOW)
    recordOutcome(MINIMAX, true, 12_000, NOW)
    recordOutcome(MINIMAX, false, 90_000, NOW)

    expect(healthyOrder(NOW)[0]).toBe(DEEPSEEK)
  })

  // Probed on 5 September: DeepSeek answered in 7.2 s and MiniMax in 1.1 s, both HTTP 200. The
  // reader that returns sooner is the one to ask first when nothing separates them on reliability.
  // Which of the two is faster moves between measurements, so the assertion is on the ordering
  // rule rather than on a family name.
  test('at equal success rate the faster family comes first', () => {
    recordOutcome(DEEPSEEK, true, 7_200, NOW)
    recordOutcome(MINIMAX, true, 1_100, NOW)

    const order = healthyOrder(NOW)
    expect(order.indexOf(MINIMAX)).toBeLessThan(order.indexOf(DEEPSEEK))
  })
})
