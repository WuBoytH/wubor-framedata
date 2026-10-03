<script lang="ts">
  import type { Index, Fighter, CancelSpec } from '../lib/types'
  import { loadFighter } from '../lib/data'
  import { fighterName } from '../lib/fighters'
  import { href } from '../lib/router.svelte'
  import { moveInfo } from '../lib/moves'
  import { short, fmtSpan } from '../lib/format'
  import { orderVariants } from '../lib/variants'
  import { moveVisible } from '../lib/visibility'

  let { idx, id }: { idx: Index; id: string } = $props()
  const data = $derived(loadFighter('wubor', id))

  const on = (s: CancelSpec) => (s.on.length ? s.on.join(' / ') : 'always')

  /** Every cancel window across the fighter's own scripts, flattened. */
  function windows(f: Fighter) {
    const out = []
    for (const [name, s] of Object.entries(f.agents[id] ?? {})) {
      if (!moveVisible(id, id, name)) continue
      for (const { variant: v, label } of orderVariants(s.variants)) for (const c of v.cancels) {
        out.push({ name, move: moveInfo(name, id, id).name, variant: s.variants.length > 1 ? label || 'unmodified' : '', c })
      }
    }
    return out.sort((a, b) => moveInfo(a.name, id, id).order.localeCompare(moveInfo(b.name, id, id).order) || a.name.localeCompare(b.name))
  }
</script>

<div class="crumbs"><a href={href.home}>Fighters</a><a href={href.fighter(id)}>{fighterName(id)}</a><span>Cancels</span></div>
<h1>{fighterName(id)} — cancels</h1>
<p class="muted small">
  Rules the mod registers through <code>CustomCancelManager::add_cancel_info</code>, then the windows they produce on each move
  (from the ACMD on/off frames of the cancel flag, or the first hitbox frame for hit/block cancels).
  Hitbox fields: {idx.hitbox_fields.length}.
</p>

{#await data}
  <p class="muted">Loading…</p>
{:then f}
  <h2>Rules</h2>
  {#if !f.cancel_rules.length}
    <p class="muted">No custom cancel rules for this fighter.</p>
  {/if}
  {#each f.cancel_rules as r}
    <div class="card rule">
      <div class="row">
        <b class="mono">{short(r.status)}</b>
        <span class="faint small mono">{r.source}{r.functions?.length ? ` · ${r.functions.join(', ')}` : ''}</span>
      </div>
      {#snippet specs(list: CancelSpec[])}
        <table class="small">
          <thead><tr><th>Kind</th><th>On</th><th>Needs flag</th><th>Into</th></tr></thead>
          <tbody>
            {#each list as s}
              <tr>
                <td>{s.kind}{s.direction ? ` (${s.direction})` : ''}</td>
                <td>{on(s)}</td>
                <td>{s.require_flag ? 'yes' : 'no'}</td>
                <td class="mono muted">{s.into.length ? s.into.map(short).join(', ') : 'any'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/snippet}
      {@render specs(r.specs)}
      {#if r.alt_flag}
        <p class="small muted">While <code>{short(r.alt_flag)}</code> is set:</p>
        {@render specs(r.alt_specs ?? [])}
      {/if}
    </div>
  {/each}

  <h2>Cancel windows by move</h2>
  {@const ws = windows(f)}
  {#if !ws.length}
    <p class="muted">No cancel windows derived.</p>
  {:else}
    <div class="table-wrap"><table>
      <thead><tr><th>Move</th><th>Kind</th><th>On</th><th>Window</th><th>Flag</th><th>Into</th></tr></thead>
      <tbody>
        {#each ws as w}
          <tr>
            <td><a href={href.move(id, id, w.name)}>{w.move}</a>{#if w.variant}<div class="small mono muted">{w.variant}</div>{/if}</td>
            <td>{w.c.kind.replace('_', ' ')}{w.c.alt_flag ? ` (alt: ${short(w.c.alt_flag)})` : ''}</td>
            <td>{w.c.on.length ? w.c.on.join(' / ') : 'always'}</td>
            <td class="mono">f{fmtSpan(w.c.window)}</td>
            <td class="mono small muted">{w.c.flag ? short(w.c.flag) : '—'}</td>
            <td class="mono small muted">{w.c.into.length ? w.c.into.map(short).join(', ') : 'any'}</td>
          </tr>
        {/each}
      </tbody>
    </table></div>
  {/if}
{:catch e}
  <p class="note warn">Failed to load {id}: {e.message}</p>
{/await}

<style>
  .rule { margin-bottom: .75rem; }
  .rule table { margin-top: .5rem; }
</style>
