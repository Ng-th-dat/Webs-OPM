import type { MasteryBranch, MasteryTier } from '@/types/mastery';

function stats(atk: number, def: number, hp: number) {
  return [
    { stat: 'ATK', value: atk, isPercent: false },
    { stat: 'DEF', value: def, isPercent: false },
    { stat: 'HP', value: hp, isPercent: false },
  ];
}

function material(materialId: string, materialName: string, quantity: number) {
  return { materialId, materialName, quantity };
}

const TYPE_TIERS: MasteryTier[] = [
  {
    tier: 1,
    statGain: stats(0, 0, 0),
    materials: [
      material('type-mastery-token', 'Type Mastery Token', 2),
      material('type-element-token', 'Type Element Token', 2),
      material('type-certificate', 'Type Certificate', 1),
      material('gold', 'Gold', 1000),
    ],
    requirements: ['Own limit-break reaches 2★ (gold)', 'Support character: Limit Break 3★'],
  },
  {
    tier: 2,
    statGain: stats(840, 840, 5040),
    materials: [
      material('type-manual', 'Type Manual', 75),
      material('type-mastery-token', 'Type Mastery Token', 8),
      material('type-element-token', 'Type Element Token', 5),
      material('type-certificate', 'Type Certificate', 3),
      material('gold', 'Gold', 7000),
    ],
    requirements: [
      'Own limit-break reaches 3★ (gold)',
      'Exclusive Insignia reaches 2★',
      'Support character: Limit Break 3★',
    ],
  },
  {
    tier: 3,
    statGain: stats(1680, 1680, 10080),
    materials: [
      material('type-manual', 'Type Manual', 231),
      material('type-mastery-token', 'Type Mastery Token', 15),
      material('type-element-token', 'Type Element Token', 9),
      material('type-certificate', 'Type Certificate', 7),
      material('gold', 'Gold', 14000),
    ],
    requirements: [
      'Own limit-break reaches 3★ (gold)',
      'Exclusive Insignia reaches 3★',
      'Support character: Limit Break 4★',
    ],
  },
  {
    tier: 4,
    statGain: stats(3360, 3360, 20160),
    materials: [
      material('type-manual', 'Type Manual', 513),
      material('type-mastery-token', 'Type Mastery Token', 23),
      material('type-element-token', 'Type Element Token', 15),
      material('type-certificate', 'Type Certificate', 13),
      material('gold', 'Gold', 26000),
    ],
    requirements: [
      'Own limit-break reaches 4★ (gold)',
      'Exclusive Insignia reaches 3★',
      'Support character: Awakening 2★',
    ],
  },
  {
    tier: 5,
    statGain: stats(5040, 5040, 30240),
    materials: [
      material('type-manual', 'Type Manual', 951),
      material('type-mastery-token', 'Type Mastery Token', 23),
      material('type-element-token', 'Type Element Token', 18),
      material('type-certificate', 'Type Certificate', 21),
      material('type-element-material', 'Type Element Material', 1),
      material('gold', 'Gold', 39000),
    ],
    requirements: [
      'Own limit-break reaches 4★ (gold)',
      'Exclusive Insignia reaches 4★',
      'Support character: Awakening 2★',
    ],
  },
  {
    tier: 6,
    statGain: stats(6720, 6720, 40320),
    materials: [
      material('type-manual', 'Type Manual', 1614),
      material('type-mastery-token', 'Type Mastery Token', 23),
      material('type-element-token', 'Type Element Token', 21),
      material('type-certificate', 'Type Certificate', 29),
      material('type-element-material', 'Type Element Material', 3),
      material('gold', 'Gold', 57000),
    ],
    requirements: [
      'Own limit-break reaches 5★ (gold)',
      'Exclusive Insignia reaches 4★',
      'Support character: Awakening 3★',
    ],
  },
  {
    tier: 7,
    statGain: stats(9240, 9240, 55440),
    materials: [
      material('type-manual', 'Type Manual', 2500),
      material('type-mastery-token', 'Type Mastery Token', 23),
      material('type-element-token', 'Type Element Token', 26),
      material('type-certificate', 'Type Certificate', 39),
      material('type-element-material', 'Type Element Material', 7),
      material('gold', 'Gold', 76000),
    ],
    requirements: [
      'Own limit-break reaches 5★ (gold)',
      'Exclusive Insignia reaches 5★',
      'Support character: Awakening 3★',
    ],
  },
  {
    tier: 8,
    statGain: stats(11760, 11760, 70560),
    materials: [
      material('type-manual', 'Type Manual', 3596),
      material('type-mastery-token', 'Type Mastery Token', 23),
      material('type-element-token', 'Type Element Token', 29),
      material('type-certificate', 'Type Certificate', 49),
      material('type-element-material', 'Type Element Material', 15),
      material('gold', 'Gold', 100000),
    ],
    requirements: [
      'Own limit-break reaches 6★ (gold)',
      'Exclusive Insignia reaches 5★',
      'Support character: Awakening 4★',
    ],
  },
  {
    tier: 9,
    statGain: stats(14280, 14280, 85680),
    materials: [
      material('type-manual', 'Type Manual', 4058),
      material('type-mastery-token', 'Type Mastery Token', 23),
      material('type-element-token', 'Type Element Token', 47),
      material('type-certificate', 'Type Certificate', 61),
      material('type-element-material', 'Type Element Material', 25),
      material('gold', 'Gold', 125000),
    ],
    requirements: [
      'Own limit-break reaches 6★ (gold)',
      'Exclusive Insignia reaches 6★',
      'Support character: Awakening 4★',
    ],
  },
  {
    tier: 10,
    statGain: stats(17220, 17220, 103320),
    materials: [
      material('type-manual', 'Type Manual', 6281),
      material('type-mastery-token', 'Type Mastery Token', 23),
      material('type-element-token', 'Type Element Token', 63),
      material('type-certificate', 'Type Certificate', 73),
      material('type-element-material', 'Type Element Material', 39),
      material('gold', 'Gold', 155000),
    ],
    requirements: [
      'Own limit-break reaches 7★ (gold)',
      'Exclusive Insignia reaches 6★',
      'Support character: Awakening 5★',
    ],
  },
];

