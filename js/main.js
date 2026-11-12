
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");

menuButton?.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

navigation?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open menu");
  });
});

document.querySelector("#year").textContent = new Date().getFullYear();

// Live radio playback now lives in js/radio-player.js

// STARPOWER ROTATING INTERVIEWEE PORTRAITS



const heroGuests = [
  { name: "Charles Ray", image: "images/interviewees/charles-ray.jpg" },
  { name: "Chris", image: "images/interviewees/chris.jpg" },
  { name: "Courtney Lynne", image: "images/interviewees/courtney-lynne.jpg" },
  { name: "Sheldon", image: "images/interviewees/sheldon.jpg" },
  { name: "Chei", image: "images/interviewees/chei.jpg" },
  { name: "Avon", image: "images/interviewees/avon.jpg" },
  { name: "Courtney", image: "images/interviewees/courtney.jpg" },
  { name: "Arlene", image: "images/interviewees/arlene.jpg" },
  { name: "Calena", image: "images/interviewees/calena.jpg" },
  { name: "Kim", image: "images/interviewees/kim.jpg" },
  { name: "Anesia", image: "images/interviewees/anesia.jpg" },
  { name: "Symhonee", image: "images/interviewees/symhonee.jpg" },
  { name: "Sid", image: "images/interviewees/sid.jpg" },
  { name: "Rodney", image: "images/interviewees/rodney.jpg" },
  { name: "Racheal", image: "images/interviewees/racheal.jpg" },
  { name: "Debra", image: "images/interviewees/debra.jpg" },
  { name: "Charlie", image: "images/interviewees/charlie.jpg" },
  { name: "Criag", image: "images/interviewees/criag.jpg" },
  { name: "Hassan", image: "images/interviewees/hassan.jpg" },
  { name: "Afe", image: "images/interviewees/afe.jpg" },
  { name: "Sapphire Monet", image: "images/interviewees/SAPPHIRE-MONET.jpeg" },
  { name: "Nikki Igbo", image: "images/interviewees/Nikki-Igbo.jpeg" },
  { name: "SkirtLady Taina", image: "images/interviewees/SkirtLady-Taina.jpeg" },
  { name: "Taylor Cather", image: "images/interviewees/Taylor-Cather.jpeg" },
  { name: "Nasi Jackson", image: "images/interviewees/NASI-JACKSON.jpg" },
  { name: "Golda Simpson", image: "images/interviewees/GOLDA-SIMPSON.jpg" },
  { name: "James Byers", image: "images/interviewees/James-Byers.jpg" },
  { name: "Leesah Pitts", image: "images/interviewees/Leesah-Pitts.jpg" },
  { name: "Divinity West", image: "images/interviewees/Divinity-West.jpg" },
  { name: "Saadi", image: "images/interviewees/Saadi.jpg" },
  { name: "Renee Neufville", image: "images/interviewees/renee-neufville.jpeg" }
];



const heroPortrait = document.querySelector("#hero-portrait");
const heroGuestName = document.querySelector("#hero-guest-name");
const heroGallery = document.querySelector(".hero-gallery");

let heroGuestIndex = 0;
let heroLoadSequence = 0;

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

function displayHeroGuest(index) {
  if (!heroPortrait || !heroGuestName) return;

  const guest = heroGuests[index];
  if (!guest) return;

  const loadSequence = ++heroLoadSequence;
  const preload = new Image();
  preload.onload = () => {
    if (loadSequence !== heroLoadSequence) return;
    heroPortrait.classList.remove("visible");

    const update = () => {
      if (loadSequence !== heroLoadSequence) return;
      heroPortrait.src = guest.image;
      heroPortrait.alt = `Portrait of ${guest.name}`;
      heroGuestName.textContent = guest.name;
      heroPortrait.classList.add("visible");
    };

    if (reduceMotion) {
      update();
    } else {
      setTimeout(update, 500);
    }
  };

  preload.onerror = () => {
    console.warn("Could not load:", guest.image);
  };

  preload.src = guest.image;
}

if (heroGuests.length > 0) {
  if (heroGuests.length > 1 && !reduceMotion) {
    setInterval(() => {
      heroGuestIndex =
        (heroGuestIndex + 1) % heroGuests.length;

      displayHeroGuest(heroGuestIndex);
    }, 6000);
  }
} else if (heroGallery) {
  heroGallery.hidden = true;
}

