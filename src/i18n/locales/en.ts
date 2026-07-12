export const en = {
  common: {
    home: 'Home',
    characters: 'Characters',
    updates: 'Updates',
    mastery: 'Mastery',
    coreLab: 'Core Lab',
    calculators: 'Calculators',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    viewDetails: 'View Details',
    viewCharacter: 'View Character',
    back: 'Back',
    backToHome: 'Back to home',
    backToCharacters: 'Back to Characters',
    backToUpdates: 'Back to Updates',
    explore: 'Explore',
    comingSoon: 'Coming soon',
    resetFilters: 'Reset filters',
    clearSearch: 'Clear search',
    language: 'Language',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    mainNavigation: 'Main navigation',
    backToTop: 'Top',
    loading: 'Loading…',
    errorTitle: 'Something went wrong',
    errorDescription: "We couldn't load this data. Please refresh the page.",
  },
  home: {
    hero: {
      eyebrow: 'Character Wiki & Tools',
      headline: 'Master One Punch Man, one calculation at a time.',
      exploreCharacters: 'Explore Characters',
      viewUpdates: 'View Updates',
      upcomingLabel: 'Upcoming on CN & SEA',
      stats: {
        characters: 'Characters',
        upcoming: 'Upcoming Releases',
        rarityTiers: 'Rarity Tiers',
      },
    },
    tagline:
      'Character data, release schedules, and calculators for One Punch Man players — fast to browse, easy to compare.',
    features: {
      specCalculator: {
        title: 'Spec ATK/DEF Calculator',
        description:
          'Enter your current stats and upgrade parameters to see exactly what your Spec ATK and DEF will become.',
      },
      coreLabCalculator: {
        title: 'Core-Lab Calculator',
        description:
          'Set your current and target level to get a full resource breakdown for your next Core-Lab push.',
      },
    },
  },
  characters: {
    title: 'Character Database',
    description: 'Browse, search, and filter every character in the roster to plan your next team.',
    searchPlaceholder: 'Search characters…',
    filters: {
      tier: 'Tier',
      type: 'Type',
      faction: 'Faction',
      role: 'Role',
      rank: 'Rank',
    },
    resultCount: '{count} of {total} characters',
    emptyTitle: 'No characters found',
    emptyDescription: 'Try a different search term or clear your filters to see more characters.',
    faction: {
      hero: 'Hero',
      monster: 'Monster',
      thirdParty: 'Third-party',
    },
    rank: {
      s1: 'S-Rank 1',
      s2: 'S-Rank 2',
      a: 'A-Rank',
      demon: 'Demon-level',
      dragon: 'Dragon-level',
    },
  },
  characterDetail: {
    power: 'Power Tier',
    skills: 'Skills',
    passive: 'Passive',
    awakening: 'Awakening',
    awakeningTier: 'Awakening {tier}',
    core: 'Core',
    coreTier: 'Core {tier}',
    tierBase: 'Base',
    tierUltimateUpgrade: '3★ Upgrade',
    tierPassiveGold: '5★ Gold',
    tierPassivePurple: '5★ Purple',
    cost: 'Cost: {value}',
    skillType: {
      attack: 'Attack',
      ultimate: 'Ultimate',
      passive: 'Passive',
      awakenPassive: 'Awaken Passive',
      core: 'Core',
    },
    glossary: 'Effect Glossary',
    strengths: 'Strengths',
    weaknesses: 'Weaknesses',
    requirement: 'Requirement: {value}',
    gallery: 'Gallery',
    previousImage: 'Previous image',
    nextImage: 'Next image',
  },
  releaseSchedule: {
    chinaServer: 'China Server',
    seaServer: 'SEA Server',
    globalServer: 'Global Server',
    releaseType: {
      debut: 'Debut',
      comeback: 'Comeback',
      limited: 'Limited',
      core: 'Core',
      event: 'Event',
    },
    timing: {
      startOfMonth: 'Start of Month',
      midMonth: 'Mid Month',
      endOfMonth: 'End of Month',
    },
    status: {
      released: 'Released',
      upcoming: 'Upcoming',
      tbd: 'TBD',
    },
    months: {
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December',
    },
  },
  updates: {
    title: 'Game Updates',
    description: 'The latest patch notes, events, and CN-server news — all in one feed.',
    showMore: 'Show more',
    eventSchedule: 'Event Schedule',
    emptyTitle: 'No updates yet',
    emptyDescription: 'Check back soon for patch notes, events, and server news.',
    category: {
      update: 'Update',
      event: 'Event',
      cnNews: 'CN News',
      maintenance: 'Maintenance',
    },
  },
  mastery: {
    eyebrow: 'Guide & Calculator',
    title: 'Mastery',
    description:
      "A full breakdown of Mastery stat growth, paired with the Spec ATK/DEF calculator, is in development. Here's what's coming.",
    formulaGuide: 'Formula Guide',
    sections: {
      statGrowth: {
        title: 'Stat Growth',
        description: 'How each Mastery level adds to Spec ATK and DEF.',
      },
      upgradeMaterials: {
        title: 'Upgrade Materials',
        description: 'What each level costs and where to farm it.',
      },
      optimizationTips: {
        title: 'Optimization Tips',
        description: 'The most efficient order to invest Mastery points.',
      },
    },
    calculatorTitle: 'Calculator',
    calculatorPreview:
      'The Spec ATK/DEF calculator will be embedded here. In the meantime, try the standalone tool.',
    calculatorLink: 'Go to Spec ATK/DEF Calculator →',
  },
  coreLab: {
    eyebrow: 'Guide & Dashboard',
    title: 'Core-Lab',
    description:
      "Core selection, level effects, and the resource calculator are in development. Here's what's coming.",
    guideTitle: 'Core-Lab Guide',
    sections: {
      coreSelection: {
        title: 'Core Selection',
        description: 'Which cores are worth investing in and why.',
      },
      unlockedBuffs: {
        title: 'Unlocked Buffs',
        description: 'What each Core-Lab level unlocks as you upgrade.',
      },
      resourcePlanning: {
        title: 'Resource Planning',
        description: 'How to budget materials across multiple cores.',
      },
    },
    calculatorTitle: 'Level Calculator',
    calculatorPreview:
      'The Core-Lab resource calculator will be embedded here. In the meantime, try the standalone tool.',
    calculatorLink: 'Go to Core-Lab Calculator →',
  },
  calculators: {
    eyebrow: 'Tools',
    title: 'Calculators',
    description: 'Run the numbers before you commit resources — pick a calculator below.',
  },
  comingSoonPages: {
    specCalculator: {
      title: 'Spec ATK/DEF Calculator',
      description:
        'Plug in your current stats and upgrade parameters to see your resulting Spec ATK/DEF. This calculator is next up on the roadmap.',
    },
    coreLabCalculator: {
      title: 'Core-Lab Resource Calculator',
      description:
        'Enter a current and target level to get the full resource total, broken down by material. Landing here soon.',
    },
  },
  notFound: {
    title: "This page doesn't exist.",
    description:
      "The page you're looking for may have been moved or never existed. Head back to the homepage to keep exploring.",
  },
  footer: {
    navigationLabel: 'Footer navigation',
    tagline: 'An unofficial community wiki and calculator toolkit for One Punch Man players.',
    disclaimer:
      '© {year} S-Class Codex. This is an unofficial, fan-made community wiki — not affiliated with or endorsed by the official One Punch Man game publisher. All game names, artwork, and assets referenced belong to their respective owners.',
    donate: {
      badge: 'Support the project',
      title: 'Enjoying S-Class Codex? Buy me a coffee ☕',
      description:
        'This is a solo, non-profit fan project. Any support helps cover server costs and keeps the character data updated faster.',
      accountHolder: 'Account holder',
      copy: 'Copy',
      copied: 'Copied!',
      qrAlt: 'MB Bank transfer QR code for {holder}',
    },
    legalLabel: 'Legal',
    privacyPolicyLink: 'Privacy Policy',
    disclaimerLink: 'Disclaimer & Takedown',
  },
  legal: {
    privacy: {
      eyebrow: 'Legal',
      title: 'Privacy Policy',
      updated: 'Last updated: July 11, 2026',
      intro:
        'S-Class Codex is a static, non-profit fan wiki that does not require an account or sign-in. This page explains what your browser stores when you visit the site, and what we do not collect.',
      sections: {
        dataStored: {
          title: 'What is stored in your browser',
          body: 'Exactly one thing is stored locally: your language choice (English / Vietnamese), saved via localStorage so the site remembers it on your next visit. This value is never sent to any server.',
        },
        noTracking: {
          title: 'What we do not collect',
          body: 'There is no account system, no tracking cookies, no analytics or advertising scripts, and we do not collect any personal information from visitors.',
        },
        thirdParty: {
          title: 'Third-party resources',
          body: 'A few resources are loaded directly from external services: the Inter font from Google Fonts, and the bank transfer QR code from VietQR (only when you open the support widget). Loading these means your browser connects to those services directly, the same way any image or font load works on the web.',
        },
        donation: {
          title: 'Donation information',
          body: 'MoMo and bank transfers happen entirely inside your own MoMo app or banking app. We do not collect, store, or have access to any transaction, balance, or account data.',
        },
        contact: {
          title: 'Contact',
          body: 'If you have questions about privacy, reach out through the channel below.',
        },
      },
    },
    disclaimer: {
      eyebrow: 'Legal',
      title: 'Disclaimer & Takedown',
      updated: 'Last updated: July 11, 2026',
      intro:
        'S-Class Codex is a solo, non-profit fan project made by a One Punch Man fan. This site is not owned by, affiliated with, or endorsed by the official publisher or rights holders of One Punch Man.',
      sections: {
        ownership: {
          title: 'Content ownership',
          body: "All character names, artwork, designs, story content, and related assets belong to the original creator and the respective publishers/rights holders. We use this content for non-commercial, informational purposes to support the player and fan community.",
        },
        nonCommercial: {
          title: 'Not for commercial use',
          body: 'S-Class Codex does not sell advertising and does not monetize game content. Any voluntary community support is used solely to cover server costs and keep data updates going, not for profit.',
        },
        takedown: {
          title: 'Takedown requests',
          body: 'If you are a rights holder or authorized representative and believe content on this site infringes your rights, contact us through the channel below with: (1) a description of the work in question, (2) the URL of the content on this site, (3) your contact details, and (4) a good-faith statement that the use is unauthorized. We will review and remove the content as soon as possible.',
        },
        contact: {
          title: 'Contact',
          body: 'Send takedown requests or copyright concerns through the channel below.',
        },
      },
    },
    contactChannelLabel: 'Contact channel',
  },
};
