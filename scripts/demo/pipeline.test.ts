import { afterEach, describe, expect, test } from 'bun:test'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const schedule = join(import.meta.dir, 'schedule.py')
const assemble = join(import.meta.dir, 'assemble.sh')
const narrate = join(import.meta.dir, 'narrate.sh')
const subtitles = join(import.meta.dir, 'subtitles.py')
const speak = join(import.meta.dir, 'speak.py')
const narration = join(import.meta.dir, 'narration.txt')
const scratchDirs: string[] = []
const browserBeats = [
  { name: 'shot-1', ms: 1_000 },
  { name: 'shot-2', ms: 14_000 },
  { name: 'shot-3', ms: 25_000 },
  { name: 'shot-4', ms: 38_000 },
  { name: 'shot-5', ms: 55_000 },
  { name: 'shot-6', ms: 75_000 },
  { name: 'shot-7', ms: 89_000 },
  { name: 'shot-8', ms: 102_000 },
  { name: 'shot-9', ms: 115_000 },
  { name: 'end', ms: 120_000 }
]

function makeScratchDir() {
  const path = mkdtempSync(join(tmpdir(), 'cekgu-demo-pipeline-'))
  scratchDirs.push(path)
  return path
}

function writeJson(path: string, value: unknown) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
}

function readJson(path: string) {
  return JSON.parse(readFileSync(path, 'utf8')) as unknown
}

function runSchedule(...args: string[]) {
  const result = Bun.spawnSync(['python3', schedule, ...args])
  return {
    exitCode: result.exitCode,
    stderr: result.stderr.toString(),
    stdout: result.stdout.toString()
  }
}

function run(...command: string[]) {
  const result = Bun.spawnSync(command)
  return {
    exitCode: result.exitCode,
    stderr: result.stderr.toString(),
    stdout: result.stdout.toString()
  }
}

afterEach(() => {
  for (const path of scratchDirs.splice(0)) rmSync(path, { recursive: true, force: true })
})

