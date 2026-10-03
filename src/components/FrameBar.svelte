<script lang="ts">
  // Frame strip: one lane per thing that's active on a span of game frames.
  // Colour marks identity (hitbox / autocancel / cancel / intangible) and every
  // lane also carries a text label, so colour is never the only encoding.
  import type { Variant, Motion } from '../lib/types'
  import { fmtSpan, windowIds, short, groupWindows } from '../lib/format'

  let { variant, motion, fields }: { variant: Variant; motion: Motion | null; fields: string[] } = $props()

  interface Seg { start: number; end: number; title: string }
  interface Lane { label: string; role: 'active' | 'autocancel' | 'cancel' | 'intangible'; segs: Seg[] }

  // No cancel frame → the "FAF" is just anim end + 1, so the strip ends at the
  // animation and is labelled Total instead.
  const faf = $derived(variant.faf_source === 'motion_end' ? null : variant.faf ?? null)
  const total = $derived.by(() => {
    const ends = [
      Math.ceil(variant.total_frames ?? 0),
      faf ?? 0,
      ...variant.windows.map((w) => w.end ?? w.start),
      ...variant.autocancel.map((w) => w.end ?? w.start),
      ...variant.cancels.map((c) => c.window.end ?? c.window.start),
    ]
    return Math.max(1, ...ends)
  })

  const lanes = $derived.by((): Lane[] => {
    const out: Lane[] = []
    const clip = (end: number | null) => Math.min(end ?? total, total)
    const windows = groupWindows(variant.windows)
    windows.forEach((w) => {
      const ids = windowIds(w, fields)
      out.push({
        label: windows.length > 1 ? `Hitbox ${ids}` : 'Hitboxes',
        role: 'active',
        segs: [{ start: w.start, end: clip(w.end), title: `Hitbox id ${ids} active f${fmtSpan(w)}${w.tags.length ? ` [${w.tags.join(', ')}]` : ''}` }],
      })
    })
    if (variant.autocancel.length) {
      out.push({ label: 'Autocancel', role: 'autocancel', segs: variant.autocancel.map((w) => ({ start: w.start, end: clip(w.end), title: `Autocancel f${fmtSpan(w)}` })) })
    }
    const byKind = new Map<string, Seg[]>()
    for (const c of variant.cancels) {
      const on = c.on.length ? ` on ${c.on.join('/')}` : ''
      const seg = { start: c.window.start, end: clip(c.window.end), title: `${c.kind} cancel${on} f${fmtSpan(c.window)}${c.flag ? ` [${short(c.flag)}]` : ''}` }
      byKind.set(c.kind, [...(byKind.get(c.kind) ?? []), seg])
    }
    for (const [kind, segs] of byKind) out.push({ label: `Cancel: ${kind.replace('_', ' ')}`, role: 'cancel', segs })
    if (motion && motion.xlu_end > 0) {
      out.push({ label: 'Intangible', role: 'intangible', segs: [{ start: motion.xlu_start, end: Math.min(motion.xlu_end, total), title: `Intangible anim f${motion.xlu_start}–${motion.xlu_end} (animation frames)` }] })
    }
    return out
  })

  // Label the end of the strip: the FAF when there is one, else the total.
  const endLabel = $derived(faf !== null && faf <= total ? 'faf' : variant.faf_source === 'motion_end' ? 'total' : null)
  const mark = $derived(endLabel === 'faf' ? faf! : endLabel === 'total' ? total : null)
  const ticks = $derived([1, ...Array.from({ length: Math.floor(total / 5) }, (_, i) => (i + 1) * 5)].filter((t) => mark === null || Math.abs(t - mark) > 3))
  let hover = $state<number | null>(null)

  const atFrame = (f: number) =>
    lanes.flatMap((l) => l.segs.filter((s) => f >= s.start && f <= s.end).map((s) => s.title))
  // Row 1 is the ruler; lanes start at row 2. Column 1 is the label; frame f is column f+1.
  const rows = $derived(lanes.length + 1)
</script>

