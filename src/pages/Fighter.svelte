<script lang="ts">
  import type { Index, Fighter, Script } from '../lib/types'
  import { loadFighter } from '../lib/data'
  import { fighterName, agentLabel } from '../lib/fighters'
  import { href } from '../lib/router.svelte'
  import { moveInfo, CATEGORIES, type Category } from '../lib/moves'
  import { summarize, hasHitboxes } from '../lib/format'
  import MoveTable, { type Row } from '../components/MoveTable.svelte'
  import { orderVariants } from '../lib/variants'
  import ParamList from '../components/ParamList.svelte'
  import { moveVisible, paramVisible } from '../lib/visibility'

  let { idx, id }: { idx: Index; id: string } = $props()
  let showAll = $state(false)

  const data = $derived(loadFighter('wubor', id))

  function rows(f: Fighter, agent: string, filter: (name: string, s: Script) => boolean): Row[] {
    const out: Row[] = []
    for (const [name, s] of Object.entries(f.agents[agent] ?? {})) {
      if (!moveVisible(id, agent, name) || !filter(name, s)) continue
      const info = moveInfo(name, id, agent)
      // Variants that differ only in effects/sfx share a row; the move page still shows each.
      const groups = new Map<string, { labels: string[]; row: Row }>()
      for (const { variant: v, label } of orderVariants(s.variants)) {
        const summary = summarize(v, idx.hitbox_fields)
        const key = JSON.stringify([summary, v.cancels.map((c) => [c.kind, c.window])])
        const g = groups.get(key)
        if (g) {
          g.labels.push(label)
          continue
        }
        groups.set(key, {
          labels: [label],
          row: {
            href: href.move(id, agent, name),
            name: info.name,
            script: name,
            variant: '',
            modded: s.origin === 'modded',
            summary,
            landing: info.aerial ? (f.landing_lag[info.aerial] ?? null) : null,
            cancels: v.cancels.length,
            intangible: s.motion && s.motion.xlu_end > 0 ? `${s.motion.xlu_start}–${s.motion.xlu_end}` : null,
          },
        })
      }
      for (const g of groups.values()) {
        // Base row stays unlabelled; if other variants share its data, say so.
        const named = g.labels.filter(Boolean)
        if (groups.size > 1) g.row.variant = g.labels.includes('') ? (named.length ? `also ${named.join(' / ')}` : '') : named.join(' / ')
        else if (s.variants.length > 1) g.row.variant = `${s.variants.length} variants, same frame data`
        out.push(g.row)
      }
    }
    return out
  }

  function byCategory(f: Fighter): { cat: Category; rows: Row[] }[] {
    return CATEGORIES.map((cat) => {
      const r = rows(f, id, (n, s) => {
        const info = moveInfo(n, id, id)
        if (info.category !== cat) return false
        return cat !== 'Other' || showAll || hasHitboxes(s)
      }).sort((a, b) => moveInfo(a.script, id, id).order.localeCompare(moveInfo(b.script, id, id).order) || a.script.localeCompare(b.script))
      return { cat, rows: r }
    }).filter((c) => c.rows.length)
  }

  const articles = (f: Fighter) => Object.keys(f.agents).filter((a) => a !== id).sort()
  const hiddenOther = (f: Fighter) =>
    Object.entries(f.agents[id] ?? {}).filter(([n, s]) => moveVisible(id, id, n) && moveInfo(n, id, id).category === 'Other' && !hasHitboxes(s)).length
  /** Scripts removed by src/data/visibility.ts, all agents. */
  const hiddenByConfig = (f: Fighter) =>
    Object.entries(f.agents).reduce((n, [a, scripts]) => n + Object.keys(scripts).filter((s) => !moveVisible(id, a, s)).length, 0)
  const visibleParams = (f: Fighter) => (f.param_table ?? []).filter((p) => paramVisible(id, p.key))
</script>

<div class="crumbs"><a href={href.home}>Fighters</a><span>{fighterName(id)}</span></div>

{#await data}
  <h1>{fighterName(id)}</h1>
  <p class="muted">Loading…</p>
{:then f}
  <h1>{fighterName(id)} <span class="mono faint small">{id}</span></h1>
  <div class="layout">
  <div class="main">
  <div class="row">
    {#if Object.keys(f.landing_lag).length}
      <div class="chips">
        <span class="muted small">Landing lag</span>
        {#each ['n', 'f', 'b', 'hi', 'lw'] as k}
          {#if f.landing_lag[k] !== undefined}<span class="chip">{k} <b>{f.landing_lag[k]}</b></span>{/if}
        {/each}
        {#each Object.entries(f.landing_lag).filter(([k]) => !['n', 'f', 'b', 'hi', 'lw'].includes(k)) as [k, v]}
          <span class="chip">{k} <b>{v}</b></span>
        {/each}
      </div>
    {/if}
    <span class="grow"></span>
    {#if f.cancel_rules.length}<a class="btn" href={href.cancels(id)}>{f.cancel_rules.length} cancel rule{f.cancel_rules.length === 1 ? '' : 's'} →</a>{/if}
  </div>

  {#each byCategory(f) as { cat, rows: r } (cat)}
    <h2>{cat}</h2>
    <MoveTable rows={r} showLanding={cat === 'Aerials'} />
  {/each}

  {#if hiddenOther(f)}
    <p><button class="small" onclick={() => (showAll = !showAll)}>{showAll ? 'Hide' : 'Show'} {hiddenOther(f)} scripts without hitboxes (entry, win, damage, …)</button></p>
  {/if}

  {#if articles(f).length}
    <h2>Articles</h2>
    {#each articles(f) as a (a)}
      {@const r = rows(f, a, () => true).sort((x, y) => x.script.localeCompare(y.script))}
      {#if r.length}
        <h3 class="mono">{agentLabel(a, id)} <span class="faint small">{a}</span></h3>
        <MoveTable rows={r} />
      {/if}
    {/each}
  {/if}

  {#if hiddenByConfig(f)}
    <p class="small faint">{hiddenByConfig(f)} script{hiddenByConfig(f) === 1 ? '' : 's'} hidden by <code>src/data/visibility.ts</code>.</p>
  {/if}
  {#if f.warnings.length}
    <details class="small"><summary>{f.warnings.length} build warning{f.warnings.length === 1 ? '' : 's'}</summary>
      {#each f.warnings as w}<div class="note warn mono">{w}</div>{/each}
    </details>
  {/if}
  </div>
  {#if f.param_table?.length}
    <ParamList params={visibleParams(f)} hidden={f.param_table.length - visibleParams(f).length} />
  {/if}
  </div>
{:catch e}
  <p class="note warn">Failed to load {id}: {e.message}</p>
{/await}

<style>
  .grow { flex: 1; }
  .row { margin: .5rem 0 1rem; }
  .layout { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 1.5rem; align-items: start; }
  .layout > :global(.params) { position: sticky; top: 3.5rem; max-height: calc(100vh - 4.5rem); }
  @media (max-width: 960px) {
    .layout { grid-template-columns: minmax(0, 1fr); }
    .layout > :global(.params) { position: static; max-height: 60vh; }
  }
</style>
