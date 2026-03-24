# Twitter Country Filter

A Chrome extension that attempts to filter tweets from your timeline based on the user's profile location.

## Prerequisites

*   Google Chrome (or a Chromium-based browser like Brave, Edge).
*   A Twitter/X account.

## Installation

Since this is a custom extension (not in the Chrome Web Store), you must install it manually using **Developer Mode**.

1.  **Download the Code**: Ensure you have all the project files (`manifest.json`, `background.js`, `content.js`, `popup.html`, etc.) in a single folder on your computer.
2.  **Open Extensions Management**:
    *   Open Chrome.
    *   Navigate to `chrome://extensions/` in the address bar.
3.  **Enable Developer Mode**:
    *   Look for the toggle switch named **"Developer mode"** in the top-right corner of the page and turn it **ON**.
4.  **Load the Extension**:
    *   Click the **"Load unpacked"** button that appeared in the top-left corner.
    *   Select the **folder** containing the project files.
5.  **Verify**: The "Twitter Country Filter" card should now appear in your list of extensions.

## How to Use

1.  **Pin the Extension**: Click the puzzle piece icon in your browser toolbar and pin "Twitter Country Filter" so the icon is visible.
2.  **Configure Blocklist**:
    *   Click the extension icon.
    *   Enter a country name (e.g., "Russia", "France") in the input box.
    *   Click **Add**.
3.  **Browse Twitter**:
    *   Go to `https://twitter.com` or `https://x.com`.
    *   As you scroll, the extension will attempt to check the location of tweet authors.
    *   If a location matches your blocklist, the tweet will be hidden.

## How it Works (Technical)

*   **HTML Scraping**: When a tweet appears, the extension takes the username and fetches their profile page (`https://x.com/username`) in the background.
*   **Parsing**: It looks for location text in the profile's HTML code.
*   **Filtering**: If the found location contains the text of a blocked country, the tweet is hidden.

## Troubleshooting

If it doesn't seem to be blocking tweets:
1.  **Check the Console**: Right-click on the Twitter page -> **Inspect** -> **Console** tab. You might see logs like "Found location..." or "Blocked tweet...".
2.  **Clear Cache**: If you updated your blocklist but tweets are still showing, open the extension popup and click **"Clear Location Cache"**.
3.  **Twitter Limits**: Twitter often blocks automated background requests (returning 400/429 errors or a login page). If the extension cannot read the profile page, it defaults to allowing the tweet.
