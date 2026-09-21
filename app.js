(function () {
  "use strict";

  const C = window.ROCX_CONTENT;
  const app = document.getElementById("app");
  const initialPreviewState = new URLSearchParams(window.location.search).get("state") || new URLSearchParams((window.location.hash.split("?")[1] || "")).get("state");
  let previewState = ["logged-out", "onboarding", "active"].includes(initialPreviewState) ? initialPreviewState : "onboarding";
  let missionWidgetOpen = new URLSearchParams(window.location.search).get("mission") === "open";
  let profileMenuOpen = false;
  let networkMenuOpen = new URLSearchParams(window.location.search).get("networkMenu") === "open";
  let myProfileName = "Explorer";
  let myProfileAvatar = null;
  const mySocialProfiles = { x: "https://x.com/explorer_rocx" };
  const initialSocialDialog = new URLSearchParams(window.location.search).get("social");
  let myPageDialog = initialSocialDialog === "x" ? { type: "social", platform: "x" } : null;
  const initialAssetContext = new URLSearchParams(window.location.search).get("asset");
  let actionPreview = ["deposit", "borrow", "swap-from", "swap-to", "bridge-source", "bridge-destination"].includes(initialAssetContext) ? { kind: "asset", context: initialAssetContext } : null;
  let gameDialog = null;
  const gamePlayCounts = { "card-flip": 0, roulette: 0, prediction: 0 };
  let predictionRoundTimer = null;
  let rouletteRoundTimer = null;
  let rouletteDrawTimer = null;
  let predictionRound = null;
  let rouletteRound = null;
  const predictionHistory = [];
  const rouletteHistory = [];
  let rouletteSeat = 2;
  const NETWORKS = [
    { id: "base", name: "Base Sepolia", short: "Base", symbol: "B" },
    { id: "ethereum", name: "Ethereum Sepolia", short: "Ethereum", symbol: "E" },
    { id: "arbitrum", name: "Arbitrum Sepolia", short: "Arbitrum", symbol: "A" },
    { id: "bnb", name: "BNB Testnet", short: "BNB", symbol: "B" }
  ];
  const savedNetwork = window.localStorage.getItem("rocx-selected-network");
  let selectedNetwork = NETWORKS.some(network => network.id === savedNetwork) ? savedNetwork : "ethereum";
  const initialPoaQuery = new URLSearchParams(window.location.search);
  const initialPoaRegisterStep = initialPoaQuery.get("register");
  let poaPlatform = "All platforms";
  let poaSeason = "Season 01";
  let poaSector = ["DeFi", "Layer 2", "AI", "Gaming", "NFT", "Education", "RocX"].includes(initialPoaQuery.get("sector")) ? initialPoaQuery.get("sector") : "All sectors";
  let poaSort = "Latest";
  let poaRegisterOpen = ["form", "complete"].includes(initialPoaRegisterStep);
  let poaRegisterStep = poaRegisterOpen ? initialPoaRegisterStep : "form";
  let poaRegisterDraft = { platform: "X", url: poaRegisterStep === "form" ? "" : "https://x.com/you/status/123456789", sector: "DeFi" };
  const poaActivityActions = {};
  let checkedIn = false;
  const lendingModes = { deposit: "Deposit", borrow: "Borrow" };
  const selectedAssets = { deposit: "ETH", borrow: "USDC", "swap-from": "ETH", "swap-to": "USDC", "bridge-source": NETWORKS.find(network => network.id === selectedNetwork).name, "bridge-destination": "Arbitrum Sepolia" };
  const gameBetAmounts = { "card-flip": null, roulette: 100, prediction: 100 };
  const gameSelections = { "card-flip": null, roulette: "4:1 Room A", prediction: null };

  function clearGameRounds() {
    clearTimeout(predictionRoundTimer);
    clearTimeout(rouletteRoundTimer);
    clearTimeout(rouletteDrawTimer);
    predictionRound = null;
    rouletteRound = null;
  }

  const iconPaths = {
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M16 10h5v6h-5a3 3 0 0 1 0-6ZM7 6V4h10v2"/>',
    bolt: '<path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z"/>',
    motion: '<path d="M4 14c5 0 5-8 10-8 3 0 5 2 6 4M4 18c5 0 5-8 10-8 3 0 5 2 6 4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/>',
    vote: '<path d="M7 10v10H3V10h4Zm0 9h10a3 3 0 0 0 3-2l1-4a3 3 0 0 0-3-4h-4l1-4a2 2 0 0 0-2-2l-1 1-5 6"/>',
    voteDown: '<path d="M7 14V4H3v10h4Zm0-9h10a3 3 0 0 1 3 2l1 4a3 3 0 0 1-3 4h-4l1 4a2 2 0 0 1-2 2l-1-1-5-6"/>',
    play: '<path d="m8 5 11 7-11 7V5Z"/>',
    orbit: '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(45 12 12)"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    cards: '<rect x="6" y="3" width="13" height="17" rx="2" transform="rotate(6 12 12)"/><path d="m9 7 3 3 3-3M4 6l-1 13a2 2 0 0 0 2 2h9"/>',
    roulette: '<circle cx="12" cy="12" r="9"/><path d="m12 3 2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7Z"/><circle cx="12" cy="12" r="2"/>',
    chart: '<path d="M3 20h18M5 17l4-5 4 3 6-9"/><path d="M16 6h3v3"/>',
    bookmark: '<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    swap: '<path d="m7 7-4 4 4 4M3 11h14M17 17l4-4-4-4M21 13H7"/>',
    bridge: '<path d="M3 19h18M5 19V9M19 19V9M3 9h18M7 9V5h10v4"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H3v2a4 4 0 0 0 4 4M17 6h4v2a4 4 0 0 1-4 4"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    shield: '<path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1A1.7 1.7 0 0 0 4.3 7l-.1-.1L7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    filter: '<path d="M4 5h16M7 12h10M10 19h4"/>',
    external: '<path d="M14 3h7v7M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>'
  };

  function icon(name, className = "icon") {
    const paths = iconPaths[name] || iconPaths.orbit;
    return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  const socialPaths = {
    x: '<path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/>',
    youtube: '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>',
    tiktok: '<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',
    threads: '<path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"/>'
  };

  function socialIcon(platform, className = "social-icon") {
    const key = String(platform || "").toLowerCase();
    const path = socialPaths[key];
    if (!path) return icon("message", className);
    return `<svg class="${className} social-${key}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${path}</svg>`;
  }

  function href(route) {
    return `#${route}`;
  }

  function currentRoute() {
    const raw = window.location.hash.slice(1) || "/app/explore/missions";
    const route = raw.split("?")[0].split("#")[0].replace(/\/$/, "") || "/app/explore/missions";
    const legacyMyPageRoutes = {
      "/app/mypage": "/app/my-page/profile",
      "/app/my-page": "/app/my-page/profile",
      "/app/my-page/overview": "/app/my-page/profile",
      "/app/my-page/accounts": "/app/my-page/social",
      "/app/my-page/ae-history": "/app/my-page/ae",
      "/app/my-page/activity-history": "/app/my-page/ae",
      "/app/my-page/boost": "/app/my-page/sbt",
      "/app/my-page/referral": "/app/my-page/profile",
      "/app/my-page/achievements": "/app/my-page/sbt",
      "/app/my-page/settings": "/app/my-page/profile"
    };
    if (legacyMyPageRoutes[route]) return legacyMyPageRoutes[route];
    return route === "/app/home" || route === "/app/explore/all" ? "/app/explore/missions" : route;
  }

  function currentSection(route) {
    if (route.startsWith("/app/defi")) return "defi";
    if (route.startsWith("/app/poa")) return "poa";
    if (route.startsWith("/app/explore")) return "explore";
    if (route.startsWith("/app/leaderboard")) return "leaderboard";
    if (route.startsWith("/app/my-page")) return "my-page";
    return "explore";
  }

  function renderHeader(section) {
    const loggedOut = previewState === "logged-out";
    const network = NETWORKS.find(item => item.id === selectedNetwork);
    return `
      <header class="site-header">
        <div class="header-inner">
          <a class="brand" href="${href("/app/explore/missions")}" aria-label="RocX Explore home">
            <span class="brand-mark">R</span>
            <span class="brand-word">Roc<span>X</span></span>
          </a>
          <span class="environment-badge">${C.product.environment}</span>
          <nav class="primary-nav" id="primary-nav" aria-label="Primary navigation">
            ${C.primaryNav.map(item => `<a class="${item.section === section ? "active" : ""} ${item.badge ? "nav-featured" : ""}" href="${href(item.route)}"><span>${item.label}</span>${item.badge ? `<span class="nav-ae-badge">${icon("bolt")} ${item.badge}</span>` : ""}</a>`).join("")}
          </nav>
          <div class="header-network-wrap">
            <button class="header-network-trigger" type="button" data-network-toggle aria-label="Select network, current ${network.name}" aria-expanded="${networkMenuOpen}"><span class="network-token ${network.id}">${network.symbol}</span><span class="header-network-name">${network.short}<small>${network.name.split(" ").slice(1).join(" ")}</small></span><span class="network-chevron" aria-hidden="true">⌄</span></button>
            ${networkMenuOpen ? `<div class="header-network-menu" role="group" aria-label="Select network"><span class="header-network-menu-label">NETWORK</span>${NETWORKS.map(option => `<button type="button" class="header-network-option ${option.id === selectedNetwork ? "active" : ""}" data-network-select="${option.id}" aria-pressed="${option.id === selectedNetwork}"><span class="network-token ${option.id}">${option.symbol}</span><span>${option.name}</span>${option.id === selectedNetwork ? icon("check") : ""}</button>`).join("")}</div>` : ""}
          </div>
          ${loggedOut ? `<button class="wallet-button" type="button" data-connect>${icon("wallet")}<span>Connect Wallet</span></button>` : `<div class="header-account"><a class="header-ae-balance" href="${href("/app/my-page/ae")}" aria-label="View AE history">${icon("bolt")} <strong>${previewState === "active" ? C.product.aeBalance : "0"}</strong><span>AE</span></a><div class="profile-wrap"><button class="profile-trigger" type="button" data-profile-toggle aria-label="Open profile menu" aria-expanded="${profileMenuOpen}"><span class="avatar">${C.product.user}</span>${icon("arrow")}</button>${profileMenuOpen ? `<div class="profile-dropdown" role="menu"><div class="profile-dropdown-head"><span class="avatar">${C.product.user}</span><div><strong>${escapeHtml(myProfileName)}</strong><small>${previewState === "active" ? "Active account" : "Setup in progress"}</small></div></div><button class="profile-address" type="button" data-copy="0xaeb5f64cb5ac7d5d22c0d1bb1c46b231af95f0b6" aria-label="Copy connected wallet address"><span><small>Connected wallet · ${network.name}</small><strong>0xaeb5...f0b6</strong></span>${icon("copy")}</button><a role="menuitem" href="${href("/app/my-page/profile")}">${icon("users")} My Page ${icon("arrow")}</a><a role="menuitem" href="${href("/app/my-page/ae")}">${icon("bolt")} My AE ${icon("arrow")}</a><a role="menuitem" href="${href("/app/my-page/social")}">${icon("wallet")} Social profiles ${icon("arrow")}</a><a role="menuitem" href="${href("/app/my-page/portfolio")}">${icon("settings")} Portfolio ${icon("arrow")}</a><button class="profile-disconnect" type="button" data-disconnect>${icon("lock")} Disconnect wallet</button></div>` : ""}</div></div>`}
          <button class="mobile-menu" type="button" aria-label="Open navigation" aria-expanded="false">${icon("menu")}</button>
        </div>
      </header>
      <div class="utility-bar">
        <div class="utility-inner">
          <div class="preview-state"><span>WIREFRAME STATE</span><div class="segmented" aria-label="Preview user state"><button type="button" data-preview-state="logged-out" class="${previewState === "logged-out" ? "active" : ""}">Logged out</button><button type="button" data-preview-state="onboarding" class="${previewState === "onboarding" ? "active" : ""}">Onboarding</button><button type="button" data-preview-state="active" class="${previewState === "active" ? "active" : ""}">Active</button></div></div>
        </div>
      </div>`;
  }

  function renderHero(section, route) {
    const data = C.sections[section];
    if (section === "explore") {
      const gamesActive = route.includes("/games");
      const exploreTabs = `<nav class="explore-tabs" aria-label="Explore sections"><a class="${gamesActive ? "" : "active"}" href="${href("/app/explore/missions")}">Mission<span>Earn AE through verified actions</span></a><a class="${gamesActive ? "active" : ""}" href="${href("/app/explore/games")}">Game<span>Use AE in transparent game rooms</span></a></nav>`;
      if (gamesActive) return exploreTabs;
      const stateContent = previewState === "logged-out"
        ? {
            title: "Connect your wallet to start earning AE.",
            detail: "Connect a wallet and one social account to begin.",
            action: `<button class="button primary large" type="button" data-connect>${icon("wallet")} Connect Wallet</button>`,
            reward: "3 setup steps"
          }
        : previewState === "onboarding"
          ? {
              title: "Deposit $50+ once.",
              detail: "Deposit on Base, Ethereum, or Arbitrum Sepolia to unlock daily missions.",
              action: `<a class="button primary large" href="${href("/app/defi/deposit")}">Continue setup ${icon("arrow")}</a>`,
              reward: "+100 AE"
            }
          : {
              title: checkedIn ? "Today's check-in is complete." : "Check in today.",
              detail: checkedIn ? "Come back after the 00:00 UTC reset for the next attendance proof." : "Sign once before 00:00 UTC to keep your 18-day streak.",
              action: checkedIn ? `<a class="button primary large" href="${href("/app/my-page/ae")}">View AE history ${icon("arrow")}</a>` : `<button class="button primary large" type="button" data-checkin>Check in now</button>`,
              reward: checkedIn ? "+100 AE credited" : "+100 AE"
            };
      return `<section class="page-hero explore-hero">
        <div class="explore-hero-copy">
          <span class="explore-eyebrow">${icon("bolt")} UP NEXT</span>
          <h1>${stateContent.title}</h1>
          <p>${stateContent.detail}</p>
          <div class="explore-hero-action">${stateContent.action}<span>${icon("bolt")} ${stateContent.reward}</span></div>
        </div>
        <div class="explore-hero-art" aria-label="Campaign graphic image area"><span>GRAPHIC IMAGE AREA</span><i class="orbit orbit-one"></i><i class="orbit orbit-two"></i><b>${icon("compass")}</b><em>${icon("bolt")} Earn AE</em></div>
      </section>${exploreTabs}`;
    }
    return `
      <section class="page-hero ${section === "my-page" ? "my-page-hero" : ""}">
        <div>
          <h1>${section === "defi" ? "Your capital, in one place." : section === "poa" ? "Turn your insights into energy." : data.title}</h1>
          <p>${data.description}</p>
        </div>
        ${section === "poa" && route.endsWith("/feed") ? `<button class="button primary large poa-hero-cta" type="button" data-poa-register-open>${icon("plus")} Register activity</button>` : ""}
      </section>`;
  }

  function renderSideNav(section, route) {
    if (section === "explore") return "";
    const items = C.sectionNav[section];
    if (!items) return "";
    const primary = C.primaryNav.find(item => item.section === section);
    const sidebarStatus = previewState === "logged-out"
      ? `<div class="sidebar-balance"><small>Personal progress</small><strong>Connect Wallet</strong><span>Mission rules remain visible</span></div>`
      : `<div class="sidebar-balance"><small>My Active Energy</small><strong>${previewState === "active" ? C.product.aeBalance : "0"} AE</strong><span>${previewState === "active" ? "18-day attendance streak" : "Complete onboarding to earn"}</span></div>`;
    return `<aside class="section-sidebar">
      <div class="sidebar-heading"><span class="sidebar-section-icon">${icon(section === "explore" ? "compass" : section === "leaderboard" ? "trophy" : section === "my-page" ? "users" : section === "poa" ? "message" : "orbit")}</span><div><strong>${primary?.label || section}</strong>${section === "explore" ? "<small>Missions · Games · AE</small>" : ""}</div></div>
      <nav class="side-nav" aria-label="${primary?.label || section} navigation">
        ${items.map(item => section === "poa" && item.route === "/app/poa/register"
          ? `<button class="button primary full poa-sidebar-cta" type="button" data-poa-register-open>${icon("plus")} Register activity</button>`
          : item.locked
          ? `<button class="side-nav-locked" type="button" data-locked><span>${item.label}</span>${icon("lock")}</button>`
          : `<a class="${route === item.route ? "active" : ""}" href="${href(item.route)}"><span>${item.label}</span>${item.badge ? `<span class="side-nav-badge">${item.badge}</span>` : item.count ? `<span class="tab-count">${item.count}</span>` : icon("arrow")}</a>`).join("")}
      </nav>
      ${sidebarStatus}
    </aside>`;
  }

  function panelHeader(title, description, meta = "") {
    return `<div class="panel-header"><div><h2>${title}</h2>${description ? `<p>${description}</p>` : ""}</div>${meta ? `<span class="panel-meta">${meta}</span>` : ""}</div>`;
  }

  function progress(mission) {
    if (previewState === "logged-out") return "";
    const pct = Math.min(100, Math.round((mission.progress / mission.target) * 100));
    if (!mission.progress) return "";
    return `<div class="mission-progress"><div class="progress-label"><span>Progress</span><span>${mission.progress} / ${mission.target}</span></div><div class="progress-track"><i style="width:${pct}%"></i></div></div>`;
  }

  function missionRoute(mission) {
    if (mission.route) return mission.route;
    if (mission.id === "connect") return "/app/my-page/social";
    if (mission.id === "play-game") return "/app/explore/games";
    if (mission.id === "register-link" || mission.id === "mention-rocx") return "/app/poa/register";
    if (mission.id === "helpful-vote") return "/app/poa/feed";
    return "";
  }

  function renderMissionRows(missions) {
    return `<div class="mission-list">${missions.map(mission => {
      const route = missionRoute(mission);
      const actionClass = mission.featured ? "button primary" : "button";
      const primaryAction = mission.disabled
        ? `<button class="button" type="button" data-demo="This mission is coming soon. Its eligibility and reward flow will appear here when released.">${mission.action}</button>`
        : previewState === "logged-out" && !mission.external
          ? `<button class="${actionClass}" type="button" data-connect>Connect</button>`
        : mission.external
        ? `<a class="${actionClass}" href="${mission.external}" target="_blank" rel="noreferrer">${mission.action} ${icon("external")}</a>`
        : route
          ? `<a class="${actionClass}" href="${href(route)}">${mission.action} ${icon("arrow")}</a>`
        : `<button class="${actionClass}" type="button" ${checkedIn ? "disabled" : "data-checkin"}>${checkedIn ? "Checked in" : mission.action}</button>`;
      const secondaryAction = mission.secondaryRoute
        ? `<a class="button soft" href="${href(mission.secondaryRoute)}">${mission.secondaryAction} ${icon("arrow")}</a>`
        : mission.secondaryExternal
          ? `<a class="button soft" href="${mission.secondaryExternal}" target="_blank" rel="noreferrer">${mission.secondaryAction} ${icon("external")}</a>`
          : "";
      return `<article class="mission-row ${mission.featured ? "featured" : ""}">
        <span class="icon-box ${mission.status === "progress" ? "purple" : ""}">${mission.social ? socialIcon(mission.social) : icon(mission.icon)}</span>
        <div class="mission-copy"><div class="mission-title-row"><strong>${mission.title}</strong>${mission.featured ? `<span class="pill mint">Next</span>` : ""}</div><p>${mission.detail}</p></div>
        ${progress(mission)}
        <span class="mission-reward ${mission.reward.includes("AE") ? "ae-reward" : ""}">${mission.reward.includes("AE") ? icon("bolt") : ""}${mission.reward}</span>
        <div class="mission-actions">${primaryAction}${secondaryAction}</div>
      </article>`;
    }).join("")}</div>`;
  }

  function renderDefiOverview() {
    const networkName = NETWORKS.find(network => network.id === selectedNetwork).name;
    return `<section class="panel portfolio-total"><div><small>Total balance</small><strong>$2,200.00</strong><span>Supplied collateral − debt</span></div><div class="portfolio-ring"><b>$2,500</b><span>Total value</span></div><div class="portfolio-legend"><span><i class="supply"></i>Supplies <strong>$2,500</strong></span><span><i class="debt"></i>Debt <strong>$300</strong></span></div></section>
      <div class="grid four defi-summary-grid">
        <article class="panel summary-card"><small>Total supplied</small><strong>$2,500</strong><span>Across 2 assets</span></article>
        <article class="panel summary-card"><small>Total borrowed</small><strong>$300</strong><span>USDC · 6.4% APY</span></article>
        <article class="panel summary-card"><small>Borrow power used</small><strong>20.7%</strong><span>$1,150 available</span></article>
        <article class="panel summary-card"><small>Health factor</small><strong class="positive">6.67</strong><span>Liquidation threshold 1.00</span></article>
      </div>
      <section class="panel defi-positions">${panelHeader("Positions", "Review collateral, debt, and available actions.", networkName)}
        <div class="position-block"><h3>Your supplies</h3><div class="defi-table-head"><span>Asset</span><span>Balance</span><span>APY</span><span>Collateral</span><span>USD value</span><span>Action</span></div><div class="defi-table-row"><div class="defi-asset"><span class="token-dot">E</span><b>ETH</b></div><span>0.5 ETH</span><strong>2.8%</strong><span class="status-on">Enabled</span><span>$1,500</span><button class="button" data-lending-open="Withdraw">Withdraw</button></div><div class="defi-table-row"><div class="defi-asset"><span class="token-dot stable">$</span><b>USDC</b></div><span>1,000 USDC</span><strong>5.5%</strong><span class="status-on">Enabled</span><span>$1,000</span><button class="button" data-lending-open="Withdraw">Withdraw</button></div></div>
        <div class="position-block"><h3>Your borrows</h3><div class="defi-table-head borrow"><span>Asset</span><span>Debt</span><span>APY</span><span>USD value</span><span>Action</span></div><div class="defi-table-row borrow"><div class="defi-asset"><span class="token-dot stable">$</span><b>USDC</b></div><span>300 USDC</span><strong>6.4%</strong><span>$300</span><button class="button" data-lending-open="Repay">Repay</button></div></div>
        <p class="oracle-note">Oracle values are used for collateral and Health factor calculations. Testnet prices may differ from the live market.</p>
      </section>${renderDefiHistory("Portfolio")}`;
  }

  function renderDefiHistory(label) {
    return `<section class="panel defi-history">${panelHeader(`${label} history`, "Transactions will appear after wallet confirmation.", NETWORKS.find(network => network.id === selectedNetwork).name)}<div class="defi-empty">${icon("history")}<strong>No activity yet</strong><span>Type, amount, network, transaction hash, time, and status will be tracked here.</span></div></section>`;
  }

  function renderLending(kind) {
    const deposit = kind === "deposit";
    const verb = deposit ? "Deposit" : "Borrow";
    const secondary = deposit ? "Withdraw" : "Repay";
    const networkName = NETWORKS.find(network => network.id === selectedNetwork).name;
    if (lendingModes[kind] === secondary) return `<div class="defi-action-tabs"><button type="button" data-lending-mode="${verb}" data-lending-kind="${kind}">${verb}</button><button class="active" type="button" data-lending-mode="${secondary}" data-lending-kind="${kind}">${secondary}</button></div>
      <p class="defi-helper">${deposit ? "Withdraw from a supplied position. Check your remaining collateral and Health factor before confirmation." : "Repay outstanding debt. Confirm the amount and remaining wallet balance before signing."}</p>
      <div class="defi-workspace lending-workspace"><section class="panel defi-form-card">${panelHeader(secondary, deposit ? "Move supplied assets back to your wallet." : "Reduce your current borrow position.")}
        <div class="panel-body"><div class="field"><label for="lending-amount">Amount</label><input class="input" id="lending-amount" type="number" min="0" step="0.01" value="${deposit ? "0.25" : "100"}"></div><div class="field"><label>Asset</label><button class="asset-select" type="button" data-demo="Choose an asset from the eligible position list."><span class="token-dot ${deposit ? "" : "stable"}">${deposit ? "E" : "$"}</span>${deposit ? "ETH" : "USDC"}⌄</button></div><div class="field-help">${deposit ? "Supplied 0.50 ETH · Available to withdraw 0.35 ETH" : "Outstanding debt 300 USDC · Wallet balance 1,150 USDC"}</div><button class="button primary large full" type="button" data-demo="${secondary} review shows amount, position impact, and wallet signature before submission.">Review ${secondary.toLowerCase()}</button></div></section>
        <section class="panel defi-summary-card">${panelHeader(`${secondary} details`, "Review the position impact before wallet confirmation.")}<div class="panel-body transaction-details"><div class="detail-row"><span>Network</span><strong>${networkName}</strong></div><div class="detail-row"><span>Asset</span><strong>${deposit ? "ETH" : "USDC"}</strong></div><div class="detail-row"><span>${deposit ? "Supplied before" : "Debt before"}</span><strong>${deposit ? "0.50 ETH" : "300 USDC"}</strong></div><div class="detail-row"><span>${deposit ? "Remaining supply" : "Remaining debt"}</span><strong>${deposit ? "0.25 ETH" : "200 USDC"}</strong></div><div class="detail-row"><span>Health factor after</span><strong class="positive">${deposit ? "5.42" : "7.10"}</strong></div></div></section></div>${renderDefiHistory(secondary)}`;
    return `<div class="defi-action-tabs"><button class="active" type="button" data-lending-mode="${verb}" data-lending-kind="${kind}">${verb}</button><button type="button" data-lending-mode="${secondary}" data-lending-kind="${kind}">${secondary}</button></div>
      <p class="defi-helper">${deposit ? "Test assets are subject to faucet eligibility and rate limits. If you already have test assets, continue directly to Deposit." : "Borrowing capacity is calculated from enabled collateral, loan-to-value limits, and current oracle prices."}</p>
      <div class="defi-workspace lending-workspace">
        <section class="panel defi-form-card">${panelHeader(verb, deposit ? "Supply an asset to earn variable APY." : "Borrow against your enabled collateral.")}
          <div class="panel-body"><div class="amount-entry"><span class="amount-value">${deposit ? "0.50" : "300"}</span><button class="asset-select"><span class="token-dot ${deposit ? "" : "stable"}">${deposit ? "E" : "$"}</span>${deposit ? "ETH" : "USDC"}⌄</button><small>${deposit ? "$1,500.00" : "$300.00"}</small><span class="balance">${deposit ? "Balance 2 ETH" : "Available 1,150 USDC"} · <b>Max</b></span></div>
          <div class="apy-meter"><div><span>${verb} APY ${icon("info")}</span><strong>${deposit ? "2.8%" : "6.4%"}</strong></div><div class="apy-track"><i style="width:${deposit ? 28 : 64}%"></i></div><div class="meter-labels"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div></div>
          <button class="button primary large full" data-demo="${verb} review opened.">Review ${verb.toLowerCase()}</button></div>
        </section>
        <section class="panel defi-summary-card">${panelHeader(`Your ${verb} summary`, "Values update before wallet confirmation.")}
          <div class="panel-body transaction-details">${deposit ? `<div class="detail-row"><span>Network</span><strong>${networkName}</strong></div><div class="detail-row"><span>Asset</span><strong>ETH</strong></div><div class="detail-row"><span>APY</span><strong>2.8%</strong></div><div class="detail-row"><span>Your deposit</span><strong>0.50 ETH</strong></div><div class="detail-row"><span>Wallet balance after</span><strong>1.50 ETH</strong></div><div class="detail-row ae-summary"><span>First eligible $50+ deposit</span><strong>${icon("bolt")} +100 AE</strong></div>` : `<div class="detail-row"><span>Network</span><strong>${networkName}</strong></div><div class="detail-row"><span>Estimated APR</span><strong>6.4%</strong></div><div class="detail-row"><span>Estimated daily interest</span><strong>$0.05</strong></div><div class="detail-row"><span>Estimated yearly interest</span><strong>$19.20</strong></div><div class="detail-row"><span>Health factor after borrow</span><strong class="positive">4.82</strong></div><div class="detail-row"><span>Liquidation price</span><strong>$1,174 / ETH</strong></div>`}</div>
        </section>
      </div>
      <section class="panel market-table-panel">${panelHeader(`${verb} markets`, "Compare balances, rates, borrowed amounts, and liquidity.", networkName)}<div class="defi-table-head market"><span>Asset</span><span>Wallet balance</span><span>Borrowed</span><span>APY</span><span>Total borrowed</span><span>Available liquidity</span></div>${[["ETH","2 ETH","0 ETH",deposit?"2.8%":"3.9%","$4.2M","$8.6M"],["USDC","3,500 USDC","300 USDC",deposit?"5.5%":"6.4%","$2.8M","$5.0M"],["USDT","1,200 USDT","0 USDT",deposit?"5.1%":"6.1%","$1.6M","$3.75M"]].map(row => `<div class="defi-table-row market"><div class="defi-asset"><span class="token-dot ${row[0] !== "ETH" ? "stable" : ""}">${row[0] === "ETH" ? "E" : "$"}</span><b>${row[0]}</b></div>${row.slice(1).map((cell, index) => `<span class="${index === 2 ? "rate" : ""}">${cell}</span>`).join("")}</div>`).join("")}<p class="oracle-note">Liquidation Level (LT) is the minimum collateralization level before liquidation can occur.</p></section>
      ${renderDefiHistory(verb)}`;
  }

  function renderSwap() {
    return `<div class="defi-metrics"><div><small>24H volume</small><strong>$1.84M</strong></div><div><small>Liquidity pools</small><strong>8</strong></div><div><small>Supported chains</small><strong>4</strong></div><div><small>Supported tokens</small><strong>12</strong></div></div>
      <div class="swap-layout"><section class="panel swap-form">${panelHeader("Swap", "Select a pair and amount.", "Slippage 0.5%")}
        <div class="panel-body"><div class="percent-row"><button>25%</button><button>50%</button><button>75%</button><button>100%</button></div><div class="swap-asset"><small>From</small><div><button class="asset-select"><span class="token-dot">E</span> ETH⌄</button><strong>1.00</strong></div><span>Balance 2 ETH · $3,000</span></div><div class="swap-arrow">${icon("swap")}</div><div class="swap-asset"><small>To</small><div><button class="asset-select"><span class="token-dot stable">$</span> USDC⌄</button><strong>2,986.42</strong></div><span>Estimated output</span></div><button class="button primary large full" data-demo="Swap review opened.">Review swap</button><div class="transaction-details"><div class="detail-row"><span>Execution path</span><strong>ETH → USDC</strong></div><div class="detail-row"><span>Price impact</span><strong>0.08%</strong></div><div class="detail-row"><span>Est. network fee</span><strong>$1.82</strong></div><div class="detail-row"><span>Minimum received</span><strong>2,971.48 USDC</strong></div><div class="detail-row"><span>Slippage tolerance</span><strong>0.5%</strong></div></div></div></section>
        <div class="swap-content"><section class="panel price-chart">${panelHeader("Price chart", "ETH / USDC", "1D  ·  7D  ·  30D  ·  90D")}<div class="chart-placeholder"><span>3,025</span><svg viewBox="0 0 700 220" preserveAspectRatio="none"><path d="M0 170 C80 160,100 110,170 130 S270 55,350 92 S450 145,520 82 S620 45,700 28"/></svg><strong>1 ETH = 2,986.42 USDC</strong></div></section><div class="grid two"><section class="panel route-card">${panelHeader("Swap route", "Best available execution path.")}<div class="route-line"><span class="token-dot">E</span><i></i><span class="route-pool">Uniswap V3 · 0.05%</span><i></i><span class="token-dot stable">$</span></div></section><section class="panel guide-card">${panelHeader("Swap guide", "Before you confirm.")}<button>How does swapping work?<span>Learn the basics of token swaps.</span></button><button>How are fees calculated?<span>Network + liquidity provider fees.</span></button><button>What if a swap fails?<span>Review common failure cases.</span></button></section></div></div></div>${renderDefiHistory("Swap")}`;
  }

  function renderBridge() {
    return `<div class="defi-metrics"><div><small>Supported chains</small><strong>4</strong></div><div><small>Supported protocols</small><strong>2</strong></div><div><small>Bridgeable tokens</small><strong>USDC</strong></div><div><small>Estimated time</small><strong>~2 min</strong></div></div>
      <div class="bridge-layout"><section class="panel bridge-form">${panelHeader("Bridge", "Move supported assets between test networks.")}<div class="panel-body"><div class="bridge-asset"><small>Source chain</small><button class="asset-select"><span class="network-token ethereum">E</span>Ethereum Sepolia⌄</button><strong>500</strong><span>USDC · Balance 1,200</span></div><div class="swap-arrow">${icon("swap")}</div><div class="bridge-asset"><small>Destination chain</small><button class="asset-select"><span class="network-token arbitrum">A</span>Arbitrum Sepolia⌄</button><strong>499.50</strong><span>USDC · Estimated receive</span></div><button class="button primary large full" data-demo="Bridge review opened.">Review bridge</button><div class="transaction-details"><div class="detail-row"><span>Protocol</span><strong>Circle CCTP</strong></div><div class="detail-row"><span>Bridge fee</span><strong>$0.50</strong></div><div class="detail-row"><span>Estimated completion</span><strong>~2 min</strong></div></div></div></section>
        <div><section class="panel bridge-route">${panelHeader("Bridge route", "Route and security checks before transfer.")}<div class="bridge-route-visual"><span><b>Ethereum Sepolia</b><small>500 USDC</small></span><i>${icon("arrow")}</i><span><b>Circle CCTP</b><small>Burn & mint</small></span><i>${icon("arrow")}</i><span><b>Arbitrum Sepolia</b><small>499.50 USDC</small></span></div></section><section class="panel security-card"><span class="icon-box purple">${icon("shield")}</span><div><h3>The RocX Bridge is secure</h3><p>Multi-signature protection, real-time monitoring, and smart contract audits support safer asset transfers.</p></div><div class="security-pills"><span>${icon("check")} Multi-signature</span><span>${icon("check")} Real-time monitoring</span><span>${icon("check")} Contract audit</span></div></section></div></div>${renderDefiHistory("Bridge")}`;
  }

  function renderDefi(route) {
    if (route.endsWith("/overview")) return renderDefiOverview();
    if (route.endsWith("/deposit")) return renderLending("deposit");
    if (route.endsWith("/borrow")) return renderLending("borrow");
    if (route.endsWith("/swap")) return renderSwap();
    return renderBridge();
  }

  function activityCard(activity) {
    const hasMedia = Boolean(activity.cover);
    const duration = activity.platform === "YouTube" ? "6:12" : activity.platform === "TikTok" ? "0:58" : "Post";
    const activityId = encodeURIComponent(activity.title);
    const actionState = poaActivityActions[activityId] || { vote: null, saved: activity.saved };
    const helpful = activity.helpful + (actionState.vote === "helpful" ? 1 : 0);
    const notHelpful = activity.notHelpful + (actionState.vote === "not-helpful" ? 1 : 0);
    const sourceUrl = activity.platform === "YouTube" ? "https://www.youtube.com/results?search_query=RocX" : activity.platform === "TikTok" ? "https://www.tiktok.com/search?q=RocX" : activity.platform === "Threads" ? "https://www.threads.net/search?q=RocX" : "https://x.com/RocX_official";
    const preview = hasMedia ? `<div class="activity-cover ${activity.cover}" role="img" aria-label="Cover artwork for ${activity.title}">
        <span class="activity-platform-badge" aria-label="${activity.platform}">${socialIcon(activity.platform)}</span>
        <span class="cover-orbit orbit-a"></span><span class="cover-orbit orbit-b"></span>
        <span class="cover-symbol">${icon(activity.cover === "voyage" ? "play" : activity.cover === "bridge" ? "bridge" : "orbit")}</span>
        <span class="cover-caption"><small>${activity.sector}</small>Explore the story</span>
        <span class="activity-duration">${duration}</span>
      </div>` : "";
    return `<article class="panel activity-card ${activity.cover ? "with-media" : "no-media"}">
      ${preview}
      <div class="activity-card-body">
        ${hasMedia ? "" : `<div class="activity-text-label"><span aria-label="${activity.platform}" title="${activity.platform}">${socialIcon(activity.platform)}</span></div>`}
        <div class="activity-story"><span class="avatar">${activity.initials}</span><h3>${activity.title}</h3></div>
        ${hasMedia ? "" : `<p class="activity-excerpt">${activity.excerpt}</p>`}
        <strong class="activity-byline">${activity.author}</strong>
        <span class="activity-meta">${activity.platform} · ${activity.sector} · ${activity.time}</span>
        <div class="activity-actions"><button class="activity-vote ${actionState.vote === "helpful" ? "active" : ""}" aria-label="Helpful, ${helpful} evaluations" aria-pressed="${actionState.vote === "helpful"}" title="Helpful · ${helpful}" data-activity-vote="${activityId}" data-vote-kind="helpful">${icon("vote")}<span>${helpful}</span></button><button class="activity-vote ${actionState.vote === "not-helpful" ? "active" : ""}" aria-label="Not Helpful, ${notHelpful} evaluations" aria-pressed="${actionState.vote === "not-helpful"}" title="Not Helpful · ${notHelpful}" data-activity-vote="${activityId}" data-vote-kind="not-helpful">${icon("voteDown")}<span>${notHelpful}</span></button><button class="activity-bookmark ${actionState.saved ? "active" : ""}" data-activity-bookmark="${activityId}" aria-label="${actionState.saved ? "Remove bookmark" : "Bookmark activity"}" aria-pressed="${actionState.saved}">${icon("bookmark")}</button><a class="activity-open" href="${sourceUrl}" target="_blank" rel="noreferrer" aria-label="Open activity source">${icon("external")}</a></div>
      </div>
    </article>`;
  }

  function renderPoaFeed(list = C.activities) {
    const visible = list.filter(activity => activity.season === poaSeason && (poaSector === "All sectors" || activity.sector === poaSector) && (poaPlatform === "All platforms" || activity.platform === poaPlatform));
    if (poaSort === "Most helpful") visible.sort((a, b) => b.helpful - a.helpful);
    const platforms = ["All platforms", "X", "YouTube", "TikTok", "Threads"];
    const sectors = ["All sectors", "DeFi", "Layer 2", "AI", "Gaming", "NFT", "Education", "RocX"];
    return `
      <div class="filter-row">
        ${platforms.map(platform => `<button class="filter-chip ${poaPlatform === platform ? "active" : ""}" type="button" data-poa-platform="${platform}">${platform === "All platforms" ? "" : socialIcon(platform)} ${platform}</button>`).join("")}
        <span class="filter-spacer"></span><select class="select-control" data-poa-sort aria-label="Sort activities"><option ${poaSort === "Latest" ? "selected" : ""}>Latest</option><option ${poaSort === "Most helpful" ? "selected" : ""}>Most helpful</option></select>
      </div>
      <div class="poa-filter-bar"><label>Season<select data-poa-season aria-label="Filter by season"><option value="Season 01" ${poaSeason === "Season 01" ? "selected" : ""}>Season 01 · LIVE</option><option value="Season 00" ${poaSeason === "Season 00" ? "selected" : ""}>Season 00 · Ended</option></select></label><label>Sector<select data-poa-sector aria-label="Filter by sector">${sectors.map(sector => `<option value="${sector}" ${poaSector === sector ? "selected" : ""}>${sector}</option>`).join("")}</select></label><span class="poa-result-count">${visible.length} activities</span></div>
      <div class="activity-grid">${visible.length ? visible.map(activityCard).join("") : `<div class="panel empty-state"><h2>No activities match these filters</h2><p>Try another season, sector, or platform.</p><button class="button soft" type="button" data-poa-clear-filters>Clear filters</button></div>`}</div>`;
  }

  function renderPoaRegister() {
    return `<div class="form-layout poa-register-landing">
      <section class="panel">${panelHeader("Register an activity", "Submit original public content from a connected account.", "1 per UTC day")}
        <div class="panel-body"><p>Your link and connected author account are checked before you sign. Registration does not award a fixed amount of AE immediately.</p><button class="button primary large" type="button" data-poa-register-open>${icon("plus")} Register activity</button></div>
      </section>
      <aside class="panel padded"><span class="icon-box mint">${icon("shield")}</span><h2 style="font-size:18px;font-weight:500;margin:20px 0 8px">Registration eligibility</h2><p style="color:var(--muted);font-size:12px">Access is checked again at submission. Registration does not create an immediate fixed AE reward.</p><div class="requirement-list"><div class="requirement">${icon("check")} Connected author account</div><div class="requirement">${icon("check")} Eligible deposits of $50+ held for 24 hours</div><div class="requirement">${icon("check")} One original link per day</div><div class="requirement">${icon("check")} Public, accessible, relevant, and not duplicated</div><div class="requirement">${icon("check")} Wallet signature at submission</div></div></aside>
    </div>`;
  }

  function renderPoaRegisterModal() {
    if (!poaRegisterOpen) return "";
    const sectors = ["DeFi", "Layer 2", "AI", "Gaming", "NFT", "Education", "RocX"];
    const form = `<p>Share one original public link from a connected account.</p><form data-poa-register-form><div class="field"><label for="poa-modal-platform">Platform</label><select id="poa-modal-platform" name="platform" required><option value="X" ${poaRegisterDraft.platform === "X" ? "selected" : ""}>X</option><option value="YouTube" ${poaRegisterDraft.platform === "YouTube" ? "selected" : ""}>YouTube</option><option value="TikTok" ${poaRegisterDraft.platform === "TikTok" ? "selected" : ""}>TikTok</option><option value="Threads" ${poaRegisterDraft.platform === "Threads" ? "selected" : ""}>Threads</option></select></div><div class="field"><label for="poa-modal-url">Public activity URL</label><input class="input" id="poa-modal-url" name="url" type="url" required placeholder="https://x.com/you/status/..." value="${escapeHtml(poaRegisterDraft.url)}"><div class="field-help">The author must match your connected account.</div></div><div class="field"><label for="poa-modal-sector">Sector</label><select id="poa-modal-sector" name="sector" required><option value="" disabled>Select a sector</option>${sectors.map(sector => `<option value="${sector}" ${poaRegisterDraft.sector === sector ? "selected" : ""}>${sector}</option>`).join("")}</select><div class="field-help">Choose the topic that best matches this activity.</div></div><div class="poa-register-modal-actions"><button class="button primary large full" type="submit">Sign & submit ${icon("arrow")}</button></div></form>`;
    const complete = `<div class="poa-register-complete"><span class="icon-box mint">${icon("check")}</span><h3>Activity submitted</h3><p>Track eligibility and evaluation status in My Activity.</p><a class="button primary large" href="${href("/app/poa/my-activity")}">View My Activity ${icon("arrow")}</a></div>`;
    return `<div class="flow-overlay poa-register-overlay" data-poa-register-overlay><section class="poa-register-modal" role="dialog" aria-modal="true" aria-labelledby="poa-register-title"><div class="poa-register-modal-head"><div><span class="eyebrow">PROOF OF ACTIVITY</span><h2 id="poa-register-title">${poaRegisterStep === "form" ? "Register activity" : "Registration status"}</h2></div><button type="button" data-poa-register-close aria-label="Close registration">×</button></div>${poaRegisterStep === "form" ? form : complete}</section></div>`;
  }

  function renderPoa(route) {
    if (route.endsWith("/register")) return renderPoaRegister();
    if (route.endsWith("/my-activity")) return renderPoaFeed(C.activities.slice(0, 2));
    if (route.endsWith("/bookmarks")) return renderPoaFeed(C.activities.filter(item => item.saved));
    if (route.endsWith("/rank")) return renderLeaderboard("/app/leaderboard/poa");
    return renderPoaFeed();
  }

  function renderLoggedOutGate() {
    return `<section class="panel auth-gate"><span class="auth-icon">${icon("wallet")}</span><h2>Connect your wallet to start earning AE.</h2><p>Your wallet identifies your RocX account. After connecting, link one social account and complete onboarding to unlock recurring missions.</p><button class="button primary large" type="button" data-connect>${icon("wallet")} Connect Wallet</button><div class="auth-steps"><div><strong>01</strong><span>Connect wallet</span></div><div><strong>02</strong><span>Link one social account</span></div><div><strong>03</strong><span>Complete onboarding</span></div></div></section>`;
  }

  function renderLoggedOutMissions() {
    return `<div class="section-heading"><h2>Start here</h2><span class="pill">3 one-time steps</span></div><section class="panel">${renderMissionRows(C.onboardingMissions)}</section>
      <div class="grid mission-branch-grid" style="margin-top:20px">${missionSection("Daily", "Unlocks after setup.", C.dailyMissions, "00:00 UTC reset")}${missionSection("Weekly", "One original X post per campaign week.", C.weeklyMissions, "Coming soon")}</div>`;
  }

  function renderOnboardingMissions() {
    return `<div class="section-heading"><h2>Setup</h2><span class="pill">2 steps left</span></div><section class="panel">${renderMissionRows(C.onboardingMissions)}</section><div class="unlock-note">${icon("lock")}<div><strong>Daily missions unlock after setup.</strong></div><button class="button soft" type="button" data-complete-onboarding>Finish setup</button></div>`;
  }

  function renderLockedMissions(period) {
    return `<section class="panel locked-state"><span class="auth-icon">${icon("lock")}</span><h2>${period} missions are locked.</h2><p>Complete all onboarding missions first. The onboarding section will disappear and ${period.toLowerCase()} missions will unlock automatically.</p><a class="button primary" href="${href("/app/explore/missions")}">Return to onboarding ${icon("arrow")}</a></section>`;
  }

  function missionSection(title, description, missions, meta) {
    return `<section class="panel">${panelHeader(title, description, meta)}${renderMissionRows(missions)}</section>`;
  }

  function renderGetAeOverview(mode) {
    if (previewState === "logged-out") return renderLoggedOutMissions();
    if (previewState === "onboarding") return renderOnboardingMissions();
    if (mode === "daily") return `<div class="section-heading"><h2>Today</h2><span class="pill">Resets 00:00 UTC</span></div><section class="panel">${renderMissionRows(C.dailyMissions)}</section>`;
    if (mode === "weekly") return `<div class="section-heading"><h2>Weekly</h2><span class="pill">Coming soon</span></div><section class="panel">${renderMissionRows(C.weeklyMissions)}</section><div class="policy-note">${icon("info")}<span>Campaign weeks are continuous 7-day periods. Weekly posts are validated separately from PoA.</span></div>`;
    return `<div class="section-heading"><h2>Today</h2><span class="pill">0 of 4 complete</span></div><section class="panel">${renderMissionRows(C.dailyMissions)}</section><div class="section-heading"><h2>Weekly</h2><span class="pill">Coming soon</span></div><section class="panel">${renderMissionRows(C.weeklyMissions)}</section>`;
  }

  function gamePrimaryAction(game, label, disabled = false) {
    if (previewState === "logged-out") return `<button class="button primary large" type="button" data-connect-game>${icon("wallet")} Connect wallet</button>`;
    if (previewState === "onboarding") return `<a class="button primary large" href="${href("/app/explore/missions")}">${icon("check")} Continue setup</a>`;
    return `<button class="button primary large" type="button" data-game-play="${game}" ${disabled ? "disabled" : ""}>${label}</button>`;
  }

  function gamePotentialReturn(game, amount) {
    if (!amount) return "— AE";
    if (game === "card-flip") return `${Math.round(amount * 2.5).toLocaleString()} AE`;
    if (game === "roulette") return `${gameSelections.roulette.startsWith("8:1") ? "800" : "400"} AE`;
    return `${Math.round(amount * 2).toLocaleString()} AE`;
  }

  function syncGameBetInput(input) {
    const game = input.dataset.betInput;
    const entered = Number(input.value);
    const amount = input.value.trim() && Number.isFinite(entered) && entered >= 100 && entered <= 1000 && entered % 10 === 0 ? entered : null;
    gameBetAmounts[game] = amount;
    const stage = input.closest(".game-stage, .prediction-stage");
    const returnValue = stage?.querySelector(".game-return-preview strong");
    if (returnValue) returnValue.textContent = gamePotentialReturn(game, amount);
    const playButton = stage?.querySelector("[data-game-play]");
    if (playButton && game === "card-flip") playButton.disabled = !amount || !gameSelections["card-flip"];
    stage?.querySelectorAll(`[data-bet-game="${game}"][data-bet-action="half"], [data-bet-game="${game}"][data-bet-action="double"]`).forEach(button => { button.disabled = !amount; });
    stage?.querySelectorAll("[data-prediction-bet]").forEach(button => { button.disabled = !amount; });
    if (game === "card-flip") {
      const amountLabel = stage?.querySelector(".outcome-key-title small");
      if (amountLabel) amountLabel.textContent = amount ? `At ${amount.toLocaleString()} AE` : "Enter a bet to see amounts";
      stage?.querySelectorAll(".outcome-key-row strong").forEach((node, index) => { node.textContent = amount ? `${Math.round(amount * [2.5, 1.5, 1, .8, .5][index]).toLocaleString()} AE` : "— AE"; });
    } else if (game === "prediction") {
      const correctValue = stage?.querySelector(".prediction-payout-note strong");
      if (correctValue) correctValue.textContent = gamePotentialReturn(game, amount);
    }
  }

  function renderGameBalance() {
    const balance = previewState === "logged-out" ? "—" : previewState === "onboarding" ? "0" : C.product.aeBalance;
    return `<div class="game-balance-card"><span>${icon("bolt")} Available balance</span><strong>${balance} AE</strong></div>`;
  }

  function renderBetAmountControl(game, locked = false) {
    const amount = gameBetAmounts[game];
    return `<div class="game-bet-setting ${locked ? "is-locked" : ""}"><div class="game-bet-label"><label for="bet-${game}">Bet amount</label><span>100–1,000 AE · steps of 10</span></div><div class="game-bet-input"><input id="bet-${game}" type="number" min="100" max="1000" step="10" value="${amount ?? ""}" placeholder="Enter amount" inputmode="numeric" data-bet-input="${game}" ${locked ? "disabled" : ""} aria-label="Bet amount for ${game}"><span>AE</span></div><div class="game-bet-shortcuts" aria-label="Quick bet amount"><button type="button" data-bet-action="half" data-bet-game="${game}" ${locked || !amount ? "disabled" : ""}>½</button><button type="button" data-bet-action="double" data-bet-game="${game}" ${!amount ? "disabled" : ""}>2×</button><button type="button" data-bet-action="500" data-bet-game="${game}" ${locked ? "disabled" : ""}>500</button><button type="button" data-bet-action="max" data-bet-game="${game}" ${locked ? "disabled" : ""}>MAX</button></div></div>`;
  }

  function renderGameIntro(description) {
    return `<div class="game-intro"><p>${description}</p></div>`;
  }

  function renderCardFlipGame() {
    const amount = gameBetAmounts["card-flip"];
    const revealed = gameDialog?.game === "card-flip";
    const effects = [["250%", 2.5, "win"], ["150%", 1.5, "win"], ["KEEP", 1, "neutral"], ["−20%", .8, "loss"], ["−50%", .5, "loss"]];
    return `<section class="panel game-stage game-single-stage card-flip-stage">${renderGameIntro("Choose a card, enter 100–1,000 AE, then flip to reveal its effect.")}
      <div class="card-flip-grid ${revealed ? "revealed" : ""}">${revealed ? renderGameResult("card-flip") : Array.from({ length: 9 }, (_, index) => { const label = `Card ${String(index + 1).padStart(2, "0")}`; return `<button class="${gameSelections["card-flip"] === label ? "selected" : ""}" type="button" aria-label="Choose card ${index + 1}" aria-pressed="${gameSelections["card-flip"] === label}" data-game-selection="${label}" data-game="card-flip"><span>R</span><small>${String(index + 1).padStart(2, "0")}</small></button>`; }).join("")}</div>
      <div class="game-stage-action">${renderGameBalance()}<div class="game-entry-controls" aria-label="Card Flip bet"><div class="game-entry-heading"><strong>${revealed ? "Round complete" : "Bet"}</strong>${revealed ? "" : "<span>Choose a card and amount</span>"}</div>${renderBetAmountControl("card-flip", revealed)}${revealed ? "" : `<div class="game-entry-actions">${gamePrimaryAction("card-flip", "Flip", !amount || !gameSelections["card-flip"])}</div>`}<div class="game-return-preview"><span>Maximum reward</span><strong>${gamePotentialReturn("card-flip", amount)}</strong></div></div><div class="outcome-key"><div class="outcome-key-title"><strong>What can this card return?</strong><small>${amount ? `At ${amount.toLocaleString()} AE` : "Enter a bet to see amounts"}</small></div>${effects.map(([label, multiplier, tone]) => `<div class="outcome-key-row ${tone}"><span>${label}</span><strong>${amount ? `${Math.round(amount * multiplier).toLocaleString()} AE` : "— AE"}</strong></div>`).join("")}<p>Winning rewards are paid in full. KEEP returns the entry; loss effects return the amount shown.</p></div><details class="game-details game-details-inline"><summary>More game details <span>Card effects & settlement</span></summary><div class="game-details-content"><p>The nine-card deck contains one 250%, one 150%, one KEEP, three −20%, and three −50% outcomes. Only your chosen card is revealed.</p><p>The card effect determines the total AE returned, including any entry amount in that result. No extra winning deduction applies.</p></div></details></div></section>`;
  }

  function renderRouletteGame() {
    const rooms = [["4:1 Room A", 1, 4, 400], ["4:1 Room B", 2, 4, 400], ["8:1 Room C", 5, 8, 800]];
    const selectedRoom = rooms.find(room => room[0] === gameSelections.roulette) || rooms[0];
    const [name, initialFilled, capacity, payout] = selectedRoom;
    const activeRound = rouletteRound?.selection === name ? rouletteRound : null;
    const result = gameDialog?.game === "roulette";
    const filled = activeRound?.filled ?? initialFilled;
    const roomSeats = (roomName, players, seats, interactive) => Array.from({ length: seats }, (_, index) => {
      const seat = index + 1;
      const angle = (seats === 8 ? -67.5 : -45) + index * (360 / seats);
      const rad = angle * Math.PI / 180;
      const position = `left:${(50 + Math.cos(rad) * 31).toFixed(1)}%;top:${(50 + Math.sin(rad) * 31).toFixed(1)}%`;
      const taken = index < players;
      if (!interactive) return `<span class="roulette-mini-seat ${taken ? "taken" : ""}" style="${position}"></span>`;
      const selected = rouletteSeat === seat;
      const mine = activeRound && selected;
      const winner = result && seat === (activeRound.won ? activeRound.seat : activeRound.seat === 1 ? 2 : 1);
      return `<button class="roulette-wheel-seat ${winner ? "winner" : mine ? "mine" : taken ? "taken" : selected ? "selected" : ""}" type="button" style="${position}" ${taken || activeRound ? "disabled" : `data-roulette-seat="${seat}" data-roulette-room="${roomName}"`} aria-label="${roomName} seat ${seat} ${winner ? "winning seat" : mine ? "your seat" : taken ? "occupied" : selected ? "selected" : "available"}" ${taken || activeRound ? "" : `aria-pressed="${selected}"`}><span class="seat-person"></span><small>${seat}</small></button>`;
    }).join("");
    const roundStatus = activeRound ? `<div class="roulette-round-status ${activeRound.phase}" role="status"><span class="roulette-round-dot"></span><div><strong>${activeRound.phase === "waiting" ? "Seat joined · waiting for players" : activeRound.phase === "spinning" ? "Room full · drawing a winner" : "Draw complete"}</strong><span>${filled} / ${capacity} seats filled${activeRound.phase === "waiting" ? " · draw starts automatically when full" : ""}</span></div></div>` : "";
    return `<section class="panel game-stage game-single-stage roulette-stage">${renderGameIntro("Choose an open seat. When the room fills, the draw starts automatically and the winner receives the full pool.")}
      <div class="roulette-arena"><div class="roulette-featured"><div class="roulette-featured-head"><span class="pill mint">SELECTED ROOM</span><h3>${name}</h3></div><div class="roulette-wheel ${capacity === 8 ? "eight" : "four"} ${activeRound?.phase === "spinning" ? "spinning" : ""}" role="group" aria-label="${name} seats"><i class="wheel-pointer"></i><span class="roulette-wheel-center">${result ? "DRAW" : "SPIN"}<small>${result ? "COMPLETE" : "WHEN FULL"}</small></span>${roomSeats(name, filled, capacity, true)}</div><div class="roulette-featured-foot"><span>${result ? "Winning seat highlighted on the wheel" : activeRound ? `${filled} / ${capacity} seats filled` : "Pick an open seat on the wheel"}</span></div></div><div class="roulette-room-rail">${rooms.filter(room => room[0] !== name).map(([roomName, players, seats]) => `<button class="roulette-compact-room" type="button" data-game-selection="${roomName}" data-game="roulette" aria-label="Switch to ${roomName}" ${activeRound ? "disabled" : ""}><span class="roulette-mini-wheel ${seats === 8 ? "eight" : "four"}">${roomSeats(roomName, players, seats, false)}<i></i></span><strong>${roomName}</strong></button>`).join("")}</div></div>
      <div class="game-stage-action">${renderGameBalance()}${result ? renderGameResult("roulette") : `<div class="roulette-bet-panel"><div class="game-entry-heading"><strong>${activeRound ? "Your room" : "Join room"}</strong><span>Fixed entry · 100 AE</span></div><div class="roulette-selected-summary"><strong>${name}</strong></div><div class="roulette-pool-math"><div><span>Your entry</span><strong>100 AE</strong></div><div><span>Full pool</span><strong>${capacity * 100} AE</strong></div><div class="winner"><span>Winner receives</span><strong>${payout} AE</strong></div></div>${activeRound ? roundStatus : `<div class="game-entry-actions">${gamePrimaryAction("roulette", "Join Room")}</div>`}<p class="roulette-refund-note">Cancelled rooms return the 100 AE entry.</p></div>`}<details class="game-details game-details-inline"><summary>More game details <span>Draw & refund</span></summary><div class="game-details-content"><p>Each seat costs 100 AE. When all ${capacity} seats are filled, entry closes and one winner is selected at random. The winner receives the full ${payout} AE pool, including the entry already paid.</p><p>Other seats do not receive a payout. If a room is cancelled before a completed draw, the entry is refunded.</p></div></details></div></section>${renderRouletteHistory()}`;
  }

  function renderRouletteHistory() {
    const visibleHistory = previewState === "active" ? rouletteHistory : [];
    const emptyMessage = previewState === "logged-out" ? "Connect your wallet to view room history." : previewState === "onboarding" ? "Complete setup to enter a room." : "Your room entries will appear here after you join.";
    return `<section class="panel roulette-history"><div class="prediction-history-title"><h2>My roulette history</h2><span>${visibleHistory.length ? `${visibleHistory.length} room${visibleHistory.length === 1 ? "" : "s"}` : "No rooms yet"}</span></div><div class="roulette-history-table" role="table" aria-label="My roulette history"><div class="roulette-history-row head" role="row"><span>Room</span><span>Seat</span><span>Entry</span><span>Status</span><span>Return</span></div>${visibleHistory.length ? visibleHistory.map(round => `<div class="roulette-history-row" role="row"><strong>${round.selection}</strong><span>Seat ${round.seat}</span><span>${round.amount.toLocaleString()} AE</span><span class="${round.phase === "complete" ? round.won ? "won" : "lost" : "pending"}">${round.phase === "waiting" ? "Waiting for seats" : round.phase === "spinning" ? "Drawing" : round.won ? "Won" : "Lost"}</span><strong>${round.phase === "complete" ? `${round.won ? round.capacity * 100 : 0} AE` : "Pending"}</strong></div>`).join("") : `<div class="prediction-history-empty">${emptyMessage}</div>`}</div></section>`;
  }

  function renderPredictionGame() {
    const amount = gameBetAmounts.prediction;
    const running = predictionRound?.phase === "running";
    const result = gameDialog?.game === "prediction";
    return `<section class="panel prediction-stage">${renderGameIntro("Bet UP or DOWN; the BTC price after 60 seconds decides the result.")}
      <div class="prediction-play-layout"><div class="prediction-chart"><div class="chart-toolbar"><span>BTC / USDT</span><span>60-second round</span></div><svg viewBox="0 0 900 270" preserveAspectRatio="none" aria-label="BTC price chart"><path class="grid-line" d="M0 55H900M0 135H900M0 215H900"/><path class="price-line" d="M0 180 L55 166 L100 174 L145 130 L190 147 L235 118 L280 136 L325 82 L370 116 L415 77 L460 101 L505 61 L550 84 L595 55 L640 89 L685 70 L730 112 L775 137 L820 120 L860 150 L900 124"/></svg><span class="live-price">$80,831.70</span>${running ? `<div class="prediction-chart-live" role="status"><span class="prediction-live-dot"></span><strong>Round in progress</strong><span>Opening price $${predictionRound.opening.toLocaleString("en-US", { minimumFractionDigits: 2 })} · ${predictionRound.selection} · ${predictionRound.amount} AE</span></div>` : result ? `<div class="prediction-chart-live settled" role="status"><strong>Round settled</strong><span>Open ${gameDialog.opening.toLocaleString("en-US", { minimumFractionDigits: 2 })} · Close ${gameDialog.closing.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>` : ""}<div class="prediction-timeline"><span>Bet placed · opening price</span><i></i><span>60 seconds</span><i></i><span>Closing price · settle</span></div></div>
      <div class="prediction-controls">${renderGameBalance()}${running ? `<div class="prediction-running-card"><span class="pill mint">IN PROGRESS</span><h3>${predictionRound.selection} prediction</h3><p>Waiting for the 60-second closing price.</p><div><span>Entry</span><strong>${predictionRound.amount.toLocaleString()} AE</strong></div><div><span>Opening price</span><strong>$${predictionRound.opening.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></div><div><span>If correct</span><strong>${(predictionRound.amount * 2).toLocaleString()} AE</strong></div><div class="prediction-running-progress"><i></i></div></div>` : result ? renderGameResult("prediction") : `<div class="prediction-bet-panel">${renderBetAmountControl("prediction")}<div class="direction-buttons"><button class="up" type="button" data-prediction-bet="UP" ${previewState !== "active" || !amount ? "disabled" : ""}><b>UP</b></button><button class="down" type="button" data-prediction-bet="DOWN" ${previewState !== "active" || !amount ? "disabled" : ""}><b>DOWN</b></button></div>${previewState === "active" ? "" : `<div class="game-entry-actions">${gamePrimaryAction("prediction", "")}</div>`}<p class="prediction-payout-note">Correct call returns <strong>${gamePotentialReturn("prediction", amount)}</strong> · 2× after 60 seconds</p></div>`}<details class="game-details game-details-inline"><summary>More game details <span>Price source & settlement</span></summary><div class="game-details-content"><p>The BTC/USDT price is compared at entry and after 60 seconds. Settlement uses the RocX Price Feed based on Binance Spot.</p><p>A correct individual prediction returns 2× the entry, including the original stake. An incorrect call receives no payout; a tied or cancelled round returns the entry.</p></div></details></div></div></section>${renderPredictionHistory()}`;
  }

  function renderPredictionHistory() {
    const visibleHistory = previewState === "active" ? predictionHistory : [];
    const emptyMessage = previewState === "logged-out" ? "Connect your wallet to view predictions." : previewState === "onboarding" ? "Complete setup to enter a prediction." : "Your predictions will appear here after you enter a round.";
    return `<section class="panel prediction-history"><div class="prediction-history-title"><h2>My predictions</h2><span>${visibleHistory.length ? `${visibleHistory.length} round${visibleHistory.length === 1 ? "" : "s"}` : "No rounds yet"}</span></div><div class="prediction-history-table" role="table" aria-label="My predictions"><div class="prediction-history-row head" role="row"><span>Direction</span><span>Entry</span><span>Opening price</span><span>Status</span><span>Return</span></div>${visibleHistory.length ? visibleHistory.map(round => `<div class="prediction-history-row" role="row"><strong class="${round.selection.toLowerCase()}">${round.selection}</strong><span>${round.amount.toLocaleString()} AE</span><span>$${round.opening.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span><span>${round.phase === "running" ? "In progress" : round.correct ? "Won" : "Lost"}</span><strong>${round.phase === "running" ? "Pending" : `${round.correct ? (round.amount * 2).toLocaleString() : "0"} AE`}</strong></div>`).join("") : `<div class="prediction-history-empty">${emptyMessage}</div>`}</div></section>`;
  }

  function renderGames(route) {
    const selected = route.endsWith("/roulette") ? "roulette" : route.endsWith("/prediction") ? "prediction" : "card-flip";
    const games = [{ id: "card-flip", title: "Card Flip", icon: "cards" }, { id: "roulette", title: "Roulette", icon: "roulette" }, { id: "prediction", title: "Prediction", icon: "chart" }];
    const content = selected === "roulette" ? renderRouletteGame() : selected === "prediction" ? renderPredictionGame() : renderCardFlipGame();
    return `<div class="game-workspace"><h1 class="visually-hidden">Choose a game</h1><nav class="game-switcher" aria-label="Choose a game">${games.map(game => `<a class="${selected === game.id ? "active" : ""}" href="${href(`/app/explore/games/${game.id}`)}" ${selected === game.id ? `aria-current="page"` : ""}><span class="icon-box purple">${icon(game.icon)}</span><span><strong>${game.title}</strong></span>${selected === game.id ? "" : icon("arrow")}</a>`).join("")}</nav>${content}</div>`;
  }

  function renderGetAe(route) {
    if (route.includes("/games")) return renderGames(route);
    if (previewState === "logged-out") return renderLoggedOutMissions();
    if (previewState === "onboarding" && route.endsWith("/daily")) return renderLockedMissions("Daily");
    if (previewState === "onboarding" && route.endsWith("/weekly")) return renderLockedMissions("Weekly");
    const mode = route.split("/").pop();
    const subnav = `<nav class="mission-subnav" aria-label="Mission period"><a class="${mode === "missions" ? "active" : ""}" href="${href("/app/explore/missions")}">All missions</a><a class="${mode === "daily" ? "active" : ""}" href="${href("/app/explore/daily")}">Daily</a><a class="${mode === "weekly" ? "active" : ""}" href="${href("/app/explore/weekly")}">Weekly</a></nav>`;
    return `${subnav}${renderGetAeOverview(mode)}`;
  }

  function renderLeaderboard(route) {
    const type = route.split("/").pop();
    if (type === "defi") {
      return `<section class="panel locked-state"><span class="auth-icon">${icon("lock")}</span><h2>DeFi ranking is not public on testnet.</h2><p>Onboarding contribution data is preserved for analysis, but user names, addresses, scores, and ranks remain hidden. This board is planned for Mainnet.</p><span class="pill">Available on Mainnet</span></section>`;
    }
    const rows = C.leaderboard[type] || C.leaderboard.overall;
    const unitLabel = type === "poa" ? "Net score" : "Contribution score";
    const context = type === "poa"
      ? `<div class="policy-note prominent">${icon("trophy")}<span><strong>14-Day Contributor Ranking.</strong> Rank is based on PoA Net Score and its tie-breakers. Top-100 settlement eligibility may be shown, but the payout budget, funding source, and cutoff are still pending approval.</span></div>`
      : `<div class="policy-note prominent">${icon("chart")}<span><strong>Campaign Contribution Ranking.</strong> This board compares valid AE earned during the campaign. Current AE balance is separate and may be lower after normal game spending.</span></div>`;
    const periodFilters = type === "poa"
      ? `<span class="pill mint">14-day round · Live</span><span class="filter-spacer"></span><select class="select-control"><option>Current round</option><option>Previous round</option></select>`
      : `<span class="pill mint">Season 03 · Live</span><span class="filter-spacer"></span><select class="select-control"><option>Season 03</option><option>Season 02</option></select>`;
    return `
      ${context}
      <div class="filter-row">${periodFilters}</div>
      <div class="leader-podium">
        ${rows.slice(0,3).map((row, index) => `<article class="panel podium-card ${index === 0 ? "first" : index === 1 ? "second" : "third"}"><span class="rank-medal">${row.rank}</span><h3>${row.label}</h3><p>${row.user}</p><strong>${row.value}</strong></article>`).join("")}
      </div>
      <div class="leader-layout">
        <section class="panel table-wrap"><table class="data-table"><thead><tr><th>Rank</th><th>User</th><th>Change</th><th style="text-align:right">${unitLabel}</th></tr></thead><tbody>${rows.map(row => `<tr><td class="rank">#${row.rank}</td><td><div class="user-cell"><span class="avatar">${row.label.slice(0,2).toUpperCase()}</span><div><strong>${row.label}</strong><small>${row.user}</small></div></div></td><td class="delta">${row.delta}</td><td class="value-cell">${row.value}</td></tr>`).join("")}</tbody></table></section>
        <aside class="panel my-rank-card"><span class="icon-box purple">${icon("trophy")}</span><h2>My rank</h2><div class="my-rank-number">#27</div><p>Top 18% of active users ${type === "poa" ? "this round" : "this campaign"}.</p><div class="rank-stat"><span>${type === "poa" ? "Net score" : "Contribution score"}</span><strong>${type === "poa" ? "128 pts" : "4,820 pts"}</strong></div><div class="rank-stat"><span>Next rank</span><strong>+240</strong></div><a class="button soft full" href="${href("/app/explore/missions")}">Find ways to contribute</a></aside>
      </div>`;
  }

  function renderMyOverview() {
    return `<div class="metric-banner compact"><div class="metric"><small>My AE</small><strong>12,450</strong></div><div class="metric"><small>Contribution</small><strong>4,820 pts</strong></div><div class="metric"><small>Streak</small><strong>18 days</strong></div></div>
      <div class="section-heading"><h2>Manage account</h2></div>
      <div class="grid three"><article class="panel quick-card"><span class="icon-box purple">${icon("bolt")}</span><h3>AE history</h3><p>Credits, entries, claims, refunds, and adjustments.</p><a class="text-link" href="${href("/app/my-page/ae-history")}">Open history ${icon("arrow")}</a></article><article class="panel quick-card"><span class="icon-box orange">${icon("users")}</span><h3>Connected accounts</h3><p>Wallet and social accounts used for verification.</p><a class="text-link" href="${href("/app/my-page/accounts")}">Manage ${icon("arrow")}</a></article><article class="panel quick-card"><span class="icon-box mint">${icon("shield")}</span><h3>NFT & boost status</h3><p>NFT profile, streak, and inactive legacy boosts.</p><a class="text-link" href="${href("/app/my-page/boost")}">View status ${icon("arrow")}</a></article></div>`;
  }

  function renderAeHistory() {
    const rows = [
      ["Sep 18, 2026", "Attendance", "Start Proof of Activity", "+100 AE", "Added"],
      ["Sep 18, 2026", "DeFi onboarding", "First eligible $50+ deposit", "+100 AE", "Added"],
      ["Sep 17, 2026", "Explore", "Card Flip entry", "−100 AE", "Settled"],
      ["Sep 17, 2026", "Explore", "Card Flip result", "+250 AE", "Claimed"],
      ["Sep 16, 2026", "Explore", "Roulette room not filled", "+100 AE", "Refunded"],
      ["Sep 14, 2026", "Adjustment", "Duplicate mission credit removed", "−100 AE", "Finalized"]
    ];
    return `<div class="metric-banner"><div class="metric"><small>Total active energy</small><strong>12,450 AE</strong></div><div class="metric"><small>Earned this season</small><strong>4,820 AE</strong></div><div class="metric"><small>Spent this season</small><strong>1,300 AE</strong></div><div class="metric"><small>Pending</small><strong>200 AE</strong></div></div>
      <div class="policy-note">${icon("bolt")}<span>AE History is an offchain ledger of additions, uses, claims, refunds, and adjustments. It is not a token transaction history.</span></div>
      <div class="filter-row" style="margin-top:20px"><input class="input" style="width:auto" value="Sep 01, 2026 — Sep 18, 2026" aria-label="Date range"><select class="select-control"><option>All types</option><option>Mission</option><option>Game</option><option>Referral</option></select><select class="select-control"><option>All statuses</option><option>Completed</option><option>Pending</option></select></div>
      <section class="panel table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows.map(row => `<tr>${row.map((cell, i) => `<td class="${i === 3 ? "value-cell" : ""}" style="${i === 3 ? "text-align:left" : ""}">${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></section>`;
  }

  function renderBoost() {
    return `<div class="metric-banner"><div class="metric"><small>Current streak</small><strong>18 days</strong></div><div class="metric"><small>Longest streak</small><strong>42 days</strong></div><div class="metric"><small>NFT profile</small><strong>Selected</strong></div><div class="metric"><small>Active payout boost</small><strong>None</strong></div></div><div class="policy-note">${icon("shield")}<span>Recurring Deposit AE is paused through the end of testnet, so legacy attendance and eligible NFT boost records have no current payout effect. They do not boost Attendance AE, onboarding AE, X Weekly AE, PoA score, or contribution score.</span></div><div class="section-heading"><div><h2>Profile and historical boost records</h2><p>Review identity, streak, and achievement states without implying an active AE multiplier.</p></div></div><div class="grid three"><article class="panel boost-card"><span class="icon-box mint">${icon("calendar")}</span><h3>Attendance streak</h3><p>Attendance resets at 00:00 UTC. A missed day restarts the current streak at 1, while the longest streak and 7/30/100-day milestones remain recorded.</p><div class="boost-value"><strong>18 days</strong><span class="pill mint">Active streak</span></div></article><article class="panel boost-card"><span class="icon-box purple">${icon("shield")}</span><h3>NFT profile</h3><p>Select an NFT you own as your avatar. Profile selection and boost eligibility are separate checks.</p><div class="boost-value"><strong>Selected</strong><button class="button soft" type="button" data-demo="NFT profile selector opened.">Change</button></div></article><article class="panel boost-card"><span class="icon-box">${icon("trophy")}</span><h3>Achievement SBT</h3><p>Earned achievements are stored as records. SBT claiming is a separate release and is not available yet.</p><div class="boost-value"><strong>Coming soon</strong><button class="button" type="button" disabled>Claim SBT</button></div></article></div>`;
  }

  function renderConnectedAccounts() {
    return `<div class="policy-note prominent">${icon("shield")}<span>Connected accounts support pseudonymous activity verification. Your wallet remains the primary RocX account identifier.</span></div><div class="grid two account-grid"><article class="panel account-card"><div class="account-main"><span class="icon-box purple">${icon("wallet")}</span><div><small>Primary wallet</small><h3>0xaeb5...f0b6</h3><p>Base Sepolia · Connected</p></div></div><span class="pill mint">Verified</span></article><article class="panel account-card"><div class="account-main"><span class="icon-box social-box">${socialIcon("X")}</span><div><small>Author account</small><h3>@explorer_rocx</h3><p>Used for ownership checks on registered links.</p></div></div><span class="pill mint">Connected</span></article><article class="panel account-card"><div class="account-main"><span class="icon-box social-box youtube">${socialIcon("YouTube")}</span><div><small>Author account</small><h3>YouTube</h3><p>Connect another source account for PoA registration.</p></div></div><button class="button" type="button" data-demo="YouTube connection flow opened.">Connect</button></article><article class="panel account-card"><div class="account-main"><span class="icon-box social-box">${socialIcon("TikTok")}</span><div><small>Author account</small><h3>TikTok</h3><p>Not connected.</p></div></div><button class="button" type="button" data-demo="TikTok connection flow opened.">Connect</button></article></div>`;
  }

  function renderActivityHistory() {
    return `<div class="policy-note prominent">${icon("orbit")}<span>PoA and Explore histories stay separate because they use different eligibility, evaluation, and settlement systems.</span></div><div class="grid two history-grid"><section class="panel">${panelHeader("PoA activity", "Registered sources and finalized contribution outcomes.", "14-day rounds")}<div class="mission-list"><div class="mission-row"><span class="icon-box purple">${icon("message")}</span><div class="mission-copy"><strong>Why liquidity routing matters</strong><p>Registered Sep 18 · X · Awaiting round finalization</p></div><span class="pill">In ranking</span></div><div class="mission-row"><span class="icon-box mint">${icon("vote")}</span><div class="mission-copy"><strong>Helpful evaluation</strong><p>Sep 18 · Wallet signed</p></div><span class="pill mint">Recorded</span></div></div></section><section class="panel">${panelHeader("Explore activity", "Game entries, results, claims, and refunds.", "Mission settlement")}<div class="mission-list"><div class="mission-row"><span class="icon-box orange">${icon("cards")}</span><div class="mission-copy"><strong>Card Flip</strong><p>Sep 17 · 100 AE entry · 80 AE returned</p></div><span class="pill">Settled</span></div><div class="mission-row"><span class="icon-box purple">${icon("roulette")}</span><div class="mission-copy"><strong>Roulette</strong><p>Sep 16 · Room not filled within 24 hours</p></div><span class="pill mint">Refunded</span></div></div></section></div>`;
  }

  function renderReferral() {
    return `<div class="policy-note prominent">${icon("lock")}<span><strong>Coming soon.</strong> Referral sharing is not available yet.</span></div><div class="referral-hero"><section class="panel referral-copy"><h2>Earn 500 AE for a qualified referral.</h2><p>The reward goes to the referrer after the invited wallet meets the approved deposit condition. Saving a code alone earns nothing.</p><div class="code-box"><input class="input" value="Referral code unavailable" readonly aria-label="Referral code"><button class="button primary" type="button" disabled>${icon("copy")} Locked</button></div></section><section class="panel referral-stats"><div><small>Status</small><strong>Locked</strong></div><div><small>Recipient</small><strong>Referrer</strong></div><div><small>Reward</small><strong>500 AE</strong></div><div><small>Rules</small><strong>Pending</strong></div></section></div>
      <div class="section-heading"><h2>Qualification</h2><span class="pill">Coming soon</span></div>
      <section class="panel table-wrap"><table class="data-table"><thead><tr><th>Step</th><th>What happens</th><th>AE effect</th><th>Status</th></tr></thead><tbody><tr><td>1</td><td>Referral code relationship is saved</td><td>No immediate reward</td><td><span class="pill">Planned</span></td></tr><tr><td>2</td><td>Invited wallet meets the configured deposit-observation rule</td><td>Eligibility check only</td><td><span class="pill orange">Config pending</span></td></tr><tr><td>3</td><td>Qualification is confirmed once</td><td>+500 AE to referrer</td><td><span class="pill">Coming soon</span></td></tr></tbody></table></section>`;
  }

  function renderAchievements() {
    return `<div class="policy-note prominent">${icon("trophy")}<span>Achievement badges are profile records and do not automatically add AE. Achievement SBT claiming is currently unavailable.</span></div><div class="grid three"><article class="panel boost-card"><span class="icon-box orange">${icon("trophy")}</span><h3>First Orbit</h3><p>Complete your first verified RocX mission.</p><div class="boost-value"><strong>Earned</strong><span class="pill mint">Sep 02</span></div></article><article class="panel boost-card"><span class="icon-box purple">${icon("message")}</span><h3>Useful Voice</h3><p>Receive 25 Helpful votes across your PoA activities.</p><div class="boost-value"><strong>38 / 25</strong><span class="pill mint">Earned</span></div></article><article class="panel boost-card"><span class="icon-box">${icon("orbit")}</span><h3>Achievement SBT</h3><p>Minting is a separate future release. Earning a badge does not issue an SBT automatically.</p><div class="boost-value"><strong>Coming soon</strong><button class="button" type="button" disabled>Claim SBT</button></div></article></div>`;
  }

  function renderSettings() {
    return `<section class="panel padded settings-list"><h2 style="font-size:19px;font-weight:500">Preferences</h2><div class="setting-row"><span class="icon-box">${icon("bolt")}</span><div class="setting-copy"><strong>AE activity notifications</strong><small>Receive updates when AE is earned, spent, claimed, refunded, or adjusted.</small></div><button class="toggle on" type="button" aria-label="Toggle AE notifications"></button></div><div class="setting-row"><span class="icon-box">${icon("message")}</span><div class="setting-copy"><strong>PoA feedback notifications</strong><small>Receive updates when your activity gets community feedback.</small></div><button class="toggle on" type="button" aria-label="Toggle PoA notifications"></button></div><div class="setting-row"><span class="icon-box">${icon("users")}</span><div class="setting-copy"><strong>Referral updates</strong><small>Receive updates when an invitation becomes qualified.</small></div><button class="toggle" type="button" aria-label="Toggle referral notifications"></button></div><div class="setting-row"><span class="icon-box">${icon("motion")}</span><div class="setting-copy"><strong>Reduced motion</strong><small>Minimize decorative motion across the interface.</small></div><button class="toggle" type="button" aria-label="Toggle reduced motion"></button></div></section>`;
  }

  function renderMyProfile() {
    const initial = escapeHtml(myProfileName.slice(0, 2).toUpperCase());
    return `<section class="panel my-profile-settings" aria-label="Profile settings">
      <div class="my-profile-settings-heading"><h2>Profile settings</h2><p>Manage the details shown on your RocX profile.</p></div>
      <div class="my-profile-setting">
        <div class="my-profile-setting-copy"><h2>Profile photo</h2><p>Choose how you appear across RocX.</p></div>
        <div class="my-profile-setting-control">
          <div class="my-profile-preview"><span class="my-profile-avatar">${myProfileAvatar ? `<img src="${myProfileAvatar}" alt="Profile photo">` : initial}</span><div class="my-profile-identity"><h2>${escapeHtml(myProfileName)}</h2><span class="pill">RocX Explorer</span></div></div>
          <div class="my-profile-photo-actions"><label class="button my-profile-upload" for="my-profile-photo">${icon("plus")} Change photo<input id="my-profile-photo" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Change profile photo"></label><button class="button" type="button" data-my-photo-remove ${myProfileAvatar ? "" : "disabled"}>Remove photo</button></div>
          <small class="my-profile-photo-note">JPG, PNG or WebP · up to 1 MB</small>
        </div>
      </div>
      <div class="my-profile-setting">
        <div class="my-profile-setting-copy"><h2>Profile name</h2><p>This name appears on your RocX profile.</p></div>
        <form class="my-profile-form my-profile-setting-control" data-my-profile-form><label for="my-profile-name">Display name</label><input class="input" id="my-profile-name" name="name" maxlength="24" required value="${escapeHtml(myProfileName)}"><button class="button primary" type="submit">Save name ${icon("check")}</button></form>
      </div>
      <div class="my-profile-setting">
        <div class="my-profile-setting-copy"><h2>Referral code</h2><p>Your code will appear here when referrals launch.</p></div>
        <div class="my-profile-setting-control"><input class="input" id="my-referral-code" aria-label="My referral code" value="Coming soon" readonly aria-describedby="my-referral-note"><small id="my-referral-note">Referral sharing is not available yet.</small></div>
      </div>
      <div class="my-profile-settings-footer"><a class="text-link" href="${href("/app/my-page/social")}">Manage social profiles ${icon("arrow")}</a></div>
    </section>`;
  }

  function renderMySbt() {
    const badges = [["First Deposit", "Make your first deposit", "wallet"], ["Seven Days", "Check in for seven days", "calendar"], ["Community Voice", "Contribute to PoA", "message"], ["Helpful Explorer", "Cast 100 helpful votes", "vote"], ["Beyond Orbit", "Complete Explore missions", "compass"], ["Energy Collector", "Build an AE activity record", "bolt"]];
    return `<section class="my-sbt-intro"><span class="icon-box purple">${icon("lock")}</span><div><h2>Your contribution, remembered.</h2><p>SBT issuance is coming later. These badges show the kinds of achievements you may unlock; none has been issued yet.</p></div><span class="pill">COMING SOON</span></section><div class="my-sbt-grid">${badges.map(([name, detail, symbol]) => `<article class="panel my-sbt-card"><span class="my-sbt-symbol">${icon(symbol)}</span><h3>${name}</h3><p>${detail}</p><span class="my-sbt-locked">${icon("lock")} Locked</span></article>`).join("")}</div>`;
  }

  const mySocialPlatforms = [
    { id: "x", name: "X", mark: "X", available: true },
    { id: "youtube", name: "YouTube", mark: "YouTube", available: true },
    { id: "tiktok", name: "TikTok", mark: "TikTok", available: true },
    { id: "threads", name: "Threads", mark: "Threads", available: true },
    { id: "instagram", name: "Instagram", mark: "◎", available: false },
    { id: "telegram", name: "Telegram", mark: "➤", available: false },
    { id: "reddit", name: "Reddit", mark: "r", available: false },
    { id: "facebook", name: "Facebook", mark: "f", available: false }
  ];

  function renderMySocial() {
    return `<section class="panel my-social-panel"><div class="my-social-heading"><h2>My social profiles</h2><p>Save public profile links in one place. A saved link is not an ownership verification or an OAuth connection.</p></div><div class="my-social-list">${mySocialPlatforms.map(platform => {
      const saved = mySocialProfiles[platform.id];
      const mark = platform.available ? socialIcon(platform.mark) : `<span class="my-social-glyph">${platform.mark}</span>`;
      return `<div class="my-social-row"><span class="my-social-mark ${platform.id}">${mark}</span><div class="my-social-copy"><strong>${platform.name}</strong><span>${saved ? escapeHtml(saved) : "Add a public profile link."}</span></div>${saved ? `<span class="pill mint">Profile saved</span><button class="button" type="button" data-my-social-edit="${platform.id}">Edit</button><button class="button" type="button" data-my-social-unlink="${platform.id}">Remove</button>` : `<button class="button soft" type="button" data-my-social-edit="${platform.id}">Add profile</button>`}</div>`;
    }).join("")}</div></section>`;
  }

  function renderMyPortfolio() {
    const positions = [["ethereum", "$3,000", "$2,500", "$300", "$5,200"], ["base", "$1,250", "$0", "$0", "$1,250"], ["arbitrum", "$750", "$0", "$0", "$750"], ["bnb", "$0", "$0", "$0", "$0"]];
    return `<div class="my-portfolio-stats"><article class="panel"><small>Total assets</small><strong>$7,500</strong><span>Wallet + supplied assets</span></article><article class="panel"><small>Total borrowed</small><strong>$300</strong><span>Across test networks</span></article><article class="panel"><small>Net assets</small><strong>$7,200</strong><span>Assets minus debt</span></article></div><section class="panel my-portfolio-table"><div class="my-portfolio-heading"><h2>Portfolio by network</h2><span class="pill">TESTNET</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Network</th><th>Wallet</th><th>Supplied</th><th>Borrowed</th><th>Net assets</th><th></th></tr></thead><tbody>${positions.map(([id, wallet, supplied, borrowed, net]) => { const network = NETWORKS.find(item => item.id === id); return `<tr class="${id === selectedNetwork ? "my-portfolio-selected" : ""}"><td><span class="my-network-name"><span class="network-token ${id}">${network.symbol}</span>${network.name}</span></td><td>${wallet}</td><td>${supplied}</td><td>${borrowed}</td><td class="value-cell">${net}</td><td><button class="button" type="button" data-my-portfolio-network="${id}">Manage ${icon("arrow")}</button></td></tr>`; }).join("")}</tbody></table></div></section>`;
  }

  function renderMyAe() {
    const active = previewState === "active";
    const history = [["Daily check-in", "Explore", "Sep 18 · 09:32", "+100 AE"], ["First eligible deposit", "DeFi", "Sep 18 · 08:10", "+100 AE"], ["Card Flip entry", "Explore", "Sep 17 · 16:20", "−100 AE"], ["Card Flip win claimed", "Explore", "Sep 17 · 16:21", "+250 AE"], ["Roulette room refunded", "Explore", "Sep 16 · 13:05", "+100 AE"]];
    return `<section class="my-ae-summary"><div><span>MY ACTIVE ENERGY</span><strong>${active ? C.product.aeBalance : "0"}<small> AE</small></strong><p>Available to use across RocX.</p></div><div class="my-ae-totals"><span>Earned this season <b>${active ? "4,820" : "0"} AE</b></span><span>Used this season <b>${active ? "1,300" : "0"} AE</b></span></div><span class="pill mint">${active ? "Active" : "Setup"}</span></section><div class="my-ae-sources"><article class="panel"><span>${icon("orbit")} DeFi</span><strong>${active ? "100 AE" : "0 AE"}</strong><small>Eligible deposits</small></article><article class="panel"><span>${icon("message")} PoA</span><strong>Pending</strong><small>Round settlement is not finalized</small></article><article class="panel"><span>${icon("compass")} Explore</span><strong>${active ? "4,720 AE" : "0 AE"}</strong><small>Missions and game results</small></article><article class="panel"><span>${icon("users")} Referral</span><strong>Locked</strong><small>Coming soon</small></article></div><section class="panel my-ae-history"><div class="my-portfolio-heading"><h2>AE activity</h2><span>Recent entries</span></div>${active ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Activity</th><th>Source</th><th>Time</th><th>AE</th></tr></thead><tbody>${history.map(row => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td class="value-cell">${row[3]}</td></tr>`).join("")}</tbody></table></div>` : `<div class="my-ae-empty">Complete onboarding to see your AE activity.</div>`}</section>`;
  }

  function renderMyPage(route) {
    if (previewState === "logged-out" && !route.endsWith("/sbt")) return `<section class="panel auth-gate">${icon("wallet")}<h2>Connect your wallet to open My Page.</h2><p>Your profile, portfolio, and AE history will appear here after connection.</p><button class="button primary large" type="button" data-connect>Connect Wallet</button></section>`;
    if (route.endsWith("/sbt")) return renderMySbt();
    if (route.endsWith("/social")) return renderMySocial();
    if (route.endsWith("/portfolio")) return renderMyPortfolio();
    if (route.endsWith("/ae")) return renderMyAe();
    return renderMyProfile();
  }

  function renderMyPageDialog() {
    if (!myPageDialog) return "";
    const platform = mySocialPlatforms.find(item => item.id === myPageDialog.platform);
    if (!platform) return "";
    const removing = myPageDialog.type === "unlink";
    return `<div class="flow-overlay my-page-dialog-overlay" data-my-dialog-overlay><section class="my-page-dialog" role="dialog" aria-modal="true" aria-labelledby="my-page-dialog-title"><div class="my-page-dialog-heading"><div><span class="eyebrow">SOCIAL PROFILE</span><h2 id="my-page-dialog-title">${removing ? `Remove ${platform.name} profile?` : `${platform.name} profile link`}</h2></div><button type="button" data-my-dialog-close aria-label="Close dialog">×</button></div>${removing ? `<p>This removes the saved profile link from My Page. It does not disconnect a verified account.</p><div class="my-page-dialog-actions"><button class="button" type="button" data-my-dialog-close>Cancel</button><button class="button primary" type="button" data-my-social-remove="${platform.id}">Remove link</button></div>` : `<p>Save your public profile URL. This does not verify account ownership or connect through OAuth.</p><form data-my-social-form="${platform.id}"><label for="my-social-url">Profile URL</label><input class="input" id="my-social-url" name="url" type="url" required placeholder="https://" value="${escapeHtml(mySocialProfiles[platform.id] || "")}"><button class="button primary large full" type="submit">Save profile link</button></form>`}</section></div>`;
  }

  function renderContent(section, route) {
    if (section === "defi") return renderDefi(route);
    if (section === "poa") return renderPoa(route);
    if (section === "explore") return renderGetAe(route);
    if (section === "leaderboard") return renderLeaderboard(route);
    if (section === "my-page") return renderMyPage(route);
    return renderGetAe("/app/explore/missions");
  }

  function renderFooter() {
    return `<footer class="footer"><span>© 2026 RocX</span><div class="footer-links"><a href="#" data-demo="Documentation is not available yet.">Docs</a><a href="#" data-demo="Terms of use are not available yet.">Terms</a><a href="#" data-demo="Privacy policy is not available yet.">Privacy</a></div></footer>`;
  }

  function renderMissionWidget() {
    const state = previewState === "logged-out"
      ? { title: "Connect to unlock missions", detail: "See every action and start collecting AE.", progress: "0 / 3 setup", pct: 0, reward: "+100 AE", action: `<button class="button primary full" type="button" data-connect>Connect wallet</button>` }
      : previewState === "onboarding"
        ? { title: "Deposit $50+ once", detail: "Complete setup to unlock recurring missions.", progress: "1 / 3 setup", pct: 33, reward: "+100 AE", action: `<a class="button primary full" href="${href("/app/defi/deposit")}">Continue ${icon("arrow")}</a>` }
        : { title: "Check in today", detail: "Sign once before the 00:00 UTC reset.", progress: "0 / 4 today", pct: 0, reward: "+100 AE", action: `<a class="button primary full" href="${href("/app/explore/missions")}">Open mission ${icon("arrow")}</a>` };

    if (!missionWidgetOpen) {
      return `<button class="mission-fab" type="button" data-mission-toggle aria-label="Open missions · next reward ${state.reward}"><span class="mission-fab-icon">${icon("compass")}</span><span class="mission-fab-reward">${icon("bolt")} ${state.reward}</span></button>`;
    }

    return `<aside class="mission-float" aria-label="Mission progress">
      <div class="mission-float-head"><span class="mission-float-symbol">${icon("compass")}</span><div><strong>Missions</strong></div><button type="button" data-mission-toggle aria-label="Minimize missions">×</button></div>
      <div class="mission-float-progress"><span>${state.progress}</span><div class="progress-track"><i style="width:${state.pct}%"></i></div></div>
      <div class="mission-float-next"><div><small>UP NEXT</small><strong>${state.title}</strong><p>${state.detail}</p></div><span class="mission-float-reward">${icon("bolt")} ${state.reward}</span></div>
      ${state.action}
      <a class="mission-float-all" href="${href("/app/explore/missions")}">View all missions ${icon("arrow")}</a>
    </aside>`;
  }

  function keepGameStateVisible(selector, previousScrollY) {
    window.scrollTo({ top: previousScrollY, behavior: "instant" });
    const target = document.querySelector(selector);
    if (!target) return;
    const bounds = target.getBoundingClientRect();
    const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height || 0;
    if (bounds.top < headerHeight + 12 || bounds.top > window.innerHeight - 180) {
      window.scrollTo({ top: window.scrollY + bounds.top - headerHeight - 12, behavior: "instant" });
    }
  }

  function openGameDialog(game) {
    const scrollY = window.scrollY;
    const amount = game === "roulette" ? 100 : gameBetAmounts[game];
    if (game === "card-flip" && (!amount || !gameSelections["card-flip"])) return;
    if (game === "prediction" && (!amount || !gameSelections.prediction)) return;
    const playCount = ++gamePlayCounts[game];
    if (game === "card-flip") {
      const outcomes = [["250%", 2.5], ["150%", 1.5], ["KEEP", 1], ["−20%", .8], ["−50%", .5]];
      const cardNumber = Number(gameSelections["card-flip"].slice(-2));
      const [effect, multiplier] = outcomes[(cardNumber + playCount - 2) % outcomes.length];
      const received = Math.round(amount * multiplier);
      gameDialog = { game, phase: "result", amount, selection: gameSelections["card-flip"], effect, received };
    } else if (game === "roulette") {
      const capacity = gameSelections.roulette.startsWith("8:1") ? 8 : 4;
      const filled = gameSelections.roulette === "4:1 Room A" ? 1 : capacity === 4 ? 2 : 5;
      rouletteRound = { game, phase: "waiting", amount, selection: gameSelections.roulette, seat: rouletteSeat, capacity, filled: filled + 1, won: playCount % 2 === 1 };
      rouletteHistory.unshift(rouletteRound);
      gameDialog = null;
    } else {
      const direction = gameSelections.prediction;
      const correct = playCount % 2 === 1;
      const opening = 80831.70;
      const closing = opening + (direction === "UP" ? correct ? 12.40 : -9.10 : correct ? -12.40 : 9.10);
      predictionRound = { game, phase: "running", amount, selection: direction, correct, opening, closing };
      predictionHistory.unshift(predictionRound);
      gameDialog = null;
    }
    render();
    keepGameStateVisible(game === "card-flip" ? ".card-flip-inline-result" : game === "prediction" ? ".prediction-running-card" : ".roulette-round-status", scrollY);
    if (game === "roulette") {
      clearTimeout(rouletteRoundTimer);
      clearTimeout(rouletteDrawTimer);
      const round = rouletteRound;
      rouletteRoundTimer = setTimeout(() => {
        if (rouletteRound !== round || round.phase !== "waiting") return;
        round.phase = "spinning";
        round.filled = round.capacity;
        render();
        keepGameStateVisible(".roulette-round-status", scrollY);
        rouletteDrawTimer = setTimeout(() => {
          if (rouletteRound !== round || round.phase !== "spinning") return;
          round.phase = "complete";
          gameDialog = { ...round, phase: "result" };
          render();
          keepGameStateVisible(".roulette-inline-result", scrollY);
        }, 1500);
      }, 2200);
    }
    if (game === "prediction") {
      clearTimeout(predictionRoundTimer);
      const round = predictionRound;
      predictionRoundTimer = setTimeout(() => {
        if (predictionRound !== round || round.phase !== "running") return;
        const currentScrollY = window.scrollY;
        round.phase = "result";
        gameDialog = { ...round };
        render();
        keepGameStateVisible(".prediction-inline-result", currentScrollY);
      }, 2800);
    }
  }

  function renderCardFlipReveal(round) {
    const cardNumber = round.selection.slice(-2);
    const tone = round.received > round.amount ? "gain" : round.received < round.amount ? "loss" : "keep";
    const net = round.received - round.amount;
    return `<section class="card-flip-inline-result card-reveal-stage ${tone}" role="status" aria-live="polite"><div class="card-reveal-scene" aria-hidden="true"><div class="card-reveal-flipper"><div class="card-reveal-face back"><span>R</span><small>${cardNumber}</small></div><div class="card-reveal-face front"><small>ROCX · CARD ${cardNumber}</small><span class="card-reveal-emblem">${icon("bolt")}</span><strong>${round.effect}</strong><span>${round.received.toLocaleString()} AE returned</span></div></div></div><div class="card-reveal-summary" aria-label="Card Flip result"><div><span>Bet</span><strong>${round.amount.toLocaleString()} AE</strong></div><div><span>AE received</span><strong>${round.received.toLocaleString()} AE</strong></div><div><span>Net vs. bet</span><strong class="${tone}">${net > 0 ? "+" : ""}${net.toLocaleString()} AE</strong></div></div><button class="button soft large card-reveal-replay" type="button" data-game-close>Play another</button></section>`;
  }

  function renderGameResult(game) {
    if (gameDialog?.game !== game) return "";
    const d = gameDialog;
    if (d.game === "card-flip") return renderCardFlipReveal(d);
    let eyebrow, title, description = "", visual, rows;
    if (d.game === "roulette") {
      const received = d.won ? d.capacity * 100 : 0;
      eyebrow = "DRAW COMPLETE";
      title = d.won ? "Your seat won!" : "Another seat won";
      visual = `<div class="game-modal-orbit">${icon("roulette")}<strong>${received} AE</strong><span>${d.won ? "WINNER PAYOUT" : "YOUR PAYOUT"}</span></div>`;
      rows = [["Full pool", `${d.capacity * 100} AE`], ["You receive", `${received} AE`]];
    } else {
      const received = d.correct ? Math.round(d.amount * 2) : 0;
      eyebrow = d.correct ? "RESULT · WON" : "RESULT · LOST";
      title = d.correct ? "Prediction correct" : "Prediction incorrect";
      visual = `<div class="game-modal-outcome ${d.correct ? "win" : "loss"}"><span class="result-symbol">${icon(d.correct ? "check" : "arrow")}</span><small>${d.correct ? "CLAIMABLE REWARD" : "NO REWARD THIS ROUND"}</small><strong>${received.toLocaleString()} AE</strong><div class="result-prices"><span>Open <b>$${d.opening.toLocaleString("en-US", { minimumFractionDigits: 2 })}</b></span><span>Close <b>$${d.closing.toLocaleString("en-US", { minimumFractionDigits: 2 })}</b></span></div></div>`;
      rows = [["Your call", d.selection], ["Bet amount", `${d.amount.toLocaleString()} AE`], ["Actual direction", d.closing > d.opening ? "UP" : "DOWN"], ["Claimable", `${received.toLocaleString()} AE`], ["Net vs. bet", `${received >= d.amount ? "+" : ""}${(received - d.amount).toLocaleString()} AE`]];
    }
    return `<section class="game-inline-result ${game}-inline-result" role="status" aria-live="polite"><div class="game-inline-result-top"><span class="pill mint">${eyebrow}</span></div>${visual}<h2>${title}</h2>${description ? `<p>${description}</p>` : ""}<div class="game-inline-result-rows">${rows.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</div><button class="button soft large game-inline-replay" type="button" data-game-close>Play another</button></section>`;
  }

  function previewRows() {
    if (!actionPreview) return "";
    if (actionPreview.rows?.length) return actionPreview.rows.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("");
    if (actionPreview.kind === "game") {
      const game = currentRoute().split("/").pop();
      return `<div><span>Selection</span><strong>${gameSelections[game] || "—"}</strong></div><div><span>Bet amount</span><strong>${(gameBetAmounts[game] || 100).toLocaleString()} AE</strong></div><div><span>Possible return</span><strong>${gamePotentialReturn(game, gameBetAmounts[game] || 100)}</strong></div>`;
    }
    if (actionPreview.kind === "defi") {
      const network = { base: "Base Sepolia", ethereum: "Ethereum Sepolia", arbitrum: "Arbitrum Sepolia", bnb: "BNB Testnet" }[selectedNetwork];
      return `<div><span>Product</span><strong>${currentRoute().split("/").pop()}</strong></div><div><span>Network</span><strong>${network}</strong></div><div><span>Confirmation</span><strong>Wallet signature required</strong></div>`;
    }
    if (actionPreview.kind === "poa") return `<div><span>Eligibility</span><strong>Connected account + wallet signature</strong></div><div><span>Result</span><strong>Recorded after validation</strong></div>`;
    return `<div><span>Current page</span><strong>${currentSection(currentRoute()).toUpperCase()}</strong></div><div><span>Next state</span><strong>${actionPreview.kind === "unavailable" ? "Not available yet" : "Review → confirm"}</strong></div>`;
  }

  function renderActionPreview() {
    if (!actionPreview) return "";
    if (actionPreview.kind === "asset") {
      const context = actionPreview.context;
      const isChain = context.startsWith("bridge-");
      const options = isChain ? ["Ethereum Sepolia", "Arbitrum Sepolia", "Base Sepolia", "BNB Testnet"] : ["ETH", "USDC", "USDT"];
      const balances = { ETH: "2.00 ETH", USDC: "3,500 USDC", USDT: "1,200 USDT" };
      return `<div class="flow-overlay asset-picker-overlay" data-flow-overlay><section class="asset-picker-modal" role="dialog" aria-modal="true" aria-labelledby="asset-picker-title"><div class="asset-picker-head"><div><span class="eyebrow">${isChain ? "BRIDGE NETWORK" : "SUPPORTED ASSETS"}</span><h2 id="asset-picker-title">${isChain ? "Select network" : "Select an asset"}</h2><p>${isChain ? "Choose a supported test network for this transfer." : "Choose the asset to use in this transaction."}</p></div><button type="button" data-flow-close aria-label="Close asset selection">×</button></div><div class="asset-picker-list">${options.map(option => `<button type="button" class="asset-picker-option ${selectedAssets[context] === option ? "selected" : ""}" data-flow-option="${option}" aria-pressed="${selectedAssets[context] === option}"><span class="${isChain ? "network-token " + option.split(" ")[0].toLowerCase() : "token-dot " + (option === "ETH" ? "" : "stable")}">${option === "ETH" || option.startsWith("Ethereum") ? "E" : option.startsWith("Arbitrum") ? "A" : option.startsWith("Base") || option.startsWith("BNB") ? "B" : "$"}</span><span><strong>${option}</strong><small>${isChain ? "Testnet" : `Available ${balances[option]}`}</small></span>${selectedAssets[context] === option ? icon("check") : icon("arrow")}</button>`).join("")}</div></section></div>`;
    }
    const completed = actionPreview.stage === "complete";
    return `<div class="flow-overlay" data-flow-overlay><section class="flow-sheet" role="dialog" aria-modal="true" aria-labelledby="flow-title"><div class="flow-sheet-top"><span class="pill ${completed ? "mint" : ""}">${completed ? "REVIEW COMPLETE" : "REVIEW ACTION"}</span><button type="button" data-flow-close aria-label="Close review">×</button></div><span class="flow-screen-icon">${icon(completed ? "check" : actionPreview.kind === "game" ? "cards" : actionPreview.kind === "defi" ? "wallet" : actionPreview.kind === "poa" ? "vote" : "arrow")}</span><h2 id="flow-title">${actionPreview.title}</h2><p>${completed ? "Return to the page to review another action." : actionPreview.description}</p>${completed ? "" : `<div class="flow-review"><small>REVIEW DETAILS</small>${previewRows()}</div>`}<div class="flow-sheet-actions">${completed || actionPreview.kind === "unavailable" ? `<button class="button primary large full" type="button" data-flow-close>Back to page</button>` : `<button class="button soft large" type="button" data-flow-close>Back</button><button class="button primary large" type="button" data-flow-confirm>Continue ${icon("arrow")}</button>`}</div></section></div>`;
  }

  function openActionPreview(title, description, kind = "general", rows = []) {
    actionPreview = { title, description, kind, rows, stage: "review" };
    const scrollY = window.scrollY;
    render();
    window.scrollTo(0, scrollY);
  }

  function assetContext(button) {
    const route = currentRoute();
    if (route.endsWith("/deposit")) return "deposit";
    if (route.endsWith("/borrow")) return "borrow";
    if (route.endsWith("/swap")) return button.closest(".swap-asset")?.querySelector("small")?.textContent.trim() === "To" ? "swap-to" : "swap-from";
    return button.closest(".bridge-asset")?.querySelector("small")?.textContent.trim() === "Destination chain" ? "bridge-destination" : "bridge-source";
  }

  function applyAssetSelections() {
    document.querySelectorAll(".asset-select").forEach(button => {
      const choice = selectedAssets[assetContext(button)];
      if (!choice) return;
      const chain = choice.includes("Sepolia") || choice.includes("Testnet");
      const letter = choice === "ETH" || choice.startsWith("Ethereum") ? "E" : choice.startsWith("Arbitrum") ? "A" : choice.startsWith("Base") || choice.startsWith("BNB") ? "B" : "$";
      button.innerHTML = `<span class="${chain ? "network-token " + choice.split(" ")[0].toLowerCase() : "token-dot " + (choice === "ETH" ? "" : "stable")}">${letter}</span>${choice}<span aria-hidden="true">⌄</span>`;
      button.setAttribute("aria-label", `Select ${chain ? "network" : "asset"}, current ${choice}`);
      button.removeAttribute("data-demo");
    });
  }

  function bindInteractions() {
    const menu = document.querySelector(".mobile-menu");
    const nav = document.getElementById("primary-nav");
    menu?.addEventListener("click", () => {
      nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
    });

    document.querySelector("[data-profile-toggle]")?.addEventListener("click", () => {
      const scrollY = window.scrollY;
      profileMenuOpen = !profileMenuOpen;
      networkMenuOpen = false;
      render();
      window.scrollTo(0, scrollY);
    });

    document.querySelector("[data-network-toggle]")?.addEventListener("click", () => {
      const scrollY = window.scrollY;
      networkMenuOpen = !networkMenuOpen;
      profileMenuOpen = false;
      render();
      window.scrollTo(0, scrollY);
    });

    document.querySelector("[data-disconnect]")?.addEventListener("click", () => {
      previewState = "logged-out";
      profileMenuOpen = false;
      render();
      showToast("Wallet disconnected.");
    });

    document.querySelector("[data-my-profile-form]")?.addEventListener("submit", event => {
      event.preventDefault();
      const name = event.currentTarget.elements.name.value.trim().slice(0, 24);
      if (!name) return;
      myProfileName = name;
      render();
      showToast("Profile changes saved.");
    });
    document.querySelector("#my-profile-photo")?.addEventListener("change", event => {
      const file = event.currentTarget.files?.[0];
      if (!file) return;
      if (!(["image/png", "image/jpeg", "image/webp"].includes(file.type)) || file.size > 1024 * 1024) {
        showToast("Choose a JPG, PNG or WebP image under 1 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => { myProfileAvatar = String(reader.result); render(); showToast("Profile photo updated."); };
      reader.readAsDataURL(file);
    });
    document.querySelector("[data-my-photo-remove]")?.addEventListener("click", () => { myProfileAvatar = null; render(); showToast("Profile photo removed."); });
    document.querySelectorAll("[data-my-social-edit]").forEach(button => button.addEventListener("click", () => { myPageDialog = { type: "social", platform: button.dataset.mySocialEdit }; render(); }));
    document.querySelectorAll("[data-my-social-unlink]").forEach(button => button.addEventListener("click", () => { myPageDialog = { type: "unlink", platform: button.dataset.mySocialUnlink }; render(); }));
    document.querySelectorAll("[data-my-dialog-close]").forEach(button => button.addEventListener("click", () => { myPageDialog = null; render(); }));
    document.querySelector("[data-my-dialog-overlay]")?.addEventListener("click", event => { if (event.target === event.currentTarget) { myPageDialog = null; render(); } });
    document.querySelector("[data-my-social-form]")?.addEventListener("submit", event => {
      event.preventDefault();
      const platform = event.currentTarget.dataset.mySocialForm;
      mySocialProfiles[platform] = event.currentTarget.elements.url.value.trim();
      myPageDialog = null;
      render();
      showToast("Profile link saved. Ownership is not verified.");
    });
    document.querySelector("[data-my-social-remove]")?.addEventListener("click", event => {
      delete mySocialProfiles[event.currentTarget.dataset.mySocialRemove];
      myPageDialog = null;
      render();
      showToast("Profile link removed.");
    });
    document.querySelectorAll("[data-my-portfolio-network]").forEach(button => button.addEventListener("click", () => {
      selectedNetwork = button.dataset.myPortfolioNetwork;
      selectedAssets["bridge-source"] = NETWORKS.find(network => network.id === selectedNetwork).name;
      window.localStorage.setItem("rocx-selected-network", selectedNetwork);
      window.location.hash = href("/app/defi/overview");
    }));

    document.querySelectorAll("[data-flow-close]").forEach(button => button.addEventListener("click", () => {
      const scrollY = window.scrollY;
      actionPreview = null;
      render();
      window.scrollTo(0, scrollY);
    }));

    document.querySelector("[data-flow-confirm]")?.addEventListener("click", () => {
      const scrollY = window.scrollY;
      actionPreview.stage = "complete";
      render();
      window.scrollTo(0, scrollY);
    });

    document.querySelectorAll("[data-flow-option]").forEach(button => button.addEventListener("click", () => {
      const scrollY = window.scrollY;
      selectedAssets[actionPreview.context] = button.dataset.flowOption;
      actionPreview = null;
      render();
      window.scrollTo(0, scrollY);
    }));

    document.querySelector("[data-flow-overlay]")?.addEventListener("click", event => {
      if (event.target !== event.currentTarget) return;
      const scrollY = window.scrollY;
      actionPreview = null;
      render();
      window.scrollTo(0, scrollY);
    });

    document.querySelectorAll("[data-preview-state]").forEach(button => button.addEventListener("click", () => {
      previewState = button.dataset.previewState;
      poaRegisterOpen = false;
      gameDialog = null;
      clearGameRounds();
      render();
    }));

    document.querySelectorAll("[data-mission-toggle]").forEach(button => button.addEventListener("click", () => {
      missionWidgetOpen = !missionWidgetOpen;
      render();
    }));

    document.querySelectorAll("[data-connect]").forEach(button => button.addEventListener("click", () => {
      previewState = "onboarding";
      window.location.hash = "/app/explore/missions";
      render();
      showToast("Wallet connected. Onboarding is ready.");
    }));

    document.querySelectorAll("[data-connect-game]").forEach(button => button.addEventListener("click", () => {
      previewState = "onboarding";
      render();
      showToast("Wallet connected. Complete setup to earn AE.");
    }));

    document.querySelectorAll("[data-network-select]").forEach(button => button.addEventListener("click", () => {
      const scrollY = window.scrollY;
      selectedNetwork = button.dataset.networkSelect;
      selectedAssets["bridge-source"] = NETWORKS.find(network => network.id === selectedNetwork).name;
      window.localStorage.setItem("rocx-selected-network", selectedNetwork);
      networkMenuOpen = false;
      render();
      window.scrollTo(0, scrollY);
    }));

    document.querySelectorAll("[data-lending-mode]").forEach(button => button.addEventListener("click", () => {
      const scrollY = window.scrollY;
      lendingModes[button.dataset.lendingKind] = button.dataset.lendingMode;
      render();
      window.scrollTo(0, scrollY);
    }));

    document.querySelectorAll("[data-lending-open]").forEach(button => button.addEventListener("click", () => {
      const mode = button.dataset.lendingOpen;
      const kind = mode === "Withdraw" ? "deposit" : "borrow";
      lendingModes[kind] = mode;
      window.location.hash = `/app/defi/${kind}`;
      render();
    }));

    document.querySelectorAll("[data-poa-platform]").forEach(button => button.addEventListener("click", () => {
      const scrollY = window.scrollY;
      poaPlatform = button.dataset.poaPlatform;
      render();
      window.scrollTo(0, scrollY);
    }));

    [["[data-poa-season]", value => { poaSeason = value; }], ["[data-poa-sector]", value => { poaSector = value; }], ["[data-poa-sort]", value => { poaSort = value; }]].forEach(([selector, update]) => {
      document.querySelector(selector)?.addEventListener("change", event => {
        const scrollY = window.scrollY;
        update(event.target.value);
        render();
        window.scrollTo(0, scrollY);
      });
    });
    document.querySelector("[data-poa-clear-filters]")?.addEventListener("click", () => {
      poaSeason = "Season 01";
      poaSector = "All sectors";
      poaPlatform = "All platforms";
      render();
    });
    document.querySelectorAll("[data-activity-vote]").forEach(button => button.addEventListener("click", () => {
      const scrollY = window.scrollY;
      const activityId = button.dataset.activityVote;
      const activity = C.activities.find(item => encodeURIComponent(item.title) === activityId);
      if (!activity) return;
      const current = poaActivityActions[activityId] || { vote: null, saved: activity.saved };
      const vote = current.vote === button.dataset.voteKind ? null : button.dataset.voteKind;
      poaActivityActions[activityId] = { ...current, vote };
      render();
      window.scrollTo(0, scrollY);
      showToast(vote ? (vote === "helpful" ? "Marked Helpful." : "Marked Not Helpful.") : "Evaluation removed.");
    }));
    document.querySelectorAll("[data-activity-bookmark]").forEach(button => button.addEventListener("click", () => {
      const scrollY = window.scrollY;
      const activityId = button.dataset.activityBookmark;
      const activity = C.activities.find(item => encodeURIComponent(item.title) === activityId);
      if (!activity) return;
      const current = poaActivityActions[activityId] || { vote: null, saved: activity.saved };
      poaActivityActions[activityId] = { ...current, saved: !current.saved };
      render();
      window.scrollTo(0, scrollY);
      showToast(current.saved ? "Bookmark removed." : "Activity saved.");
    }));
    document.querySelectorAll("[data-poa-register-open]").forEach(button => button.addEventListener("click", () => {
      if (previewState !== "active") {
        openActionPreview(previewState === "logged-out" ? "Connect to register" : "Complete onboarding first", previewState === "logged-out" ? "Connect your wallet and social account before registering an activity." : "Complete the account setup to unlock activity registration.", "unavailable");
        return;
      }
      poaRegisterOpen = true;
      poaRegisterStep = "form";
      render();
    }));
    document.querySelector("[data-poa-register-close]")?.addEventListener("click", () => { poaRegisterOpen = false; render(); });
    document.querySelector("[data-poa-register-overlay]")?.addEventListener("click", event => { if (event.target === event.currentTarget) { poaRegisterOpen = false; render(); } });
    document.querySelector("[data-poa-register-form]")?.addEventListener("submit", event => {
      event.preventDefault();
      const form = event.currentTarget;
      poaRegisterDraft = { platform: form.elements.platform.value, url: form.elements.url.value.trim(), sector: form.elements.sector.value };
      poaRegisterStep = "complete";
      render();
    });

    document.querySelectorAll("[data-bet-action]").forEach(button => button.addEventListener("click", () => {
      const scrollY = window.scrollY;
      const game = button.dataset.betGame;
      const current = gameBetAmounts[game] || 100;
      const action = button.dataset.betAction;
      gameBetAmounts[game] = action === "half" ? Math.max(100, Math.round(current / 2 / 10) * 10) : action === "double" ? Math.min(1000, current * 2) : action === "max" ? 1000 : Number(action);
      render();
      window.scrollTo(0, scrollY);
    }));

    document.querySelectorAll("[data-bet-input]").forEach(input => {
      input.addEventListener("input", () => syncGameBetInput(input));
      input.addEventListener("change", () => syncGameBetInput(input));
    });

    document.querySelectorAll("[data-game-selection]").forEach(button => button.addEventListener("click", () => {
      const scrollY = window.scrollY;
      gameSelections[button.dataset.game] = button.dataset.gameSelection;
      if (button.dataset.game === "roulette") rouletteSeat = button.dataset.gameSelection === "4:1 Room A" ? 2 : button.dataset.gameSelection === "4:1 Room B" ? 3 : 6;
      render();
      window.scrollTo(0, scrollY);
    }));

    document.querySelectorAll("[data-roulette-seat]").forEach(button => button.addEventListener("click", () => {
      const scrollY = window.scrollY;
      gameSelections.roulette = button.dataset.rouletteRoom;
      rouletteSeat = Number(button.dataset.rouletteSeat);
      render();
      window.scrollTo(0, scrollY);
    }));

    document.querySelectorAll("[data-game-play]").forEach(button => button.addEventListener("click", () => {
      openGameDialog(button.dataset.gamePlay);
    }));

    document.querySelectorAll("[data-prediction-bet]").forEach(button => button.addEventListener("click", () => {
      gameSelections.prediction = button.dataset.predictionBet;
      openGameDialog("prediction");
    }));

    document.querySelectorAll("[data-game-close]").forEach(button => button.addEventListener("click", () => {
      const scrollY = window.scrollY;
      gameDialog = null;
      clearGameRounds();
      render();
      window.scrollTo(0, scrollY);
    }));

    document.querySelectorAll("[data-complete-onboarding]").forEach(button => button.addEventListener("click", () => {
      previewState = "active";
      window.location.hash = "/app/explore/missions";
      render();
      showToast("Onboarding completed. Daily missions unlocked.");
    }));

    document.querySelectorAll("[data-locked]").forEach(button => button.addEventListener("click", () => {
      openActionPreview("Missions locked", "Complete onboarding to unlock these missions and their rewards.", "unavailable");
    }));

    document.querySelectorAll("[data-demo]").forEach(element => element.addEventListener("click", event => {
      if (element.tagName === "A" && element.getAttribute("href") === "#") event.preventDefault();
      const label = element.textContent.trim().replace(/\s+/g, " ") || element.getAttribute("aria-label") || "Action";
      const kind = /unavailable|coming soon|locked/i.test(element.dataset.demo) ? "unavailable" : currentSection(currentRoute()) === "defi" ? "defi" : currentSection(currentRoute()) === "poa" ? "poa" : "general";
      const rows = kind === "defi" && label.toLowerCase().includes("review")
        ? Array.from(document.querySelectorAll(".defi-workspace .transaction-details .detail-row, .swap-form .transaction-details .detail-row, .bridge-form .transaction-details .detail-row"), row => [row.querySelector("span")?.textContent.trim() || "Detail", row.querySelector("strong")?.textContent.trim() || "—"]).slice(0, 6)
        : [];
      openActionPreview(label, element.dataset.demo, kind, rows);
    }));

    document.querySelectorAll("[data-checkin]").forEach(button => button.addEventListener("click", () => {
      checkedIn = true;
      openActionPreview("Attendance complete", "Your daily check-in was recorded. The next check-in opens after 00:00 UTC.", "general");
    }));

    document.querySelectorAll(".segmented button:not([data-preview-state])").forEach(button => button.addEventListener("click", () => {
      button.parentElement.querySelectorAll("button").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
    }));

    document.querySelectorAll(".toggle").forEach(toggle => toggle.addEventListener("click", () => toggle.classList.toggle("on")));

    document.querySelector("[data-demo-form]")?.addEventListener("submit", event => {
      event.preventDefault();
      openActionPreview("Review PoA submission", "The next screen checks the URL, connected author account, daily limit, deposit eligibility, and wallet signature before registering the activity.", "poa");
    });

    document.querySelectorAll("[data-copy]").forEach(button => button.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(button.dataset.copy); } catch (_) { /* local file fallback */ }
      if (button.classList.contains("profile-address")) {
        showToast("Wallet address copied.");
        return;
      }
      button.innerHTML = `${icon("check")} Copied`;
      showToast("Referral code copied.");
    }));

    document.querySelectorAll("button:disabled").forEach(button => {
      if (!/Claim SBT|Locked/.test(button.textContent)) return;
      button.disabled = false;
      button.setAttribute("aria-disabled", "true");
      button.addEventListener("click", () => openActionPreview(button.textContent.trim(), "This feature is not available in the current testnet release. The next screen will explain eligibility and timing when the feature launches.", "unavailable"));
    });

    const handledButtons = "[data-profile-toggle],[data-network-toggle],[data-disconnect],[data-my-photo-remove],[data-my-social-edit],[data-my-social-unlink],[data-my-dialog-close],[data-my-social-remove],[data-my-portfolio-network],[data-flow-close],[data-flow-confirm],[data-flow-option],[data-preview-state],[data-mission-toggle],[data-connect],[data-connect-game],[data-network-select],[data-lending-mode],[data-lending-open],[data-poa-platform],[data-poa-clear-filters],[data-poa-register-open],[data-poa-register-close],[data-activity-vote],[data-activity-bookmark],[data-bet-action],[data-game-selection],[data-roulette-seat],[data-game-play],[data-prediction-bet],[data-game-close],[data-complete-onboarding],[data-locked],[data-demo],[data-checkin],[data-copy],[aria-disabled=true],.mobile-menu,.toggle,.segmented button,[type=submit]";
    document.querySelectorAll(`button:not(:disabled):not(${handledButtons})`).forEach(button => button.addEventListener("click", () => {
      const label = button.textContent.trim().replace(/\s+/g, " ") || button.getAttribute("aria-label") || "Selection";
      const isAsset = button.classList.contains("asset-select");
      if (isAsset) {
        actionPreview = { kind: "asset", context: assetContext(button) };
        const scrollY = window.scrollY;
        render();
        window.scrollTo(0, scrollY);
      } else {
        openActionPreview(label, `Review ${label.toLowerCase()} before confirming the action.`, currentSection(currentRoute()) === "defi" ? "defi" : "general");
      }
    }));
  }

  let toastTimer;
  function showToast(message) {
    const toast = document.querySelector(".toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function render() {
    const route = currentRoute();
    const section = currentSection(route);
    const poaFeedPage = section === "poa" && route === "/app/poa/feed";
    document.title = `RocX — ${C.primaryNav.find(item => item.section === section)?.label || "Explore"}`;
    app.innerHTML = `${renderHeader(section)}<main id="main"><div class="main-inner ${poaFeedPage ? "poa-feed-main" : ""}"><div class="page-layout ${section === "explore" ? "explore-layout" : section === "my-page" ? "my-page-layout" : ""} ${poaFeedPage ? "poa-feed-layout" : ""}">${renderSideNav(section, route)}<div class="page-column">${renderHero(section, route)}${renderContent(section, route)}</div></div>${renderFooter()}</div></main>${renderMissionWidget()}${renderActionPreview()}${renderPoaRegisterModal()}${renderMyPageDialog()}<div class="toast" role="status" aria-live="polite"></div>`;
    applyAssetSelections();
    bindInteractions();
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", () => { profileMenuOpen = false; networkMenuOpen = false; myPageDialog = null; actionPreview = null; poaRegisterOpen = false; gameDialog = null; clearGameRounds(); render(); });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || actionPreview?.kind !== "asset") return;
    actionPreview = null;
    render();
  });
  document.addEventListener("click", event => {
    if ((!profileMenuOpen || event.target.closest(".profile-wrap")) && (!networkMenuOpen || event.target.closest(".header-network-wrap"))) return;
    const scrollY = window.scrollY;
    profileMenuOpen = false;
    networkMenuOpen = false;
    render();
    window.scrollTo(0, scrollY);
  });
  window.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (!profileMenuOpen && !networkMenuOpen && !myPageDialog && !actionPreview && !gameDialog && !poaRegisterOpen) return;
    profileMenuOpen = false;
    networkMenuOpen = false;
    myPageDialog = null;
    actionPreview = null;
    poaRegisterOpen = false;
    gameDialog = null;
    const scrollY = window.scrollY;
    render();
    window.scrollTo(0, scrollY);
  });
  render();
}());
