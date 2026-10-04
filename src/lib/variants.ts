// Display order and labels for a script's variants.
//
// The interpreter emits variants in exploration order (the `if` branch first)
// with a label that spells out every condition. For reading we want:
//   * Light / Medium / Heavy strength variants first, in that order;
//   * then the unmodified move (every other condition false) with no label;
//   * then modified versions, labelled by just the conditions that are on;
//   * a strength branch that tests all of W/M/S and matches none is dropped.
// A variant the interpreter merged from several worlds (same frame data under
// each) is labelled by its "simplest" world — unmodified if any world is —
// with the other worlds' labels listed after a `/`.
//
// src/data/rename.ts and src/data/order.ts can rename labels and pin an order
// per fighter and script; `orderVariants` applies it when given the fighter/agent/script.
import type { Condition, Variant } from './types'
import { VARIANT_NAMES } from '../data/rename'
import { VARIANT_ORDER } from '../data/order'
import { scriptKey } from './moves'

export interface VariantView {
  /** index into `script.variants` */
  index: number
  variant: Variant
  /** '' for the unmodified move; renamed by src/data/rename.ts if listed there */
  label: string
  /** label before any rename — the key to use in src/data/rename.ts / order.ts */
  auto: string
  /** label came from src/data/rename.ts (it's prose, not condition text) */
  renamed: boolean
  /** 0 Light, 1 Medium, 2 Heavy; null = no strength conditions */
  strength: number | null
  /** every strength value tested and all false — the branch can't run */
  unreachable: boolean
  /** conditions that are on, shortened */
  modifiers: string[]
}

const STRENGTH = /==\s*\w+_STRENGTH_(W|M|S)\s*$/
const STRENGTH_NAME: Record<string, string> = { W: 'Light', M: 'Medium', S: 'Heavy' }
const STRENGTH_RANK: Record<string, number> = { W: 0, M: 1, S: 2 }

/**
 * `VarModule::is_flag(vars::ryu::status::flag::USED_DENJIN_CHARGE)` → `USED_DENJIN_CHARGE`,
 * `WorkModule::get_int(FIGHTER_PICKEL_INSTANCE_WORK_ID_INT_HAVE_CRAFT_WEAPON_MATERIAL_KIND) == FIGHTER_PICKEL_MATERIAL_KIND_GOLD`
 * → `HAVE_CRAFT_WEAPON_MATERIAL_KIND == GOLD`, `0 < x` → `x > 0`.
 */
export function shortCondition(text: string): string {
  let t = text.trim()
  let m = t.match(/^(?:VarModule|WorkModule)::is_flag\((.+)\)$/)
  if (m) t = m[1]
  m = t.match(/^(?:macros::IS_EXIST_ARTICLE|ArticleModule::is_exist)\((.+)\)$/)
  if (m) t = `has ${m[1]}`
  m = t.match(/^(\d+(?:\.\d+)?) < (.+)$/)
  if (m) t = `${m[2]} > ${m[1]}`
  return t
    .replace(/(?:VarModule|WorkModule)::get_(?:int|int64|float)\(([^()]*)\)/g, '$1')
    .replace(/vars::[\w:]*::/g, '')
    .replace(/FIGHTER_\w+?_INSTANCE_WORK_ID_(?:FLAG|INT|FLOAT)_/g, '')
    .replace(/FIGHTER_\w+?_STATUS_\w+?_(?:FLAG|WORK_INT|WORK_FLOAT|INT|FLOAT)_/g, '')
    .replace(/FIGHTER_\w+?_GENERATE_ARTICLE_/g, '')
    // enum-style right-hand sides: `== FIGHTER_PICKEL_MATERIAL_KIND_GOLD` → `== GOLD`
    .replace(/(==|!=) FIGHTER_\w+?_KIND_(\w+)$/, '$1 $2')
}

interface WorldView {
  label: string
  strength: number | null
  unreachable: boolean
  modifiers: string[]
}

