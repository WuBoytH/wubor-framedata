// Hand-maintained display names. Edit freely; this file is the only place
// the site gets fighter-specific names from. Ordering lives in
// src/data/order.ts and hiding in src/data/visibility.ts.
//
// Keys used throughout:
// * fighter id — the data file name (`mario`, `ryu`); `'*'` = every fighter.
//   A fighter's own section wins over `'*'`.
// * script — as shown under each move (`game_specialn`). Scripts on an
//   article agent are keyed `agent/script` (`mario_fireball/game_fly`).
//   For fighters whose data lives on another agent (Ice Climbers → Popo, see
//   MAIN_AGENT in src/lib/fighters.ts) that agent's scripts are keyed plainly.
import type { Category } from '../lib/moves'

// ── Moves ────────────────────────────────────────────────────────────────────
//   fighter id  →  script  →  name, or { name?, category? }
//
// * Give an object to also move the script to another section
//   (`{ name: 'Monado Arts', category: 'Other' }`). Leave out `name` to keep
//   the automatic name and only change the section
//   (`{ category: 'System' }`). Categories: Ground Normals, Smash Attacks,
//   Aerials, Grabs & Throws, Specials, Dodges & Ledge, System, Other.
// * Anything not listed here falls back to the pattern rules in
//   src/lib/moves.ts (Jab 1, Forward Tilt, Neutral Special (air), …).

export type NameOverride = string | { name?: string; category?: Category }

export const MOVE_NAMES: Record<string, Record<string, NameOverride>> = {
  '*': {
    game_escapeairslide: { name: 'Air Dash', category: 'System' },
    game_guardcancelattack: { name: 'Guard Cancel Attack', category: 'System' },
  },

  eflame: {
    game_specialnstart: 'Flame Nova (Startup)',
    game_specialnhold: 'Flame Nova (Charge)',
    game_specialn1: 'Flame Nova (Min Charge)',
    game_specialn2: 'Flame Nova (Mid Charge)',
    game_specialn3: 'Flame Nova (Max Charge)',
    game_specialn4: 'Flame Nova (Final Hit)',
    game_specialairnstart: 'Flame Nova (Startup) (Air)',
    game_specialairnhold: 'Flame Nova (Charge) (Air)',
    game_specialairn1: 'Flame Nova (Min Charge) (Air)',
    game_specialairn2: 'Flame Nova (Mid Charge) (Air)',
    game_specialairn3: 'Flame Nova (Max Charge) (Air)',
    game_specialairn4: 'Flame Nova (Final Hit) (Air)',

    game_specials: 'Blazing End',
    game_specialsflick: 'Blazing End (Flick)',
    game_specialairs: 'Blazing End (Air)',
    game_specialairsflick: 'Blazing End (Flick) (Air)',

    game_specialhistart: 'Prominence Revolt (Startup)',
    game_specialairhistart: 'Prominence Revolt (Startup) (Air)',
    game_specialairhijump: 'Prominence Revolt (Jump)',
    game_specialairhifall: 'Prominence Revolt (Fall)',
    game_specialhi: 'Prominence Revolt (Landing)',

    game_speciallwattack: 'Double Spinning Edge',
    game_specialairlwattack: 'Double Spinning Edge (Air)',
  },
  elight: {
    game_specialnstart: 'Lightning Buster (Startup)',
    game_specialnhold: 'Lightning Buster (Charge)',
    game_specialn: 'Lightning Buster (Low Charge)',
    game_specialn2: 'Lightning Buster (Max Charge)',
    game_specialairnstart: 'Lightning Buster (Startup) (Air)',
    game_specialairnhold: 'Lightning Buster (Charge) (Air)',
    game_specialairn: 'Lightning Buster (Low Charge) (Air)',
    game_specialairn2: 'Lightning Buster (Max Charge) (Air)',

    game_specialsstart: 'Photon Edge (Startup)',
    game_specials: 'Photon Edge (Dash)',
    game_specialsend: 'Photon Edge (End)',
    game_specialairsstart: 'Photon Edge (Startup) (Air)',
    game_specialairs: 'Photon Edge (Dash) (Air)',
    game_specialairsend: 'Photon Edge (End) (Air)',

    game_specialhistart: 'Ray of Punishment (Startup)',
    game_specialairhistart: 'Ray of Punishment (Startup) (Air)',
    game_specialairhijump: 'Ray of Punishment (Jump)',
    game_specialairhi1: 'Ray of Punishment (Fire)',
    game_specialairhi2: 'Chroma Dust (Fire)',
    game_specialairhiend: 'Ray of Punishment (Fall)',

    game_speciallwattack: 'Rolling Smash',
    game_specialairlwattack: 'Rolling Smash (Air)',
  },
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

// ── Articles ─────────────────────────────────────────────────────────────────
//   fighter id  →  agent  →  heading of its table in the Articles section
//
// Unlisted articles show the agent name with the fighter prefix stripped
// (`mario_fireball` → `fireball`).

export const ARTICLE_NAMES: Record<string, Record<string, string>> = {
  eflame: {
    eflame_blazepillar: 'Burning Sword (Final Smash)',
    eflame_esword: 'Blazing End (Side Special)',
    eflame_firepillar: 'Prominence Revolt (Up Special)',
  },
  elight: {
    elight_bunshin: 'Photon Edge (Side Special)',
    elight_exprosiveshot: 'Ray of Punishment (Up Special)',
    elight_spreadbullet: 'Chroma Dust (Up Special)',
    elight_meteor: 'Sacred Arrow (Multihits)',
    elight_beam: 'Sacred Arrow (Final Hit)'
  },
  mario: {
    mario_fireball: 'Fireball',
    mario_pumpwater: 'F.L.U.D.D.',
  },
  ryu: {
    ryu_hadoken: 'Hadoken',
    ryu_shinkuhadoken: 'Shinku Hadoken',
  },
  samus: {
    samus_cshot: 'Charge Shot',
    samus_missile: 'Missile',
    samus_supermissile: 'Super Missile',
    samus_bomb: 'Bomb',
  },
}

// ── Variants ─────────────────────────────────────────────────────────────────
//   fighter id ('*' = every fighter)  →  script ('*' = every script)  →  label → new label
//
// Variants are the branches the move page shows as tabs. Keys are the labels
// the site shows automatically — the short condition text
// (`USED_DENJIN_CHARGE`, `HAVE_CRAFT_WEAPON_MATERIAL_KIND == GOLD`),
// `Light` / `Medium` / `Heavy`, or `''` for the unmodified variant.
// * Lookup goes fighter/script → fighter/'*' → '*'/script → '*'/'*'.
// * A key also matches one part of a combined label
//   (`Light · USED_DENJIN_CHARGE` → `Light · Denjin`) and each world of a
//   merged `a / b` label.

export const VARIANT_NAMES: Record<string, Record<string, Record<string, string>>> = {
  '*': {},
  eflame: {
    game_attack11: {
      HAS_ESWORD: 'Base',
      '': 'While Blazing End is Active'
    },
    game_attackairn: {
      HAS_ESWORD: 'Base',
      '': 'While Blazing End is Active'
    },
    game_attackairlw: {
      HAS_ESWORD: 'Base',
      '': 'While Blazing End is Active'
    },
    game_landingairlw: {
      HAS_ESWORD: 'Base',
      '': 'While Blazing End is Active'
    },
  },
  ryu: {
    '*': {
      USED_DENJIN_CHARGE: 'During Denjin Rush',
    },
  },
}
