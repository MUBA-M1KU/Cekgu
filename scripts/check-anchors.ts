// Every Markdown anchor link in the repo, checked against the headings it points at.
//
//   bun run check:anchors
//
// Not wired into CI. It exists because the break it catches is silent: a rewrite of
// docs/README.md deleted the `repository-layout` heading that AGENTS.md links to, and nothing
// complained. Renaming a heading is an ordinary edit, and the file that breaks is one nobody
// opened.

import { Glob } from 'bun'

const SKIP = ['node_modules/', '.agents/skills/', '.claude/skills/', 'graphify-out/']

// GitHub's rule: lowercase, drop anything that is not a word character, whitespace or hyphen,
// then turn each remaining space into a hyphen. Runs are NOT collapsed, so a heading with an
// em-dash between spaces yields a double hyphen.
function slug(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s/g, '-')
}

// A fenced block can contain both headings and links, and neither is real.
function withoutFences(markdown: string): string {
  return markdown.replace(/^```[\s\S]*?^```/gm, '')
}

function anchorsOf(markdown: string): Set<string> {
  const seen = new Map<string, number>()
  const found = new Set<string>()

  for (const [, heading] of withoutFences(markdown).matchAll(/^#{1,6}\s+(.*)$/gm)) {
    const base = slug(heading ?? '')
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    found.add(count === 0 ? base : `${base}-${count}`)
  }

  return found
}

const files = (await Array.fromAsync(new Glob('**/*.md').scan('.')))
  .filter((file) => !SKIP.some((prefix) => file.startsWith(prefix)))
  .sort()

const headings = new Map(await Promise.all(files.map(async (f) => [f, anchorsOf(await Bun.file(f).text())] as const)))

const broken: string[] = []
let checked = 0

for (const file of files) {
  const dir = file.includes('/') ? file.slice(0, file.lastIndexOf('/')) : '.'

  for (const [, target, anchor] of withoutFences(await Bun.file(file).text()).matchAll(/\]\(([^)\s#]*)#([^)\s]+)\)/g)) {
    if (target?.startsWith('http') || target?.startsWith('mailto')) continue

    const path = target ? Bun.pathToFileURL(`${dir}/${target}`).pathname.slice(process.cwd().length + 1) : file
    const known = headings.get(path)

    if (!known) {
      broken.push(`${file}  ->  ${target}#${anchor}   (no such file)`)
      continue
    }

    checked += 1
    if (!known.has((anchor ?? '').toLowerCase()))
      broken.push(`${file}  ->  ${target || ''}#${anchor}   (no such heading)`)
  }
}

console.log(`${checked} anchor links checked across ${files.length} files`)
if (broken.length === 0) {
  console.log('all resolve')
  process.exit(0)
}

console.error(`\n${broken.length} broken:`)
for (const line of broken) console.error(`  ${line}`)
process.exit(1)
