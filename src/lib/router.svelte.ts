// Hash router: `#/`, `#/f/mario`, `#/f/mario/cancels`, `#/f/mario/mario/game_attack11`.

export type Route =
  | { page: 'home' }
  | { page: 'fighter'; id: string }
  | { page: 'cancels'; id: string }
  | { page: 'move'; id: string; agent: string; script: string }

function parse(hash: string): Route {
  const p = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  if (p[0] === 'f' && p[1]) {
    if (p.length === 2) return { page: 'fighter', id: p[1] }
    if (p[2] === 'cancels') return { page: 'cancels', id: p[1] }
    if (p.length === 4) return { page: 'move', id: p[1], agent: p[2], script: p[3] }
  }
  return { page: 'home' }
}

export const route = $state({ current: parse(location.hash) })

window.addEventListener('hashchange', () => {
  route.current = parse(location.hash)
  window.scrollTo(0, 0)
})

const enc = encodeURIComponent
export const href = {
  home: '#/',
  fighter: (id: string) => `#/f/${enc(id)}`,
  cancels: (id: string) => `#/f/${enc(id)}/cancels`,
  move: (id: string, agent: string, script: string) => `#/f/${enc(id)}/${enc(agent)}/${enc(script)}`,
}
