<script lang="ts">
  // Grab / search boxes: few enough fields to show them all. Offsets are
  // folded into one column like HitboxTable does.
  import type { Val } from '../lib/types'
  import { fmtVal, hitboxField } from '../lib/format'

  let { boxes, fields }: { boxes: Val[][]; fields: string[] } = $props()

  const get = $derived(hitboxField(fields))
  const hasOffset2 = $derived(boxes.some((b) => get(b, 'x2') !== null || get(b, 'y2') !== null || get(b, 'z2') !== null))
  const POS = ['x', 'y', 'z', 'x2', 'y2', 'z2']
  const cols = $derived(fields.filter((f) => !POS.includes(f)))
  const num = (b: Val[], f: string) => typeof get(b, f) === 'number'
  const pos = (b: Val[], s = '') => ['x', 'y', 'z'].map((c) => fmtVal(get(b, c + s))).join(', ')
</script>

<div class="table-wrap">
  <table class="small">
    <thead>
      <tr>
        {#each cols as f}<th class:num={boxes.every((b) => num(b, f))}>{f}</th>{/each}
        <th>Offset</th>
        {#if hasOffset2}<th>Offset 2</th>{/if}
      </tr>
    </thead>
    <tbody>
      {#each boxes as b}
        <tr>
          {#each cols as f}<td class:num={num(b, f)} class:mono={!num(b, f)}>{fmtVal(get(b, f))}</td>{/each}
          <td class="mono">{pos(b)}</td>
          {#if hasOffset2}<td class="mono">{pos(b, '2')}</td>{/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
