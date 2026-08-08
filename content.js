(() => {
  const HIDDEN = "data-hide-premium-x-post";
  const TWEETS = 'article[data-testid="tweet"], article[data-tweet-id], article[itemtype="https://schema.org/SocialMediaPosting"]';
  const AUTHOR = '[data-testid="User-Name"]';
  const BADGE = '[data-testid="icon-verified"], [aria-label="Verified account"], [data-icon^="icon-verified"]';
  const BADGE_COLORS = {
    blue: [29, 155, 240],
    gold: [255, 212, 0],
    gray: [130, 154, 171]
  };
  const USERNAME = /^[a-z0-9_]{1,15}$/i;
  const isFirefox = typeof browser !== "undefined" &&
    browser.runtime.getURL("").startsWith("moz-extension:");
  const settingsStorage = isFirefox ? chrome.storage.local : chrome.storage.sync;
  const settingsAreaName = isFirefox ? "local" : "sync";
  let enabled = true;
  let badgeFilters = { blue: true, gold: false, gray: false };
  let reveal = false;
  let whitelist = new Set();
  let followingAccounts = new Set();
  let importAccounts = null;
  let scheduled = false;

  const normalize = (value) => value.trim().replace(/^@/, "").toLowerCase();
  function matchesColor(color, target) {
    const rgb = color.match(/[\d.]+/g);
    return Boolean(rgb && rgb.length >= 3 &&
      target.every((value, index) => Math.abs(Number(rgb[index]) - value) <= 8));
  }
  function badgeType(badge) {
    const icon = badge.matches('[data-icon^="icon-verified"]')
      ? badge
      : badge.querySelector('[data-icon^="icon-verified"]');
    const iconName = icon?.getAttribute("data-icon") || "";
    if (iconName.includes("gold")) return "gold";

    const colors = [];
    for (const element of [badge, ...badge.querySelectorAll("svg, path, stop")]) {
      const style = getComputedStyle(element);
      colors.push(style.color, style.fill, element.getAttribute("fill"),
        element.getAttribute("stop-color"));
    }
    if (badge.parentElement) {
      const parentStyle = getComputedStyle(badge.parentElement);
      colors.push(parentStyle.color, parentStyle.fill);
    }
    const colorType = Object.keys(BADGE_COLORS).find((type) =>
      colors.some((color) => matchesColor(color, BADGE_COLORS[type]))
    );
    if (colorType) return colorType;
    if (iconName === "icon-verified") return "blue";
    return "gray";
  }
  function authorDetails(tweet) {
    const authors = [...tweet.querySelectorAll(AUTHOR)].map((element) => {
      for (const link of element.querySelectorAll('a[href^="/"]')) {
        const username = normalize(link.getAttribute("href")?.split("/")[1] || "");
        if (USERNAME.test(username)) return { element, username };
      }
      return { element, username: "" };
    });
    for (const person of tweet.querySelectorAll(
      '[itemprop="author"][itemtype="https://schema.org/Person"]'
    )) {
      const username = normalize(
        person.querySelector('meta[itemprop="alternateName"]')?.getAttribute("content") || ""
      );
      if (USERNAME.test(username)) {
        authors.push({ element: person.closest("article") || tweet, username });
      }
    }
    return authors;
  }
  function hasFilteredBadge(element) {
    return [...element.querySelectorAll(BADGE)].some((badge) => {
      const type = badgeType(badge);
      return type && badgeFilters[type];
    });
  }
  function shouldHide(tweet) {
    if (!enabled || reveal) return false;
    return authorDetails(tweet).some((author) =>
      !whitelist.has(author.username) && !followingAccounts.has(author.username) &&
      hasFilteredBadge(author.element)
    );
  }
  function scan() {
    scheduled = false;
    document.querySelectorAll(TWEETS).forEach((tweet) =>
      tweet.toggleAttribute(HIDDEN, shouldHide(tweet))
    );
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(scan);
  }
  function button() {
    return document.querySelector("#hide-premium-x-posts-control")
      ?.shadowRoot?.querySelector("button");
  }
  function refreshButton() {
    const control = button();
    if (!control) return;
    const active = enabled && !reveal;
    let tooltip;
    if (!enabled) {
      tooltip = "Verification Filter: Off — click to turn it on";
    } else if (reveal) {
      tooltip = "Verification Filter: Paused for this tab — click to resume";
    } else {
      tooltip = "Verification Filter: Active — click to show filtered posts";
    }
    control.querySelector("span").textContent = "Verification Filter";
    control.setAttribute("aria-pressed", String(active));
    control.setAttribute("aria-label", tooltip);
    control.title = tooltip;
  }
  function setEnabled(value) {
    enabled = value;
    if (!enabled) reveal = false;
    document.documentElement.classList.toggle("hide-premium-x-posts-enabled", enabled);
    refreshButton();
    schedule();
  }
  function addButton() {
    const existing = document.querySelector("#hide-premium-x-posts-control");
    const primaryNav = document.querySelector('header[role="banner"] nav');

    if (existing) {
      if (primaryNav && existing.previousElementSibling !== primaryNav) {
        existing.classList.remove("fallback");
        primaryNav.insertAdjacentElement("afterend", existing);
      }
      return;
    }

    const host = document.createElement("div");
    host.id = "hide-premium-x-posts-control";
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>
      :host{display:block;width:100%;margin:4px 0 6px;color:inherit}
      button{box-sizing:border-box;display:flex;align-items:center;gap:18px;width:100%;border:0;
        border-radius:9999px;background:transparent;color:inherit;padding:12px;
        font:400 20px/24px TwitterChirp,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
        cursor:pointer;text-align:left;white-space:nowrap}
      button:hover{background:rgb(239 243 244/10%)}
      button:focus-visible{outline:2px solid rgb(29,155,240);outline-offset:2px}
      svg{width:26px;height:26px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      span{overflow:hidden;text-overflow:ellipsis}
      @media(max-width:1280px){:host{width:52px}button{justify-content:center;padding:13px}span{display:none}}
      :host(.fallback){position:fixed;right:20px;bottom:20px;width:auto;z-index:2147483647}
      :host(.fallback) button{width:auto;border:1px solid rgb(83,100,113);background:rgb(15,20,25);color:white;box-shadow:0 2px 12px rgb(0 0 0/25%)}
      @media(max-width:700px){:host(.fallback){right:12px;bottom:72px}}
    </style><button type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16l-6.2 7.1v5.2l-3.6 1.8v-7L4 5Z"/></svg><span>Verification Filter</span></button>`;
    shadow.querySelector("button").addEventListener("click", () => {
      if (!enabled) return void settingsStorage.set({ enabled: true });
      reveal = !reveal;
      refreshButton();
      schedule();
    });

    if (primaryNav) {
      primaryNav.insertAdjacentElement("afterend", host);
    } else {
      host.classList.add("fallback");
      document.documentElement.appendChild(host);
    }
    refreshButton();
  }

  function collectFollowingAccounts() {
    if (!importAccounts) return;
    document.querySelectorAll('[data-testid="primaryColumn"] [data-testid="UserCell"]').forEach((cell) => {
      for (const link of cell.querySelectorAll('a[href^="/"]')) {
        const username = normalize(link.getAttribute("href")?.split("/")[1] || "");
        if (USERNAME.test(username)) {
          importAccounts.add(username);
          break;
        }
      }
    });
    const count = document.querySelector("#premium-following-import")?.shadowRoot?.querySelector("[data-count]");
    if (count) count.textContent = String(importAccounts.size);
  }

  function finishFollowingImport(save) {
    const host = document.querySelector("#premium-following-import");
    if (save && importAccounts) {
      chrome.storage.local.set({ followingAccounts: [...importAccounts].sort() });
    }
    importAccounts = null;
    host?.remove();
    if (location.hash === "#premium-filter-import") {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  function startFollowingImport() {
    if (document.querySelector("#premium-following-import")) return;
    importAccounts = new Set();
    const host = document.createElement("div");
    host.id = "premium-following-import";
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>
      :host{position:fixed;right:20px;bottom:20px;z-index:2147483647}
      div{width:280px;border:1px solid rgb(83,100,113);border-radius:16px;background:rgb(15,20,25);
        color:white;padding:16px;box-shadow:0 4px 20px rgb(0 0 0/35%);
        font:14px/20px TwitterChirp,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      strong{display:block;font-size:16px;margin-bottom:6px}p{margin:6px 0;color:rgb(139,152,165)}
      b{color:white}section{display:flex;gap:8px;margin-top:12px}
      button{border:0;border-radius:9999px;padding:8px 14px;font-weight:700;cursor:pointer}
      [data-save]{background:rgb(239,243,244);color:rgb(15,20,25)}
      [data-cancel]{background:transparent;color:white;border:1px solid rgb(83,100,113)}
    </style><div><strong>Import Following</strong>
      <p>Scroll through your Following page. Visible accounts are collected locally.</p>
      <p>Accounts found: <b data-count>0</b></p><section>
      <button data-save>Save Import</button><button data-cancel>Cancel</button>
      </section></div>`;
    shadow.querySelector("[data-save]").addEventListener("click", () => finishFollowingImport(true));
    shadow.querySelector("[data-cancel]").addEventListener("click", () => finishFollowingImport(false));
    document.documentElement.appendChild(host);
    collectFollowingAccounts();
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "start-following-import") return;
    const profileLink = document.querySelector('[data-testid="AppTabBar_Profile_Link"]');
    const username = normalize(profileLink?.getAttribute("href")?.split("/")[1] || "");
    if (!USERNAME.test(username)) {
      sendResponse({ ok: false, error: "Could not find your X profile link." });
      return;
    }
    sendResponse({ ok: true });
    location.assign(`/${username}/following#premium-filter-import`);
  });
  const style = document.createElement("style");
  style.textContent = `.hide-premium-x-posts-enabled article[${HIDDEN}]{display:none!important}`;
  (document.head || document.documentElement).appendChild(style);
  addButton();

  settingsStorage.get({ enabled: true, whitelist: [], badgeFilters: { blue: true, gold: false, gray: false } }, (saved) => {
    whitelist = new Set(saved.whitelist.map(normalize));
    badgeFilters = { blue: true, gold: false, gray: false, ...saved.badgeFilters };
    setEnabled(saved.enabled !== false);
  });
  chrome.storage.local.get({ followingAccounts: [] }, (saved) => {
    followingAccounts = new Set(saved.followingAccounts.map(normalize));
    schedule();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === settingsAreaName) {
      if (changes.enabled) setEnabled(changes.enabled.newValue !== false);
      if (changes.whitelist) {
        whitelist = new Set((changes.whitelist.newValue || []).map(normalize));
        schedule();
      }
      if (changes.badgeFilters) {
        badgeFilters = { blue: true, gold: false, gray: false, ...(changes.badgeFilters.newValue || {}) };
        schedule();
      }
    }
    if (area === "local" && changes.followingAccounts) {
      followingAccounts = new Set((changes.followingAccounts.newValue || []).map(normalize));
      schedule();
    }
  });
  new MutationObserver(() => {
    schedule();
    addButton();
    collectFollowingAccounts();
  }).observe(document.body, { childList: true, subtree: true });
  if (location.hash === "#premium-filter-import") startFollowingImport();
  schedule();
})();
