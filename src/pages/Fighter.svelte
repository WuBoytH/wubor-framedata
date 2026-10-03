<script lang="ts">
  import type { Index, Fighter, Script } from '../lib/types'
  import { loadFighter } from '../lib/data'
  import { fighterName, agentLabel } from '../lib/fighters'
  import { href } from '../lib/router.svelte'
  import { moveInfo, CATEGORIES, type Category } from '../lib/moves'
  import { summarize, hasHitboxes, landingLag } from '../lib/format'
  import MoveTable, { type Row } from '../components/MoveTable.svelte'
  import { orderVariants } from '../lib/variants'
  import ParamList from '../components/ParamList.svelte'
  import SectionNav, { type Section } from '../components/SectionNav.svelte'
  import { articleVisible, moveVisible, paramVisible } from '../lib/visibility'

  let { idx, id }: { idx: Index; id: string } = $props()
  let showAll = $state(false)
  let navOpen = $state(localStorage.getItem('fighter-nav') !== 'hidden')
  const toggleNav = () => {
    navOpen = !navOpen
    localStorage.setItem('fighter-nav', navOpen ? 'open' : 'hidden')
  }

  const data = $derived(loadFighter('wubor', id))

  function rows(f: Fighter, agent: string, filter: (name: string, s: Script) => boolean): Row[] {
    const out: Row[] = []
    for (const [name, s] of Object.entries(f.agents[agent] ?? {})) {
      if (!moveVisible(id, agent, name) || !filter(name, s)) continue
      const info = moveInfo(name, id, agent)
      // One row per script: the primary variant's data (unmodified, or Light
      // for strength moves); the others are counted and the move page shows each.
      const views = orderVariants(s.variants)
      if (!views.length) continue
      const primary = views[0]
      const summary = summarize(primary.variant, idx.hitbox_fields)
      const sig = (v: typeof primary) => JSON.stringify([summarize(v.variant, idx.hitbox_fields), v.variant.cancels.map((c) => [c.kind, c.window])])
      const primarySig = sig(primary)
      out.push({
        href: href.move(id, agent, name),
        name: info.name,
        script: name,
        variant: views.length > 1 ? primary.label : '',
        variants: views.map((v) => v.label || 'unmodified'),
        variantsDiffer: views.slice(1).some((v) => sig(v) !== primarySig),
        modded: s.origin === 'modded',
        summary,
        landing: landingLag(f.landing_lag, name),
        cancels: primary.variant.cancels.length,
        intangible: s.motion && s.motion.xlu_end > 0 ? `${s.motion.xlu_start}–${s.motion.xlu_end}` : null,
      })
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

  const articles = (f: Fighter) => Object.keys(f.agents).filter((a) => a !== id && articleVisible(id, a)).sort()
  const hiddenOther = (f: Fighter) =>
    Object.entries(f.agents[id] ?? {}).filter(([n, s]) => moveVisible(id, id, n) && moveInfo(n, id, id).category === 'Other' && !hasHitboxes(s)).length
  /** Scripts removed by src/data/visibility.ts, all agents. */
  const hiddenByConfig = (f: Fighter) =>
    Object.entries(f.agents).reduce((n, [a, scripts]) => n + Object.keys(scripts).filter((s) => !articleVisible(id, a) || !moveVisible(id, a, s)).length, 0)
  const visibleParams = (f: Fighter) => (f.param_table ?? []).filter((p) => paramVisible(id, p.key))
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const sections = (f: Fighter): Section[] => [
    ...(f.param_table?.length ? [{ id: 'params', label: 'Params' }] : []),
    ...byCategory(f).map(({ cat }) => ({ id: `cat-${slug(cat)}`, label: cat })),
    ...(articles(f).length
      ? [{ id: 'articles', label: 'Articles', sub: articles(f).map((a) => ({ id: `article-${slug(a)}`, label: agentLabel(a, id) })) }]
      : []),
  ]
</script>

<div class="crumbs"><a href={href.home}>Fighters</a><span>{fighterName(id)}</span></div>

{#await data}
  <h1>{fighterName(id)}</h1>
  <p class="muted">Loading…</p>
{:then f}
  <h1>{fighterName(id)} <span class="mono faint small">{id}</span></h1>
  <div class="layout" class:nonav={!navOpen}>
  <div class="main">
  <div class="row">
    <span class="grow"></span>
    {#if f.cancel_rules.length}<a class="btn" href={href.cancels(id)}>{f.cancel_rules.length} cancel rule{f.cancel_rules.length === 1 ? '' : 's'} →</a>{/if}
  </div>

  {#if f.param_table?.length}
    <ParamList params={visibleParams(f)} hidden={f.param_table.length - visibleParams(f).length} />
  {/if}

  {#each byCategory(f) as { cat, rows: r } (cat)}
    <h2 id="cat-{slug(cat)}">{cat}</h2>
    <MoveTable rows={r} showLanding={cat === 'Aerials'} />
  {/each}

  {#if hiddenOther(f)}
    <p><button class="small" onclick={() => (showAll = !showAll)}>{showAll ? 'Hide' : 'Show'} {hiddenOther(f)} scripts without hitboxes (entry, win, damage, …)</button></p>
  {/if}

  {#if articles(f).length}
    <h2 id="articles">Articles</h2>
    {#each articles(f) as a (a)}
      {@const r = rows(f, a, () => true).sort((x, y) => moveInfo(x.script, id, a).order.localeCompare(moveInfo(y.script, id, a).order) || x.script.localeCompare(y.script))}
      {#if r.length}
        <h3 class="mono" id="article-{slug(a)}">{agentLabel(a, id)} <span class="faint small">{a}</span></h3>
        <MoveTable rows={r} />
      {/if}
    {/each}
  {/if}

  <!-- {#if hiddenByConfig(f)}
    <p class="small faint">{hiddenByConfig(f)} script{hiddenByConfig(f) === 1 ? '' : 's'} hidden by <code>src/data/visibility.ts</code>.</p>
  {/if} -->
  <!-- {#if f.warnings.length}
    <details class="small"><summary>{f.warnings.length} build warning{f.warnings.length === 1 ? '' : 's'}</summary>
      {#each f.warnings as w}<div class="note warn mono">{w}</div>{/each}
    </details>
  {/if} -->
  </div>
  {#if navOpen}
    <div class="side">
      <SectionNav sections={sections(f)} onhide={toggleNav} />
    </div>
  {:else}
    <button class="show-nav small" onclick={toggleNav} title="Show the section list">Sections</button>
  {/if}
  </div>
{:catch e}
  <p class="note warn">Failed to load {id}: {e.message}</p>
{/await}

<style>
  .grow { flex: 1; }
  .row { margin: .5rem 0 1rem; }
  .layout { display: grid; grid-template-columns: minmax(0, 1fr) 220px; gap: 1.25rem; align-items: start; }
  .layout.nonav { grid-template-columns: minmax(0, 1fr); }
  .show-nav { position: fixed; right: .75rem; top: 3.5rem; z-index: 5; box-shadow: 0 1px 4px rgb(0 0 0 / .15); }
  /* The column stretches to the full height of the layout so the nav inside
     it can stay pinned for the whole page (a sticky element can't leave its
     container, and `align-items: start` would make that container tiny). */
  .side { align-self: stretch; }
  .side > :global(.toc) { position: sticky; top: 3.5rem; max-height: calc(100vh - 4rem); overflow-y: auto; }
  .main :global(h2), .main :global(h3) { scroll-margin-top: 3.5rem; }
  @media (max-width: 960px) {
    .layout { grid-template-columns: minmax(0, 1fr); }
    .side > :global(.toc) { position: static; max-height: none; }
  }
</style>
