
/* STARPOWER COLLECTIVE — CURATED VIDEO ARCHIVE */

const starPowerVideos = [
  {
    id: "S8z0liI95CA",
    title: "Kevin Burke has StarPower!",
    description: "Interview highlight from StarPower Collective."
  },
  {
    id: "bTtHRnS_rXI",
    title: "KOOL MO DEE HAS STARPOWER!!!!!",
    description: "Interview highlight from StarPower Collective."
  },
  {
    id: "vRJYzOQ4JoQ",
    title: "ONAJE ALLEN GUMBS HAS STARPOWER!!!!!",
    description: "Interview highlight from StarPower Collective."
  },
  {
    id: "uTDAS9vsy-k",
    title: "RHONDA THOMAS HAS STARPOWER!!!!!",
    description: "Interview highlight from StarPower Collective."
  },
  {
    id: "qOxOprGYdCA",
    title: "MONTSHO ESHE HAS STARPOWER!!!!",
    description: "Interview highlight from StarPower Collective."
  },
  {
    id: "AiJPcfFnvXQ",
    title: "DLB HAS STARPOWER!!!!",
    description: "Interview highlight from StarPower Collective."
  }
];

function initStarPowerGallery() {
  const grid = document.getElementById("sp-curated-grid");
  const search = document.getElementById("sp-curated-search");
  const count = document.getElementById("sp-curated-count");
  const empty = document.getElementById("sp-curated-empty");
  const dialog = document.getElementById("sp-video-dialog");
  const dialogTitle = document.getElementById("sp-video-dialog-title");
  const player = document.getElementById("sp-video-player");
  const closeButton = dialog?.querySelector(".sp-video-dialog-close");
  const youtubeLink = document.getElementById("sp-video-youtube-link");

  if (
    !grid || !search || !count || !empty || !dialog ||
    !dialogTitle || !player || !closeButton || !youtubeLink
  ) return;

  const supportsDialog =
    typeof dialog.showModal === "function" &&
    typeof dialog.close === "function";
  let activePlayButton = null;

  if (!supportsDialog) dialog.hidden = true;

  function renderGallery() {
    const query = search.value.trim().toLowerCase();
    const filtered = starPowerVideos.filter(video =>
      `${video.title} ${video.description}`.toLowerCase().includes(query)
    );

    grid.replaceChildren();

    filtered.forEach(video => {
      const card = document.createElement("article");
      card.className = "sp-video-card";

      const playButton = document.createElement("button");
      playButton.type = "button";
      playButton.className = "sp-video-link";
      playButton.setAttribute("aria-haspopup", "dialog");

      const thumb = document.createElement("div");
      thumb.className = "sp-video-thumb";

      const img = document.createElement("img");
      img.src =
        `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
      img.alt = "";
      img.loading = "lazy";

      const play = document.createElement("span");
      play.className = "sp-video-play";
      play.textContent = "▶";
      play.setAttribute("aria-hidden", "true");

      thumb.append(img, play);

      const body = document.createElement("div");
      body.className = "sp-video-body";

      const label = document.createElement("span");
      label.className = "sp-video-label";
      label.textContent = "INTERVIEW HIGHLIGHT";

      const title = document.createElement("h3");
      title.className = "sp-video-title";
      title.textContent = video.title;

      const description = document.createElement("p");
      description.className = "sp-video-description";
      description.textContent = video.description;

      body.append(label, title, description);
      playButton.append(thumb, body);

      playButton.addEventListener("click", () => {
        const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
        if (!supportsDialog) {
          window.open(videoUrl, "_blank", "noopener,noreferrer");
          return;
        }

        activePlayButton = playButton;
        dialogTitle.textContent = video.title;
        youtubeLink.href = videoUrl;

        const iframe = document.createElement("iframe");
        iframe.src =
          `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`;
        iframe.title = video.title;
        iframe.allow =
          "autoplay; encrypted-media; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.loading = "lazy";
        player.replaceChildren(iframe);
        dialog.showModal();
      });

      const watchLink = document.createElement("a");
      watchLink.className = "sp-video-watch-link";
      watchLink.href = `https://www.youtube.com/watch?v=${video.id}`;
      watchLink.target = "_blank";
      watchLink.rel = "noopener noreferrer";
      watchLink.textContent = "Watch on YouTube";

      card.append(playButton, watchLink);
      grid.append(card);
    });

    count.textContent = `${filtered.length} videos`;
    empty.hidden = filtered.length > 0;
  }

  if (supportsDialog) {
    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("cancel", event => {
      event.preventDefault();
      dialog.close();
    });
    dialog.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        dialog.close();
      }
    });
    dialog.addEventListener("close", () => {
      player.replaceChildren();
      activePlayButton?.focus();
      activePlayButton = null;
    });
    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close();
    });
  }
  search.addEventListener("input", renderGallery);
  renderGallery();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initStarPowerGallery
  );
} else {
  initStarPowerGallery();
}
