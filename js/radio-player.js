// =====================================================
// Nu Soul Hwy Radio — live player powered by radio.co
// Public data feed (no API key): https://public.radio.co
// =====================================================
(() => {
  const STATION = "s8dd253f7b";
  const STREAM = `https://streamer.radio.co/${STATION}/listen`;
  const API = `https://public.radio.co/stations/${STATION}`;
  const STATION_NAME = "Nu Soul Hwy Radio";
  const FALLBACK_ART = "images/star-power-logo.png";
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

  el.art.addEventListener("error", () => {
    if (!el.art.src.endsWith(FALLBACK_ART)) el.art.src = FALLBACK_ART;
  });

  startPolling();
})();
