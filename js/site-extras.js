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
