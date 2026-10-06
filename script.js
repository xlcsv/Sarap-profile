const audioToggle = document.getElementById("audio-toggle");
const audioElement = document.getElementById("bg-music");
const audioStatus = document.getElementById("audio-status");
const driveIntro = document.getElementById("drive-intro");
const driveButton = document.getElementById("drive-button");
const soundConfigured = Boolean(audioElement.querySelector("source[src]"));
let audioStartTimeout;
let hasStarted = false;

document.addEventListener("contextmenu", (event) => event.preventDefault());
document.addEventListener("copy", (event) => event.preventDefault());
document.addEventListener("cut", (event) => event.preventDefault());
document.addEventListener("selectstart", (event) => event.preventDefault());
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const modifier = event.ctrlKey || event.metaKey;
  const devToolsShortcut = modifier && event.shiftKey && ["i", "j", "c"].includes(key);
  const copyShortcut = modifier && ["a", "c", "u", "x"].includes(key);

  if (event.key === "F12" || devToolsShortcut || copyShortcut) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

function syncAudioButton(isPlaying) {
  audioToggle.setAttribute("aria-pressed", String(isPlaying));
  audioToggle.setAttribute("aria-label", isPlaying ? "Pause the song" : "Play the song");
  if (isPlaying) {
    window.clearTimeout(audioStartTimeout);
    audioStatus.textContent = "";
    audioStatus.classList.remove("is-visible");
  }
}

function showAudioStatus(message) {
  window.clearTimeout(audioStartTimeout);
  audioStatus.textContent = message;
  audioStatus.classList.add("is-visible");
}

async function toggleAudio() {
  if (!soundConfigured) return;

  if (!audioElement.paused && !audioStatus.classList.contains("is-visible")) {
    audioElement.pause();
    return;
  }

  await startAudio();
}

async function startAudio() {
  if (!soundConfigured) return;

  audioStatus.textContent = "Starting the song…";
  audioStatus.classList.add("is-visible");
  window.clearTimeout(audioStartTimeout);
  audioStartTimeout = window.setTimeout(() => {
    if (audioElement.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      syncAudioButton(false);
      showAudioStatus(window.location.protocol === "file:"
        ? "Run Start Ayos Ba.bat to play the local song."
        : "The song didn't start. Press the music button.");
    }
  }, 6000);
  try {
    await audioElement.play();
    if (!audioElement.paused && audioElement.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      syncAudioButton(true);
    }
  } catch {
    syncAudioButton(false);
    showAudioStatus(audioElement.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
      ? "This browser can't play the audio file."
      : "Autoplay was blocked. Press the music button.");
  }
}

driveButton.addEventListener("click", () => {
  if (hasStarted) return;
  hasStarted = true;
  driveButton.disabled = true;
  driveIntro.classList.add("is-driving");

  const transitionTime = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 500;
  window.setTimeout(() => {
    driveIntro.hidden = true;
    document.getElementById("top").scrollIntoView({ block: "start" });
    void startAudio();
  }, transitionTime);
});

audioToggle.addEventListener("click", toggleAudio);
audioElement.addEventListener("playing", () => syncAudioButton(true));
audioElement.addEventListener("pause", () => {
  syncAudioButton(false);
  window.clearTimeout(audioStartTimeout);
  audioStatus.textContent = "";
  audioStatus.classList.remove("is-visible");
});
audioElement.addEventListener("error", () => {
  syncAudioButton(false);
  showAudioStatus(window.location.protocol === "file:"
    ? "Run Start Ayos Ba.bat to play the local song."
    : "The audio file couldn't be opened.");
});

if (!soundConfigured) {
  audioToggle.title = "Add an audio source in index.html";
  audioToggle.setAttribute("aria-label", "No audio source is configured");
}
