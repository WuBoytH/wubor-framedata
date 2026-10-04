// Applies the simple "listed first, then automatic" tables in src/data/order.ts.
// (MOVE_ORDER and VARIANT_ORDER are folded into their own sort keys in
// src/lib/moves.ts and src/lib/variants.ts.)

/** Position in the fighter's list, then the '*' list; unlisted → after everything listed. */
function manualPos(table: Record<string, string[]>, fighter: string, key: string): number {
  const list = [...(table[fighter] ?? []), ...(table['*'] ?? [])]
  const i = list.indexOf(key)
  return i < 0 ? list.length : i
}

/**
 * Stable sort: items named in `table` first, in that order; the rest keep
 * their incoming order (so sort them automatically before calling this).
 */
export function pinOrder<T>(items: T[], table: Record<string, string[]>, fighter: string, key: (item: T) => string): T[] {
  return items
    .map((item, i) => ({ item, i, pos: manualPos(table, fighter, key(item)) }))
    .sort((a, b) => a.pos - b.pos || a.i - b.i)
    .map((x) => x.item)
}
