export interface BunnySkin {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  colors: {
    body: number;
    earInner: number;
    nose: number;
    eyes: number;
    feet: number;
    tail: number;
  };
  auraColor?: number;
  tag?: string;
}

export const BUNNY_SKINS: Record<string, BunnySkin> = {
  classic: {
    id: 'classic',
    name: 'Snow Bunny',
    description: 'The cheerful classic fluffy hopper.',
    cost: 0,
    unlocked: true,
    colors: {
      body: 0xffffff,
      earInner: 0xff9fb3,
      nose: 0xff6f91,
      eyes: 0x2a2a2a,
      feet: 0xffffff,
      tail: 0xffffff,
    },
    tag: 'Classic',
  },
  golden: {
    id: 'golden',
    name: 'Golden Hare',
    description: 'Forged in carrots of pure legend. Shines brightly!',
    cost: 20,
    unlocked: false,
    colors: {
      body: 0xffc83b,
      earInner: 0xffe279,
      nose: 0xff922b,
      eyes: 0x472e00,
      feet: 0xe6a817,
      tail: 0xfff3b0,
    },
    auraColor: 0xffd700,
    tag: 'Rare',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Lop',
    description: 'High-tech neon hopper from Neo-Tokyo.',
    cost: 45,
    unlocked: false,
    colors: {
      body: 0x00e5ff,
      earInner: 0xff007f,
      nose: 0x00ffcc,
      eyes: 0xff00ff,
      feet: 0x00b4d8,
      tail: 0xff007f,
    },
    auraColor: 0x00f5d4,
    tag: 'Epic',
  },
  midnight: {
    id: 'midnight',
    name: 'Shadow Ninja',
    description: 'Silent and stealthy through the darkest streets.',
    cost: 75,
    unlocked: false,
    colors: {
      body: 0x22222e,
      earInner: 0x8a2be2,
      nose: 0xff3366,
      eyes: 0x00f0ff,
      feet: 0x181824,
      tail: 0x3d3d52,
    },
    auraColor: 0x7b2cbf,
    tag: 'Epic',
  },
  berry: {
    id: 'berry',
    name: 'Berry Sherbet',
    description: 'Sweet strawberry fluff with minty ears!',
    cost: 100,
    unlocked: false,
    colors: {
      body: 0xff9ebb,
      earInner: 0xa8f0c6,
      nose: 0xff4d88,
      eyes: 0x4a2040,
      feet: 0xff85aa,
      tail: 0xffd1dc,
    },
    auraColor: 0xff85a1,
    tag: 'Legendary',
  },
  matcha: {
    id: 'matcha',
    name: 'Matcha Boba',
    description: 'Earthy green tea champion of the riverbanks.',
    cost: 150,
    unlocked: false,
    colors: {
      body: 0x8cb369,
      earInner: 0xd4e09b,
      nose: 0x436436,
      eyes: 0x1f2421,
      feet: 0x6e904b,
      tail: 0xf4f1de,
    },
    auraColor: 0xa7c957,
    tag: 'Mythic',
  },
};

export interface GameStats {
  score: number;             // Distance score (furthest row)
  carrotsSession: number;    // Carrots collected in current run
  goldenCarrotsSession: number;
  totalCarrots: number;      // Lifetime carrot bank for unlocks
  highScore: number;         // Best distance score
  gamesPlayed: number;
  unlockedSkins: string[];
  selectedSkin: string;
  soundEnabled: boolean;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export interface CarrotFloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  isGolden: boolean;
}
