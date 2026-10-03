<script lang="ts">
  import type { Summary, LandingLag } from '../lib/format'
  import { fmtSpans, fmtNum } from '../lib/format'

  export interface Row {
    href: string
    name: string
    script: string
    /** label of the variant whose numbers are shown ('' = unmodified) */
    variant: string
    /** all variant labels, display order */
    variants: string[]
    /** some other variant has different frame data from the one shown */
    variantsDiffer: boolean
    modded: boolean
    summary: Summary
    landing: LandingLag | null
    cancels: number
    intangible: string | null
  }
  let { rows, showLanding = false }: { rows: Row[]; showLanding?: boolean } = $props()
</script>

<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th>Move</th>
        <th class="num">Startup</th>
        <th>Active</th>
        <th class="num">FAF</th>
        <th class="num">Total</th>
        <th>Damage</th>
        {#if showLanding}<th class="num">Landing lag</th><th>Autocancel</th>{/if}
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as r (r.href + r.variant)}
        {@const s = r.summary}
        <tr>
          <td>
            <a href={r.href}>{r.name}</a>
            {#if r.modded}<span class="badge mod" title="Script changed by the mod">mod</span>{/if}
            {#if r.variant}<div class="small mono muted">{r.variant}</div>{/if}
            <div class="small mono faint">{r.script}</div>
          </td>
          <td class="num">{s.startup ?? '—'}</td>
          <td class="mono">{s.active.length ? fmtSpans(s.active) : '—'}</td>
          <td class="num">{s.faf ?? '—'}</td>
          <td class="num">{s.total === null ? '—' : fmtNum(s.total)}</td>
          <td class="mono">{s.damage.length ? s.damage.map(fmtNum).join('/') : '—'}</td>
          {#if showLanding}
            <td class="num">
              {#if r.landing}
                {r.landing.lag}
                {#if r.landing.shoot !== null}<span class="small muted shoot" title="Bullet Arts: added to the base landing lag when shooting during the aerial">+{r.landing.shoot}</span>{/if}
              {:else}—{/if}
            </td>
            <td class="mono">{s.autocancel.length ? fmtSpans(s.autocancel) : '—'}</td>
          {/if}
          <td class="small muted">
            {#if r.variants.length > 1}
              <span class="chip" title={r.variants.join(' · ')}>{r.variants.length} variants{r.variantsDiffer ? ', data differs' : ''}</span>
            {/if}
            {#if r.intangible}<span class="chip">intangible {r.intangible}</span>{/if}
            {#if r.cancels}<span class="chip">{r.cancels} cancel{r.cancels === 1 ? '' : 's'}</span>{/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .chip { margin-right: .3rem; }
  td:first-child { max-width: 320px; }
  td:first-child .mono { overflow-wrap: anywhere; }
  .shoot { white-space: nowrap; }
</style>
