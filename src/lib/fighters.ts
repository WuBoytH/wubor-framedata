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

/** Article agent (`mario_fireball`) → `fireball`; the fighter's own agent → ''. */
export function agentLabel(agent: string, fighter: string) {
  if (agent === fighter) return ''
  return agent.startsWith(fighter + '_') ? agent.slice(fighter.length + 1) : agent
}
