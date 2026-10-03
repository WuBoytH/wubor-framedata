// Script name (`game_attackairn`) → human move name and category.
// Per-fighter names come from src/data/move-names.ts and win over the rules here.

import { MOVE_NAMES } from '../data/move-names'

export type Category =
  | 'Ground Normals'
  | 'Smash Attacks'
  | 'Aerials'
  | 'Grabs & Throws'
  | 'Specials'
  | 'Dodges & Ledge'
  | 'Other'

export const CATEGORIES: Category[] = [
  'Ground Normals', 'Smash Attacks', 'Aerials', 'Grabs & Throws', 'Specials', 'Dodges & Ledge', 'Other',
]

export interface MoveInfo {
  name: string
  category: Category
  /** sort key within the category (compare as strings); ties break on script name */
  order: string
  /** `n`/`f`/`b`/`hi`/`lw` for aerials — picks the landing-lag param */
  aerial?: string
}

const DIR: Record<string, string> = { n: 'Neutral', f: 'Forward', b: 'Back', hi: 'Up', lw: 'Down', s: 'Side' }
const AIR_DIRS = ['n', 'f', 'b', 'hi', 'lw']
const SPECIAL_DIRS = ['n', 's', 'hi', 'lw']

/** A rule: pattern, display name, category, sort key within the category. */
type Rule = [RegExp, (m: RegExpMatchArray) => string, Category, (m: RegExpMatchArray) => string]

const suffix = (s: string | undefined) => (s ? ` (${s})` : '')
const angled = (s: string | undefined) => (s ? ` (${s === 'hi' ? 'up' : 'down'} angled)` : '')
const idx = (list: string[], s: string) => Math.max(0, list.indexOf(s))
/** Sort key from parts; numbers are zero-padded so string comparison orders them. */
const key = (...parts: (number | string)[]) => parts.map((p) => (typeof p === 'number' ? String(p).padStart(3, '0') : p)).join('.')
/** Smashes: `start`/`hold`/`charge` come before the main hit; other suffixes after it, alphabetically. */
const stage = (s: string) => (s === 'start' ? '0' : s === 'hold' || s === 'charge' ? '1' : s === '' ? '2' : `3${s}`)
/** Everything else: the plain script first, then start/hold, then other suffixes alphabetically. */
const sfx = (s: string) => (s === '' ? '0' : s === 'start' ? '1' : s === 'hold' || s === 'charge' ? '2' : `3${s}`)