// Guest interview practice stays in memory and is never submitted.
(() => {
  const questionElement = document.querySelector("#practice-question");
  const progress = document.querySelector("#practice-progress");
  const progressBar = document.querySelector("#practice-progress-bar");
  const answer = document.querySelector("#practice-answer");
  const previous = document.querySelector("#practice-previous");
  const next = document.querySelector("#practice-next");
  const restart = document.querySelector("#practice-reset");

  if (!questionElement || !progress || !progressBar || !answer ||
      !previous || !next || !restart) return;

  const questions = [
    "What does music mean to you?",
    "Where did you grow up?",
    "What are your earliest memories of music in your home?",
    "What are your parents' musical likes?",
    "Pick a song that made your list. Why that one?",
    "What was the first record you ever purchased?",
    "What was your first concert?",
    "What schools did you go to?",
    "What was your first party?",
    "How do you feel about the state of music now, and the artists now?",
    "How do you feel about instruments?",
    "What was the last album or CD you purchased?"
  ];
  const answers = new Map();
  let questionIndex = 0;

  function showQuestion() {
    questionElement.textContent = questions[questionIndex];
    progress.textContent =
      `Question ${questionIndex + 1} of ${questions.length}`;
    progressBar.value = questionIndex + 1;
    answer.value = answers.get(questionIndex) || "";
    previous.disabled = questionIndex === 0;
    next.disabled = questionIndex === questions.length - 1;
  }

  answer.addEventListener("input", () => {
    answers.set(questionIndex, answer.value);
  });

  previous.addEventListener("click", () => {
    if (questionIndex === 0) return;
    answers.set(questionIndex, answer.value);
    questionIndex -= 1;
    showQuestion();
  });

  next.addEventListener("click", () => {
    if (questionIndex >= questions.length - 1) return;
    answers.set(questionIndex, answer.value);
    questionIndex += 1;
    showQuestion();
  });

  restart.addEventListener("click", () => {
    answers.clear();
    questionIndex = 0;
    showQuestion();
    answer.focus();
  });

  showQuestion();
})();

