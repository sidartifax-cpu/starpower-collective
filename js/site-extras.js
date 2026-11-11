// ==========================================================
// StarPower Collective: newsletter signup + visitor analytics
// ==========================================================

// ---- 1) VISITOR STATS (Cloudflare Web Analytics, free, no cookies) ----
// Paste your Cloudflare Web Analytics token between the quotes below.
// Find it at dash.cloudflare.com → Analytics & Logs → Web Analytics → Add a site.
const CF_ANALYTICS_TOKEN = "ac8403916d7d4b80a63247c09da0e358";

(() => {
  if (!CF_ANALYTICS_TOKEN) return;
  const s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", JSON.stringify({ token: CF_ANALYTICS_TOKEN }));
  document.head.appendChild(s);
})();

// ---- 2) NEWSLETTER SIGNUP ("Get new interviews in your inbox") ----
(() => {
  document.querySelectorAll("form.signup-form").forEach(form => {
    const status = form.querySelector(".signup-status");
    const email = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (!email.value.trim() || !email.checkValidity()) {
        email.setAttribute("aria-invalid", "true");
        status.textContent = "Please enter a valid email address, like name@example.com.";
        email.focus();
        return;
      }
      email.removeAttribute("aria-invalid");
      button.disabled = true;
      status.textContent = "Signing you up…";
      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.querySelector(".signup-fields").hidden = true;
        status.textContent = "You're on the list. Thank you for keeping StarPower alive!";
      } catch (err) {
        console.error("Signup failed:", err);
        status.textContent = "Something went wrong. Please try again, or email starpower.collective@gmail.com.";
        button.disabled = false;
      }
    });
  });
})();

