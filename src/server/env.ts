function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable ${name}. See docs/TRD.md section 8.`)
  return value
}

function optional(name: string): string | null {
  const value = process.env[name]
  return value && value.length > 0 ? value : null
}

const googleClientId = optional('GOOGLE_CLIENT_ID')
const googleClientSecret = optional('GOOGLE_CLIENT_SECRET')
const geminiApiKey = optional('GEMINI_API_KEY')

export const env = {
  port: Number(process.env.PORT ?? 8080),
  gonkaApiKey: required('GONKA_API_KEY'),
  // The product uses the OpenAI surface only. The /v1 suffix belongs in the value, not the path
  // the client builds, because the two surfaces disagree about it (TRD section 1).
  gonkaBaseUrlOpenai: optional('GONKA_BASE_URL_OPENAI') ?? 'https://api.gonkarouter.io/v1',
  databaseUrl: required('DATABASE_URL'),
  betterAuthSecret: required('BETTER_AUTH_SECRET'),
  betterAuthUrl: optional('BETTER_AUTH_URL') ?? `http://localhost:${process.env.PORT ?? 8080}`,
  guestEmail: required('GUEST_EMAIL'),
  guestPassword: required('GUEST_PASSWORD'),
  mascotEnabled: process.env.MASCOT_ENABLED === 'true',
  // Both default on, so production and local development are unchanged by their absence. A preview
  // revision sets them to 'false': it shares production's DATABASE_URL by TRD section 10, and an
  // instance nobody has reviewed yet must not apply migrations or run a delete loop against those rows.
  migrateOnStart: process.env.MIGRATE_ON_START !== 'false',
  workerEnabled: process.env.WORKER_ENABLED !== 'false',
  // Google stays optional so a deployment without an OAuth client still boots with
  // email and Guest sign-in working. FR-AUTH-2 is the demo path, not Google.
  google: googleClientId && googleClientSecret ? { clientId: googleClientId, clientSecret: googleClientSecret } : null,
  // Optional on purpose: absent, POST /api/extract answers 503 with a sentence saying uploads are
  // off, and every other route is unaffected. A deployment without this key is a working product
  // with one affordance missing, not a broken one.
  gemini: geminiApiKey ? { apiKey: geminiApiKey, model: optional('GEMINI_MODEL') ?? 'gemini-2.5-flash' } : null
}
