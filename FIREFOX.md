# Firefox build

The extension uses the same JavaScript and UI in Chromium and Firefox. Firefox
uses `manifest.firefox.json`, which adds a stable Gecko extension ID, requires
Firefox 140 or later, and declares that the add-on transmits no data.

On Firefox, settings and imported usernames use local extension storage. Nothing
is sent to the developer or to third parties.

## Test temporarily

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on**.
3. Choose `manifest.firefox.json`.
4. Open or refresh X.

For AMO submission, use the generated
`verification-post-filter-x-firefox-v1.0.0.zip`. Inside that archive, the
Firefox manifest is correctly named `manifest.json`.
