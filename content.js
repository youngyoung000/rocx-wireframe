/*
 * Edit this file first when changing labels, routes, mission copy, rewards,
 * leaderboard entries, or page-level navigation.
 */
window.ROCX_CONTENT = {
  product: {
    name: "RocX",
    environment: "TESTNET",
    season: "SEASON 03 LIVE",
    user: "EX",
    aeBalance: "12,450"
  },

  primaryNav: [
    { label: "Explore", route: "/app/explore/missions", section: "explore", icon: "compass", badge: "Earn AE" },
    { label: "DeFi", route: "/app/defi/overview", section: "defi", icon: "orbit" },
    { label: "PoA", route: "/app/poa/feed", section: "poa", icon: "message" },
    { label: "Leaderboard", route: "/app/leaderboard/overall", section: "leaderboard", icon: "trophy" },
    { label: "My Page", route: "/app/my-page/profile", section: "my-page", icon: "users" }
  ],

  sectionNav: {
    defi: [
      { label: "Overview", route: "/app/defi/overview" },
      { label: "Deposit", route: "/app/defi/deposit" },
      { label: "Borrow", route: "/app/defi/borrow" },
      { label: "Swap", route: "/app/defi/swap" },
      { label: "Bridge", route: "/app/defi/bridge" }
    ],
    poa: [
      { label: "Register Activity", route: "/app/poa/register" },
      { label: "Activity Feed", route: "/app/poa/feed" },
      { label: "My Activity", route: "/app/poa/my-activity", count: 2 },
      { label: "Bookmarks", route: "/app/poa/bookmarks", count: 4 },
      { label: "Rank", route: "/app/poa/rank" }
    ],
    "explore": [
      { label: "Explore Home", route: "/app/explore/missions" },
      { label: "Daily", route: "/app/explore/daily" },
      { label: "Weekly", route: "/app/explore/weekly" },
      { label: "Bonus Games", route: "/app/explore/games" }
    ],
    leaderboard: [
      { label: "Overall", route: "/app/leaderboard/overall" },
      { label: "DeFi", route: "/app/leaderboard/defi" },
      { label: "PoA Contributor", route: "/app/leaderboard/poa" }
    ],
    "my-page": [
      { label: "My Profile", route: "/app/my-page/profile" },
      { label: "Social Profiles", route: "/app/my-page/social" },
      { label: "Portfolio", route: "/app/my-page/portfolio" },
      { label: "My AE", route: "/app/my-page/ae" },
      { label: "SBT", route: "/app/my-page/sbt", badge: "Coming soon" }
    ]
  },

  sections: {
    defi: {
      title: "Manage testnet assets.",
      description: "Deposit, borrow, swap, or bridge."
    },
    poa: {
      title: "Share useful activity.",
      description: "Register original content and evaluate community contributions."
    },
    "explore": {
      title: "Explore RocX. Earn AE.",
      description: "Find your next action, build a streak, and collect Active Energy."
    },
    leaderboard: {
      title: "Community rankings.",
      description: "Compare campaign contribution and PoA scores."
    },
    "my-page": {
      title: "My corner of the universe.",
      description: "Your profile, assets, and the energy you've earned."
    }
  },

  onboardingMissions: [
    { id: "connect", category: "Account", icon: "wallet", title: "Connect wallet and social", detail: "Connect a wallet and at least one social account.", reward: "Required", action: "Connect", status: "progress", progress: 1, target: 2 },
    { id: "follow-rocx", category: "Social", icon: "users", social: "X", title: "Follow @RocX_official", detail: "Use your connected X account.", reward: "Required", action: "Open X", external: "https://x.com/RocX_official", status: "ready", progress: 0, target: 1 },
    { id: "first-deposit", category: "DeFi", icon: "orbit", title: "Deposit $50+ once", detail: "Use Base, Ethereum, or Arbitrum Sepolia. Faucet use is optional.", reward: "+100 AE", action: "Deposit", route: "/app/defi/deposit", secondaryAction: "Get test ETH", secondaryExternal: "https://www.alchemy.com/faucets/base-sepolia", status: "ready", progress: 0, target: 1 }
  ],

  dailyMissions: [
    { id: "check-in", category: "Attendance", icon: "calendar", title: "Check in today", detail: "Sign once. Resets at 00:00 UTC.", reward: "+100 AE", action: "Check in", status: "ready", featured: true, progress: 0, target: 1 },
    { id: "register-link", category: "PoA", icon: "message", title: "Register a PoA link", detail: "One original public link per UTC day.", reward: "Ranking", action: "Register", status: "ready", progress: 0, target: 1 },
    { id: "helpful-vote", category: "PoA", icon: "vote", title: "Mark one activity Helpful", detail: "Review the source, then sign.", reward: "PoA signal", action: "Open feed", status: "ready", progress: 0, target: 1 },
    { id: "play-game", category: "Explore", icon: "cards", title: "Play a bonus game", detail: "Your settled result determines AE.", reward: "Result based", action: "View games", status: "ready", progress: 0, target: 1 }
  ],

  weeklyMissions: [
    { id: "mention-rocx", category: "X weekly", icon: "message", title: "Post about RocX on X", detail: "One original post per campaign week. It cannot also be used for PoA.", reward: "+100 AE", action: "Coming soon", disabled: true, status: "coming-soon", progress: 0, target: 1 }
  ],

  bonusGames: [
    { title: "Card Flip", icon: "cards", description: "Choose one of nine cards, bet 100–1,000 AE, and receive the full card result.", cost: "100–1,000 AE", route: "/app/explore/games/card-flip", status: "Available" },
    { title: "Roulette", icon: "roulette", description: "Join a 4-seat or 8-seat room for 100 AE. One winner receives the full entry pool.", cost: "100 AE / seat", route: "/app/explore/games/roulette", status: "Available" },
    { title: "Prediction", icon: "chart", description: "Pick UP or DOWN for a one-minute BTC/USDT price game. A correct individual call returns 2×.", cost: "100–1,000 AE", route: "/app/explore/games/prediction", status: "Available" }
  ],

  activities: [
    { author: "Orbit Research", initials: "OR", platform: "X", time: "2 hours ago", season: "Season 01", sector: "DeFi", cover: "orbit", title: "Why liquidity routing matters on test networks", excerpt: "A short field note on execution quality, route selection, and transparent results.", helpful: 18, notHelpful: 1, saved: true },
    { author: "Blue Voyager", initials: "BV", platform: "YouTube", time: "5 hours ago", season: "Season 01", sector: "Education", cover: "voyage", title: "A practical guide to cross-chain deposits", excerpt: "A step-by-step walkthrough for moving test assets and confirming a position.", helpful: 12, notHelpful: 0, saved: false },
    { author: "Nova Studio", initials: "NS", platform: "Threads", time: "Yesterday", season: "Season 01", sector: "RocX", title: "What makes an activity useful to others?", excerpt: "Clarity, original perspective, and enough context for the next person to act.", helpful: 9, notHelpful: 2, saved: true },
    { author: "Chain Atlas", initials: "CA", platform: "TikTok", time: "Yesterday", season: "Season 01", sector: "DeFi", cover: "bridge", title: "Three things to check before you bridge", excerpt: "Network, token support, and the destination wallet — in under sixty seconds.", helpful: 7, notHelpful: 0, saved: false },
    { author: "Layer Shift", initials: "LS", platform: "X", time: "2 days ago", season: "Season 01", sector: "Layer 2", title: "Choosing the right test network for your next action", excerpt: "A comparison of confirmation times and practical setup steps.", helpful: 14, notHelpful: 1, saved: false },
    { author: "Signal Lab", initials: "SL", platform: "YouTube", time: "3 days ago", season: "Season 01", sector: "AI", title: "How to evaluate an onchain AI claim", excerpt: "Look for clear evidence, repeatable steps, and the limits of each result.", helpful: 11, notHelpful: 0, saved: false },
    { author: "Archive Notes", initials: "AN", platform: "Threads", time: "Last season", season: "Season 00", sector: "Education", title: "Getting started with your first activity", excerpt: "An earlier guide to sharing a useful, original contribution.", helpful: 6, notHelpful: 0, saved: false }
  ],

  leaderboard: {
    overall: [
      { rank: 1, user: "0xaeb5...f0b6", label: "Astra", value: "18,225 pts", delta: "+2" },
      { rank: 2, user: "0x8f9e...09f3", label: "Orbit", value: "16,390 pts", delta: "−1" },
      { rank: 3, user: "0x00f8...abb1", label: "Nova", value: "15,073 pts", delta: "+1" },
      { rank: 4, user: "0xf5ce...2d7d", label: "Blue", value: "12,386 pts", delta: "—" },
      { rank: 5, user: "0x0f0e...a243", label: "Echo", value: "10,300 pts", delta: "+3" },
      { rank: 6, user: "0x1b9b...1941", label: "Atlas", value: "9,880 pts", delta: "−2" }
    ],
    defi: [
      { rank: 1, user: "0xf5ce...2d7d", label: "Blue", value: "$28,420", delta: "+1" },
      { rank: 2, user: "0xaeb5...f0b6", label: "Astra", value: "$24,780", delta: "−1" },
      { rank: 3, user: "0x8f9e...09f3", label: "Orbit", value: "$19,630", delta: "—" },
      { rank: 4, user: "0x00f8...abb1", label: "Nova", value: "$16,250", delta: "+2" },
      { rank: 5, user: "0x1b9b...1941", label: "Atlas", value: "$12,400", delta: "−1" }
    ],
    poa: [
      { rank: 1, user: "0x8f9e...09f3", label: "Orbit", value: "312 pts", delta: "+2" },
      { rank: 2, user: "0x00f8...abb1", label: "Nova", value: "286 pts", delta: "—" },
      { rank: 3, user: "0xaeb5...f0b6", label: "Astra", value: "244 pts", delta: "−2" },
      { rank: 4, user: "0x0f0e...a243", label: "Echo", value: "198 pts", delta: "+1" },
      { rank: 5, user: "0xf5ce...2d7d", label: "Blue", value: "175 pts", delta: "—" }
    ]
  }
};