describe('demo timeline assembly', () => {
  test('plans slide starts from the measured capture duration', () => {
    const demoDir = makeScratchDir()
    writeJson(join(demoDir, 'beats.json'), browserBeats)

    const result = runSchedule('plan-slides', demoDir, '120000', '3', '285000')

    expect(result.exitCode).toBe(0)
    expect(readJson(join(demoDir, 'slides.json'))).toEqual([
      { name: 'slide-1', ms: 120_000, duration_ms: 55_000 },
      { name: 'slide-2', ms: 175_000, duration_ms: 55_000 },
      { name: 'slide-3', ms: 230_000, duration_ms: 55_000 }
    ])
  })

  test('preserves measured shot offsets when slide beats are applied', () => {
    const demoDir = makeScratchDir()
    writeJson(join(demoDir, 'beats.json'), browserBeats)
    expect(runSchedule('plan-slides', demoDir, '120000', '3', '285000').exitCode).toBe(0)

    const result = runSchedule('apply-slides', demoDir)
    const beats = readJson(join(demoDir, 'beats.json'))

    expect(result.exitCode).toBe(0)
    expect(beats).toEqual([
      ...browserBeats.slice(0, -1),
      { name: 'slide-1', ms: 120_000 },
      { name: 'slide-2', ms: 175_000 },
      { name: 'slide-3', ms: 230_000 },
      { name: 'end', ms: 285_000 }
    ])
  })

  test('rejects a capture missing one of the recorder beats', () => {
    const demoDir = makeScratchDir()
    writeJson(
      join(demoDir, 'beats.json'),
      browserBeats.filter((beat) => beat.name !== 'shot-5')
    )

    const result = runSchedule('plan-slides', demoDir, '120000', '3', '285000')

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('missing required beat shot-5')
  })

  test('rejects a target that leaves no readable time for the deck', () => {
    const demoDir = makeScratchDir()
    writeJson(join(demoDir, 'beats.json'), browserBeats)

    const result = runSchedule('plan-slides', demoDir, '120000', '3', '130000')

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('at least 5 seconds per slide')
  })

  test('joins every deck page after the capture and publishes their beats', async () => {
    const demoDir = makeScratchDir()
    const deckPath = join(demoDir, 'source-deck.pdf')
    const ffmpegWrapper = join(demoDir, 'ffmpeg-wrapper.sh')
    const deckHashBefore = new Bun.CryptoHasher('sha256')
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ channel: 'chrome', headless: true })
    const page = await browser.newPage()
    await page.setContent(`
      <style>
        @page { size: 20in 11.25in; margin: 0; }
        body { margin: 0; }
        section { box-sizing: border-box; height: 11.25in; padding: 1in; page-break-after: always; }
      </style>
      <section>First slide</section><section>Second slide</section>
    `)
    await page.pdf({ path: deckPath, width: '20in', height: '11.25in', printBackground: true })
    await browser.close()
    deckHashBefore.update(readFileSync(deckPath))

    const video = run(
      'ffmpeg',
      '-y',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      'color=c=white:s=320x180:r=10',
      '-t',
      '10',
      '-c:v',
      'libvpx-vp9',
      join(demoDir, 'capture.webm')
    )
    expect(video.exitCode).toBe(0)
    writeFileSync(
      ffmpegWrapper,
      ['#!/usr/bin/env bash', 'IFS= read -r -n 1 _ || true', 'exec ffmpeg "$@"', ''].join('\n')
    )
    chmodSync(ffmpegWrapper, 0o755)
    writeJson(
      join(demoDir, 'beats.json'),
      browserBeats.map((beat, index) => ({ ...beat, ms: index === 9 ? 9_800 : (index + 1) * 1_000 }))
    )

    const result = Bun.spawnSync(['bash', assemble], {
      env: {
        ...process.env,
        DEMO_DECK: deckPath,
        DEMO_DIR: demoDir,
        DEMO_FFMPEG: ffmpegWrapper,
        DEMO_FPS: '10',
        DEMO_PRESET: 'ultrafast',
        DEMO_TOTAL_SECONDS: '20'
      }
    })

    expect(result.exitCode, result.stderr.toString()).toBe(0)
    expect(existsSync(join(demoDir, 'capture-joined.mp4'))).toBe(true)
    expect(readJson(join(demoDir, 'beats.json'))).toEqual([
      ...browserBeats.slice(0, -1).map((beat, index) => ({ ...beat, ms: (index + 1) * 1_000 })),
      { name: 'slide-1', ms: 10_000 },
      { name: 'slide-2', ms: 15_000 },
      { name: 'end', ms: 20_000 }
    ])
    expect(new Bun.CryptoHasher('sha256').update(readFileSync(deckPath)).digest('hex')).toBe(
      deckHashBefore.digest('hex')
    )
    const dimensions = run(
      'ffprobe',
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height',
      '-of',
      'csv=p=0:s=x',
      join(demoDir, 'capture-joined.mp4')
    )
    expect(dimensions.stdout.trim()).toBe('1920x1080')
  }, 30_000)
})