const FACTION_TIERS: MasteryTier[] = [
  {
    tier: 1,
    statGain: stats(0, 0, 0),
    materials: [
      material('faction-mastery-token', 'Faction Mastery Token', 9),
      material('faction-mastery-token-plus', 'Faction Mastery Token+', 2),
      material('faction-certificate', 'Faction Certificate', 1),
      material('gold', 'Gold', 1000),
    ],
    requirements: ['2 {type} characters reach 3★ (gold) limit-break', 'Training Center avg Lv 45'],
  },
  {
    tier: 2,
    statGain: stats(840, 840, 5040),
    materials: [
      material('faction-mastery-material', 'Faction Mastery Material', 240),
      material('faction-mastery-token', 'Faction Mastery Token', 10),
      material('faction-mastery-token-plus', 'Faction Mastery Token+', 7),
      material('faction-certificate', 'Faction Certificate', 3),
      material('gold', 'Gold', 7000),
    ],
    requirements: [
      '3 {type} characters reach 3★ (gold) limit-break',
      'Training Center avg Lv 50',
      '2 {faction} characters reach Faction-Mastery tier 2',
      'Support character 1: Insignia Lv 1',
    ],
  },
  {
    tier: 3,
    statGain: stats(1680, 1680, 10080),
    materials: [
      material('faction-mastery-material', 'Faction Mastery Material', 684),
      material('faction-mastery-token', 'Faction Mastery Token', 16),
      material('faction-mastery-token-plus', 'Faction Mastery Token+', 15),
      material('faction-certificate', 'Faction Certificate', 7),
      material('gold', 'Gold', 14000),
    ],
    requirements: [
      '3 {type} characters reach 4★ (gold) limit-break',
      'Training Center avg Lv 55',
      '3 {faction} characters reach Faction-Mastery tier 2',
      'Support character 1: Insignia Lv 2',
      'Support character 2: Insignia Lv 1',
    ],
  },
  {
    tier: 4,
    statGain: stats(3360, 3360, 20160),
    materials: [
      material('faction-mastery-material', 'Faction Mastery Material', 1249),
      material('faction-mastery-token', 'Faction Mastery Token', 16),
      material('faction-mastery-token-plus', 'Faction Mastery Token+', 20),
      material('faction-mastery-token-plus-plus', 'Faction Mastery Token++', 1),
      material('faction-certificate', 'Faction Certificate', 15),
      material('gold', 'Gold', 26000),
    ],
    requirements: [
      '4 {type} characters reach 4★ (gold) limit-break',
      'Training Center avg Lv 60',
      '3 {faction} characters reach Faction-Mastery tier 3',
      'Support character 1: Insignia Lv 2',
      'Support character 2: Insignia Lv 2',
    ],
  },
  {
    tier: 5,
    statGain: stats(5040, 5040, 30240),
    materials: [
      material('faction-mastery-material', 'Faction Mastery Material', 2120),
      material('faction-mastery-token', 'Faction Mastery Token', 16),
      material('faction-mastery-token-plus', 'Faction Mastery Token+', 27),
      material('faction-mastery-token-plus-plus', 'Faction Mastery Token++', 3),
      material('faction-certificate', 'Faction Certificate', 25),
      material('gold', 'Gold', 39000),
    ],
    requirements: [
      '4 {type} characters reach 5★ (gold) limit-break',
      'Training Center avg Lv 65',
      '4 {faction} characters reach Faction-Mastery tier 3',
      'Support character 1: Insignia Lv 3',
      'Support character 2: Insignia Lv 2',
    ],
  },
  {
    tier: 6,
    statGain: stats(6720, 6720, 40320),
    materials: [
      material('faction-mastery-material', 'Faction Mastery Material', 3355),
      material('faction-mastery-token', 'Faction Mastery Token', 16),
      material('faction-mastery-token-plus', 'Faction Mastery Token+', 36),
      material('faction-mastery-token-plus-plus', 'Faction Mastery Token++', 7),
      material('faction-certificate', 'Faction Certificate', 39),
      material('gold', 'Gold', 57000),
    ],
    requirements: [
      '5 {type} characters reach 5★ (gold) limit-break',
      'Training Center avg Lv 70',
      '4 {faction} characters reach Faction-Mastery tier 4',
      'Support character 1: Insignia Lv 3',
      'Support character 2: Insignia Lv 3',
    ],
  },
  {
    tier: 7,
    statGain: stats(9240, 9240, 55440),
    materials: [
      material('faction-mastery-material', 'Faction Mastery Material', 4960),
      material('faction-mastery-token', 'Faction Mastery Token', 16),
      material('faction-mastery-token-plus', 'Faction Mastery Token+', 39),
      material('faction-mastery-token-plus-plus', 'Faction Mastery Token++', 16),
      material('faction-certificate', 'Faction Certificate', 56),
      material('gold', 'Gold', 76000),
    ],
    requirements: [
      '5 {type} characters reach 6★ (gold) limit-break',
      'Training Center avg Lv 75',
      '5 {faction} characters reach Faction-Mastery tier 4',
      'Support character 1: Insignia Lv 4',
      'Support character 2: Insignia Lv 3',
    ],
  },
  {
    tier: 8,
    statGain: stats(11760, 11760, 70560),
    materials: [
      material('faction-mastery-material', 'Faction Mastery Material', 6940),
      material('faction-mastery-token', 'Faction Mastery Token', 16),
      material('faction-mastery-token-plus', 'Faction Mastery Token+', 52),
      material('faction-mastery-token-plus-plus', 'Faction Mastery Token++', 33),
      material('faction-certificate', 'Faction Certificate', 77),
      material('gold', 'Gold', 100000),
    ],
    requirements: [
      '6 {type} characters reach 6★ (gold) limit-break',
      'Training Center avg Lv 80',
      '5 {faction} characters reach Faction-Mastery tier 5',
      'Support character 1: Insignia Lv 4',
      'Support character 2: Insignia Lv 4',
    ],
  },
  {
    tier: 9,
    statGain: stats(14280, 14280, 85680),
    materials: [
      material('faction-mastery-material', 'Faction Mastery Material', 9194),
      material('faction-mastery-token', 'Faction Mastery Token', 16),
      material('faction-mastery-token-plus', 'Faction Mastery Token+', 63),
      material('faction-mastery-token-plus-plus', 'Faction Mastery Token++', 53),
      material('faction-certificate', 'Faction Certificate', 103),
      material('gold', 'Gold', 125000),
    ],
    requirements: [
      '6 {type} characters reach 7★ (gold) limit-break',
      'Training Center avg Lv 85',
      '5 {faction} characters reach Faction-Mastery tier 6',
      'Support character 1: Insignia Lv 5',
      'Support character 2: Insignia Lv 4',
    ],
  },
  {
    tier: 10,
    statGain: stats(17220, 17220, 103320),
    materials: [
      material('faction-mastery-material', 'Faction Mastery Material', 11666),
      material('faction-mastery-token', 'Faction Mastery Token', 16),
      material('faction-mastery-token-plus', 'Faction Mastery Token+', 92),
      material('faction-mastery-token-plus-plus', 'Faction Mastery Token++', 78),
      material('faction-certificate', 'Faction Certificate', 135),
      material('gold', 'Gold', 155000),
    ],
    requirements: [
      '7 {type} characters reach 7★ (gold) limit-break',
      'Training Center avg Lv 90',
      '5 {faction} characters reach Faction-Mastery tier 7',
      'Support character 1: Insignia Lv 5',
      'Support character 2: Insignia Lv 5',
    ],
  },
];

