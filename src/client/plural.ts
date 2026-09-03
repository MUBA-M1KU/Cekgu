// "1 questions" is the kind of thing a judge reads as carelessness, and it appears wherever a count
// meets a noun. One helper rather than a ternary at each site.
export function count(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`
}
