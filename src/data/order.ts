// Hand-maintained display order. Names live in src/data/rename.ts and
// hiding in src/data/visibility.ts; keys are the same as there.
//
// Every table works the same way: whatever is listed goes first, in that
// order; everything not listed follows in the automatic order. To pin a whole
// list by hand, list all of it. A fighter's list comes before the '*' list.

// ── Moves ────────────────────────────────────────────────────────────────────
//   fighter id ('*' = every fighter)  →  [script, script, …]
//
// * Keys are script names (`game_specialn`); article scripts are
//   `agent/script`. A fighter's list comes before the '*' list.
// * This only moves scripts within their category (automatic order:
//   src/lib/moves.ts); use `category` in src/data/rename.ts to move one to
//   another section.

export const MOVE_ORDER: Record<string, string[]> = {
  '*': [],
  demon: [
    'game_attack11',
    'game_attack12',
    'game_flashpunch',
    'game_attack13',
    'game_attack14',
    'game_attack15',
    'game_attack16',
    'game_attack17',
    'game_attack18',
    'game_attack19',
    'game_attack110',
    'game_attackdash',
    'game_attacks3',
    'game_attackstand5',
    'game_attackstand4',
    'game_attackhi3',
    'game_attackhi32',

    'game_specialnstart',
    'game_specialn',
    'game_specialnhi',
    'game_specialnlw',
    'game_specialairnstart',
    'game_specialairn',
    'game_specialairnhi',
    'game_specialairnlw',

    'game_specials',
    'game_specialshit',
    'game_specialsend',
    'game_specialairs',
    'game_specialairshit',
    'game_specialairsend',
    'game_specialslanding',

    'game_specialhistart',
    'game_specialairhistart',
    'game_specialhi',

    'game_speciallw',
    'game_specialairlw'
  ],
  eflame: [
    'game_specialnstart',
    'game_specialnhold',
    'game_specialn1',
    'game_specialn2',
    'game_specialn3',
    'game_specialn4',
    'game_specialairnstart',
    'game_specialairnhold',
    'game_specialairn1',
    'game_specialairn2',
    'game_specialairn3',
    'game_specialairn4',

    'game_specials',
    'game_specialsflick',
    'game_specialairs',
    'game_specialairsflick',
    'game_specialscatch',
    'game_specialairscatch',

    'game_specialhistart',
    'game_specialairhistart',
    'game_specialairhijump',
    'game_specialairhifall',
    'game_specialhi',

    'game_speciallw',
    'game_speciallwend',
    'game_speciallwattack',
    'game_specialairlw',
    'game_specialairlwend',
    'game_specialairlwattack',
  ],
  elight: [
    'game_specialnstart',
    'game_specialnhold',
    'game_specialn',
    'game_specialn2',
    'game_specialairnstart',
    'game_specialairnhold',
    'game_specialairn',
    'game_specialairn2',

    'game_specialsstart',
    'game_specialairsstart',
    'game_specials',
    'game_specialairs',
    'game_specialsend',
    'game_specialairsend',

    'game_specialhistart',
    'game_specialairhistart',
    'game_specialairhijump',
    'game_specialairhi1',
    'game_specialairhi2',
    'game_specialairhiend',

    'game_speciallw',
    'game_speciallwend',
    'game_speciallwattack',
    'game_specialairlw',
    'game_specialairlwend',
    'game_specialairlwattack',
  ],
  ryu: [
    'game_specialn',
    'game_specialairn',
    'game_specialn2',
    'game_specialairn2',
    'game_specialsstart',
    'game_specials',
    'game_specialsend',
    'game_specialairsstart',
    'game_specialairs',
    'game_specialairsend',
    'game_specialairs2start',
    'game_specialairs2',
    'game_specialairs2end',
    'game_specialhi',
    'game_specialairhi',
    'game_specialhicommand',
    'game_specialairhicommand',
    'game_specialairhiend',
    'game_specialhifall',
    'game_specialhilanding',
    'game_speciallw',
    'game_specialairlw',
    'game_speciallwrush',
    'game_specialairlwrush',

    'ryu_hadoken/game_movew',
    'ryu_hadoken/game_movem',
    'ryu_hadoken/game_moves',
    'ryu_hadoken/game_movespw',
    'ryu_hadoken/game_movespw_last',
    'ryu_hadoken/game_movespm',
    'ryu_hadoken/game_movespm_last',
    'ryu_hadoken/game_movesps',
    'ryu_hadoken/game_movesps_last',

    'ryu_shinkuhadoken/game_move'
  ],
}

// ── Variants ─────────────────────────────────────────────────────────────────
//   fighter id ('*' = every fighter)  →  script ('*' = every script)  →  [label, label, …]
//
// * Labels are the automatic ones (see VARIANT_NAMES in src/data/rename.ts)
//   or their renamed form; `''` is the unmodified variant.
// * The most specific list wins: fighter/script → fighter/'*' → '*'/script → '*'/'*'.
// * Automatic order (src/lib/variants.ts): Light / Medium / Heavy, then the
//   unmodified variant, then modified ones by how many conditions are on.

export const VARIANT_ORDER: Record<string, Record<string, string[]>> = {
  '*': {},
  eflame: {
    game_attack11: ['HAS_ESWORD', ''],
    game_attackairn: ['HAS_ESWORD', ''],
    game_attackairlw: ['HAS_ESWORD', ''],
    game_landingairlw: ['HAS_ESWORD', ''],
  }
}

// ── Params ───────────────────────────────────────────────────────────────────
//   fighter id ('*' = every fighter)  →  [param key, param key, …]
//
// * Keys are `fighter_param_table` field names (`walk_speed_max`), the same
//   ones PARAMS in src/data/visibility.ts matches on.
// * Automatic order is the file order of fighter_param.prc.

export const PARAM_ORDER: Record<string, string[]> = {
  '*': [
    'air_dash_tier'
  ],
}

// ── Articles ─────────────────────────────────────────────────────────────────
//   fighter id ('*' = every fighter)  →  [agent, agent, …]
//
// * Keys are full agent names (`mario_fireball`), as under each Articles
//   heading. Automatic order is alphabetical.

export const ARTICLE_ORDER: Record<string, string[]> = {
  '*': [],
  eflame: [
    'eflame_esword',
    'eflame_firepillar',
    'eflame_blazepillar'
  ],
  elight: [
    'elight_bunshin',
    'elight_exprosiveshot',
    'elight_spreadbullet',
    'elight_meteor',
    'elight_beam',
  ],
}