const LEVEL_TIERS: MasteryTier[] = [
  {
    tier: 1,
    statGain: stats(0, 0, 0),
    materials: [material('level-manual', 'Level Manual', 8), material('hero-omnishard-3', 'Hero Omnishard III', 1), material('gold', 'Gold', 1000)],
    requirements: ['3 {rank} characters reach 1★ (purple) awakening', 'Keepsake reaches 2★'],
  },
  {
    tier: 2,
    statGain: stats(600, 600, 3600),
    materials: [material('level-manual', 'Level Manual', 20), material('hero-omnishard-3', 'Hero Omnishard III', 2), material('gold', 'Gold', 2000)],
    requirements: [
      'Keepsake reaches 2★',
      '2 {type} characters reach Type-Mastery tier 2',
      'Support character 1: Keepsake Lv 1',
    ],
  },
  {
    tier: 3,
    statGain: stats(1200, 1200, 7200),
    materials: [
      material('level-manual', 'Level Manual', 35),
      material('hero-omnishard-3', 'Hero Omnishard III', 4),
      material('level-certificate', 'Level Certificate', 2),
      material('gold', 'Gold', 4000),
    ],
    requirements: [
      '4 {rank} characters reach 2★ (purple) awakening',
      'Keepsake reaches 3★',
      '2 {type} characters reach Type-Mastery tier 3',
      'Support character 1: Keepsake Lv 2',
      'Support character 2: Keepsake Lv 1',
    ],
  },
  {
    tier: 4,
    statGain: stats(2000, 2000, 12000),
    materials: [
      material('level-manual', 'Level Manual', 53),
      material('hero-omnishard-3', 'Hero Omnishard III', 7),
      material('level-certificate', 'Level Certificate', 2),
      material('gold', 'Gold', 6000),
    ],
    requirements: [
      'Keepsake reaches 3★',
      '2 {type} characters reach Type-Mastery tier 3',
      'Support character 1: Keepsake Lv 2',
      'Support character 2: Keepsake Lv 2',
    ],
  },
  {
    tier: 5,
    statGain: stats(2800, 2800, 16800),
    materials: [
      material('level-manual', 'Level Manual', 75),
      material('hero-omnishard-3', 'Hero Omnishard III', 10),
      material('level-certificate', 'Level Certificate', 4),
      material('gold', 'Gold', 9000),
    ],
    requirements: [
      '4 {rank} characters reach 3★ (purple) awakening',
      'Keepsake reaches 4★',
      '2 {type} characters reach Type-Mastery tier 4',
      'Support character 1: Keepsake Lv 3',
      'Support character 2: Keepsake Lv 2',
    ],
  },
  {
    tier: 6,
    statGain: stats(3600, 3600, 21600),
    materials: [
      material('level-manual', 'Level Manual', 100),
      material('hero-omnishard-3', 'Hero Omnishard III', 14),
      material('level-certificate', 'Level Certificate', 4),
      material('gold', 'Gold', 12000),
    ],
    requirements: [
      'Keepsake reaches 4★',
      '3 {type} characters reach Type-Mastery tier 4',
      'Support character 1: Keepsake Lv 3',
      'Support character 2: Keepsake Lv 3',
    ],
  },
  {
    tier: 7,
    statGain: stats(4800, 4800, 28800),
    materials: [
      material('level-manual', 'Level Manual', 129),
      material('hero-omnishard-3', 'Hero Omnishard III', 19),
      material('level-certificate', 'Level Certificate', 4),
      material('gold', 'Gold', 16000),
    ],
    requirements: [
      '5 {rank} characters reach 4★ (purple) awakening',
      'Keepsake reaches 5★',
      '3 {type} characters reach Type-Mastery tier 5',
      'Support character 1: Keepsake Lv 4',
      'Support character 2: Keepsake Lv 3',
    ],
  },
  {
    tier: 8,
    statGain: stats(6000, 6000, 36000),
    materials: [
      material('level-manual', 'Level Manual', 162),
      material('hero-omnishard-3', 'Hero Omnishard III', 25),
      material('level-certificate', 'Level Certificate', 7),
      material('gold', 'Gold', 20000),
    ],
    requirements: [
      'Keepsake reaches 5★',
      '3 {type} characters reach Type-Mastery tier 5',
      'Support character 1: Keepsake Lv 4',
      'Support character 2: Keepsake Lv 4',
    ],
  },
  {
    tier: 9,
    statGain: stats(7200, 7200, 43200),
    materials: [
      material('level-manual', 'Level Manual', 198),
      material('hero-omnishard-3', 'Hero Omnishard III', 32),
      material('level-certificate', 'Level Certificate', 7),
      material('gold', 'Gold', 25000),
    ],
    requirements: [
      '5 {rank} characters reach 5★ (purple) awakening',
      'Keepsake reaches 6★',
      '3 {type} characters reach Type-Mastery tier 6',
      'Support character 1: Keepsake Lv 5',
      'Support character 2: Keepsake Lv 4',
    ],
  },
  {
    tier: 10,
    statGain: stats(8600, 8600, 51600),
    materials: [
      material('level-manual', 'Level Manual', 237),
      material('hero-omnishard-3', 'Hero Omnishard III', 40),
      material('level-certificate', 'Level Certificate', 10),
      material('gold', 'Gold', 30000),
    ],
    requirements: [
      'Keepsake reaches 6★',
      '3 {type} characters reach Type-Mastery tier 6',
      'Support character 1: Keepsake Lv 5',
      'Support character 2: Keepsake Lv 5',
    ],
  },
];

/** Cumulative stat gain + materials per tier (1-10), from "Not started" — Arena-only Specialization system. */
export const MASTERY_TIERS: Record<MasteryBranch, MasteryTier[]> = {
  type: TYPE_TIERS,
  faction: FACTION_TIERS,
  level: LEVEL_TIERS,
};
