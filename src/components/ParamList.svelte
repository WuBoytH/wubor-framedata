<script lang="ts">
  // Every fighter_param_table field, file order; the mod's changes highlighted.
  import type { Param } from '../lib/types'
  import { fmtVal } from '../lib/format'

  let { params, hidden = 0 }: { params: Param[]; hidden?: number } = $props()
  let q = $state('')
  let changedOnly = $state(false)

  const changed = $derived(params.filter((p) => p.changed).length)
  const shown = $derived(
    params.filter((p) => (!changedOnly || p.changed) && (!q || p.key.includes(q.toLowerCase().trim()))),
  )
</script>

<section class="params">
  <div class="head row">
    <h2 id="params">Params <span class="muted small">{params.length}</span></h2>
    <!-- <p class="small muted">
      <code>fighter_param.prc</code> entry. <mark>Highlighted</mark> = changed by the mod ({changed}). {#if hidden}
        {hidden} hidden by <code>visibility.ts</code>.{/if}
    </p> -->
    <p class="small muted">
      <code>fighter_param.prc</code> entry. <mark>Highlighted</mark> = changed by the mod ({changed}).
    </p>
    <span class="grow"></span>
    <input type="search" placeholder="Filter…" bind:value={q} aria-label="Filter params" />
    <label class="small"><input type="checkbox" bind:checked={changedOnly} /> changed only</label>
  </div>
  <div class="list">
    {#each shown as p (p.key)}
      <div class="prow" class:changed={p.changed} title={p.changed ? `vanilla: ${fmtVal(p.vanilla ?? null)}` : undefined}>
        <span class="key mono">{p.key}</span>
        <span class="val mono">
          {fmtVal(p.value)}
          {#if p.changed}<s class="old">{p.vanilla === null || p.vanilla === undefined ? 'new' : fmtVal(p.vanilla)}</s>{/if}
        </span>
      </div>
    {:else}
      <p class="small muted">No params match.</p>
    {/each}
  </div>
</section>

<style>
  .params { margin-bottom: .5rem; }
  .head { align-items: center; gap: .5rem 1rem; }
  .head h2 { margin: 0; }
  .head p { margin: 0; flex-basis: 100%; }
  .head input[type='search'] { width: 220px; padding: .3rem .6rem; }
  .head label { color: var(--text-2); white-space: nowrap; }
  .grow { flex: 1; }
  mark { background: var(--hl); color: inherit; padding: 0 .15em; border-radius: 2px; }
  /* multi-column: file order runs down each column, then the next */
  .list { columns: 300px; column-gap: 1.5rem; margin-top: .5rem; font-variant-numeric: tabular-nums; }
  .prow { break-inside: avoid; display: flex; justify-content: space-between; gap: .75rem; padding: .2rem .5rem; font-size: .8rem; line-height: 1.35; border-bottom: 1px solid var(--border); }
  .prow:hover { background: var(--surface-2); }
  .prow.changed { background: var(--hl); box-shadow: inset 3px 0 0 var(--mod); }
  .prow.changed:hover { background: color-mix(in oklab, var(--hl), var(--text) 6%); }
  .key { color: var(--text-2); overflow-wrap: anywhere; }
  .prow.changed .key { color: var(--text); }
  .val { text-align: right; white-space: nowrap; flex-shrink: 0; }
  .prow.changed .val { font-weight: 600; }
  .old { display: block; font-weight: 400; color: var(--text-3); font-size: .75rem; }
</style>
