import { ARTICLE_NAMES } from '../data/rename'

/** Internal fighter directory name → display name. */
const NAMES: Record<string, string> = {
  bayonetta: 'Bayonetta', brave: 'Hero', buddy: 'Banjo & Kazooie', captain: 'Captain Falcon',
  chrom: 'Chrom', cloud: 'Cloud', daisy: 'Daisy', dedede: 'King Dedede', demon: 'Kazuya',
  diddy: 'Diddy Kong', dolly: 'Terry', donkey: 'Donkey Kong', duckhunt: 'Duck Hunt',
  edge: 'Sephiroth', eflame: 'Pyra', elight: 'Mythra', element: 'Pyra / Mythra', falco: 'Falco',
  fox: 'Fox', gamewatch: 'Mr. Game & Watch', ganon: 'Ganondorf', gaogaen: 'Incineroar',
  gekkouga: 'Greninja', iceclimber: 'Ice Climbers', ike: 'Ike', inkling: 'Inkling', jack: 'Joker',
  kamui: 'Corrin', ken: 'Ken', kirby: 'Kirby', koopa: 'Bowser', koopag: 'Giga Bowser',
  koopajr: 'Bowser Jr.', krool: 'King K. Rool', link: 'Link', littlemac: 'Little Mac',
  lucario: 'Lucario', lucas: 'Lucas', lucina: 'Lucina', luigi: 'Luigi', mario: 'Mario',
  mariod: 'Dr. Mario', marth: 'Marth', master: 'Byleth', metaknight: 'Meta Knight',
  mewtwo: 'Mewtwo', miienemyf: 'Mii Brawler (enemy)', miienemyg: 'Mii Gunner (enemy)',
  miienemys: 'Mii Swordfighter (enemy)', miifighter: 'Mii Brawler', miigunner: 'Mii Gunner',
  miiswordsman: 'Mii Swordfighter', murabito: 'Villager', nana: 'Nana', ness: 'Ness',
  packun: 'Piranha Plant', pacman: 'Pac-Man', palutena: 'Palutena', peach: 'Peach',
  pfushigisou: 'Ivysaur', pichu: 'Pichu', pickel: 'Steve', pikachu: 'Pikachu', pikmin: 'Olimar',
  pit: 'Pit', pitb: 'Dark Pit', plizardon: 'Charizard', popo: 'Popo', ptrainer: 'Pokémon Trainer',
  purin: 'Jigglypuff', pzenigame: 'Squirtle', reflet: 'Robin', richter: 'Richter', ridley: 'Ridley',
  robot: 'R.O.B.', rockman: 'Mega Man', rosetta: 'Rosalina & Luma', roy: 'Roy', ryu: 'Ryu',
  samus: 'Samus', samusd: 'Dark Samus', sheik: 'Sheik', shizue: 'Isabelle', shulk: 'Shulk',
  simon: 'Simon', snake: 'Snake', sonic: 'Sonic', szerosuit: 'Zero Suit Samus', tantan: 'Min Min',
  toonlink: 'Toon Link', trail: 'Sora', wario: 'Wario', wiifit: 'Wii Fit Trainer', wolf: 'Wolf',
  yoshi: 'Yoshi', younglink: 'Young Link', zelda: 'Zelda',
}

export const fighterName = (id: string) => NAMES[id] ?? id

/**
 * Fighters whose data lives on an agent with a different name. That agent's
 * scripts are shown as the fighter's own moves (not as an article) and its
 * name is the prefix stripped from article names; override tables key its
 * scripts plainly (`game_specialn`, not `popo/game_specialn`).
 */
const MAIN_AGENT: Record<string, string> = {
  iceclimber: 'popo',
}

/** The agent holding a fighter's own moves — usually the fighter id itself. */
export const mainAgent = (id: string) => MAIN_AGENT[id] ?? id

/**
 * Article agent → display name: `ARTICLE_NAMES` if set, else the agent name
 * with the fighter prefix stripped (`mario_fireball` → `fireball`). The
 * fighter's own agent → ''.
 */
export function agentLabel(agent: string, fighter: string) {
  const main = mainAgent(fighter)
  if (agent === fighter || agent === main) return ''
  const named = ARTICLE_NAMES[fighter]?.[agent]
  if (named) return named
  for (const prefix of [fighter + '_', main + '_']) if (agent.startsWith(prefix)) return agent.slice(prefix.length)
  return agent
}
