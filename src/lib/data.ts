import type { Fighter, Index, Side } from './types'

const base = `${import.meta.env.BASE_URL}data/`
const cache = new Map<string, Promise<unknown>>()

function get<T>(path: string): Promise<T> {
  let p = cache.get(path)
  if (!p) {
    p = fetch(base + path).then((r) => {
      if (!r.ok) throw new Error(`${r.status} ${r.statusText} loading ${path}`)
      return r.json()
    })
    p.catch(() => cache.delete(path))
    cache.set(path, p)
  }
  return p as Promise<T>
}

export const loadIndex = () => get<Index>('index.json')
export const loadFighter = (side: Side, id: string) => get<Fighter>(`${side}/${id}.json`)
