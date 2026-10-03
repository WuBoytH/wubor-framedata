import type { Span, Val, Variant, Script, HitboxWindow } from './types'

export function fmtSpan(w: Span): string {
  if (w.end === null) return `${w.start}+`
  if (w.end === w.start) return `${w.start}`
  return `${w.start}–${w.end}`
}

export const fmtSpans = (ws: Span[]) => ws.map(fmtSpan).join(', ')

/** Game frame; fractional values show the frame they land on plus the exact value. */
export function fmtFrame(g: number): string {
  return Number.isInteger(g) ? `${g}` : `${Math.ceil(g)} (${g.toFixed(2)})`
}

export function fmtNum(n: number): string {
  return Number.isInteger(n) ? `${n}` : `${+n.toFixed(3)}`
}

/** Strip the boilerplate prefixes off smash constants and hash labels. */
const PREFIXES = [
  'COLLISION_SITUATION_MASK_', 'COLLISION_CATEGORY_MASK_', 'COLLISION_PART_MASK_',
  'ATTACK_LR_CHECK_', 'ATTACK_SETOFF_KIND_', 'ATTACK_SOUND_LEVEL_', 'COLLISION_SOUND_ATTR_',
  'ATTACK_REGION_', 'collision_attr_', 'FIGHTER_STATUS_TRANSITION_TERM_ID_CONT_',
  'FIGHTER_STATUS_TRANSITION_TERM_ID_', 'FIGHTER_STATUS_KIND_', 'FIGHTER_STATUS_ATTACK_AIR_FLAG_',
  'FIGHTER_STATUS_ATTACK_FLAG_',
]
export function short(s: string): string {
  for (const p of PREFIXES) if (s.startsWith(p)) return s.slice(p.length)
  // `vars::fighter::status::flag::FOO` → `FOO`
  const i = s.lastIndexOf('::')
  return i >= 0 ? s.slice(i + 2) : s
}

export function fmtVal(v: Val, shorten = true): string {
  if (v === null) return '—'
  if (typeof v === 'number') return fmtNum(v)
  if (typeof v === 'boolean') return v ? 'yes' : 'no'
  if (typeof v === 'string') return shorten ? short(v) : v
  return `{${v.expr}}`
}

/** Field accessor for positional hitboxes. */
export function hitboxField(fields: string[]) {
  const idx = new Map(fields.map((f, i) => [f, i]))
  return (hb: Val[], name: string): Val => hb[idx.get(name) ?? -1] ?? null
}

/** Merge overlapping/adjacent spans. */
export function mergeSpans(spans: Span[]): Span[] {
  const sorted = [...spans].sort((a, b) => a.start - b.start)
  const out: Span[] = []
  for (const s of sorted) {
    const last = out[out.length - 1]
    if (last && (last.end === null || s.start <= last.end + 1)) {
      if (last.end !== null) last.end = s.end === null ? null : Math.max(last.end, s.end)
    } else out.push({ ...s })
  }
  return out
}

export interface Summary {
  startup: number | null
  active: Span[]
  damage: number[]
  faf: number | null
  total: number | null
  autocancel: Span[]
  hitboxes: number
}

export function summarize(v: Variant, fields: string[]): Summary {
  const get = hitboxField(fields)
  const dmg = new Set<number>()
  for (const w of v.windows) for (const h of w.hitboxes) {
    const d = get(h, 'damage')
    if (typeof d === 'number') dmg.add(d)
  }
  const starts = v.windows.map((w) => w.start)
  return {
    startup: starts.length ? Math.min(...starts) : null,
    active: mergeSpans(v.windows),
    damage: [...dmg].sort((a, b) => b - a),
    faf: v.faf ?? null,
    total: v.total_frames ?? null,
    autocancel: v.autocancel,
    hitboxes: v.windows.reduce((n, w) => n + w.hitboxes.length, 0),
  }
}

export const hasHitboxes = (s: Script) => s.variants.some((v) => v.windows.length > 0)

/** Windows with the same span merged into one (hitboxes concatenated), in start order. */
export function groupWindows(windows: HitboxWindow[]): HitboxWindow[] {
  const out: HitboxWindow[] = []
  for (const w of windows) {
    const g = out.find((o) => o.start === w.start && o.end === w.end)
    if (g) {
      g.hitboxes = [...g.hitboxes, ...w.hitboxes]
      g.tags = [...new Set([...g.tags, ...w.tags])]
    } else out.push({ ...w })
  }
  return out.sort((a, b) => a.start - b.start)
}

export const windowIds = (w: HitboxWindow, fields: string[]) => {
  const get = hitboxField(fields)
  return [...new Set(w.hitboxes.map((h) => fmtVal(get(h, 'id'))))].join(', ')
}
