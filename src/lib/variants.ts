// Display order and labels for a script's variants.
//
// The interpreter emits variants in exploration order (the `if` branch first)
// with a label that spells out every condition. For reading we want:
//   * Light / Medium / Heavy strength variants first, in that order;
//   * then the unmodified move (every other condition false) with no label;
//   * then modified versions, labelled by just the conditions that are on.
import type { Variant } from './types'

export interface VariantView {
  /** index into `script.variants` */
  index: number
  variant: Variant
  /** '' for the unmodified move */
  label: string
  /** 0 Light, 1 Medium, 2 Heavy, 3 other strength value, null = no strength conditions */
  strength: number | null
  /** conditions that are on, shortened */
  modifiers: string[]
}

const STRENGTH = /==\s*\w+_STRENGTH_(W|M|S)\s*$/
const STRENGTH_NAME: Record<string, string> = { W: 'Light', M: 'Medium', S: 'Heavy' }
const STRENGTH_RANK: Record<string, number> = { W: 0, M: 1, S: 2 }

/** `VarModule::is_flag(vars::ryu::status::flag::USED_DENJIN_CHARGE)` → `USED_DENJIN_CHARGE` */
export function shortCondition(text: string): string {
  let t = text.trim()
  let m = t.match(/^(?:VarModule|WorkModule)::is_flag\((.+)\)$/)
  if (m) t = m[1]
  m = t.match(/^(?:macros::IS_EXIST_ARTICLE|ArticleModule::is_exist)\((.+)\)$/)
  if (m) t = `has ${m[1]}`
  return t
    .replace(/vars::[\w:]*::/g, '')
    .replace(/FIGHTER_\w+?_INSTANCE_WORK_ID_(?:FLAG|INT|FLOAT)_/g, '')
    .replace(/FIGHTER_\w+?_GENERATE_ARTICLE_/g, '')
}

function view(variant: Variant, index: number): VariantView {
  const mentioned = new Set<string>()
  let on: string | null = null
  const modifiers: string[] = []
  for (const c of variant.conditions) {
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
  if (mentioned.size) {
    // All strength checks false → it's the one value the script didn't test for.
    const letter = on ?? ['W', 'M', 'S'].filter((l) => !mentioned.has(l)).join('')
    if (letter in STRENGTH_RANK) {
      strength = STRENGTH_RANK[letter]
      strengthLabel = STRENGTH_NAME[letter]
    } else {
      strength = 3
      strengthLabel = 'Other strength'
    }
  }
  const label = [strengthLabel, ...modifiers].filter(Boolean).join(' · ')
  return { index, variant, label, strength, modifiers }
}

/** Variants in display order. A script with a single unconditional variant gives one view with label ''. */
export function orderVariants(variants: Variant[]): VariantView[] {
  return variants
    .map(view)
    .sort(
      (a, b) =>
        (a.strength ?? 9) - (b.strength ?? 9) ||
        a.modifiers.length - b.modifiers.length ||
        a.index - b.index,
    )
}
