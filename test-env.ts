// Preloaded before every test file by bunfig.toml.
//
// src/server/env.ts snapshots process.env when it is first imported, and `bun test` runs the whole
// suite in one process, so without this the first test file to reach env.ts decides these values
// for every other file and the suite passes or fails on filename order.
//
// The assignments are unconditional on purpose. Bun loads .env for `bun test` too, so a developer's
// real DATABASE_URL is otherwise live inside the suite and one careless query reaches Neon. A test
// that wants a database asks for TEST_DATABASE_URL and overrides this itself; everything else gets
// a stand-in that connects to nothing.
process.env.DATABASE_URL = 'postgres://cekgu@localhost:5432/cekgu'
process.env.BETTER_AUTH_SECRET = 'placeholder'
process.env.GUEST_EMAIL = 'guest@example.invalid'
process.env.GUEST_PASSWORD = 'placeholder'
process.env.MASCOT_ENABLED = 'true'
// Required by env.ts. CI has no .env, so without this every file that reaches the gateway client
// throws at import. The tests stub fetch and never send it anywhere.
process.env.GONKA_API_KEY = 'sk-placeholder-not-a-key'
