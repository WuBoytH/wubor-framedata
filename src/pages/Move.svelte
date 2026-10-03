<script lang="ts">
  import type { Index, Event } from '../lib/types'
  import { loadFighter } from '../lib/data'
  import { fighterName, agentLabel } from '../lib/fighters'
  import { href } from '../lib/router.svelte'
  import { moveInfo } from '../lib/moves'
  import { summarize, fmtSpan, fmtSpans, fmtFrame, fmtNum, fmtVal, short, windowIds, groupWindows, landingLag } from '../lib/format'
  import FrameBar from '../components/FrameBar.svelte'
  import HitboxTable from '../components/HitboxTable.svelte'
  import { orderVariants } from '../lib/variants'

  let { idx, id, agent, script }: { idx: Index; id: string; agent: string; script: string } = $props()
  const data = $derived(loadFighter('wubor', id))
  const info = $derived(moveInfo(script, id, agent))
  let vi = $state(0)
  // reset the variant tab when navigating between moves
  $effect(() => { script; agent; vi = 0 })

  function eventText(e: Event): string {
    const args = (e.args ?? []).map((a) => fmtVal(a, false)).join(', ')
    switch (e.kind) {
      case 'Attack': return `ATTACK id ${fmtVal(e.id ?? null)}`
      case 'Call': return `${e.name}(${args})`
      case 'ClearAll': return 'clear all hitboxes'
      case 'Clear': return `clear hitbox id ${fmtVal(e.id ?? null)}`
      case 'HitboxModify': return `${e.command} id ${fmtVal(e.id ?? null)} (${args})`
      case 'MotionRate': return `motion rate → ${e.rate}`
      case 'Flag': return `flag ${short(e.name ?? '')}`
      case 'Unsupported': return `unsupported: ${e.text}`
    }
  }
</script>

<div class="crumbs">
  <a href={href.home}>Fighters</a><a href={href.fighter(id)}>{fighterName(id)}</a>
  {#if agent !== id}<span class="mono">{agentLabel(agent, id)}</span>{/if}
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
    {@const views = orderVariants(s.variants)}
    {@const v = views[Math.min(vi, views.length - 1)].variant}
    {@const sum = summarize(v, idx.hitbox_fields)}
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
          <button class="small" class:mono={!!sv.label} class:on={i === vi} onclick={() => (vi = i)}>{sv.label || 'Unmodified'}</button>
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
      {#if landing}<div class="stat"><div class="k">Landing lag</div><div class="v">{landing.lag}</div>{#if landing.shoot !== null}<div class="small faint">+{landing.shoot} with Bullet Arts</div>{/if}</div>{/if}
      {#if v.autocancel.length}<div class="stat"><div class="k">Autocancel</div><div class="v small-v mono">{fmtSpans(v.autocancel)}</div></div>{/if}
      {#if s.motion && s.motion.xlu_end > 0}<div class="stat"><div class="k">Intangible</div><div class="v small-v mono">{s.motion.xlu_start}–{s.motion.xlu_end}</div></div>{/if}
    </div>

    {#if v.conditions.length}
      <p class="small muted">Assuming: {#each v.conditions as c, i}{i ? ', ' : ''}<code>{c.value ? '' : '!'}{c.text}</code>{/each}</p>
    {/if}

    <h2>Frames</h2>
    <FrameBar variant={v} motion={s.motion} fields={idx.hitbox_fields} />

    {#if v.windows.length}
      <h2>Hitboxes</h2>
      {#each groupWindows(v.windows) as w}
        <h3>Frames {fmtSpan(w)} <span class="muted small">id {windowIds(w, idx.hitbox_fields)}{w.tags.length ? ` · ${w.tags.join(', ')}` : ''}</span></h3>
        <HitboxTable hitboxes={w.hitboxes} fields={idx.hitbox_fields} />
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
  .small-v { font-size: 1rem; }
  tr.attack td { color: var(--c-active); }
  tr.motionrate td { font-style: italic; }
  .badge { margin-left: .4rem; }
</style>
