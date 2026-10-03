// Hand-maintained move name overrides. Edit freely; this file is the only
// place the site gets fighter-specific names from.
//
//   fighter id  →  script name  →  name, or { name, category }
//
// * Keys are the script names as shown under each move (`game_specialn`).
// * Scripts on an article agent are keyed `agent/script`
//   (`mario_fireball/game_fly`).
// * The `'*'` section applies to every fighter and is overridden by the
//   fighter's own section.
// * Give an object to also move the script to another category
//   (`{ name: 'Monado Arts', category: 'Other' }`).
// * Anything not listed here falls back to the pattern rules in
//   src/lib/moves.ts (Jab 1, Forward Tilt, Neutral Special (air), …).
import type { Category } from '../lib/moves'

export type NameOverride = string | { name: string; category?: Category }

export const MOVE_NAMES: Record<string, Record<string, NameOverride>> = {
  '*': {},

  mario: {
    game_specialn: 'Fireball',
    game_specialairn: 'Fireball (air)',
    game_specials: 'Cape',
    game_specialairs: 'Cape (air)',
    game_specialhi: 'Super Jump Punch',
    game_specialairhi: 'Super Jump Punch (air)',
    game_speciallw: 'F.L.U.D.D.',
    game_specialairlw: 'F.L.U.D.D. (air)',
  },

  samus: {
    game_special: 'Missile',
    game_specialair: 'Missile (air)',
  },
  samusd: {
    game_special: 'Missile',
    game_specialair: 'Missile (air)',
  },
}
