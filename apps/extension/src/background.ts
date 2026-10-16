/**
 * XTRIVO extension service worker (Stage 1 skeleton).
 * Stage 5 implements: eligible-resource detection, send-to-XTRIVO, progress.
 */

chrome.runtime.onInstalled.addListener((details) => {
  console.log(`[xtrivo] installed: ${details.reason}`);
});

chrome.action.onClicked.addListener(() => {
  // Popup handles the UI; this is a fallback log for action clicks.
  console.log("[xtrivo] action clicked");
});