// Configure the Formspree endpoint in the form's data attribute before launch.
(() => {
  const form = document.querySelector("#guest-application");
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');
  const status = document.querySelector("#guest-form-status");
  const setupLink = document.querySelector(".formspree-setup-link");
  if (!submitButton || !status || !setupLink) return;

  const endpoint = form.dataset.formspreeEndpoint.trim();
  const configuredEndpoint =
    /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(endpoint);

  if (!configuredEndpoint) {
    submitButton.disabled = true;
    status.textContent =
      "Application submissions are not configured yet. Add your Formspree form endpoint to connect this form; nothing will be sent before then.";
    setupLink.hidden = false;
    return;
  }

  submitButton.disabled = false;
  setupLink.hidden = true;
  status.textContent =
    "Your application will be sent to StarPower Collective through Formspree.";

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity() || submitButton.disabled) return;

    submitButton.disabled = true;
    status.textContent = "Sending your application…";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Formspree returned HTTP ${response.status}`);
      }

      form.reset();
      status.textContent =
        "Your application was submitted. Thank you for sharing your story.";
    } catch (error) {
      console.error("Guest application submission failed:", error);
      status.textContent =
        "We could not submit your application. Please try again later.";
    } finally {
      submitButton.disabled = false;
    }
  });
})();

// Set startsAt only after a broadcast has been confirmed.
const nextShow = null;
(() => {
  const status = document.querySelector("#next-show-status");
  const countdown = document.querySelector("#show-countdown");
  if (!status || !countdown || !nextShow?.startsAt) return;

  const startsAt = new Date(nextShow.startsAt).getTime();
  if (!Number.isFinite(startsAt)) return;

  const units = {
    days: 24 * 60 * 60,
    hours: 60 * 60,
    minutes: 60,
    seconds: 1
  };
  const values = Object.fromEntries(
    Object.keys(units).map(unit => [
      unit,
      countdown.querySelector(`[data-countdown="${unit}"]`)
    ])
  );
  if (Object.values(values).some(value => !value)) return;

  let timer;
  function updateCountdown() {
    const remaining = Math.floor((startsAt - Date.now()) / 1000);
    if (remaining <= 0) {
      status.textContent = "The scheduled broadcast has started.";
      countdown.hidden = true;
      window.clearInterval(timer);
      return;
    }

    status.textContent = nextShow.title || "The next StarPower show begins in:";
    let secondsLeft = remaining;
    for (const [unit, secondsPerUnit] of Object.entries(units)) {
      const value = Math.floor(secondsLeft / secondsPerUnit);
      secondsLeft %= secondsPerUnit;
      values[unit].textContent = String(value).padStart(2, "0");
    }
    countdown.hidden = false;
  }

  updateCountdown();
  if (startsAt > Date.now()) {
    timer = window.setInterval(updateCountdown, 1000);
  }
})();

// ==========================================
// STARPOWER — TWO LEAD MAGNET EXPERIENCES
// ==========================================

(() => {
  const gateway = document.querySelector("#village");
  if (!gateway) return;

  const panels = {
    legacy: document.querySelector("#legacy-experience"),
    music: document.querySelector("#music-experience")
  };

  // Open the chosen experience.
  gateway.querySelectorAll("[data-open-experience]")
    .forEach(button => {
      button.addEventListener("click", () => {
        const selected = button.dataset.openExperience;

        Object.entries(panels).forEach(([key, panel]) => {
          if (panel) panel.hidden = key !== selected;
        });

        const panel = panels[selected];
        if (panel) {
          panel.scrollIntoView({
            behavior: window.matchMedia(
              "(prefers-reduced-motion: reduce)"
            ).matches ? "instant" : "smooth",
            block: "start"
          });
        }
      });
    });

  // Close an experience.
  gateway.querySelectorAll("[data-close-experience]")
    .forEach(button => {
      button.addEventListener("click", () => {
        button.closest(".village-experience").hidden = true;
      });
    });

  // Print the family question guide.
  document.querySelector("#print-legacy")
    ?.addEventListener("click", () => {
      window.print();
    });

  // Generate five soundtrack input groups.
  const fields = document.querySelector("#soundtrack-fields");

  if (fields) {
    for (let i = 1; i <= 5; i++) {
      const group = document.createElement("div");
      group.className = "soundtrack-entry";

      const songLabel = document.createElement("label");
      songLabel.htmlFor = `song-${i}`;
      songLabel.textContent = `Song ${i} — Title and Artist`;

      const songInput = document.createElement("input");
      songInput.id = `song-${i}`;
      songInput.name = `song-${i}`;
      songInput.type = "text";
      songInput.maxLength = 200;
      songInput.required = true;
      songInput.placeholder = "Song title — Artist";

      const memoryLabel = document.createElement("label");
      memoryLabel.htmlFor = `memory-${i}`;
      memoryLabel.textContent = "What does this song remind you of?";

      const memoryInput = document.createElement("textarea");
      memoryInput.id = `memory-${i}`;
      memoryInput.name = `memory-${i}`;
      memoryInput.maxLength = 1500;
      memoryInput.placeholder = "A person, place, or special moment...";

      group.append(
        songLabel,
        songInput,
        memoryLabel,
        memoryInput
      );

      fields.append(group);
    }
  }

  // Download the soundtrack as a text file.
  const soundtrackForm = document.querySelector(
    "#soundtrack-form"
  );

  soundtrackForm?.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.querySelector(
      "#soundtrack-name"
    ).value.trim();

    const lines = [
      "MY LIFE IN FIVE SONGS",
      "StarPower Collective",
      "",
      `Created by: ${name}`,
      "",
      "Every life has a soundtrack.",
      "Every story deserves to be heard.",
      ""
    ];

    for (let i = 1; i <= 5; i++) {
      const song = document.getElementById(
        `song-${i}`
      ).value.trim();

      const memory = document.getElementById(
        `memory-${i}`
      ).value.trim();

      lines.push(
        `${i}. ${song}`,
        `Memory: ${memory || "Not added"}`,
        ""
      );
    }

    lines.push(
      "Created with StarPower Collective.",
      "Your music. Your memories. Your legacy."
    );

    const blob = new Blob(
      [lines.join("\n")],
      { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "my-life-in-five-songs.txt";

    document.body.append(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();
