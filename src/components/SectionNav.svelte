<script lang="ts">
  // "On this page" links for the fighter page. Plain `#id` anchors would be
  // taken as routes by the hash router, so these scroll by script instead.
  import { onMount } from 'svelte'

  export interface Section {
    id: string
    label: string
    sub?: { id: string; label: string }[]
  }
  let { sections, onhide }: { sections: Section[]; onhide?: () => void } = $props()
  let active = $state<string | null>(null)

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Highlight the section nearest the top of the viewport.
  onMount(() => {
    const ids = () => sections.flatMap((s) => [s.id, ...(s.sub ?? []).map((x) => x.id)])
    const onScroll = () => {
      const top = 70
      let best: string | null = null
      for (const id of ids()) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= top) best = id
      }
      active = best ?? ids()[0] ?? null
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  })
</script>

<nav class="toc card" aria-label="On this page">
  <div class="k">
    <span>On this page</span>
    {#if onhide}<button type="button" class="hide" onclick={onhide} title="Hide the section list">hide</button>{/if}
  </div>
  <ul>
    {#each sections as s (s.id)}
      <li>
        <button type="button" class:on={active === s.id} onclick={() => go(s.id)}>{s.label}</button>
        {#if s.sub?.length}
          <ul>
            {#each s.sub as x (x.id)}
              <li><button type="button" class="sub" class:on={active === x.id} onclick={() => go(x.id)}>{x.label}</button></li>
            {/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ul>
</nav>

<style>
  .toc { padding: .6rem .9rem; flex-shrink: 0; }
  .k { display: flex; justify-content: space-between; align-items: baseline; font-size: .75rem; text-transform: uppercase; letter-spacing: .04em; color: var(--text-2); margin-bottom: .3rem; }
  .hide { width: auto; padding: 0 .2rem; font-size: .7rem; letter-spacing: .04em; text-transform: uppercase; color: var(--text-3); border: 0; }
  .hide:hover { color: var(--accent); background: none; }
  ul { list-style: none; margin: 0; padding: 0; }
  ul ul { margin-left: .75rem; }
  button { display: block; width: 100%; text-align: left; background: none; border: 0; border-left: 2px solid transparent; border-radius: 0; padding: .15rem .5rem; color: var(--text-2); font-size: .85rem; line-height: 1.3; }
  button:hover { color: var(--text); background: var(--surface-2); }
  button.on { color: var(--accent); border-left-color: var(--accent); font-weight: 600; }
  button.sub { font-size: .8rem; }
</style>
