/**
 * Popup logic (Stage 1): validates the pasted URL with the same rules as
 * @xtrivo/core and reports honest errors. Real download handoff in Stage 5.
 */

const urlInput = document.getElementById("url") as HTMLInputElement;
const sendBtn = document.getElementById("send") as HTMLButtonElement;
const status = document.getElementById("status") as HTMLParagraphElement;

function isAllowedHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return (u.protocol === "http:" || u.protocol === "https:") && !!u.hostname;
  } catch {
    return false;
  }
}

sendBtn.addEventListener("click", () => {
  const value = urlInput.value;
  if (!isAllowedHttpUrl(value)) {
    status.textContent =
      "That doesn't look like a valid http(s) download link.";
    return;
  }
  // Stage 5: hand off to the desktop app / download engine.
  status.textContent = "Link looks valid. Download handoff arrives in Stage 5.";
});
