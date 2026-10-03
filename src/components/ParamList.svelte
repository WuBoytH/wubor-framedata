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

<aside class="params">
  <div class="head">
    <h2>Params <span class="muted small">{params.length}</span></h2>
    <p class="small muted">
      <code>fighter_param.prc</code> entry. <mark>Highlighted</mark> = changed by the mod ({changed}).{#if hidden}
        {hidden} hidden by <code>visibility.ts</code>.{/if}
    </p>
    <input type="search" placeholder="Filter…" bind:value={q} aria-label="Filter params" />
    <label class="small"><input type="checkbox" bind:checked={changedOnly} /> changed only</label>
  </div>
  <div class="list" role="table">
    {#each shown as p (p.key)}
      <div class="row" class:changed={p.changed} role="row" title={p.changed ? `vanilla: ${fmtVal(p.vanilla ?? null)}` : undefined}>
        <span class="key mono" role="cell">{p.key}</span>
        <span class="val mono" role="cell">
          {fmtVal(p.value)}
          {#if p.changed}<s class="old">{p.vanilla === null || p.vanilla === undefined ? 'new' : fmtVal(p.vanilla)}</s>{/if}
        </span>
      </div>
    {:else}
      <p class="small muted">No params match.</p>
    {/each}
  </div>
</aside>

<style>
  .params { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; display: flex; flex-direction: column; min-height: 0; }
  .head { padding: .75rem .9rem .5rem; border-bottom: 1px solid var(--border); }
  .head h2 { margin: 0 0 .25rem; font-size: 1.05rem; }
  .head p { margin: 0 0 .5rem; }
  .head input[type='search'] { width: 100%; max-width: none; padding: .3rem .6rem; }
  .head label { display: block; margin-top: .4rem; color: var(--text-2); }
  mark { background: var(--hl); color: inherit; padding: 0 .15em; border-radius: 2px; }
  .list { overflow-y: auto; padding: .25rem 0; font-variant-numeric: tabular-nums; }
  .row { display: flex; justify-content: space-between; gap: .75rem; padding: .15rem .9rem; font-size: .8rem; line-height: 1.35; }
  .row:hover { background: var(--surface-2); }
  .row.changed { background: var(--hl); box-shadow: inset 3px 0 0 var(--mod); }
  .row.changed:hover { background: color-mix(in oklab, var(--hl), var(--text) 6%); }
  .key { color: var(--text-2); overflow-wrap: anywhere; }
  .row.changed .key { color: var(--text); }
  .val { text-align: right; white-space: nowrap; flex-shrink: 0; }
  .row.changed .val { font-weight: 600; }
  .old { display: block; font-weight: 400; color: var(--text-3); font-size: .75rem; }
</style>
