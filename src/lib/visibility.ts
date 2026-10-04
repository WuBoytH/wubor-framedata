import { ARTICLES, MOVES, PARAMS, type Pattern, type Rules } from '../data/visibility'
import { scriptKey } from './moves'

function matches(p: Pattern, key: string): boolean {
  if (p instanceof RegExp) return p.test(key)
  if (!p.includes('*')) return p === key
  const re = new RegExp('^' + p.split('*').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$')
  return re.test(key)
}

function allowed(table: Record<string, Rules>, fighter: string, key: string): boolean {
  const rules = [table['*'], table[fighter]].filter((r): r is Rules => !!r)
  const include = rules.flatMap((r) => r.include ?? [])
  const exclude = rules.flatMap((r) => r.exclude ?? [])
  if (include.length && !include.some((p) => matches(p, key))) return false
  return !exclude.some((p) => matches(p, key))
}

export const paramVisible = (fighter: string, key: string) => allowed(PARAMS, fighter, key)

export const moveVisible = (fighter: string, agent: string, script: string) => allowed(MOVES, fighter, scriptKey(fighter, agent, script))

export const articleVisible = (fighter: string, agent: string) => allowed(ARTICLES, fighter, agent)