<div class="wrap" role="img" aria-label="Frame strip, {total} frames">
  <div class="strip" style="--total:{total}; --rows:{rows}">
    <div class="ruler-label faint small">frame</div>
    {#each ticks as t}
      <div class="tick small faint" style="grid-column:{t + 1}">{t}</div>
    {/each}
    {#if endLabel === 'faf'}
      <div class="tick small faf-label" style="grid-column:{faf! + 1}">FAF {faf}</div>
    {:else if endLabel === 'total'}
      <div class="tick small faf-label" style="grid-column:{total + 1}">Total {total}</div>
    {/if}

    {#each lanes as lane, i}
      <div class="label small" style="grid-row:{i + 2}">{lane.label}</div>
      <div class="bed" style="grid-row:{i + 2}; grid-column: 2 / span {total}"></div>
      {#if faf !== null && faf <= total}
        <div class="actionable" style="grid-row:{i + 2}; grid-column:{faf + 1} / span {total - faf + 1}"></div>
      {/if}
      {#each lane.segs as s}
        <div class="seg {lane.role}" style="grid-row:{i + 2}; grid-column:{s.start + 1} / span {Math.max(1, s.end - s.start + 1)}" title={s.title}></div>
      {/each}
    {/each}

    {#if faf !== null && faf <= total}
      <div class="faf" style="grid-column:{faf + 1}; grid-row: 2 / span {rows - 1}"></div>
    {/if}
    {#if hover !== null}
      <div class="hl" style="grid-column:{hover + 1}; grid-row: 1 / span {rows}"></div>
    {/if}
    {#each Array.from({ length: total }, (_, i) => i + 1) as f}
      <div class="hit" style="grid-column:{f + 1}; grid-row: 1 / span {rows}" onmouseenter={() => (hover = f)} onmouseleave={() => (hover = null)} role="presentation"></div>
    {/each}
  </div>
  {#if !lanes.length}
    <p class="small muted">No hitboxes in this script{motion ? '' : ' and no motion entry'}. Projectile and article hitboxes live on their own agent (see the fighter page's Articles section).</p>
  {/if}
  {#if hover !== null}
    {@const items = atFrame(hover)}
    <div class="tip small">
      <b>Frame {hover}</b>{#if faf !== null && hover >= faf} · actionable{/if}
      {#each items as it}<div>{it}</div>{/each}
      {#if !items.length}<div class="muted">nothing active</div>{/if}
    </div>
  {:else}
    <div class="tip small muted">Hover a frame for details.</div>
  {/if}
</div>

<style>
  .wrap { overflow-x: auto; padding-bottom: .25rem; }
  .strip {
    --fw: 14px; --lh: 16px;
    display: grid;
    grid-template-columns: 150px repeat(var(--total), var(--fw));
    grid-template-rows: 18px repeat(calc(var(--rows) - 1), var(--lh));
    row-gap: 4px; position: relative; width: max-content; min-width: 100%;
  }
  .ruler-label { grid-column: 1; grid-row: 1; align-self: end; }
  .tick { grid-row: 1; align-self: end; text-align: left; margin-left: 1px; }
  .label { grid-column: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: .5rem; line-height: var(--lh); color: var(--text-2); }
  .bed { background: var(--c-idle); border-radius: 3px; }
  .actionable { background: var(--c-actionable); border-radius: 0 3px 3px 0; }
  .seg { border-radius: 4px; margin: 0 1px; box-shadow: 0 0 0 1px var(--bg); z-index: 1; }
  .seg.active { background: var(--c-active); }
  .seg.autocancel { background: var(--c-autocancel); }
  .seg.cancel { background: var(--c-cancel); }
  .seg.intangible { background: var(--c-intangible); }
  .faf { border-left: 2px solid var(--text); z-index: 2; pointer-events: none; }
  .faf-label { font-weight: 600; color: var(--text); white-space: nowrap; }
  .hl { background: color-mix(in oklab, var(--text) 12%, transparent); z-index: 3; pointer-events: none; }
  .hit { z-index: 4; }
  .tip { margin-top: .5rem; min-height: 2.5rem; }
</style>
