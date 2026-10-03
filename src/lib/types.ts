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

export interface HitboxWindow extends Span {
  tags: string[]
  /** Positional; field order is `Index.hitbox_fields`. */
  hitboxes: Val[][]
}

export type EventKind =
  | 'Attack'
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
  name?: string
  args?: Val[]
  command?: string
  rate?: number
  text?: string
}

export interface Variant {
  label: string
  conditions: Condition[]
  notes: string[]
  total_frames?: number
  faf?: number
  faf_source?: 'cancel_frame' | 'motion_end'
  autocancel: Span[]
  cancels: CancelWindow[]
  windows: HitboxWindow[]
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
  agents: string[]
  scripts: number
  modded: number
  params_changed: number
  cancel_rules: number
}

export interface Index {
  generated: string
  hitbox_fields: string[]
  wubor: IndexEntry[]
  vanilla?: IndexEntry[]
}
