import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import type { Utterance } from './speech'
import { speak } from './voice'

// bun test has no DOM. speak() reads window.speechSynthesis on every call, so a fake engine installed
// before each test is what it finds, and the utterance constructor it news up has to exist as well.
class FakeUtterance {
  text: string
  constructor(text: string) {
    this.text = text
  }
  addEventListener() {}
}

const engine = {
  cancels: 0,
  spoken: [] as string[],
  cancel() {
    this.cancels += 1
  },
  speak(utterance: FakeUtterance) {
    this.spoken.push(utterance.text)
  },
  getVoices: () => [],
  addEventListener() {},
  removeEventListener() {}
}

const line = (text: string): Utterance => ({ seat: 0, text, caption: text, cite: null })

const globals = globalThis as { window?: unknown; SpeechSynthesisUtterance?: unknown }
const real = { window: globals.window, SpeechSynthesisUtterance: globals.SpeechSynthesisUtterance }

beforeEach(() => {
  engine.cancels = 0
  engine.spoken = []
  globals.window = { speechSynthesis: engine }
  globals.SpeechSynthesisUtterance = FakeUtterance
})

afterEach(() => {
  globals.window = real.window
  globals.SpeechSynthesisUtterance = real.SpeechSynthesisUtterance
})

describe('speak', () => {
  test('a handle stops its own speech', () => {
    const handle = speak([line('Four items need a look.')], { muted: false })
    expect(engine.spoken).toEqual(['Four items need a look.'])
    expect(engine.cancels).toBe(1)

    handle.cancel()
    expect(engine.cancels).toBe(2)
  })

  // The summary speaks and arms a dismiss timer; the chat answers inside that window and starts
  // speaking; the timer fires and cancels the summary's handle. speechSynthesis.cancel() is global,
  // so that stale cancel used to cut the chat off mid-sentence.
  test('a superseded handle cannot stop the speech that replaced it', () => {
    const summary = speak([line('Four items need a look.')], { muted: false })
    const chat = speak([line('Item three is a possible key error.')], { muted: false })
    const before = engine.cancels

    summary.cancel()
    expect(engine.cancels).toBe(before)

    chat.cancel()
    expect(engine.cancels).toBe(before + 1)
  })
})
