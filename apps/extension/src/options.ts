/** Options page: real settings persisted with chrome.storage. More in Stage 5. */

const notifications = document.getElementById(
  "notifications",
) as HTMLInputElement;
const askLocation = document.getElementById("askLocation") as HTMLInputElement;
const saved = document.getElementById("saved") as HTMLParagraphElement;

const DEFAULTS = { notifications: false, askLocation: true };

chrome.storage.sync.get(DEFAULTS, (items) => {
  notifications.checked = items.notifications as boolean;
  askLocation.checked = items.askLocation as boolean;
});

function persist() {
  chrome.storage.sync.set(
    { notifications: notifications.checked, askLocation: askLocation.checked },
    () => {
      saved.textContent = "Saved.";
      setTimeout(() => (saved.textContent = ""), 1500);
    },
  );
}

notifications.addEventListener("change", persist);
askLocation.addEventListener("change", persist);
