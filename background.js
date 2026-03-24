// Background script for fetching and caching user location data
console.log("Background script loaded");

const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper to get blocked countries
async function getBlockedCountries() {
    const result = await chrome.storage.local.get(['blockedCountries']);
    return result.blockedCountries || [];
}

// Helper to get cached location
async function getCachedLocation(username) {
    const result = await chrome.storage.local.get(['userLocations']);
    const cache = result.userLocations || {};
    const entry = cache[username];

    if (entry && (Date.now() - entry.timestamp < CACHE_EXPIRATION_MS)) {
        return entry.location;
    }
    return null;
}

// Helper to set cached location
async function setCachedLocation(username, location) {
    const result = await chrome.storage.local.get(['userLocations']);
    const cache = result.userLocations || {};
    cache[username] = {
        location: location,
        timestamp: Date.now()
    };
    await chrome.storage.local.set({ userLocations: cache });
}

// Fetch user profile and extract location
async function fetchUserLocation(username) {
    try {
        const response = await fetch(`https://x.com/${username}`, {
            credentials: 'include',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const text = await response.text();

        // Strategy 1: Look for the specific "location" field in the JSON blob (UserByScreenName)
        // Twitter often embeds this in a script tag with id="react-root" or similar, but regex is safer across versions
        // We look for the pattern: "location":"City, Country"
        // We also try to avoid "location" keys that might be part of other objects (like "location": { ... })
        const locationMatch = text.match(/"location"\s*:\s*"([^"]+)"/);

        if (locationMatch && locationMatch[1]) {
            console.log(`Found location for ${username}: ${locationMatch[1]}`);
            return locationMatch[1];
        }

        // Strategy 2: Look for "legacy" object which often contains the profile info
        // "legacy":{"created_at":"...","description":"...","location":"..."
        const legacyMatch = text.match(/"legacy"\s*:\s*\{[^}]*"location"\s*:\s*"([^"]+)"/);
        if (legacyMatch && legacyMatch[1]) {
             console.log(`Found legacy location for ${username}: ${legacyMatch[1]}`);
             return legacyMatch[1];
        }

        console.log(`No location found for ${username}`);
        return "Unknown";
    } catch (error) {
        console.error(`Error fetching location for ${username}:`, error);
        return "Error";
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CHECK_USER_LOCATION') {
        (async () => {
            const { username } = request;
            const blockedCountries = await getBlockedCountries();

            // 1. Check Cache
            let location = await getCachedLocation(username);

            // 2. Fetch if not cached
            if (!location) {
                location = await fetchUserLocation(username);
                await setCachedLocation(username, location);
            }

            // 3. Check if blocked
            // Simple substring match for now (e.g. "Russia" matches "Moscow, Russia")
            const shouldBlock = blockedCountries.some(country =>
                location.toLowerCase().includes(country.toLowerCase())
            );

            sendResponse({
                shouldBlock: shouldBlock,
                location: location
            });
        })();
        return true; // Keep channel open
    }
});
