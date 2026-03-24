// Content script for filtering tweets
console.log("Twitter Country Filter: Content script loaded");

const processedTweets = new Set();

function getUsernameFromTweet(tweetNode) {
    // Look for the user link, usually the second one in the header (first is avatar)
    // Or look for the @handle
    const userLink = tweetNode.querySelector('div[data-testid="User-Name"] a[href^="/"]');
    if (userLink) {
        const href = userLink.getAttribute('href');
        return href.substring(1); // Remove the leading slash
    }
    return null;
}

function processTweet(tweetNode) {
    if (processedTweets.has(tweetNode)) return;
    processedTweets.add(tweetNode);

    const username = getUsernameFromTweet(tweetNode);
    if (!username) return;

    chrome.runtime.sendMessage({
        type: 'CHECK_USER_LOCATION',
        username: username
    }, (response) => {
        if (chrome.runtime.lastError) {
            // console.error("Runtime error:", chrome.runtime.lastError);
            return;
        }
        if (response && response.shouldBlock) {
            // Hide the tweet
            tweetNode.style.display = 'none';
            console.log(`Blocked tweet from @${username} (${response.location})`);
        }
    });
}

function observeTimeline() {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check if the node itself is a tweet
                    if (node.tagName === 'ARTICLE' && node.getAttribute('data-testid') === 'tweet') {
                        processTweet(node);
                    }
                    // Check for tweets inside the node
                    const tweets = node.querySelectorAll('article[data-testid="tweet"]');
                    tweets.forEach(processTweet);
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Process initial tweets
    const initialTweets = document.querySelectorAll('article[data-testid="tweet"]');
    initialTweets.forEach(processTweet);
}

// Start observing when the page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeTimeline);
} else {
    observeTimeline();
}
