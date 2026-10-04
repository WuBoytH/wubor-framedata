// Mirrors the compact JSON written by `wubor-framedata site`
// (crates/cli/src/site.rs in the wubor-framedata repo).

/** A statically-evaluated script argument. Hash40 labels and `*CONST`s are
 *  both plain strings; `null` is `None`; `{expr}` is source we couldn't fold. */
export type Val = number | boolean | string | null | { expr: string }

export type Side = 'wubor' | 'vanilla'
export type Origin = 'modded' | 'vanilla'

export interface Span {
  start: number
  /** `null` = until the move ends */
  end: number | null
}

export interface Condition {
  text: string
  value: boolean
}

export interface CancelWindow {
  /** normal | special | jump | aerial | dash | airdash | jab_combo */
  kind: string
  /** hit | block | whiff; empty = always */
  on: string[]
  into: string[]
  window: Span
  flag?: string
  status?: string
  alt_flag?: string
}

export interface CancelSpec {
  kind: string
  on: string[]
  into: string[]
  require_flag: boolean
  direction?: string
}

export interface CancelRule {
  status: string
  specs: CancelSpec[]
  alt_flag?: string
  alt_specs?: CancelSpec[]
  functions?: string[]
  source: string
}

/** A span of frames with a set of collision boxes active: hitboxes (`ATTACK`),
 *  grab boxes (`CATCH`) or search boxes (`SEARCH`). */
export interface BoxWindow extends Span {
  tags: string[]
  /** Positional; field order is `Index.hitbox_fields` / `grab_fields` / `search_fields`. */
  boxes: Val[][]
}

export type BoxKind = 'attack' | 'grab' | 'search'

export type EventKind =
  | 'Attack'
  | 'Catch'
  | 'Search'
  | 'Call'
  | 'ClearAll'
  | 'Clear'
  | 'HitboxModify'
  | 'MotionRate'
  | 'Flag'
  | 'Unsupported'

export interface Event {
  /** game frame (fractional under a motion rate; lands on ceil) */
  f: number
  /** animation frame */
  a: number
  tags?: string[]
  kind: EventKind
  id?: Val
  /** ClearAll / Clear: which boxes */
  boxes?: BoxKind
  name?: string
  args?: Val[]
  command?: string
  rate?: number
  text?: string
}

export interface Variant {
  label: string
  /** conditions shared by every world merged into this variant */
  conditions: Condition[]
  /** each merged world's full condition set; absent for a single world */
  worlds?: Condition[][]
  notes: string[]
  total_frames?: number
  faf?: number
  faf_source?: 'cancel_frame' | 'motion_end'
  autocancel: Span[]
  cancels: CancelWindow[]
  /** hitboxes */
  windows: BoxWindow[]
  /** grab boxes */
  grabs: BoxWindow[]
  /** search boxes */
  searches: BoxWindow[]
  events: Event[]
}

export interface Motion {
  motion_origin: 'vanilla' | 'modded' | 'removed'
  animation: string
  animation_origin: Origin
  anim_frames: number | null
  cancel_frame: number
  xlu_start: number
  xlu_end: number
  loops: boolean
}

export interface Script {
  origin: Origin
  source: string
  line: number
  notes: string[]
  motion: Motion | null
  variants: Variant[]
}

export interface ParamChange {
  vanilla: Val | null
  wubor: Val
}

/** One `fighter_param_table` field, effective value; `changed`/`vanilla` only when the mod altered it. */
export interface Param {
  key: string
  value: Val
  changed?: boolean
  vanilla?: Val | null
}

export interface Fighter {
  name: string
  landing_lag: Record<string, number>
  /** just the changes, keyed by param — a subset of `param_table` plus `param_private/…` vl.prc keys */
  params: Record<string, ParamChange>
  /** every field of the fighter's `fighter_param_table` entry, in file order */
  param_table: Param[]
  cancel_rules: CancelRule[]
  warnings: string[]
  /** agent → script name → script */
  agents: Record<string, Record<string, Script>>
}

export interface IndexEntry {
  id: string
  /** `fighter_param_table` weight (for the hitstun target picker); absent if unknown */
  weight?: number | null
  agents: string[]
  scripts: number
  modded: number
  params_changed: number
  cancel_rules: number
}

/** Constants behind shield stun / hitstun (generator README "Stun"). */
export interface StunParams {
  shield_setoff_mul: number
  shield_setoff_add: number
  shield_stiff_frame_max: number
  just_shield_setoff_mul: number
  /** attack-kind multipliers folded into the per-hit setoff mul (all 1 in the mod) */
  shield_stiff_mul_attack_air: number
  shield_stiff_mul_attack_4: number
  shield_setoff_mul_fighter_shot: number
  guard_off_cancel_frame: number
  /** hitstun frames per unit of knockback */
  hitstun_mul: number
  /** damage multiplier in 1v1 (vanilla 1.2; 1 in the mod) */
  one_on_one_damage_mul: number
  /** extra stun frames while burnt out (mod only) */
  burnout_stun_penalty: number
}

export interface Common {
  stun: StunParams
}

export interface Index {
  generated: string
  hitbox_fields: string[]
  grab_fields: string[]
  search_fields: string[]
  wubor: IndexEntry[]
  vanilla?: IndexEntry[]
  /** per side (`wubor` / `vanilla`) */
  common?: Record<string, Common>
}
