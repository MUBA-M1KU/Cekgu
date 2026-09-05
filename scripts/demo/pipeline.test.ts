import { afterEach, describe, expect, test } from 'bun:test'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const schedule = join(import.meta.dir, 'schedule.py')
const assemble = join(import.meta.dir, 'assemble.sh')
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
    writeJson(
      join(demoDir, 'beats.json'),
      browserBeats.map((beat, index) => ({ ...beat, ms: index === 9 ? 9_800 : (index + 1) * 1_000 }))
    )

    const result = Bun.spawnSync(['bash', assemble], {
      env: {
        ...process.env,
        DEMO_DECK: deckPath,
        DEMO_DIR: demoDir,
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