function world(conditions: Condition[]): WorldView {
  const mentioned = new Set<string>()
  let on: string | null = null
  const modifiers: string[] = []
  for (const c of conditions) {
    const m = c.text.match(STRENGTH)
    if (m) {
      mentioned.add(m[1])
      if (c.value) on = m[1]
    } else if (c.value) {
      modifiers.push(shortCondition(c.text))
    }
  }
  let strength: number | null = null
  let strengthLabel = ''
  let unreachable = false
  if (mentioned.size) {
    // All strength checks false → it's the one value the script didn't test for.
    // If it tested all three, nothing is left: that branch never runs.
    const letter = on ?? ['W', 'M', 'S'].filter((l) => !mentioned.has(l)).join('')
    if (letter in STRENGTH_RANK) {
      strength = STRENGTH_RANK[letter]
      strengthLabel = STRENGTH_NAME[letter]
    } else {
      unreachable = true
    }
  }
  const label = [strengthLabel, ...modifiers].filter(Boolean).join(' · ')
  return { label, strength, modifiers, unreachable }
}

const simpler = (a: WorldView, b: WorldView) => (a.strength ?? 9) - (b.strength ?? 9) || a.modifiers.length - b.modifiers.length

function view(variant: Variant, index: number): VariantView {
  const worlds = (variant.worlds?.length ? variant.worlds : [variant.conditions]).map(world).filter((w) => !w.unreachable)
  if (!worlds.length) return { index, variant, label: '', auto: '', renamed: false, strength: null, modifiers: [], unreachable: true }
  const primary = worlds.reduce((a, b) => (simpler(b, a) < 0 ? b : a))
  const label = primary.label ? [...new Set(worlds.map((w) => w.label))].join(' / ') : ''
  return { index, variant, label, auto: label, renamed: false, strength: primary.strength, modifiers: primary.modifiers, unreachable: false }
}

/** The override tables that apply to a script, most specific first. */
function overrides<T>(table: Record<string, Record<string, T>>, fighter: string, key: string): T[] {
  return [table[fighter]?.[key], table[fighter]?.['*'], table['*']?.[key], table['*']?.['*']].filter((t): t is T => t !== undefined)
}

/** Rename a label: whole label first, then each ` / ` world, then each ` · ` part. */
function rename(label: string, names: Record<string, string>[]): string | undefined {
  const exact = (s: string) => names.find((n) => s in n)?.[s]
  const whole = exact(label)
  if (whole !== undefined) return whole
  let hit = false
  const out = label
    .split(' / ')
    .map((w) => {
      const ww = exact(w)
      if (ww !== undefined) { hit = true; return ww }
      return w
        .split(' · ')
        .map((p) => {
          const pp = exact(p)
          if (pp !== undefined) hit = true
          return pp ?? p
        })
        .join(' · ')
    })
    .join(' / ')
  return hit ? out : undefined
}

/**
 * Variants in display order, unreachable ones dropped. A script with a single
 * unconditional variant gives one view with label ''. Pass the fighter, agent
 * and script to apply the renames and manual order in src/data/rename.ts / order.ts.
 */
export function orderVariants(variants: Variant[], fighter?: string, agent?: string, script?: string): VariantView[] {
  const views = variants.map(view).filter((v) => !v.unreachable)
  const names = fighter && script ? overrides(VARIANT_NAMES, fighter, scriptKey(fighter, agent, script)) : []
  const order = fighter && script ? overrides(VARIANT_ORDER, fighter, scriptKey(fighter, agent, script))[0] ?? [] : []
  for (const v of views) {
    const n = rename(v.auto, names)
    if (n !== undefined) { v.label = n; v.renamed = true }
  }
  // Manual position by automatic or renamed label; unlisted variants sort after.
  const pos = (v: VariantView) => {
    const i = [v.auto, v.label].map((l) => order.indexOf(l)).filter((i) => i >= 0)
    return i.length ? Math.min(...i) : order.length
  }
  return views.sort(
    (a, b) =>
      pos(a) - pos(b) ||
      (a.strength ?? 9) - (b.strength ?? 9) ||
      a.modifiers.length - b.modifiers.length ||
      a.index - b.index,
  )
}
