import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const app = readFileSync(join(import.meta.dir, 'App.tsx'), 'utf8')
const boundary = readFileSync(join(import.meta.dir, 'components/ErrorBoundary.tsx'), 'utf8')
const notFound = readFileSync(join(import.meta.dir, 'pages/NotFound.tsx'), 'utf8')

// Measured on the deployed app on 5 September: every unmatched path rendered an empty body with no
// heading and no console error. React Router matched nothing and drew nothing, so a mistyped or
// stale link was indistinguishable from a broken deployment.
describe('an unknown path lands somewhere', () => {
  test('the router has a catch-all route', () => {
    expect(app).toContain('path="*"')
    expect(app).toContain('<NotFound />')
  })

  test('the catch-all sits with the public routes, so it keeps the site chrome', () => {
    const publicBlock = app.slice(app.indexOf('<PublicLayout />'), app.indexOf('<AppLayout />'))
    expect(publicBlock).toContain('path="*"')
  })

  test('the page offers a way out rather than only an apology', () => {
    expect(notFound).toContain('to="/"')
    expect(notFound).toContain('to="/sample"')
  })
})

// A render that throws unmounts the whole tree, which produced the same blank page from a different
// cause. The boundary has to sit outside the router so a failure in routing is caught too, and its
// own exits must not depend on router context.
describe('a failed render is recoverable', () => {
  test('the boundary wraps the router rather than sitting inside it', () => {
    expect(app.indexOf('<ErrorBoundary>')).toBeGreaterThan(-1)
    expect(app.indexOf('<ErrorBoundary>')).toBeLessThan(app.indexOf('<BrowserRouter>'))
  })

  test('it catches render errors, which only a class can do', () => {
    expect(boundary).toContain('getDerivedStateFromError')
    expect(boundary).toContain('extends Component')
  })

  test('its exits are plain anchors, not router links', () => {
    expect(boundary).toContain('href="/"')
    expect(boundary).not.toContain("from 'react-router'")
  })
})