describe('demo narration scheduling', () => {
  test('resolves narration from named beats instead of nominal timestamps', () => {
    const demoDir = makeScratchDir()
    const script = join(demoDir, 'narration.txt')
    writeJson(join(demoDir, 'beats.json'), browserBeats)
    writeFileSync(
      script,
      '# beat | offset_ms | text\nslide-2 | 500 | The deck follows.\nshot-1 | 250 | The capture starts.\n'
    )
    expect(runSchedule('plan-slides', demoDir, '120000', '3', '285000').exitCode).toBe(0)
    expect(runSchedule('apply-slides', demoDir).exitCode).toBe(0)

    const result = runSchedule('resolve', demoDir, script)

    expect(result.exitCode).toBe(0)
    expect(readJson(join(demoDir, 'lines.json'))).toEqual([
      { beat: 'shot-1', offset_ms: 250, ms: 1_250, text: 'The capture starts.' },
      { beat: 'slide-2', offset_ms: 500, ms: 175_500, text: 'The deck follows.' }
    ])
  })

  test('rejects narration that names a beat absent from the measured take', () => {
    const demoDir = makeScratchDir()
    const script = join(demoDir, 'narration.txt')
    writeJson(join(demoDir, 'beats.json'), browserBeats)
    writeFileSync(script, 'slide-1 | 0 | This slide was never assembled.\n')

    const result = runSchedule('resolve', demoDir, script)

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain("unknown beat 'slide-1'")
  })

  test('pushes a line later when the prior wav is still speaking', () => {
    const demoDir = makeScratchDir()
    const segmentDir = join(demoDir, 'narration-segments')
    mkdirSync(segmentDir)
    writeJson(join(demoDir, 'lines.json'), [
      { beat: 'shot-1', offset_ms: 0, ms: 1_000, text: 'First line.' },
      { beat: 'shot-2', offset_ms: 0, ms: 1_500, text: 'Second line.' }
    ])
    for (const [index, duration] of [1, 0.5].entries()) {
      expect(
        run(
          'ffmpeg',
          '-y',
          '-loglevel',
          'error',
          '-f',
          'lavfi',
          '-i',
          'anullsrc=r=8000:cl=mono',
          '-t',
          String(duration),
          '-c:a',
          'pcm_s16le',
          join(segmentDir, `${index}.wav`)
        ).exitCode
      ).toBe(0)
    }

    const result = runSchedule('deconflict', demoDir)

    expect(result.exitCode).toBe(0)
    expect(readJson(join(demoDir, 'lines.json'))).toEqual([
      { beat: 'shot-1', offset_ms: 0, ms: 1_000, text: 'First line.', dur_ms: 1_000 },
      { beat: 'shot-2', offset_ms: 0, ms: 2_260, text: 'Second line.', dur_ms: 500 }
    ])
  })

  test('cuts subtitle audio at the next spoken line', () => {
    const demoDir = makeScratchDir()
    const segmentDir = join(demoDir, 'narration-segments')
    mkdirSync(segmentDir)
    writeJson(join(demoDir, 'lines.json'), [
      { beat: 'shot-1', offset_ms: 0, ms: 1_000, text: 'First caption.' },
      { beat: 'shot-2', offset_ms: 0, ms: 2_500, text: 'Second caption.' }
    ])
    for (const [index, duration] of [2, 1].entries()) {
      expect(
        run(
          'ffmpeg',
          '-y',
          '-loglevel',
          'error',
          '-f',
          'lavfi',
          '-i',
          'anullsrc=r=8000:cl=mono',
          '-t',
          String(duration),
          '-c:a',
          'pcm_s16le',
          join(segmentDir, `${index}.wav`)
        ).exitCode
      ).toBe(0)
    }

    const result = run('python3', subtitles, demoDir)

    expect(result.exitCode).toBe(0)
    expect(readFileSync(join(demoDir, 'narration.srt'), 'utf8')).toBe(
      [
        '1',
        '00:00:01,000 --> 00:00:02,500',
        'First caption.',
        '',
        '2',
        '00:00:02,500 --> 00:00:03,500',
        'Second caption.',
        ''
      ].join('\n')
    )
  })

  test('splits long narration into readable two-line subtitle cards', () => {
    const demoDir = makeScratchDir()
    const segmentDir = join(demoDir, 'narration-segments')
    const text =
      'Every reading keeps its served model, GonkaRouter request ID, and receipt status beside the answer so a teacher can inspect the evidence before deciding.'
    mkdirSync(segmentDir)
    writeJson(join(demoDir, 'lines.json'), [{ beat: 'slide-7', offset_ms: 0, ms: 1_000, text }])
    expect(
      run(
        'ffmpeg',
        '-y',
        '-loglevel',
        'error',
        '-f',
        'lavfi',
        '-i',
        'anullsrc=r=8000:cl=mono',
        '-t',
        '6',
        '-c:a',
        'pcm_s16le',
        join(segmentDir, '0.wav')
      ).exitCode
    ).toBe(0)

    const result = run('python3', subtitles, demoDir)
    const blocks = readFileSync(join(demoDir, 'narration.srt'), 'utf8').trim().split('\n\n')
    const captionLines = blocks.flatMap((block) => block.split('\n').slice(2))

    expect(result.exitCode).toBe(0)
    expect(blocks).toHaveLength(2)
    expect(captionLines.every((line) => line.length <= 42)).toBe(true)
    expect(blocks[0]).toContain('00:00:01,000 -->')
    expect(blocks[1]).toContain('--> 00:00:07,000')
    expect(captionLines.at(-1)?.split(' ').length).toBeGreaterThan(2)
  })

  test('reports missing Kokoro assets before trying to synthesize', () => {
    const demoDir = makeScratchDir()
    const result = Bun.spawnSync({
      cmd: ['python3', speak, join(demoDir, 'line.wav')],
      env: { ...process.env, KOKORO_HOME: demoDir },
      stdin: Buffer.from('A teacher checks the evidence.')
    })

    expect(result.exitCode).toBe(1)
    expect(result.stderr.toString()).toContain('missing Kokoro model')
    expect(existsSync(join(demoDir, 'line.wav'))).toBe(false)
  })

  test('keeps every scripted line inside its measured shot or slide', () => {
    const demoDir = makeScratchDir()
    writeJson(join(demoDir, 'beats.json'), browserBeats)
    expect(runSchedule('plan-slides', demoDir, '120000', '11', '285000').exitCode).toBe(0)
    expect(runSchedule('apply-slides', demoDir).exitCode).toBe(0)

    const result = runSchedule('resolve', demoDir, narration)
    expect(result.exitCode).toBe(0)
    const lines = readJson(join(demoDir, 'lines.json')) as Array<{ beat: string; ms: number }>
    const beats = readJson(join(demoDir, 'beats.json')) as Array<{ name: string; ms: number }>
    const starts = new Map(beats.map((beat) => [beat.name, beat.ms]))
    const expectedBeats = [
      ...Array.from({ length: 8 }, (_, index) => `shot-${index + 1}`),
      ...Array.from({ length: 11 }, (_, index) => `slide-${index + 1}`)
    ]
    expect(new Set(lines.map((line) => line.beat))).toEqual(new Set(expectedBeats))
    for (const line of lines) {
      const beatIndex = beats.findIndex((beat) => beat.name === line.beat)
      expect(line.ms).toBeGreaterThanOrEqual(starts.get(line.beat) ?? Number.POSITIVE_INFINITY)
      expect(line.ms).toBeLessThan(beats[beatIndex + 1]?.ms ?? 0)
    }
  })

  test('muxes scheduled speech and burned subtitles into the joined video', () => {
    const demoDir = makeScratchDir()
    const source = join(demoDir, 'capture-joined.mp4')
    const output = join(demoDir, 'finished.mp4')
    const script = join(demoDir, 'narration.txt')
    const fakeSpeak = join(demoDir, 'fake-speak.py')
    expect(
      run(
        'ffmpeg',
        '-y',
        '-loglevel',
        'error',
        '-f',
        'lavfi',
        '-i',
        'color=c=white:s=320x180:r=10',
        '-t',
        '5',
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        source
      ).exitCode
    ).toBe(0)
    writeJson(
      join(demoDir, 'beats.json'),
      browserBeats.map((beat, index) => ({ ...beat, ms: index === 9 ? 5_000 : (index + 1) * 100 }))
    )
    writeFileSync(script, 'shot-1 | 100 | The evidence stays with the decision.\n')
    writeFileSync(
      fakeSpeak,
      [
        'import sys, wave',
        'sys.stdin.read()',
        "with wave.open(sys.argv[1], 'wb') as audio:",
        '    audio.setnchannels(1)',
        '    audio.setsampwidth(2)',
        '    audio.setframerate(8000)',
        "    audio.writeframes(b'\\x00\\x00' * 8000)",
        ''
      ].join('\n')
    )

    const result = Bun.spawnSync(['bash', narrate], {
      env: {
        ...process.env,
        DEMO_DIR: demoDir,
        DEMO_FPS: '10',
        DEMO_OUT: output,
        DEMO_PRESET: 'ultrafast',
        DEMO_PYTHON: 'python3',
        DEMO_SCRIPT: script,
        DEMO_SPEAK: fakeSpeak
      }
    })

    expect(result.exitCode, result.stderr.toString()).toBe(0)
    expect(existsSync(output)).toBe(true)
    expect(readFileSync(join(demoDir, 'narration.srt'), 'utf8')).toContain('The evidence stays with the decision.')
    const streams = run(
      'ffprobe',
      '-v',
      'error',
      '-show_entries',
      'stream=codec_type,width,height',
      '-of',
      'csv=p=0',
      output
    )
    expect(streams.stdout).toContain('video,1920,1080')
    expect(streams.stdout).toContain('audio')
  }, 30_000)
})
