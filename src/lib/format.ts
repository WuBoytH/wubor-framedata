import type { Span, Val, Variant, Script, BoxWindow, StunParams } from './types'

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
  'FIGHTER_STATUS_ATTACK_FLAG_', 'COLLISION_KIND_MASK_', 'HIT_STATUS_MASK_',
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

/** Field accessor for positional boxes (hitbox / grab / search). */
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

// ----- stun --------------------------------------------------------------
// Formulas and constants: generator README "Stun". Shield stun depends only
// on the hitbox; hitstun needs the target (weight, percent) and knockback.

type Get = (h: Val[], name: string) => Val

/** The opponent the hitstun column assumes. */
export interface Target {
  weight: number
  percent: number
}
export const DEFAULT_TARGET: Target = { weight: 100, percent: 0 }
/** Target percents the hitstun column is computed at (set-knockback hits ignore percent). */
export const HITSTUN_PERCENTS = [0, 50, 100]

/** Hitbox uses set knockback (`fkb`), so knockback doesn't depend on percent. */
export const isFixedKnockback = (h: Val[], get: Get): boolean => {
  const fkb = get(h, 'fkb')
  return typeof fkb === 'number' && fkb > 0
}

/** Damage dealt in a 1v1: the side's `one_on_one_damage_mul` applied (1 in the mod). */
const dealt = (h: Val[], get: Get, stun: StunParams): number | null => {
  const d = get(h, 'damage')
  return typeof d === 'number' ? d * stun.one_on_one_damage_mul : null
}

/**
 * Attack-kind shield-stun multiplier for a script: aerials and smash attacks
 * have their own (vanilla 0.33 / 0.725; 1 in the mod). The projectile one
 * (`shield_setoff_mul_fighter_shot`) is not applied — article hitboxes aren't
 * all shots and the site can't tell which are.
 */
export function stunKindMul(script: string, stun: StunParams): number {
  if (/^game_attackair/.test(script)) return stun.shield_stiff_mul_attack_air
  if (/^game_attack(s|hi|lw)4/.test(script)) return stun.shield_stiff_mul_attack_4
  return 1
}

/**
 * `floor(min(damage × setoff_mul × kindMul × shield_setoff_mul + shield_setoff_add, shield_stiff_frame_max))`;
 * `setoff_mul` is the hitbox's `shield_setoff_mul` (1 when never set).
 */
export function shieldStun(h: Val[], get: Get, stun: StunParams, kindMul = 1): number | null {
  const d = dealt(h, get, stun)
  if (d === null) return null
  const m = get(h, 'shield_setoff_mul')
  const raw = d * (typeof m === 'number' ? m : 1) * kindMul * stun.shield_setoff_mul + stun.shield_setoff_add
  return Math.floor(Math.min(raw, stun.shield_stiff_frame_max))
}

/**
 * Vanilla knockback: `((p/10 + p·d/20) · 200/(w+100) · 1.4 + 18) · kbg/100 + bkb`
 * with `p` = target percent after the hit; set knockback (`fkb`) uses
 * `p = fkb, d = 10`; `set_weight` hitboxes use `w = 100`. No rage / staling.
 */
export function knockback(h: Val[], get: Get, stun: StunParams, t: Target): number | null {
  const d = dealt(h, get, stun)
  const kbg = get(h, 'kbg'), fkb = get(h, 'fkb'), bkb = get(h, 'bkb')
  if (d === null || typeof kbg !== 'number' || typeof fkb !== 'number' || typeof bkb !== 'number') return null
  const w = get(h, 'set_weight') === true ? 100 : t.weight
  const [p, dd] = fkb > 0 ? [fkb, 10] : [t.percent + d, d]
  return ((p / 10 + (p * dd) / 20) * (200 / (w + 100)) * 1.4 + 18) * (kbg / 100) + bkb
}

export const hitstun = (kb: number, stun: StunParams) => Math.floor(kb * stun.hitstun_mul)

export interface Summary {
  startup: number | null
  active: Span[]
  damage: number[]
  /** distinct shield stun values, highest first; empty without stun constants */
  shieldStun: number[]
  faf: number | null
  total: number | null
  autocancel: Span[]
  hitboxes: number
}

export function summarize(v: Variant, fields: string[], stun: StunParams | null = null, kindMul = 1): Summary {
  const get = hitboxField(fields)
  const dmg = new Set<number>()
  const stuns = new Set<number>()
  for (const w of v.windows) for (const h of w.boxes) {
    const d = get(h, 'damage')
    if (typeof d === 'number') dmg.add(d)
    const s = stun && shieldStun(h, get, stun, kindMul)
    if (typeof s === 'number') stuns.add(s)
  }
  // Grabs count as the move connecting; search boxes only look.
  const connecting = [...v.windows, ...v.grabs]
  const starts = connecting.map((w) => w.start)
  return {
    startup: starts.length ? Math.min(...starts) : null,
    active: mergeSpans(connecting),
    damage: [...dmg].sort((a, b) => b - a),
    shieldStun: [...stuns].sort((a, b) => b - a),
    // A FAF only exists when the script sets a cancel frame; `motion_end` means
    // the compiler synthesised anim_end + 1, which is just the total in disguise.
    faf: v.faf_source === 'motion_end' ? null : v.faf ?? null,
    total: v.total_frames ?? null,
    autocancel: v.autocancel,
    hitboxes: v.windows.reduce((n, w) => n + w.boxes.length, 0),
  }
}

export interface LandingLag {
  /** frames of landing lag for this aerial (absolute) */
  lag: number
  /** key it came from: `n`, `n2`, `f3`, … */
  key: string
  /** Bayonetta: extra frames added when Bullet Arts were used during the aerial */
  shoot: number | null
}

/**
 * Landing lag for an aerial script from the fighter's `landing_lag` map.
 * `attackairn2` prefers the `n2` key (Sora's absolute values) and falls back
 * to `n` (Bayonetta's fair 2/3 share the base); `<dir>_shoot` rides along.
 */
export function landingLag(table: Record<string, number>, script: string): LandingLag | null {
  const m = script.match(/^game_attackair(n|f|b|hi|lw)(\d*)/)
  if (!m) return null
  const [, dir, num] = m
  const key = num && table[dir + num] !== undefined ? dir + num : dir
  const lag = table[key]
  if (lag === undefined) return null
  return { lag, key, shoot: table[`${dir}_shoot`] ?? null }
}

/** Any hitbox, grab box or search box in any variant. */
export const hasHitboxes = (s: Script) => s.variants.some((v) => v.windows.length > 0 || v.grabs.length > 0 || v.searches.length > 0)

/** Windows with the same span merged into one (boxes concatenated), in start order. */
export function groupWindows(windows: BoxWindow[]): BoxWindow[] {
  const out: BoxWindow[] = []
  for (const w of windows) {
    const g = out.find((o) => o.start === w.start && o.end === w.end)
    if (g) {
      g.boxes = [...g.boxes, ...w.boxes]
      g.tags = [...new Set([...g.tags, ...w.tags])]
    } else out.push({ ...w })
  }
  return out.sort((a, b) => a.start - b.start)
}

export const windowIds = (w: BoxWindow, fields: string[]) => {
  const get = hitboxField(fields)
  return [...new Set(w.boxes.map((h) => fmtVal(get(h, 'id'))))].join(', ')
}
