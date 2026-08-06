# Verification Post Filter for X

A Chromium extension that visually hides posts on X according to the author's
verification badge. Blue/Premium filtering is enabled by default; gold
organization and gray government filters are optional.

Posts are hidden only in the browser. The extension does not block network
requests, mute accounts, or modify the user's X account.

## Features

- Independent filters for blue, gold, and gray verification badges.
- Filters embedded quoted posts from selected badge categories.
- A sidebar control temporarily reveals filtered posts in the current tab.
- A synced manual whitelist keeps selected accounts visible.
- A read-only Following import keeps followed accounts visible.
- No analytics, ads, tracking, remote code, or developer-operated servers.

## Install locally

1. Open `chrome://extensions` or `edge://extensions`.
2. Turn on **Developer mode**.
3. Choose **Load unpacked**.
4. Select this repository folder.
5. Refresh any open X tabs.

Use the toolbar popup to choose badge filters, manage the whitelist, or start a
read-only Following import.

Firefox users can follow the temporary-install and AMO packaging instructions in
[FIREFOX.md](FIREFOX.md).

## Privacy

Read the [privacy policy](PRIVACY.md). The Following import never follows,
unfollows, likes, posts, messages, or changes anything public on X.

## Notes

X can change its page markup. If badge detection stops working, selectors or
badge colors in `content.js` may require an update.

This project is not affiliated with X Corp.
