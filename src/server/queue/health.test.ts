import { beforeEach, describe, expect, test } from 'bun:test'
import { MODELS } from '../gateway/models'
import { healthyOrder, recordOutcome, resetHealth, stats } from './health'

const [DEEPSEEK, MINIMAX, KIMI] = MODELS
const NOW = Date.UTC(2026, 8, 3, 12, 0, 0)

beforeEach(resetHealth)

describe('stats', () => {
  test('a model nobody has called reads as healthy with no latency', () => {
    const all = stats(NOW)

    expect(all).toHaveLength(3)
    expect(all.every((model) => model.healthy)).toBe(true)
    expect(all.every((model) => model.medianLatencyMs === null)).toBe(true)
  })

  test('the success rate counts only calls inside the window', () => {
    recordOutcome(KIMI, false, 90_000, NOW - 16 * 60_000)
    recordOutcome(KIMI, true, 12_000, NOW)

    const kimi = stats(NOW).find((model) => model.model === KIMI)
    expect(kimi?.successes).toBe(1)
    expect(kimi?.failures).toBe(0)
    expect(kimi?.successRate).toBe(1)
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
  test('it drops a family that is down while two healthy ones remain', () => {
    for (let i = 0; i < 3; i += 1) recordOutcome(DEEPSEEK, false, 1_200, NOW)

    expect(healthyOrder(NOW)).not.toContain(DEEPSEEK)
    expect(healthyOrder(NOW)).toHaveLength(2)
  })

  // Found on production, 3 September: MiniMax was the only healthy family, so the round had one
  // candidate and every item came back Unverified without a second call being attempted — while
  // both excluded families were answering ordinary prompts in under 25 seconds.
  test('a demoted family comes back when fewer than two are healthy', () => {
    for (let i = 0; i < 3; i += 1) {
      recordOutcome(DEEPSEEK, false, 1_200, NOW)
      recordOutcome(KIMI, false, 90_000, NOW)
    }
    recordOutcome(MINIMAX, true, 12_000, NOW)

    const order = healthyOrder(NOW)
    expect(order).toHaveLength(3)
    expect(order[0]).toBe(MINIMAX)
    expect(order.slice(1)).toContain(DEEPSEEK)
    expect(order.slice(1)).toContain(KIMI)
  })

  test('a demoted family never outranks a healthy one', () => {
    for (let i = 0; i < 3; i += 1) recordOutcome(KIMI, false, 90_000, NOW)
    for (let i = 0; i < 3; i += 1) recordOutcome(DEEPSEEK, false, 1_200, NOW)
    recordOutcome(MINIMAX, true, 12_000, NOW)

    expect(healthyOrder(NOW)[0]).toBe(MINIMAX)
  })

  test('better success rate comes first', () => {
    recordOutcome(KIMI, true, 50_000, NOW)
    recordOutcome(MINIMAX, true, 12_000, NOW)
    recordOutcome(MINIMAX, false, 90_000, NOW)

    expect(healthyOrder(NOW)[0]).toBe(KIMI)
  })

  // Kimi answered in 52 seconds and MiniMax in 12 on 3 September, both successfully. The reader that
  // returns sooner is the one to ask first when nothing separates them on reliability.
  test('at equal success rate the faster family comes first', () => {
    recordOutcome(KIMI, true, 52_000, NOW)
    recordOutcome(MINIMAX, true, 12_000, NOW)

    const order = healthyOrder(NOW)
    expect(order.indexOf(MINIMAX)).toBeLessThan(order.indexOf(KIMI))
  })
})
