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
// * ARTICLE_NAMES (bottom of this file) renames an article itself — the
//   heading of its table in the Articles section — keyed by full agent name.
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
  ryu: {
    game_specialn: 'Hadoken',
    game_specialairn: 'Hadoken (Air)',

    game_specialn2: 'Hashogeki',
    game_specialairn2: 'Hashogeki (Air)',

    game_specialsstart: 'Tatsumaki Senpukyaku (Start)',
    game_specials: 'Tatsumaki Senpukyaku (Loop)',
    game_specialsend: 'Tatsumaki Senpukyaku (End)',

    game_specialairsstart: 'Tatsumaki Senpukyaku (Start) (Air)',
    game_specialairs: 'Tatsumaki Senpukyaku (Loop) (Air)',
    game_specialairsend: 'Tatsumaki Senpukyaku (End) (Air)',

    game_specialairs2start: 'Shinku Tatsumaki Senpukyaku (Start)',
    game_specialairs2: 'Shinku Tatsumaki Senpukyaku (Loop)',
    game_specialairs2end: 'Shinku Tatsumaki Senpukyaku (End)',

    game_specialhi: 'Shoryuken',
    game_specialhicommand: 'Shoryuken (Command Input)',
    game_specialhifall: 'Shoryuken (Fall)',
    game_specialairhi: 'Shoryuken (Air)',
    game_specialairhicommand: 'Shoryuken (Command Input) (Air)',
    game_specialairhiend: 'Shoryuken (End)',

    game_speciallw: 'Denjin Charge',
    game_specialairlw: 'Denjin Charge (Air)',

    game_speciallwrush: 'Denjin Rush',
    game_specialairlwrush: 'Denjin Rush (Air)',

    game_speciallwimpact: 'Denjin Impact',
    game_speciallwimpactonshield: 'Denjin Impact (Blocked)',

    'ryu_hadoken/game_movew': 'Hadoken (Light)',
    'ryu_hadoken/game_movem': 'Hadoken (Medium)',
    'ryu_hadoken/game_moves': 'Hadoken (Heavy)',

    'ryu_hadoken/game_movespw': 'Denjin Hadoken (Light) (Multihits)',
    'ryu_hadoken/game_movespw_last': 'Denjin Hadoken (Light) (Last Hit)',

    'ryu_hadoken/game_movespm': 'Denjin Hadoken (Medium) (Multihits)',
    'ryu_hadoken/game_movespm_last': 'Denjin Hadoken (Medium) (Last Hit)',

    'ryu_hadoken/game_movesps': 'Denjin Hadoken (Heavy) (Multihits)',
    'ryu_hadoken/game_movesps_last': 'Denjin Hadoken (Heavy) (Last Hit)',

    'ryu_shinkuhadoken/game_move': 'Shinku Hadoken (Multihits)',
    'ryu_shinkuhadoken/game_finish': 'Shinku Hadoken (Last Hit)'
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