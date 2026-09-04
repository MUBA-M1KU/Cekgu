import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { Glob } from 'bun'

// The GonkaRouter track's first rule is the fatal one, and its exact words are what this file
// enforces: all AI **reasoning and verification logic** must run on the Gonka Network via the
// official gateway. Reasoning and verification, not every call a model ever serves.
//
// So there is one hole in the wall and it is named here rather than left to a reviewer's memory:
// src/server/transcribe/ may reach a vision provider to turn pixels and PDF bytes into the words
// printed on the page. That step decides nothing — every judgement about what those words mean is
// made afterwards by two Gonka models carrying request ids. The hole is one directory wide, and
// the reasoning path is asserted separately below so it can never widen into one.
//
// The rest is the easiest rule to break by accident — one `npm i openai` in a hurry, one base URL
// edited while debugging — and nothing about a broken build would say so. The product would work.
// It would just be ineligible.
//
// So it is asserted rather than remembered. Everything here reads committed files; it needs no
// database, no network and no gateway key, which means it runs everywhere the rest of the suite
// does and cannot be skipped into uselessness.

const root = new URL('../../../', import.meta.url)
const read = (relative: string) => readFileSync(new URL(relative, root), 'utf8')

const GATEWAY = 'api.gonkarouter.io'

// Hostnames a model provider answers on directly. Not an exhaustive list of every provider alive,
// but every one whose SDK or docs a person could plausibly paste in while chasing a bug.
const DIRECT_PROVIDER_HOST =
  /\b(api\.openai\.com|api\.anthropic\.com|generativelanguage\.googleapis\.com|[a-z0-9-]+\.openai\.azure\.com|api\.mistral\.ai|api\.cohere\.(ai|com)|api\.together\.(ai|xyz)|api\.groq\.com|api\.deepseek\.com|api\.moonshot\.cn|api\.minimax\.chat|api\.x\.ai|api\.perplexity\.ai|openrouter\.ai)\b/

// Client libraries that talk to a provider for you. A dependency is enough to fail this: if it is
// installed, the call it makes is one import away and no reviewer will catch it.
const PROVIDER_PACKAGE =
  /^(openai|@openai\/|@anthropic-ai\/|@google\/gene|@google\/gen|@google-cloud\/aiplatform|@mistralai\/|cohere-ai|groq-sdk|@ai-sdk\/|ai$|langchain|@langchain\/|llamaindex|replicate)/

const sources = [...new Glob('src/**/*.{ts,tsx}').scanSync({ cwd: new URL('.', root).pathname })]

// The single exemption, spelled as a path prefix so a second transcription file is covered and a
// provider host anywhere else is not. Widening this line is the change a reviewer should stop.
const TRANSCRIPTION_DIR = 'src/server/transcribe/'

// Where reasoning actually happens. Named separately because the exemption above is a directory
// rule, and a directory rule alone would not notice the day somebody moves a verdict into it.
const REASONING_DIRS = ['src/server/gateway/', 'src/server/queue/', 'src/server/extract/', 'src/shared/']

describe('every inference goes through GonkaRouter', () => {
  test('no source file outside the transcription boundary names a provider host', () => {
    const offences: string[] = []
    for (const file of sources) {
      // This file names them on purpose; it is the thing doing the checking.
      if (file.endsWith('only-gonkarouter.test.ts')) continue
      if (file.startsWith(TRANSCRIPTION_DIR)) continue
      const text = read(file)
      const match = DIRECT_PROVIDER_HOST.exec(text)
      if (match) offences.push(`${file}: ${match[0]}`)
    }
    expect(offences).toEqual([])
  })

  // The exemption is for transcription only. If a file under it ever imports the verdict rule or
  // the record writer, the boundary has stopped being a boundary.
  test('the transcription boundary decides nothing', () => {
    const offences: string[] = []
    for (const file of sources.filter((name) => name.startsWith(TRANSCRIPTION_DIR))) {
      const text = read(file)
      for (const forbidden of ['shared/verdict', 'db/schema', 'queue/round', 'createRecordSchema']) {
        if (text.includes(forbidden)) offences.push(`${file}: ${forbidden}`)
      }
    }
    expect(offences).toEqual([])
  })

  // Belt to the exemption's braces: the reasoning path is checked by name, so moving a provider
  // call into it fails here even if somebody widens the directory rule above.
  test('the reasoning path names no provider host at all', () => {
    const offences: string[] = []
    for (const file of sources.filter((name) => REASONING_DIRS.some((dir) => name.startsWith(dir)))) {
      if (file.endsWith('only-gonkarouter.test.ts')) continue
      const match = DIRECT_PROVIDER_HOST.exec(read(file))
      if (match) offences.push(`${file}: ${match[0]}`)
    }
    expect(offences).toEqual([])
  })

  test('no provider client library is installed', () => {
    const manifest = JSON.parse(read('package.json')) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    const installed = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies })
    expect(installed.filter((name) => PROVIDER_PACKAGE.test(name))).toEqual([])
  })

  // The base URL is configurable, which is right — a preview or a local mock needs to point
  // somewhere else. What must not drift is the value a deployment gets when nobody sets it.
  test('the gateway base URL defaults to GonkaRouter', () => {
    const env = read('src/server/env.ts')
    const fallback = /gonkaBaseUrlOpenai:\s*optional\('GONKA_BASE_URL_OPENAI'\)\s*\?\?\s*'([^']+)'/.exec(env)
    expect(fallback?.[1]).toBeDefined()
    expect(new URL(fallback?.[1] ?? '').host).toBe(GATEWAY)
  })

  // Belt and braces on the one call that actually leaves the process: whatever the client builds
  // its request from, it has to come from env rather than from a literal of its own.
  test('the gateway client takes its host from env, never from a literal', () => {
    const client = read('src/server/gateway/client.ts')
    const literals = [...client.matchAll(/https?:\/\/[a-z0-9.-]+/g)].map((match) => match[0])
    expect(literals.filter((url) => new URL(url).host !== GATEWAY)).toEqual([])
  })
})
