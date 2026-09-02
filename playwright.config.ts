import { defineConfig, devices } from '@playwright/test'

// The smoke pass runs against a deployment, never a local build: TRD section 18 runs it
// after every production deploy and on demand against a preview URL.
const baseURL = process.env.E2E_BASE_URL ?? 'https://cekgu-op7lf5dspq-as.a.run.app'

export default defineConfig({
  testDir: './e2e',
  // .e2e.ts, not .spec.ts: bun test's default glob claims *.spec.ts and *.test.ts, and it
  // cannot run Playwright's test(). Keeping the extensions disjoint keeps both runners honest.
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
})
