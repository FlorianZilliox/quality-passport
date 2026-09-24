// Native share sheet (Teams, WhatsApp, mail… when installed); copies the text on desktop.
import { T, toast } from './ui.js';

const pageUrl = () => location.origin + location.pathname;

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast(T.copied);
  } catch {
    toast(text, 8000); // last resort: show it so it can be copied by hand
  }
}

export async function shareAchievement() {
  const data = { title: T.docTitle, text: T.shareText, url: pageUrl() };
  if (navigator.share) {
    try { await navigator.share(data); } catch (err) {
      if (err?.name !== 'AbortError') copy(`${T.shareText} ${pageUrl()}`);
    }
    return;
  }
  copy(`${T.shareText} ${pageUrl()}`);
}
