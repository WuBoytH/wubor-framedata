<script lang="ts">
  import type { Val, StunParams } from '../lib/types'
  import { fmtVal, fmtNum, hitboxField, shieldStun, knockback, hitstun, isFixedKnockback, DEFAULT_TARGET, HITSTUN_PERCENTS, type Target } from '../lib/format'

  let {
    hitboxes,
    fields,
    stun = null,
    target = DEFAULT_TARGET,
    kindMul = 1,
  }: { hitboxes: Val[][]; fields: string[]; stun?: StunParams | null; target?: Target; kindMul?: number } = $props()
  let all = $state(false)

  const get = $derived(hitboxField(fields))
  const fmtStun = (n: number | null) => (n === null ? '—' : `${n}`)
  /** Hitstun at each of `HITSTUN_PERCENTS` (one value for set knockback), knockback in the title. */
  function hitstunCell(h: Val[]): { text: string; title: string } {
    if (!stun) return { text: '—', title: '' }
    const percents = isFixedKnockback(h, get) ? [0] : HITSTUN_PERCENTS
    const kbs = percents.map((percent) => knockback(h, get, stun, { ...target, percent }))
    if (kbs.some((kb) => kb === null)) return { text: '—', title: '' }
    const fixed = percents.length === 1
    return {
      text: (kbs as number[]).map((kb) => hitstun(kb, stun)).join(' / '),
      title: (fixed ? 'set knockback ' : '') + percents.map((p, i) => `${fixed ? '' : `${p}%: `}KB ${fmtNum(kbs[i] as number)}`).join(', '),
    }
  }
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
          {#if stun}<th class="num" title="shield stun frames">Shield stun</th><th class="num" title="hitstun frames at {HITSTUN_PERCENTS.join(' / ')}% vs the weight above; one value = set knockback">Hitstun {HITSTUN_PERCENTS.join('/')}%</th>{/if}
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
            {#if stun}
              {@const hs = hitstunCell(h)}
              <td class="num">{fmtStun(shieldStun(h, get, stun, kindMul))}</td>
              <td class="num mono" title={hs.title}>{hs.text}</td>
            {/if}
            <td class="mono">{pos(h)}</td>
            {#if hasOffset2}<td class="mono">{pos(h, '2')}</td>{/if}
            <td class="muted">{flags(h)}</td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
<button class="small" onclick={() => (all = !all)}>{all ? 'Show summary columns' : `Show all ${fields.length} fields`}</button>

<style>
  button { margin-top: .4rem; }
</style>
