<script lang="ts">
  import type { Index, Event } from '../lib/types'
  import { loadFighter } from '../lib/data'
  import { fighterName, agentLabel, mainAgent } from '../lib/fighters'
  import { href } from '../lib/router.svelte'
  import { moveInfo } from '../lib/moves'
  import { summarize, fmtSpan, fmtSpans, fmtFrame, fmtNum, fmtVal, short, windowIds, groupWindows, landingLag, DEFAULT_TARGET, HITSTUN_PERCENTS, stunKindMul } from '../lib/format'
  import FrameBar from '../components/FrameBar.svelte'
  import HitboxTable from '../components/HitboxTable.svelte'
  import BoxTable from '../components/BoxTable.svelte'
  import { orderVariants } from '../lib/variants'

  let { idx, id, agent, script }: { idx: Index; id: string; agent: string; script: string } = $props()
  const data = $derived(loadFighter('wubor', id))
  const info = $derived(moveInfo(script, id, agent))
  let vi = $state(0)
  // Stun constants for this side; the opponent the hitstun column assumes.
  const stun = $derived(idx.common?.wubor?.stun ?? null)
  const kindMul = $derived(stun ? stunKindMul(script, stun) : 1)
  // Hitstun target: a fighter from the index (its weight), or the default weight.
  let targetId = $state('')
  const targets = $derived(
    idx.wubor
      .filter((f) => typeof f.weight === 'number')
      .map((f) => ({ id: f.id, name: fighterName(f.id), weight: f.weight as number }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  )
  const target = $derived({ ...DEFAULT_TARGET, weight: targets.find((f) => f.id === targetId)?.weight ?? DEFAULT_TARGET.weight })
  // reset the variant tab when navigating between moves
  $effect(() => { script; agent; vi = 0 })

  function eventText(e: Event): string {
    const args = (e.args ?? []).map((a) => fmtVal(a, false)).join(', ')
    switch (e.kind) {
      case 'Attack': return `ATTACK id ${fmtVal(e.id ?? null)}`
      case 'Catch': return `CATCH id ${fmtVal(e.id ?? null)}`
      case 'Search': return `SEARCH id ${fmtVal(e.id ?? null)}`
      case 'Call': return `${e.name}(${args})`
      case 'ClearAll': return `clear all ${boxName(e)}es`
      case 'Clear': return `clear ${boxName(e)} id ${fmtVal(e.id ?? null)}`
      case 'HitboxModify': return `${e.command} id ${fmtVal(e.id ?? null)} (${args})`
      case 'MotionRate': return `motion rate → ${e.rate}`
      case 'Flag': return `flag ${short(e.name ?? '')}`
      case 'Unsupported': return `unsupported: ${e.text}`
    }
  }
  const boxName = (e: Event) => ({ attack: 'hitbox', grab: 'grab box', search: 'search box' })[e.boxes ?? 'attack']
</script>

<div class="crumbs">
  <a href={href.home}>Fighters</a><a href={href.fighter(id)}>{fighterName(id)}</a>
  {#if agent !== mainAgent(id)}<span class="mono">{agentLabel(agent, id)}</span>{/if}
  <span>{info.name}</span>
</div>

{#await data}
  <h1>{info.name}</h1><p class="muted">Loading…</p>
{:then f}
  {@const s = f.agents[agent]?.[script]}
  {#if !s}
    <h1>{info.name}</h1>
    <p class="note warn">No script <code>{script}</code> on agent <code>{agent}</code>.</p>
  {:else}
    {@const views = orderVariants(s.variants, id, agent, script)}
    {@const v = views[Math.min(vi, views.length - 1)].variant}
    {@const sum = summarize(v, idx.hitbox_fields, stun, kindMul)}
    {@const landing = landingLag(f.landing_lag, script)}
    <h1>
      {info.name}
      {#if s.origin === 'modded'}<span class="badge mod">mod</span>{/if}
      <span class="mono faint small">{script}</span>
    </h1>
    <p class="small muted mono">
      {s.source}:{s.line}
      {#if s.motion}
        · {s.motion.animation}{#if s.motion.anim_frames} ({s.motion.anim_frames} anim frames){/if}
        {#if s.motion.motion_origin === 'modded'}<span class="badge mod">mod motion</span>{/if}
        {#if s.motion.animation_origin === 'modded'}<span class="badge mod">mod anim</span>{/if}
        {#if s.motion.motion_origin === 'removed'}<span class="badge soft">removed by mod</span>{/if}
      {/if}
    </p>

    {#if s.variants.length > 1}
      <div class="row variants">
        <span class="small muted">Variant</span>
        {#each views as sv, i}
          <button class="small" class:mono={!!sv.label && !sv.renamed} class:on={i === vi} onclick={() => (vi = i)}>{sv.label || 'Base'}</button>
        {/each}
      </div>
    {/if}

    <div class="stats">
      <div class="stat"><div class="k">Startup</div><div class="v">{sum.startup ?? '—'}</div></div>
      <div class="stat"><div class="k">Active</div><div class="v small-v mono">{sum.active.length ? fmtSpans(sum.active) : '—'}</div></div>
      {#if sum.faf === null && sum.total !== null}
        <div class="stat"><div class="k">Total Frames</div><div class="v">{fmtNum(sum.total)}</div><div class="small faint">no cancel frame</div></div>
      {:else}
        <div class="stat"><div class="k">FAF</div><div class="v">{sum.faf ?? '—'}</div></div>
        <div class="stat"><div class="k">Total</div><div class="v">{sum.total === null ? '—' : fmtNum(sum.total)}</div></div>
      {/if}
      <div class="stat"><div class="k">Damage</div><div class="v small-v mono">{sum.damage.length ? sum.damage.map(fmtNum).join(' / ') : '—'}</div></div>
      {#if sum.shieldStun.length}<div class="stat"><div class="k">Shield stun</div><div class="v small-v mono">{sum.shieldStun.join(' / ')}</div></div>{/if}
      {#if landing}<div class="stat"><div class="k">Landing lag</div><div class="v">{landing.lag}</div>{#if landing.shoot !== null}<div class="small faint">+{landing.shoot} with Bullet Arts</div>{/if}</div>{/if}
      {#if v.autocancel.length}<div class="stat"><div class="k">Autocancel</div><div class="v small-v mono">{fmtSpans(v.autocancel)}</div></div>{/if}
      {#if s.motion && s.motion.xlu_end > 0}<div class="stat"><div class="k">Intangible</div><div class="v small-v mono">{s.motion.xlu_start}–{s.motion.xlu_end}</div></div>{/if}
    </div>

    {#if v.worlds?.length}
      <p class="small muted">Assuming any of: {#each v.worlds as w, j}{j ? '; ' : ''}{#each w as c, i}{i ? ', ' : ''}<code>{c.value ? '' : '!'}{c.text}</code>{/each}{/each}</p>
    {:else if v.conditions.length}
      <p class="small muted">Assuming: {#each v.conditions as c, i}{i ? ', ' : ''}<code>{c.value ? '' : '!'}{c.text}</code>{/each}</p>
    {/if}

    <h2>Frames</h2>
    <FrameBar variant={v} motion={s.motion} {idx} />

    {#if v.windows.length}
      <h2>Hitboxes</h2>
      {#if stun}
        <div class="row small muted calc">
          <span>Hitstun at {HITSTUN_PERCENTS.join(' / ')}% vs</span>
          <select bind:value={targetId}>
            <option value="">weight {DEFAULT_TARGET.weight} (default)</option>
            {#each targets as f}<option value={f.id}>{f.name} ({f.weight})</option>{/each}
          </select>
          <span class="faint">set-knockback hits show one value{stun.one_on_one_damage_mul !== 1 ? ` · 1v1 damage ×${stun.one_on_one_damage_mul}` : ''}</span>
        </div>
      {/if}
      {#each groupWindows(v.windows) as w}
        <h3>Frames {fmtSpan(w)} <span class="muted small">id {windowIds(w, idx.hitbox_fields)}{w.tags.length ? ` · ${w.tags.join(', ')}` : ''}</span></h3>
        <HitboxTable hitboxes={w.boxes} fields={idx.hitbox_fields} {stun} {target} {kindMul} />
      {/each}
    {/if}

    {#if v.grabs.length}
      <h2>Grabboxes</h2>
      {#each groupWindows(v.grabs) as w}
        <h3>Frames {fmtSpan(w)} <span class="muted small">id {windowIds(w, idx.grab_fields)}{w.tags.length ? ` · ${w.tags.join(', ')}` : ''}</span></h3>
        <BoxTable boxes={w.boxes} fields={idx.grab_fields} />
      {/each}
    {/if}

    {#if v.searches.length}
      <h2>Searchboxes</h2>
      {#each groupWindows(v.searches) as w}
        <h3>Frames {fmtSpan(w)} <span class="muted small">id {windowIds(w, idx.search_fields)}{w.tags.length ? ` · ${w.tags.join(', ')}` : ''}</span></h3>
        <BoxTable boxes={w.boxes} fields={idx.search_fields} />
      {/each}
    {/if}

    {#if v.cancels.length}
      <h2>Cancels</h2>
      <div class="table-wrap"><table class="small">
        <thead><tr><th>Kind</th><th>On</th><th>Window</th><th>Flag</th><th>Into</th></tr></thead>
        <tbody>
          {#each v.cancels as c}
            <tr>
              <td>{c.kind.replace('_', ' ')}{c.alt_flag ? ` (alt: ${short(c.alt_flag)})` : ''}</td>
              <td>{c.on.length ? c.on.join(' / ') : 'always'}</td>
              <td class="mono">f{fmtSpan(c.window)}</td>
              <td class="mono muted">{c.flag ? short(c.flag) : '—'}</td>
              <td class="mono muted">{c.into.length ? c.into.map(short).join(', ') : 'any'}</td>
            </tr>
          {/each}
        </tbody>
      </table></div>
    {/if}

    {#if s.notes.length || v.notes.length}
      <h2>Notes</h2>
      {#each [...s.notes, ...v.notes] as n}<div class="note">{n}</div>{/each}
    {/if}

    <h2>Script events</h2>
    <details>
      <summary>{v.events.length} events (game frame · anim frame · command)</summary>
      <div class="table-wrap"><table class="small">
        <thead><tr><th class="num">Frame</th><th class="num">Anim</th><th>Event</th></tr></thead>
        <tbody>
          {#each v.events as e}
            <tr class={e.kind.toLowerCase()}>
              <td class="num mono">{fmtFrame(e.f)}</td>
              <td class="num mono muted">{fmtNum(e.a)}</td>
              <td class="mono">{eventText(e)}{#if e.tags?.length}<span class="badge soft">{e.tags.join(', ')}</span>{/if}</td>
            </tr>
          {/each}
        </tbody>
      </table></div>
    </details>
  {/if}
{:catch e}
  <p class="note warn">Failed to load {id}: {e.message}</p>
{/await}

<style>
  .variants { margin: .5rem 0; }
  .calc { margin: .25rem 0 .5rem; align-items: center; gap: .4rem; flex-wrap: wrap; }
  .small-v { font-size: 1rem; }
  tr.attack td { color: var(--c-active); }
  tr.catch td { color: var(--c-grab); }
  tr.search td { color: var(--c-search); }
  tr.motionrate td { font-style: italic; }
  .badge { margin-left: .4rem; }
</style>