// ---- 3) SHARE BUTTONS ----
// Any element like <div class="share" data-share-url="..." data-share-text="..." data-share-image="..."></div>
// becomes a row of share buttons. Leave data-share-url empty to share the current page.
(() => {
  const ICONS = {
    facebook: '<path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.9c0-.6.3-.9 1-.9z"/>',
    x: '<path d="M17.8 3h3.3l-7.2 8.2L22.4 21h-6.6l-5.2-6.8L4.6 21H1.3l7.7-8.8L1 3h6.8l4.7 6.2L17.8 3zm-1.2 16h1.8L6.5 4.9H4.6L16.6 19z"/>',
    threads: '<path d="M16.7 11.1c-.1 0-.2-.1-.3-.1-.2-3-1.8-4.7-4.6-4.7-1.7 0-3.1.7-3.9 2l1.5 1c.6-.9 1.6-1.1 2.4-1.1 1 0 1.8.3 2.2.9.3.4.5 1 .6 1.7-.8-.1-1.7-.2-2.6-.1-2.6.1-4.3 1.7-4.2 3.8.1 1.1.6 2 1.5 2.6.8.5 1.8.8 2.9.7 1.4-.1 2.5-.6 3.3-1.6.6-.8 1-1.8 1.1-3 .7.4 1.2.9 1.4 1.6.5 1.1.5 3-1 4.5-1.3 1.3-2.9 1.9-5.3 1.9-2.6 0-4.6-.9-5.9-2.5C5 17.2 4.4 15 4.4 12.3s.6-4.9 1.8-6.4C7.5 4.3 9.5 3.4 12.1 3.4c2.6 0 4.7.9 6 2.5.7.8 1.2 1.8 1.5 2.9l1.8-.5c-.4-1.5-1-2.7-1.9-3.7C17.9 2.6 15.4 1.5 12.1 1.5h0C8.9 1.5 6.4 2.6 4.8 4.7 3.3 6.5 2.6 9.1 2.6 12.3s.7 5.7 2.2 7.6c1.6 2 4.1 3.1 7.3 3.1h0c2.9 0 4.9-.8 6.6-2.4 2.2-2.2 2.1-4.9 1.4-6.6-.5-1.2-1.6-2.3-3.4-2.9zm-4.6 4.6c-1.2.1-2.4-.5-2.5-1.5 0-.8.5-1.7 2.5-1.8h.6c.7 0 1.4.1 2 .2-.2 2.4-1.4 3-2.6 3.1z"/>',
    whatsapp: '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.7-.3-1.5-.7-2.3-1.6-.6-.6-1-1.3-1.1-1.5-.1-.2 0-.4.1-.5l.4-.5c.1-.1.2-.3.3-.4.1-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.9 2.3 1 2.5c.1.2 1.7 2.6 4.1 3.6.6.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.3-.2z"/>',
    pinterest: '<path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.7 2-2.7.9 0 1.4.7 1.4 1.6 0 1-.6 2.4-.9 3.7-.3 1.1.6 2 1.7 2 2 0 3.5-2.1 3.5-5.2 0-2.7-2-4.6-4.7-4.6-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 .8 2.6.1.1.1.2.1.3l-.3 1.2c0 .2-.2.3-.4.2-1.4-.7-2.3-2.7-2.3-4.4 0-3.6 2.6-6.9 7.5-6.9 3.9 0 7 2.8 7 6.6 0 3.9-2.5 7.1-5.9 7.1-1.2 0-2.2-.6-2.6-1.3l-.7 2.7c-.3 1-1 2.2-1.4 3A10 10 0 1 0 12 2z"/>',
    email: '<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 7.2L4 7.3V17h16V7.3l-8 4.9zM4.6 7l7.4 4.6L19.4 7H4.6z"/>',
    link: '<path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.3-3.3a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0zM8.5 19.5a4.2 4.2 0 0 1-3-7.1l2.4-2.4a1 1 0 0 1 1.4 1.4l-2.4 2.4a2.2 2.2 0 0 0 3.1 3.1l2.4-2.4a1 1 0 0 1 1.4 1.4l-2.4 2.4c-.8.8-1.9 1.2-2.9 1.2zm7-5.1a1 1 0 0 1-.7-1.7l2.4-2.4a2.2 2.2 0 0 0-3.1-3.1l-2.4 2.4a1 1 0 0 1-1.4-1.4l2.4-2.4a4.2 4.2 0 0 1 5.9 5.9l-2.4 2.4c-.2.2-.5.3-.7.3z"/>',
    more: '<path d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7l-6.7 3.4a3 3 0 1 0 0 3.2L15 17a3 3 0 1 0 3-1z"/>'
  };
  const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

  document.querySelectorAll(".share").forEach(box => {
    const url = box.dataset.shareUrl ? new URL(box.dataset.shareUrl, location.href).href : location.href.split("#")[0];
    const text = box.dataset.shareText || document.title;
    const image = box.dataset.shareImage ? new URL(box.dataset.shareImage, location.href).href : "";
    const label = box.dataset.shareLabel || "Share";
    const u = encodeURIComponent(url), t = encodeURIComponent(text);

    const links = [
      ["facebook", "Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}`],
      ["x", "X", `https://twitter.com/intent/tweet?text=${t}&url=${u}`],
      ["threads", "Threads", `https://www.threads.net/intent/post?text=${encodeURIComponent(text + " " + url)}`],
      ["whatsapp", "WhatsApp", `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`],
      ["pinterest", "Pinterest", `https://www.pinterest.com/pin/create/button/?url=${u}&description=${t}${image ? "&media=" + encodeURIComponent(image) : ""}`],
      ["email", "Email", `mailto:?subject=${t}&body=${encodeURIComponent(text + "\n\n" + url)}`]
    ];

    box.innerHTML = `<span class="share-label">${label}</span><ul class="share-list"></ul><span class="share-status" role="status" aria-live="polite"></span>`;
    const list = box.querySelector(".share-list");
    const status = box.querySelector(".share-status");

    if (navigator.share) {
      const li = document.createElement("li");
      li.innerHTML = `<button type="button" class="share-btn share-more">${svg("more")}<span>Share…</span></button>`;
      li.querySelector("button").addEventListener("click", () => {
        navigator.share({ title: text, text, url }).catch(() => {});
      });
      list.appendChild(li);
    }
    links.forEach(([key, name, href]) => {
      const li = document.createElement("li");
      const target = key === "email" ? "" : ' target="_blank" rel="noopener"';
      li.innerHTML = `<a class="share-btn share-${key}" href="${href}"${target} aria-label="Share on ${name}" title="${name}">${svg(key)}</a>`;
      list.appendChild(li);
    });
    const li = document.createElement("li");
    li.innerHTML = `<button type="button" class="share-btn share-link" aria-label="Copy link" title="Copy link">${svg("link")}</button>`;
    li.querySelector("button").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(url); status.textContent = "Link copied!"; }
      catch { status.textContent = url; }
      setTimeout(() => { status.textContent = ""; }, 3000);
    });
    list.appendChild(li);
  });
})();
