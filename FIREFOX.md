# Firefox build

The extension uses the same JavaScript and UI in Chromium and Firefox. Firefox
uses `manifest.firefox.json`, which adds a stable Gecko extension ID, requires
Firefox 140 or later on desktop and Firefox for Android 142 or later, and
declares that the add-on transmits no data.

On Firefox, settings and imported usernames use local extension storage. Nothing
is sent to the developer or to third parties.

## Test temporarily

1. Extract `verification-post-filter-x-firefox-v1.0.0.zip` to a temporary
   folder.
2. Open `about:debugging#/runtime/this-firefox`.
3. Select **Load Temporary Add-on**.
4. Choose the extracted `manifest.json`.
5. Open or refresh X.

For AMO submission, upload the generated
`verification-post-filter-x-firefox-v1.0.0.zip` without extracting it. Inside
that archive, the Firefox manifest is correctly named `manifest.json`.
