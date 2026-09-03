import { expect, test } from '@playwright/test'

// The demo path end to end in a browser against a deployment, with nothing mocked: a guest types a
// mis-keyed question, the queue runs it through GonkaRouter, and the workspace shows the verdict
// with both served models and both request ids. It is the only test that proves the four track
// requirements hold in the product rather than in a fixture.
//
// It is slow by nature — a round is two live model calls — so it is excluded from the default run:
//
//   E2E_FLOW=1 bunx playwright test e2e/flow.e2e.ts
//
test.skip(!process.env.E2E_FLOW, 'Set E2E_FLOW=1 to run the live gateway path.')

test('a guest types a check and gets a receipt-verified verdict', async ({ page, request }) => {
  test.setTimeout(600_000)
  const errors: string[] = []
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  page.on('pageerror', (error) => errors.push(String(error)))

  await page.goto('/sign-in')
  await page.getByRole('button', { name: /guest/i }).first().click()
  await page.waitForURL(/dashboard|records|new-check/, { timeout: 30_000 })

  await page.goto('/new-check')
  await page.locator('#title').fill('Browser flow check')
  await page.locator('#subject').fill('Computer Science')
  await page.locator('#stem-0').fill('Which data structure processes elements in first in, first out order?')
  await page.locator('#option-0-0').fill('Stack')
  await page.locator('#option-0-1').fill('Queue')
  // The key is wrong on purpose: Stack, when both readers will say Queue.
  // The input is sr-only, so the label is the target — which is what a person clicks anyway.
  await page.locator('label:has(input[type="radio"][value="A"])').first().click()
  await page.getByRole('button', { name: 'Submit Check' }).click()

  await page.waitForURL(/\/records\/[0-9a-f-]{36}/, { timeout: 60_000 })
  const recordId = page.url().split('/').pop() ?? ''

  // Asserted on the verdict reason, not on the words "Possible Key Error". The summary filters name
  // all five verdicts at zero from the moment the page loads, so matching the label passes instantly
  // against a record that has not been read yet. A reason exists only once the rule has run.
  await expect(page.getByText(/The supplied key is Stack/i)).toBeVisible({ timeout: 480_000 })

  const body = await page.locator('body').innerText()
  const requestIds = [...new Set([...body.matchAll(/req-\d+-\d+/g)].map((match) => match[0]))]
  const models = ['MiniMaxAI/MiniMax-M2.7', 'moonshotai/Kimi-K2.6', 'deepseek-ai/DeepSeek-V4-Flash-0731'].filter(
    (model) => body.includes(model)
  )

  // The track requirements, read off the rendered page.
  expect(requestIds.length).toBeGreaterThanOrEqual(2)
  expect(models.length).toBeGreaterThanOrEqual(2)
  expect(await page.locator('a[href*="/v1/receipts/"]').count()).toBeGreaterThanOrEqual(2)
  expect(errors).toEqual([])

  // Guest records expire in 24 hours anyway, but leaving demo litter in a shared workspace is rude.
  await request.delete('/api/records', { data: { ids: [recordId] } })
})
