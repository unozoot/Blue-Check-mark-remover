const enabledToggle = document.querySelector("#enabled");
const form = document.querySelector("#whitelist-form");
const usernameInput = document.querySelector("#username");
const list = document.querySelector("#whitelist");
const emptyState = document.querySelector("#empty-state");
const message = document.querySelector("#message");
const importButton = document.querySelector("#import-following");
const clearFollowingButton = document.querySelector("#clear-following");
const importStatus = document.querySelector("#import-status");
const followingCount = document.querySelector("#following-count");
const badgeFilterInputs = [...document.querySelectorAll("[data-badge-filter]")];
const USERNAME = /^[a-z0-9_]{1,15}$/i;
let whitelist = [];
const normalize = (value) => value.trim().replace(/^@/, "").toLowerCase();
const save = () => chrome.storage.sync.set({ whitelist });

function render() {
  list.replaceChildren();
  emptyState.hidden = whitelist.length > 0;
  whitelist.forEach((username) => {
    const item = document.createElement("li");
    const account = document.createElement("span");
    const remove = document.createElement("button");
    account.textContent = `@${username}`;
    remove.type = "button";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove @${username}`);
    remove.addEventListener("click", async () => {
      whitelist = whitelist.filter((entry) => entry !== username);
      await save();
      render();
      message.textContent = `Removed @${username}.`;
    });
    item.append(account, remove);
    list.append(item);
  });
}
chrome.storage.sync.get({ enabled: true, whitelist: [], badgeFilters: { blue: true, gold: false, gray: false } }, (saved) => {
  enabledToggle.checked = saved.enabled !== false;
  badgeFilterInputs.forEach((input) => {
    input.checked = saved.badgeFilters[input.dataset.badgeFilter] === true;
  });
  whitelist = [...new Set(saved.whitelist.map(normalize))].sort();
  render();
});
enabledToggle.addEventListener("change", () =>
  chrome.storage.sync.set({ enabled: enabledToggle.checked })
);
badgeFilterInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const badgeFilters = Object.fromEntries(
      badgeFilterInputs.map((entry) => [entry.dataset.badgeFilter, entry.checked])
    );
    chrome.storage.sync.set({ badgeFilters });
  });
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = normalize(usernameInput.value);
  if (!USERNAME.test(username)) return void (message.textContent = "Enter a valid X username.");
  if (whitelist.includes(username)) return void (message.textContent = `@${username} is already listed.`);
  whitelist = [...whitelist, username].sort();
  await save();
  render();
  form.reset();
  usernameInput.focus();
  message.textContent = `Added @${username}.`;
});

chrome.storage.local.get({ followingAccounts: [] }, (saved) => {
  followingCount.textContent = String(saved.followingAccounts.length);
});

importButton.addEventListener("click", async () => {
  importStatus.textContent = "Opening your Following page...";
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !/^https:\/\/(x|twitter)\.com\//.test(tab.url || "")) {
    importStatus.textContent = "Open X in this tab first, then try again.";
    return;
  }
  chrome.tabs.sendMessage(tab.id, { type: "start-following-import" }, (response) => {
    if (chrome.runtime.lastError || !response?.ok) {
      importStatus.textContent = response?.error || "Refresh X and try again.";
    }
  });
});

clearFollowingButton.addEventListener("click", async () => {
  await chrome.storage.local.set({ followingAccounts: [] });
  followingCount.textContent = "0";
  importStatus.textContent = "Imported accounts cleared.";
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.followingAccounts) {
    followingCount.textContent = String((changes.followingAccounts.newValue || []).length);
  }
});