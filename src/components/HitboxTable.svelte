<script lang="ts">
  import type { Val } from '../lib/types'
  import { fmtVal, hitboxField } from '../lib/format'

  let { hitboxes, fields }: { hitboxes: Val[][]; fields: string[] } = $props()
  let all = $state(false)

  const get = $derived(hitboxField(fields))
  const hasOffset2 = $derived(hitboxes.some((h) => get(h, 'x2') !== null || get(h, 'y2') !== null || get(h, 'z2') !== null))

  const MAIN: [string, string, boolean][] = [
    ['id', 'ID', true], ['part', 'Part', true], ['bone', 'Bone', false], ['damage', 'Dmg', true], ['angle', 'Angle', true],
    ['kbg', 'KBG', true], ['fkb', 'FKB', true], ['bkb', 'BKB', true], ['size', 'Size', true],
    ['hitlag', 'Hitlag', true], ['sdi', 'SDI', true], ['shield_damage', 'Shield dmg', true], ['trip', 'Trip', true],
    ['rehit', 'Rehit', true], ['ground_air', 'Hits', false], ['effect', 'Effect', false], ['attack_type', 'Type', false],
  ]
  const FLAGS = ['set_weight', 'reflectable', 'absorbable', 'flinchless', 'disable_hitlag', 'friendly_fire']

  function flags(h: Val[]): string {
    const out = FLAGS.filter((f) => get(h, f) === true)
    if (get(h, 'direct') === false) out.push('indirect')
    return out.join(', ')
  }
  const pos = (h: Val[], s = '') => ['x', 'y', 'z'].map((c) => fmtVal(get(h, c + s))).join(', ')
</script>

<div class="table-wrap">
  <table class="small">
    <thead>
      <tr>
        {#if all}
          {#each fields as f}<th>{f}</th>{/each}
        {:else}
          {#each MAIN as [, label, num]}<th class:num>{label}</th>{/each}
          <th>Offset</th>
          {#if hasOffset2}<th>Offset 2</th>{/if}
          <th>Flags</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each hitboxes as h}
        <tr>
          {#if all}
            {#each fields as f}<td class="mono">{fmtVal(get(h, f), false)}</td>{/each}
          {:else}
            {#each MAIN as [f, , num]}<td class:num class:mono={!num}>{fmtVal(get(h, f))}</td>{/each}
            <td class="mono">{pos(h)}</td>
            {#if hasOffset2}<td class="mono">{pos(h, '2')}</td>{/if}
            <td class="muted">{flags(h)}</td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
<button class="small" onclick={() => (all = !all)}>{all ? 'Show summary columns' : 'Show all 36 fields'}</button>

<style>
  button { margin-top: .4rem; }
</style>
