// RaksoMusic interactions: mobile menu, waveform, and optional local audio preview.
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Build a decorative waveform without requiring an external library.
const waveform = document.getElementById("waveform");
for (let i = 0; i < 64; i++) {
  const bar = document.createElement("i");
  const height = 7 + Math.round((Math.abs(Math.sin(i * 1.71) * Math.cos(i * .29)) * 28));
  bar.style.setProperty("--bar", `${height}px`);
  waveform.appendChild(bar);
}

const audio = document.getElementById("audioPlayer");
const playButton = document.getElementById("playButton");
const playIcon = playButton.querySelector(".play-icon");
const status = document.getElementById("playerStatus");
const upload = document.getElementById("audioUpload");

function updatePlayerState() {
  const playing = !audio.paused;
  playIcon.textContent = playing ? "Ⅱ" : "▶";
  playButton.setAttribute("aria-label", playing ? "Pause track" : "Play preview");
}
playButton.addEventListener("click", async () => {
  if (!audio.src) {
    status.textContent = "Add an audio file below to preview your music.";
    upload.click();
    return;
  }
  if (audio.paused) {
    try { await audio.play(); }
    catch { status.textContent = "Couldn't play this file. Try another audio track."; }
  } else {
    audio.pause();
  }
  updatePlayerState();
});
audio.addEventListener("play", updatePlayerState);
audio.addEventListener("pause", updatePlayerState);
audio.addEventListener("ended", updatePlayerState);

upload.addEventListener("change", () => {
  const file = upload.files && upload.files[0];
  if (!file) return;
  if (audio.dataset.objectUrl) URL.revokeObjectURL(audio.dataset.objectUrl);
  const objectUrl = URL.createObjectURL(file);
  audio.src = objectUrl;
  audio.dataset.objectUrl = objectUrl;
  status.textContent = `Ready: ${file.name}`;
  audio.play().then(updatePlayerState).catch(() => {
    status.textContent = `Ready to play: ${file.name}`;
  });
});

// Highlight the navigation item matching the visible section.
const sections = ["home", "art", "music", "about", "poem"]
  .map(id => document.getElementById(id)).filter(Boolean);
const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.toggle(
          "active", link.getAttribute("href") === `#${entry.target.id}`
        ));
      }
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach(section => observer.observe(section));
}
