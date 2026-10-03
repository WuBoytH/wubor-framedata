<script lang="ts">
  import { href } from '../lib/router.svelte'
  import { fighterName } from '../lib/fighters'
  let { fighterId }: { fighterId: string | null } = $props()
</script>

<header>
  <div class="inner">
    <a class="brand" href={href.home}>WuBor Patch <span class="muted">frame data</span></a>
    {#if fighterId}
      <span class="faint">/</span>
      <a href={href.fighter(fighterId)}>{fighterName(fighterId)}</a>
      <a class="small" href={href.cancels(fighterId)}>cancels</a>
    {/if}
    <span class="grow"></span>
    <a class="small" href="https://github.com/WuBoytH/The-WuBor-Patch" target="_blank" rel="noopener">The WuBor Patch ↗</a>
  </div>
</header>

<style>
  header { border-bottom: 1px solid var(--border); background: var(--surface); position: sticky; top: 0; z-index: 10; }
  .inner { max-width: 1200px; margin: 0 auto; padding: .6rem 1.25rem; display: flex; gap: .75rem; align-items: baseline; }
  .brand { font-weight: 700; color: var(--text); }
  .grow { flex: 1; }
</style>
