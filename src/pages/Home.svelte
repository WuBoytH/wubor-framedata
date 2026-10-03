<script lang="ts">
  import type { Index } from '../lib/types'
  import { fighterName } from '../lib/fighters'
  import { href } from '../lib/router.svelte'

  let { idx }: { idx: Index } = $props()
  let q = $state('')

  const fighters = $derived(
    idx.wubor
      .map((e) => ({ ...e, name: fighterName(e.id) }))
      .filter((e) => !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.id.includes(q.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name)),
  )
  const totals = $derived({
    scripts: idx.wubor.reduce((n, e) => n + e.scripts, 0),
    modded: idx.wubor.reduce((n, e) => n + e.modded, 0),
  })
</script>

<h1>The WuBor Patch — frame data</h1>
<p class="muted">
  {idx.wubor.length} fighters · {totals.scripts.toLocaleString()} scripts, {totals.modded.toLocaleString()} changed by the mod ·
  data generated {idx.generated}. Compiled statically from the mod's source and game files; see
  <a href="https://github.com/WuBoytH/wubor-framedata" target="_blank" rel="noopener">wubor-framedata</a> for how.
</p>

<input type="search" placeholder="Search fighters…" bind:value={q} aria-label="Search fighters" />

<div class="grid">
  {#each fighters as f (f.id)}
    <a class="card fighter" href={href.fighter(f.id)}>
      <div class="name">{f.name}</div>
      <div class="small muted mono">{f.id}</div>
      <div class="small muted meta">
        <span title="scripts changed by the mod"><b>{f.modded}</b>/{f.scripts} modded</span>
        {#if f.params_changed}<span>· {f.params_changed} params</span>{/if}
        {#if f.cancel_rules}<span>· {f.cancel_rules} cancel rules</span>{/if}
      </div>
    </a>
  {/each}
</div>

<style>
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: .6rem; margin-top: 1rem; }
  .fighter { color: var(--text); display: block; }
  .fighter:hover { border-color: var(--accent); text-decoration: none; }
  .name { font-weight: 600; }
  .meta { margin-top: .3rem; }
</style>
