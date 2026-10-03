/** Article heading overrides: fighter id → agent name → display name. */
export const ARTICLE_NAMES: Record<string, Record<string, string>> = {
  mario: {
    mario_fireball: 'Fireball',
    mario_pumpwater: 'F.L.U.D.D.',
  },
  ryu: {
    ryu_hadoken: 'Hadoken',
    ryu_shinkuhadoken: 'Shinku Hadoken',
  },
  samus: {
    samus_cshot: 'Charge Shot',
    samus_missile: 'Missile',
    samus_supermissile: 'Super Missile',
    samus_bomb: 'Bomb',
  },
}