const RULES: Rule[] = [
  // jab 1-3, rapid jab start/loop/end, dash attack, tilts
  [/^attack1([1-9])(\w*)$/, (m) => `Jab ${m[1]}${suffix(m[2])}`, 'Ground Normals', (m) => key(0, +m[1], sfx(m[2]))],
  [/^attack100(\w*)$/, (m) => (m[1] === '' ? 'Rapid Jab' : m[1] === 'end' ? 'Rapid Jab (finisher)' : `Rapid Jab (${m[1]})`), 'Ground Normals', (m) => key(1, m[1] === 'start' ? '0' : m[1] === '' ? '1' : m[1] === 'end' ? '2' : `3${m[1]}`)],
  [/^attackdash(\w*)$/, (m) => `Dash Attack${suffix(m[1])}`, 'Ground Normals', (m) => key(2, sfx(m[1]))],
  [/^attacks3(hi|lw)?(\w*)$/, (m) => `Forward Tilt${angled(m[1])}${suffix(m[2])}`, 'Ground Normals', (m) => key(3, sfx(m[2]), idx(['', 'hi', 'lw'], m[1] ?? ''))],
  [/^attackhi3(\w*)$/, (m) => `Up Tilt${suffix(m[1])}`, 'Ground Normals', (m) => key(4, sfx(m[1]))],
  [/^attacklw3(\w*)$/, (m) => `Down Tilt${suffix(m[1])}`, 'Ground Normals', (m) => key(5, sfx(m[1]))],
  // smashes: start, hold, main, angled, then anything else
  [/^attacks4(hi|lw)?(\w*)$/, (m) => `Forward Smash${angled(m[1])}${suffix(m[2])}`, 'Smash Attacks', (m) => key(0, stage(m[2]), idx(['', 'hi', 'lw'], m[1] ?? ''))],
  [/^attackhi4(\w*)$/, (m) => `Up Smash${suffix(m[1])}`, 'Smash Attacks', (m) => key(1, stage(m[1]))],
  [/^attacklw4(\w*)$/, (m) => `Down Smash${suffix(m[1])}`, 'Smash Attacks', (m) => key(2, stage(m[1]))],
  // aerials: per direction, attack then landing; suffixed versions after, same pairing
  [/^attackair(n|f|b|hi|lw)(\w*)$/, (m) => `${DIR[m[1]]} Air${suffix(m[2])}`, 'Aerials', (m) => key(idx(AIR_DIRS, m[1]), sfx(m[2]), 0)],
  [/^landingair(n|f|b|hi|lw)(\w*)$/, (m) => `${DIR[m[1]]} Air landing${suffix(m[2])}`, 'Aerials', (m) => key(idx(AIR_DIRS, m[1]), sfx(m[2]), 1)],
  // grabs and throws
  [/^catch$/, () => 'Grab', 'Grabs & Throws', () => key(0, 0)],
  [/^catchdash$/, () => 'Dash Grab', 'Grabs & Throws', () => key(0, 1)],
  [/^catchturn$/, () => 'Pivot Grab', 'Grabs & Throws', () => key(0, 2)],
  [/^catchattack$/, () => 'Pummel', 'Grabs & Throws', () => key(0, 3)],
  [/^catch(\w+)$/, (m) => `Grab (${m[1]})`, 'Grabs & Throws', () => key(0, 4)],
  [/^throw(f|b|hi|lw)(\w*)$/, (m) => `${DIR[m[1]]} Throw${suffix(m[2])}`, 'Grabs & Throws', (m) => key(1, idx(['f', 'b', 'hi', 'lw'], m[1]), sfx(m[2]))],
  // specials: per direction, ground then air; suffixed versions after, ground then air per suffix
  [/^special(air)?(n|s|hi|lw)(\w*)$/, (m) => `${DIR[m[2]]} Special${m[1] ? ' (air)' : ''}${suffix(m[3])}`, 'Specials', (m) => key(idx(SPECIAL_DIRS, m[2]), sfx(m[3]), m[1] ? 1 : 0)],
  // Samus / Dark Samus: bare `special`/`specialair` is the side special (Missile)
  [/^special(air)?$/, (m) => `Side Special${m[1] ? ' (air)' : ''}`, 'Specials', (m) => key(idx(SPECIAL_DIRS, 's'), '', m[1] ? 1 : 0)],
  // dodges, ledge, getups
  [/^escapen$/, () => 'Spot Dodge', 'Dodges & Ledge', () => key(0, 0)],
  [/^escapef$/, () => 'Roll (forward)', 'Dodges & Ledge', () => key(0, 1)],
  [/^escapeb$/, () => 'Roll (back)', 'Dodges & Ledge', () => key(0, 2)],
  [/^escapeair$/, () => 'Air Dodge', 'Dodges & Ledge', () => key(0, 3)],
  [/^escapeairslide$/, () => 'Air Dodge (directional)', 'Dodges & Ledge', () => key(0, 4)],
  [/^escape(\w+)$/, (m) => `Dodge (${m[1]})`, 'Dodges & Ledge', () => key(0, 5)],
  [/^cliffattack$/, () => 'Ledge Attack', 'Dodges & Ledge', () => key(1, 0)],
  [/^cliffescape$/, () => 'Ledge Roll', 'Dodges & Ledge', () => key(1, 1)],
  [/^cliffclimb$/, () => 'Ledge Getup', 'Dodges & Ledge', () => key(1, 2)],
  [/^cliffjump(\w*)$/, (m) => `Ledge Jump${suffix(m[1])}`, 'Dodges & Ledge', () => key(1, 3)],
  [/^cliffcatch$/, () => 'Ledge Grab', 'Dodges & Ledge', () => key(1, 4)],
  [/^cliff(\w+)$/, (m) => `Ledge (${m[1]})`, 'Dodges & Ledge', () => key(1, 5)],
  [/^downattack(u|d)$/, (m) => `Getup Attack (face ${m[1] === 'u' ? 'up' : 'down'})`, 'Dodges & Ledge', () => key(2, 0)],
  [/^downstand(u|d)$/, (m) => `Getup (face ${m[1] === 'u' ? 'up' : 'down'})`, 'Dodges & Ledge', () => key(2, 1)],
  [/^downforward(u|d)$/, (m) => `Getup Roll forward (face ${m[1] === 'u' ? 'up' : 'down'})`, 'Dodges & Ledge', () => key(2, 2)],
  [/^downback(u|d)$/, (m) => `Getup Roll back (face ${m[1] === 'u' ? 'up' : 'down'})`, 'Dodges & Ledge', () => key(2, 3)],
  [/^slipattack$/, () => 'Trip Attack', 'Dodges & Ledge', () => key(2, 4)],
  [/^appeal(\w*)$/, (m) => `Taunt${suffix(m[1])}`, 'Other', () => key(0)],
  [/^final(\w*)$/, (m) => `Final Smash${suffix(m[1])}`, 'Other', () => key(1)],
]

const cache = new Map<string, MoveInfo>()

/**
 * Name/category/order for a script. `fighter` and `agent` enable the
 * hand-written overrides; the sort order always comes from the rules.
 */
export function moveInfo(script: string, fighter?: string, agent?: string): MoveInfo {
  const base = ruleInfo(script)
  if (!fighter) return base
  const key = agent && agent !== fighter ? `${agent}/${script}` : script
  const o = MOVE_NAMES[fighter]?.[key] ?? MOVE_NAMES['*']?.[key]
  if (o === undefined) return base
  return typeof o === 'string' ? { ...base, name: o } : { ...base, name: o.name, category: o.category ?? base.category }
}

function ruleInfo(script: string): MoveInfo {
  let info = cache.get(script)
  if (info) return info
  const rest = script.replace(/^game_/, '')
  info = { name: rest, category: 'Other', order: key(9) }
  for (const [re, name, category, order] of RULES) {
    const m = rest.match(re)
    if (m) {
      info = { name: name(m), category, order: order(m) }
      const air = rest.match(/^attackair(n|f|b|hi|lw)/)
      if (air) info.aerial = air[1]
      break
    }
  }
  cache.set(script, info)
  return info
}
