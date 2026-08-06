# Chrome Web Store Submission — Version 1.0.0

## Listing

**Name**

Verification Post Filter for X

**Summary**

Filters posts from blue, gold, or gray verified accounts on X, with whitelists and a read-only Following import.

**Category**

Productivity

**Detailed description**

Choose which verified-account posts you want to hide on X: blue Premium badges,
gold organization badges, or gray government badges.

Posts are hidden visually in your browser. The extension does not block network
requests, mute accounts, or change your X account.

Features:

- Independent filters for blue, gold, and gray verification badges.
- Filters embedded quoted posts from selected badge categories.
- A sidebar control that temporarily reveals filtered posts in the current tab.
- A manual whitelist for accounts that should always remain visible.
- An optional, read-only Following import so accounts you follow remain visible.
- Synced preferences and manual whitelist.
- No ads, analytics, tracking, remote code, or developer-operated servers.

The Following import only reads public usernames displayed while you scroll your
Following page. It never follows, unfollows, likes, posts, messages, or changes
anything public.

Not affiliated with X Corp. X and Twitter are trademarks of their respective owner.

## Privacy tab

**Single purpose**

Visually filter posts on X according to the verification badge category of the
post author, while allowing user-selected and followed accounts to remain
visible.

**Permission justification: storage**

Stores the enabled state, selected badge categories, and manual whitelist using
Chrome synchronized extension storage. Stores explicitly imported Following
usernames using local extension storage to avoid sync-size limits. The developer
cannot access this data.

**Permission justification: activeTab**

Used only after the user clicks Import Following in the extension popup, allowing
the popup to send a one-time command to the currently active X tab. It is not
used for background browsing or tracking.

**Host permission justification: x.com and twitter.com**

Required to inspect the rendered author badge and public username within X posts,
hide matching post elements, add the Verification Filter control, and perform the
user-initiated read-only Following import.

**Remote code**

No. All executable code is included in the extension package.

**Data categories to disclose**

- Personally identifiable information: public X usernames explicitly entered in
  the whitelist or explicitly imported from the user's Following page.
- Website content: rendered verification badges and public usernames are
  processed locally to provide filtering.

**Data handling**

- Data is used only for the extension's single purpose.
- Data is not sold or transferred.
- Data is not used for advertising, credit, lending, or unrelated purposes.
- Data is not made available for human review.
- No data is transmitted to the developer or third parties.
- Manual settings may sync through Chrome; imported Following usernames remain
  in Chrome local extension storage.

**Privacy-policy URL**

Host `privacy-policy.html` at a permanent public HTTPS URL and paste that URL
into the dashboard.

## Reviewer test instructions

1. Install the extension and open https://x.com/ while signed in.
2. Confirm that blue-badge posts are hidden by default.
3. Open the popup and enable or disable Blue/Premium, Gold/Organizations, and
   Gray/Government independently.
4. Confirm that posts and quoted posts from selected badge categories are hidden.
5. Click Verification Filter in X's left navigation and confirm filtered posts
   are temporarily revealed in that tab; click it again to resume.
6. Add a public username under Always show accounts and confirm that account's
   posts remain visible.
7. Click Import Following, scroll the central Following list, and save. Confirm
   the imported count appears and imported accounts remain visible.
8. Confirm Clear removes the imported Following list.
9. The extension requires no separate account, paid service, or reviewer
   credentials beyond access to X.

## Required screenshots

Capture the final installed build in Chrome at 1280 × 800:

1. X Home showing the Verification Filter row in the left navigation.
2. The extension popup showing all three badge-category controls.
3. The Following import panel with its account counter.

Use neutral, non-sensitive posts. Do not expose private messages, notifications,
email addresses, or personally identifying browser UI.
