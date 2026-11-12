// =====================================================
// Nu Soul Hwy Radio — live player powered by radio.co
// Public data feed (no API key): https://public.radio.co
// =====================================================
(() => {
  const STATION = "s8dd253f7b";
  const STREAM = `https://streamer.radio.co/${STATION}/listen`;
  const API = `https://public.radio.co/stations/${STATION}`;
  const STATION_NAME = "Nu Soul Hwy Radio";
  const FALLBACK_ART = "/images/star-power-logo.png";
  const POLL_MS = 30000;

  const bar = document.querySelector("#np-bar");
  if (!bar) return;

  const el = {
    play: bar.querySelector(".np-play"),
    art: bar.querySelector(".np-art"),
    badge: bar.querySelector(".np-badge"),
    title: bar.querySelector(".np-title"),
    sub: bar.querySelector(".np-sub"),
    volume: bar.querySelector(".np-volume"),
    toggle: bar.querySelector(".np-toggle"),
    panel: bar.querySelector(".np-panel"),
    next: bar.querySelector(".np-next"),
    history: bar.querySelector(".np-history"),
    status: bar.querySelector(".np-status")
  };

  const audio = new Audio();
  audio.preload = "none";
  let wantPlaying = false;
  let lastTitle = "";
  let stationArt = "";
  let nowSharing = { parsed: { show: STATION_NAME, guest: "" }, link: "" };

  // ---------- title cleanup ----------
  const SMALL = new Set(["a", "an", "and", "of", "the", "to", "in", "on", "for"]);
  const titleCase = s =>
    s.toLowerCase().replace(/\b[\w']+\b/g, (w, i) =>
      i > 0 && SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)
    ).replace(/\bPt\b/g, "Pt.").replace(/\bDj\b/g, "DJ");

  function parseTitle(raw) {
    let t = (raw || "").replace(/\s+/g, " ").trim();
    let show = STATION_NAME;
    if (/starpower|\bspc\b/i.test(t)) show = "StarPower Collective";
    else if (/harlem ?world|\bhwr\b/i.test(t)) show = "HarlemWorld Radio";

    let guest = t
      .replace(/harlem ?world radio presents\.*\s*-?/gi, "")
      .replace(/harlem ?world radio\s*-?/gi, "")
      .replace(/star ?power collective presents/gi, "")
      .replace(/star ?power collective\s*-?/gi, "")
      .replace(/\bspc\b/gi, "")
      .replace(/\bhwr\b/gi, "")
      .replace(/\b(mst|re ?edit)\b/gi, "")
      .replace(/\b\d{1,2}[.\/]\d{1,2}[.\/]\d{2,4}\b/g, "")
      .replace(/\.{2,}/g, " ")
      .replace(/^[\s\-–·]+|[\s\-–·]+$/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    guest = guest ? titleCase(guest) : "";
    return { show, guest, display: guest ? `${show} · ${guest}` : show };
  }

  // ---------- artwork + Wall matching ----------
  const norm = s => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const wallItems = [...document.querySelectorAll(".wall-item")].map(li => ({
    li,
    key: norm(li.querySelector(".wall-name")?.textContent),
    src: li.querySelector("img")?.getAttribute("src")
  })).filter(w => w.key.length >= 3);

  function matchWall(guest) {
    const g = norm(guest);
    if (g.length < 3) return null;
    return wallItems.find(w => g.includes(w.key) || w.key.includes(g)) || null;
  }

  function markOnAir(match) {
    document.querySelectorAll(".wall-item.on-air").forEach(li => li.classList.remove("on-air"));
    if (match) match.li.classList.add("on-air");
  }

  function pickArt(parsed, apiArt) {
    const match = matchWall(parsed.guest);
    if (match) return { src: match.src, match };
    if (parsed.show === "StarPower Collective") return { src: FALLBACK_ART, match: null };
    return { src: apiArt || stationArt || FALLBACK_ART, match: null };
  }

  // ---------- rendering ----------
  function setArt(src) {
    if (el.art.getAttribute("src") !== src) el.art.src = src;
  }

  function renderStatus(data) {
    const live = data?.source?.type === "live";
    const online = data?.status === "online";
    stationArt = data?.logo_url || stationArt;

    el.badge.textContent = !online ? "Off Air" : live ? "LIVE" : "On Rotation";
    el.badge.classList.toggle("is-live", live && online);
    bar.classList.toggle("is-offline", !online);

    const raw = data?.current_track?.title || "";
    const parsed = parseTitle(raw);
    el.title.textContent = parsed.guest || parsed.show;
    el.sub.textContent = parsed.guest ? `${parsed.show} · ${STATION_NAME}` : STATION_NAME;

    const art = pickArt(parsed, data?.current_track?.artwork_url_large);
    nowSharing = { parsed, link: art.match?.li.querySelector("a[href]")?.href || "" };
    setArt(art.src);
    el.art.alt = parsed.guest ? `Now playing: ${parsed.guest}` : `${STATION_NAME} logo`;
    markOnAir(art.match);

    if (raw && raw !== lastTitle) {
      lastTitle = raw;
      updateMediaSession(parsed, art.src);
    }

    const hist = (data?.history || []).slice(1, 11);
    el.history.innerHTML = "";
    hist.forEach(h => {
      const p = parseTitle(h.title);
      const li = document.createElement("li");
      li.textContent = p.display;
      el.history.appendChild(li);
    });
    if (!hist.length) el.history.innerHTML = "<li>No recent shows yet.</li>";
  }

  function renderNext(data) {
    const raw = data?.next_track?.title;
    el.next.textContent = raw ? parseTitle(raw).display : "To be announced";
  }

  function updateMediaSession(parsed, artSrc) {
    if (!("mediaSession" in navigator)) return;
    const abs = new URL(artSrc, location.href).href;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: parsed.guest || parsed.show,
      artist: parsed.guest ? parsed.show : STATION_NAME,
      album: STATION_NAME,
      artwork: [{ src: abs, sizes: "512x512" }]
    });
  }

  // ---------- data ----------
  async function getJSON(path) {
    const res = await fetch(`${API}/${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`radio.co ${path}: ${res.status}`);
    return res.json();
  }

  let pollTimer;
  async function refresh() {
    try {
      const [status, next] = await Promise.all([
        getJSON("status"),
        getJSON("next").catch(() => null)
      ]);
      renderStatus(status);
      renderNext(next);
    } catch (err) {
      console.warn("Now-playing info unavailable:", err);
      el.sub.textContent = STATION_NAME;
    }
  }
  function startPolling() {
    clearInterval(pollTimer);
    refresh();
    pollTimer = setInterval(() => { if (!document.hidden) refresh(); }, POLL_MS);
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });

  // ---------- playback ----------
  function setPlayingUI(playing) {
    bar.classList.toggle("is-playing", playing);
    el.play.setAttribute("aria-pressed", String(playing));
    el.play.setAttribute("aria-label", playing ? `Pause ${STATION_NAME}` : `Play ${STATION_NAME}`);
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }

  async function play() {
    wantPlaying = true;
    // Reload the source each time so listeners rejoin the live broadcast, not a stale buffer.
    audio.src = `${STREAM}?t=${Date.now()}`;
    el.status.textContent = `Connecting to ${STATION_NAME}…`;
    try {
      await audio.play();
    } catch (err) {
      wantPlaying = false;
      setPlayingUI(false);
      el.status.innerHTML = `Playback couldn't start. <a href="${STREAM}" target="_blank" rel="noopener">Open the stream directly</a>.`;
    }
  }

  function pause() {
    wantPlaying = false;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    setPlayingUI(false);
    el.status.textContent = "Paused.";
  }

  audio.addEventListener("playing", () => {
    setPlayingUI(true);
    el.status.textContent = `You're listening to ${STATION_NAME}.`;
  });
  audio.addEventListener("waiting", () => { if (wantPlaying) el.status.textContent = "Buffering…"; });
  audio.addEventListener("error", () => {
    if (!wantPlaying) return;
    wantPlaying = false;
    setPlayingUI(false);
    el.status.innerHTML = `The stream is unavailable right now. <a href="${STREAM}" target="_blank" rel="noopener">Try opening it directly</a>.`;
  });

  el.play.addEventListener("click", () => (wantPlaying ? pause() : play()));
  document.querySelectorAll("[data-radio-play]").forEach(btn =>
    btn.addEventListener("click", () => { if (!wantPlaying) play(); })
  );

  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", play);
    navigator.mediaSession.setActionHandler("pause", pause);
    navigator.mediaSession.setActionHandler("stop", pause);
  }

  // ---------- volume ----------
  const savedVol = (() => { try { return parseFloat(localStorage.getItem("np-volume")); } catch { return NaN; } })();
  audio.volume = Number.isFinite(savedVol) ? savedVol : 0.9;
  if (el.volume) {
    el.volume.value = audio.volume;
    el.volume.addEventListener("input", () => {
      audio.volume = parseFloat(el.volume.value);
      try { localStorage.setItem("np-volume", el.volume.value); } catch {}
    });
  }

  // ---------- details panel ----------
  el.toggle.addEventListener("click", () => {
    const open = el.panel.hidden;
    el.panel.hidden = !open;
    el.toggle.setAttribute("aria-expanded", String(open));
    el.toggle.textContent = open ? "Hide" : "Up next";
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !el.panel.hidden) el.toggle.click();
  });

  // ---------- share what's playing ----------
  const SITE = "https://starpowercollective.com/";
  const shareBtn = document.createElement("button");
  shareBtn.type = "button";
  shareBtn.className = "np-share";
  shareBtn.setAttribute("aria-haspopup", "true");
  shareBtn.setAttribute("aria-expanded", "false");
  shareBtn.setAttribute("aria-label", "Share what's playing");
  shareBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7l-6.7 3.4a3 3 0 1 0 0 3.2L15 17a3 3 0 1 0 3-1z"/></svg><span>Share</span>';
  el.toggle.before(shareBtn);

  const pop = document.createElement("div");
  pop.className = "np-share-pop";
  pop.hidden = true;
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-label", "Share what's playing");
  bar.appendChild(pop);

  function shareInfo() {
    const p = nowSharing.parsed;
    const url = nowSharing.link || SITE;
    const what = p.guest ? `${p.guest} on ${p.show}` : STATION_NAME;
    const text = p.guest
      ? `I'm listening to ${what}, live on ${STATION_NAME}. Tune in:`
      : `I'm listening to ${STATION_NAME} from StarPower Collective. Tune in:`;
    return { url, text, what };
  }

  const ICON = {
    facebook: 'M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.9c0-.6.3-.9 1-.9z',
    x: 'M17.8 3h3.3l-7.2 8.2L22.4 21h-6.6l-5.2-6.8L4.6 21H1.3l7.7-8.8L1 3h6.8l4.7 6.2L17.8 3zm-1.2 16h1.8L6.5 4.9H4.6L16.6 19z',
    whatsapp: 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z',
    threads: 'M12.1 1.5C8.9 1.5 6.4 2.6 4.8 4.7 3.3 6.5 2.6 9.1 2.6 12.3s.7 5.7 2.2 7.6c1.6 2 4.1 3.1 7.3 3.1 2.9 0 4.9-.8 6.6-2.4 2.2-2.2 2.1-4.9 1.4-6.6-.5-1.2-1.6-2.3-3.4-2.9-.2-3-1.8-4.7-4.6-4.7-1.7 0-3.1.7-3.9 2l1.5 1c.6-.9 1.6-1.1 2.4-1.1 1.5 0 2.6.8 2.8 2.6-.8-.1-1.7-.2-2.6-.1-2.6.1-4.3 1.7-4.2 3.8.1 2.1 2 3.4 4.4 3.3 2.9-.2 4.3-2.3 4.4-4.6.7.4 1.2.9 1.4 1.6.5 1.1.5 3-1 4.5-1.3 1.3-2.9 1.9-5.3 1.9-2.6 0-4.6-.9-5.9-2.5C5 17.2 4.4 15 4.4 12.3s.6-4.9 1.8-6.4C7.5 4.3 9.5 3.4 12.1 3.4c2.6 0 4.7.9 6 2.5.7.8 1.2 1.8 1.5 2.9l1.8-.5c-.4-1.5-1-2.7-1.9-3.7C17.9 2.6 15.4 1.5 12.1 1.5zm.6 12.7c.8 0 1.4.1 2 .2-.2 2.4-1.4 3-2.6 3.1-1.2.1-2.4-.5-2.5-1.5 0-.8.5-1.7 2.5-1.8h.6z',
    email: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 7.2L4 7.3V17h16V7.3l-8 4.9zM4.6 7l7.4 4.6L19.4 7H4.6z',
    link: 'M10.6 13.4a1 1 0 0 1 0-1.4l3.3-3.3a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0zM8.5 19.5a4.2 4.2 0 0 1-3-7.1l2.4-2.4a1 1 0 0 1 1.4 1.4l-2.4 2.4a2.2 2.2 0 0 0 3.1 3.1l2.4-2.4a1 1 0 0 1 1.4 1.4l-2.4 2.4c-.8.8-1.9 1.2-2.9 1.2zm7-5.1a1 1 0 0 1-.7-1.7l2.4-2.4a2.2 2.2 0 0 0-3.1-3.1l-2.4 2.4a1 1 0 0 1-1.4-1.4l2.4-2.4a4.2 4.2 0 0 1 5.9 5.9l-2.4 2.4c-.2.2-.5.3-.7.3z'
  };
  const svg = k => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICON[k]}"/></svg>`;

  function buildPop() {
    const { url, text, what } = shareInfo();
    const u = encodeURIComponent(url), t = encodeURIComponent(text);
    const links = [
      ["facebook", "Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}`],
      ["x", "X", `https://twitter.com/intent/tweet?text=${t}&url=${u}&hashtags=doyouhavestarpower`],
      ["threads", "Threads", `https://www.threads.net/intent/post?text=${encodeURIComponent(text + " " + url)}`],
      ["whatsapp", "WhatsApp", `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`],
      ["email", "Email", `mailto:?subject=${encodeURIComponent("Listen with me: " + what)}&body=${encodeURIComponent(text + "\n\n" + url)}`]
    ];
    pop.innerHTML = `<p class="np-share-head">Share what's playing</p><p class="np-share-what"></p><ul class="np-share-list">${
      links.map(([k, n, h]) => `<li><a class="np-share-btn" href="${h}"${k === "email" ? "" : ' target="_blank" rel="noopener"'} aria-label="Share on ${n}" title="${n}">${svg(k)}</a></li>`).join("")
    }<li><button type="button" class="np-share-btn np-share-copy" aria-label="Copy link" title="Copy link">${svg("link")}</button></li></ul><p class="np-share-status" role="status" aria-live="polite"></p>`;
    pop.querySelector(".np-share-what").textContent = what;
    pop.querySelector(".np-share-copy").addEventListener("click", async () => {
      const s = pop.querySelector(".np-share-status");
      try { await navigator.clipboard.writeText(`${text} ${url}`); s.textContent = "Copied! Paste it anywhere."; }
      catch { s.textContent = url; }
    });
  }
  const closePop = () => { pop.hidden = true; shareBtn.setAttribute("aria-expanded", "false"); };

  shareBtn.addEventListener("click", async () => {
    const { url, text } = shareInfo();
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ title: STATION_NAME, text, url }); } catch {}
      return;
    }
    if (pop.hidden) {
      buildPop();
      pop.hidden = false;
      shareBtn.setAttribute("aria-expanded", "true");
      pop.querySelector("a, button")?.focus();
    } else closePop();
  });
  document.addEventListener("click", e => { if (!pop.hidden && !pop.contains(e.target) && !shareBtn.contains(e.target)) closePop(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !pop.hidden) { closePop(); shareBtn.focus(); } });

  el.art.addEventListener("error", () => {
    if (!el.art.src.endsWith(FALLBACK_ART)) el.art.src = FALLBACK_ART;
  });

  startPolling();
})();
