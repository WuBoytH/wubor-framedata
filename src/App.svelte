<script lang="ts">
  import { route } from './lib/router.svelte'
  import { loadIndex } from './lib/data'
  import Nav from './components/Nav.svelte'
  import Home from './pages/Home.svelte'
  import Fighter from './pages/Fighter.svelte'
  import Move from './pages/Move.svelte'
  import Cancels from './pages/Cancels.svelte'

  const index = loadIndex()
  const r = $derived(route.current)
</script>

<Nav fighterId={'id' in r ? r.id : null} />
<main class="page">
  {#await index}
    <p class="muted">Loading…</p>
  {:then idx}
    {#if r.page === 'home'}
      <Home {idx} />
    {:else if r.page === 'fighter'}
      <Fighter {idx} id={r.id} />
    {:else if r.page === 'cancels'}
      <Cancels {idx} id={r.id} />
    {:else if r.page === 'move'}
      <Move {idx} id={r.id} agent={r.agent} script={r.script} />
    {/if}
  {:catch e}
    <p class="note warn">Could not load <code>data/index.json</code>: {e.message}. Run <code>wubor-framedata site</code> to generate it.</p>
  {/await}
</main>
