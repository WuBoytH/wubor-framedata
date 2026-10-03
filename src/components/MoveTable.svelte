<script lang="ts">
  import type { Summary } from '../lib/format'
  import { fmtSpans, fmtNum } from '../lib/format'

  export interface Row {
    href: string
    name: string
    script: string
    variant: string
    modded: boolean
    summary: Summary
    landing: number | null
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
            <td class="num">{r.landing ?? '—'}</td>
            <td class="mono">{s.autocancel.length ? fmtSpans(s.autocancel) : '—'}</td>
          {/if}
          <td class="small muted">
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
</style>
