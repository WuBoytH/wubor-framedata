// Hand-maintained move order. Scripts listed here are placed at the top of
// their category, in this order; everything not listed follows in the
// automatic order (src/lib/moves.ts). To pin an entire category by hand,
// list all of its scripts.
//
//   fighter id ('*' = every fighter)  →  [script, script, …]
//
// * Keys are script names (`game_specialn`); article scripts are
//   `agent/script`. A fighter's list comes before the '*' list.
// * This only moves scripts within their category; use `category` in
//   src/data/move-names.ts to move one to another section.

export const MOVE_ORDER: Record<string, string[]> = {
  '*': [],
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
