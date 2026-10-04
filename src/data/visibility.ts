// Hand-maintained include/exclude lists for what the fighter page shows.
// Names live in src/data/rename.ts and ordering in src/data/order.ts
// (PARAM_ORDER there reorders what the PARAMS include list lets through).
//
//   fighter id ('*' = every fighter)  →  { include?, exclude? }
//
// * `exclude`: anything matching is hidden.
// * `include`: when given (non-empty), ONLY matching entries are shown.
// * A fighter's lists are merged with the '*' lists.
// * Patterns are exact strings, strings with `*` wildcards (`se_pitch_*`),
//   or regular expressions (/^camera_/).
// * MOVES match script names (`game_attack11`); article scripts are
//   `agent/script` (`mario_fireball/game_fly`). PARAMS match param keys.
// * ARTICLES match whole article agents (`mario_hugeflame`, `*_final*`) and
//   remove the article's entire table from the Articles section.
// * Hidden moves still open from a direct link; they just leave the lists.

export type Pattern = string | RegExp
export interface Rules {
  include?: Pattern[]
  exclude?: Pattern[]
}

export const PARAMS: Record<string, Rules> = {
  '*': {
    include: [
      'walk_accel_mul',
      'walk_accel_add',
      'walk_speed_max',
      'walk_slow_speed_mul',
      'walk_middle_ratio',
      'walk_fast_ratio',
      'ground_brake',
      'dash_speed',
      'run_accel_mul',
      'run_accel_add',
      'run_speed_max',
      'jump_squat_frame',
      'jump_speed_x',
      'jump_speed_x_mul',
      'jump_aerial_speed_x_mul',
      'jump_initial_y',
      'jump_y',
      'mini_jump_y',
      'jump_aerial_y',
      'air_accel_x_mul',
      'air_accel_x_add',
      'air_speed_x_stable',
      'air_brake_x',
      'air_accel_y',
      'air_speed_y_stable',
      'air_brake_y',
      'dive_speed_y',
      'weight',
      'air_ground_speed_brake',
      'jump_count_max',
      'squat_walk_type',
      'wall_jump_type',
      'attack_wall_type',
      'air_lasso_type',
      'air_dash_tier'
    ],
    exclude: [
      'fighter_kind'
    ],
    // e.g. hide the camera/sound tuning: exclude: ['fighter_kind', 'camera_range_*', 'se_pitch_*']
    // e.g. show only movement: include: ['walk_*', 'run_*', 'dash_*', 'jump_*', 'air_*', 'weight', 'landing_*']
  },
}

export const MOVES: Record<string, Rules> = {
  '*': {
    // e.g. exclude: ['game_appeal*', 'game_final*']
  },
  demon: {
    exclude: [
      'game_attack100',
      'game_attack100end',
      'game_attack100sub',
      'game_attack142',
      'game_attacks3hi',
      'game_attacks3lw',

      'game_attacks4transform',
      'game_attackhi4transform',
      'game_attacklw4transform',

      'game_specialhiair',
      'game_specialhiground',
    ]
  },
  eflame: {
    exclude: [
      'game_specialn1common',
      'game_specialn2common',
      'game_specialn3common',
      'game_specialn4common',
    ]
  },
  elight: {
    exclude: [
      'game_specialairnhit'
    ]
  },
  mario: {
    exclude: [
      'game_attacks4hi',
      'game_attacks4lw',
      'game_speciallwhold',
      'game_speciallwheavy',
      'game_speciallwlight',
      'game_specialairlwhold',
      'game_specialairlwheavy',
      'game_specialairlwlight',
    ]
  },
  // e.g. samus: { exclude: ['game_specials', 'game_specialairs'] },
  ryu: {
    exclude: [
      'game_attack11nears',
      'game_speciallwstepf',
      'game_speciallwstepb',
      'game_speciallwturn',
      'game_specialairlwturn',
      'game_attacknearw',

      'game_speciallwstart',
      'game_specialairlwstart',
      'game_specialairlwstepf',
      'game_specialairlwstepb',
    ]
  },
  // Ice Climbers: Popo's agent also carries Nana's copy of every move (`*_nana`).
  // iceclimber: { exclude: ['game_*_nana'] },
}

export const ARTICLES: Record<string, Rules> = {
  '*': {
    // e.g. exclude: ['*_final*'],
  },
  // e.g. mario: { exclude: ['mario_hugeflame'] },
  // Ice Climbers: Popo is the fighter's own agent (src/lib/fighters.ts); Nana mirrors it.
  eflame: { exclude: ['eflame_windummy'] },
  elight: { exclude: ['elight_windummy'] },
  iceclimber: { exclude: ['nana', 'nana_*'] },
  mario: { exclude: ['mario_pumpwater'] }
}
