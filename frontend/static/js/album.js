const bodyEl = document.getElementById("body-el");
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

let albumData = null;
let currentTrack = -1;
let completedCycles = 0;
let ambientBalloonTimer = null;
let floodBalloonCount = 0;
const MAX_FLOOD_BALLOONS = 140;
const audioEl = document.getElementById("audio-el");
const ytFrame = document.getElementById("yt-frame");

function isPlayableUrl(url) {
  return (
    url.startsWith("/api/media/") || /\.(mp3|wav|ogg|m4a)(\?|$)/i.test(url)
  );
}

async function init() {
  if (!slug) return showNotFound();
  try {
    albumData = await apiFetch("/api/albums/" + slug);
  } catch (err) {
    return showNotFound();
  }
  render(albumData);
  maybeShowOwnerActions();
  startAmbientBalloons();
  window.setTimeout(() => document.getElementById("locket").click(), 700);
  window.setTimeout(startSong, 900);
}

function showNotFound() {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("not-found").classList.remove("hidden");
}

function render(a) {
  bodyEl.setAttribute("data-theme", a.theme);
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("content").classList.remove("hidden");

  document.getElementById("recipient-name").textContent = a.recipient_name;
  document.getElementById("wish-message").textContent =
    a.wish_message || "Wishing you a day as wonderful as you are..🎉";
  document.getElementById("creator-credit").innerHTML =
    `By <span class="heart"> </span> ${escapeHtml(a.creator_name)}  special for ${escapeHtml(a.recipient_name)}`;
  document.title = `Happy Birthday 🎂 ${a.recipient_name}`;
  renderCalendar();

  const photoWrap = document.getElementById("locket-photo");
  if (a.photo_id) {
    photoWrap.innerHTML = `<img src="/api/media/${a.photo_id}" alt="${escapeHtml(a.recipient_name)}" />`;
  }

  if (!a.animations.includes("cake")) {
    document.getElementById("cake-wrap").classList.add("hidden");
  }

  if (a.songs && a.songs.length) {
    document.getElementById("player").classList.remove("hidden");
    renderPlaylist(a.songs);
  }
}

function escapeHtml(s) {
  return (s || "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

function renderCalendar() {
  const now = new Date();
  const birthday =
    albumData && albumData.birthday
      ? new Date(`${albumData.birthday}T00:00:00`)
      : now;
  const birthdayMonth = birthday.getMonth();
  const birthdayDay = albumData && albumData.birthday ? birthday.getDate() : 0;
  const month = birthdayMonth;
  const year = now.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDate = new Date(year, month, 1);
  const monthName = calendarDate.toLocaleDateString(undefined, {
    month: "long",
  });
  document.getElementById("calendar-month").textContent =
    calendarDate.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  document.getElementById("calendar-note").textContent = birthdayDay
    ? `Birthday Day: ${monthName} ${birthdayDay}`
    : "your birthday month";
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = ["S", "M", "T", "W", "T", "F", "S"]
    .map((day) => `<span class="calendar-day-name">${day}</span>`)
    .join("");
  for (let i = 0; i < firstDay; i++)
    grid.insertAdjacentHTML(
      "beforeend",
      '<span class="calendar-day empty"></span>',
    );
  for (let day = 1; day <= daysInMonth; day++) {
    const birthday = day === birthdayDay;
    const today = month === now.getMonth() && day === now.getDate();
    const classes = [
      "calendar-day",
      birthday ? "birthday" : "",
      today ? "today" : "",
    ]
      .filter(Boolean)
      .join(" ");
    grid.insertAdjacentHTML(
      "beforeend",
      `<span class="${classes}">${day}${birthday ? "<i>♥</i>" : ""}</span>`,
    );
  }
}

async function maybeShowOwnerActions() {
  if (!Auth.isLoggedIn()) return;
  try {
    const mine = await apiFetch("/api/albums/mine");
    if (mine.some((m) => m.slug === slug)) {
      document.getElementById("owner-actions").style.display = "flex";
      document.getElementById("edit-link").href =
        "/create?slug=" + encodeURIComponent(slug);
    }
  } catch (_) {
    /* ignore */
  }
}

// ---------- locket open ----------
document.getElementById("locket").addEventListener("click", function () {
  if (this.classList.contains("open")) {
    startSong();
    return;
  }
  this.classList.add("open");
  document.getElementById("wish-card").classList.add("reveal");

  const anims = albumData ? albumData.animations : ["confetti"];
  if (anims.includes("confetti")) Confetti.burst(0.5, 0.32, 160);
  if (anims.includes("sparkles")) sparkleBurst();
  if (anims.includes("balloons")) {
    launchBalloons(6);
    window.setTimeout(() => launchBalloons(6), 1200);
  }
});

// ---------- cake candle ----------
document.getElementById("cake-wrap").addEventListener("click", () => {
  document.getElementById("cake-hint").textContent =
    "🎉 Wish You Very Happy Birthday 🕯️";
  const anims = albumData ? albumData.animations : ["confetti"];
  if (anims.includes("confetti")) Confetti.burst(0.5, 0.7, 120);
  if (anims.includes("balloons")) launchBalloons(4);
});

// ---------- sparkles ----------
function sparkleBurst() {
  const field = document.getElementById("hearts-field");
  for (let i = 0; i < 24; i++) {
    const s = document.createElement("span");
    s.textContent = "✦";
    s.style.position = "fixed";
    s.style.left = 40 + Math.random() * 20 + "%";
    s.style.top = 25 + Math.random() * 20 + "%";
    s.style.color = "var(--gold)";
    s.style.fontSize = 0.6 + Math.random() + "rem";
    s.style.opacity = "1";
    s.style.transition = "transform 1.1s ease-out, opacity 1.1s ease-out";
    s.style.zIndex = 40;
    field.appendChild(s);
    requestAnimationFrame(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 120;
      s.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0.2)`;
      s.style.opacity = "0";
    });
    setTimeout(() => s.remove(), 1300);
  }
}

// ---------- balloons ----------
function launchBalloons(n, stagger = 100) {
  const field = document.getElementById("hearts-field");
  const profile = document.getElementById("locket").getBoundingClientRect();
  const targetX = profile.left + profile.width / 2;
  const targetY = profile.top + profile.height / 2;
  const colors = ["var(--accent)", "var(--accent-2)", "var(--gold)"];
  for (let i = 0; i < n; i++) {
    const b = document.createElement("div");
    const left = 10 + Math.random() * 80;
    const startX = (window.innerWidth * left) / 100;
    const startY = window.innerHeight + 60;
    b.style.position = "fixed";
    b.style.left = left + "%";
    b.style.bottom = "-60px";
    b.style.width = "66px";
    b.style.height = "88px";
    b.style.borderRadius = "50% 50% 50% 50% / 60% 60% 40% 40%";
    b.style.background = colors[i % colors.length];
    b.style.opacity = "0";
    b.className = "ambient-balloon";
    b.style.zIndex = 45;
    const flightTime = 12 + Math.random() * 6;
    b.style.transition = `transform ${flightTime}s cubic-bezier(0.2, 0.7, 0.25, 1), opacity 1.8s ease-in ${flightTime - 1.8}s`;
    const string = document.createElement("span");
    string.className = "balloon-string";
    b.appendChild(string);
    field.appendChild(b);
    const launchDelay = i * stagger + Math.random() * stagger;
    setTimeout(() => {
      b.style.opacity = "0.9";
      requestAnimationFrame(() => {
        b.style.transform = `translate(${targetX - startX + (Math.random() - 0.5) * 80}px, ${targetY - startY}px)`;
      });
    }, launchDelay);
    setTimeout(() => b.remove(), launchDelay + (flightTime + 1.8) * 1000);
  }
}


function responsiveSizeFactor() {
  return Math.max(0.55, Math.min(1, window.innerWidth / 700));
}

function spawnFloodBalloon(zone) {
  if (floodBalloonCount >= MAX_FLOOD_BALLOONS) return;
  const field = document.getElementById("hearts-field");
  const colors = ["var(--accent)", "var(--accent-2)", "var(--gold)"];

  const factor = responsiveSizeFactor();
  const size = (70 + Math.random() * 60) * factor; // large: ~70-130px on desktop

  // Pick a horizontal starting zone so balloons visibly cover the left edge,
  // the middle, and the right edge of the screen instead of clustering.
  let left;
  if (zone === "left") left = Math.random() * 22;
  else if (zone === "right") left = 76 + Math.random() * 18;
  else if (zone === "mid") left = 38 + Math.random() * 24;
  else left = Math.random() * 94;

  const drift = (Math.random() - 0.5) * 220 * factor;
  const duration = 7 + Math.random() * 5;

  const b = document.createElement("div");
  b.className = "flood-balloon";
  b.style.left = left + "%";
  b.style.width = size + "px";
  b.style.height = size * 1.32 + "px";
  b.style.background = colors[Math.floor(Math.random() * colors.length)];
  b.style.setProperty("--bdrift", drift + "px");
  b.style.animationDuration = duration + "s";

  const string = document.createElement("span");
  string.className = "balloon-string";
  b.appendChild(string);
  field.appendChild(b);

  floodBalloonCount++;
  window.setTimeout(
    () => {
      b.remove();
      floodBalloonCount--;
    },
    duration * 1000 + 200,
  );
}

function startAmbientBalloons() {
  if (!albumData || !albumData.animations.includes("balloons")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (ambientBalloonTimer) return; // already running, never double-start

  const zones = ["left", "mid", "right"];

  // Big opening wave: large balloons filling the whole screen right away,
  // spread across all three zones.
  for (let i = 0; i < 30; i++) {
    window.setTimeout(() => spawnFloodBalloon(zones[i % zones.length]), i * 65);
  }


  ambientBalloonTimer = window.setInterval(() => {
    zones.forEach((zone) => spawnFloodBalloon(zone));
  }, 200);
}

// ---------- music player ----------
function renderPlaylist(songs) {
  const list = document.getElementById("player-list");
  list.innerHTML = songs
    .map(
      (s, i) => `
    <div class="p-item" data-i="${i}">🎵 ${escapeHtml(s.title)}${s.singer ? " — " + escapeHtml(s.singer) : ""}</div>
  `,
    )
    .join("");
  list.querySelectorAll(".p-item").forEach((item) => {
    item.addEventListener("click", () =>
      playTrack(parseInt(item.dataset.i, 10)),
    );
  });
  if (songs.length) playTrack(0, false);
}

function stopYoutube() {
  if (ytFrame) {
    ytFrame.src = "";
    ytFrame.classList.add("hidden");
  }
}

// ---------- small inline box for "external link" songs ----------
// Same idea as the little bordered preview box on the create page: instead
// of reusing the big YouTube-sized frame, external links get their own
// compact, rounded, fixed-height box so they clearly read as "a small
// player embedded right here" rather than a full video screen.
function getExternalSongFrame() {
  let wrap = document.getElementById("external-song-frame");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "external-song-frame";
    wrap.className = "hidden";
    wrap.style.marginTop = "10px";
    const iframe = document.createElement("iframe");
    iframe.id = "external-song-iframe";
    iframe.style.width = "100%";
    iframe.style.height = "220px";
    iframe.style.border = "1px solid var(--hairline)";
    iframe.style.borderRadius = "12px";
    wrap.appendChild(iframe);
    // Insert right after the yt-frame so it lives inside the same player card.
    ytFrame.insertAdjacentElement("afterend", wrap);
  }
  return wrap;
}

function stopExternalFrame() {
  const wrap = document.getElementById("external-song-frame");
  if (wrap) {
    const iframe = document.getElementById("external-song-iframe");
    if (iframe) iframe.src = "";
    wrap.classList.add("hidden");
  }
}

function playTrack(i, autoplay = true) {
  const songs = albumData.songs;
  currentTrack = i;
  const song = songs[i];
  const kind = song.kind || (isPlayableUrl(song.url) ? "audio" : "external");

  document.getElementById("track-title").textContent = song.title;
  document.getElementById("track-artist").textContent = song.singer || "";
  document
    .querySelectorAll(".p-item")
    .forEach((el) =>
      el.classList.toggle("active", parseInt(el.dataset.i, 10) === i),
    );

  const statusEl = document.getElementById("song-status");
  const playBtn = document.getElementById("play-pause-btn");
  statusEl.classList.add("hidden");
  audioEl.pause();

  if (kind === "youtube") {
    // Plays inline via YouTube's own embed player - same screen, any device,
    // no scraping/downloading of YouTube's audio (that would break their ToS).
    stopExternalFrame();
    audioEl.removeAttribute("src");
    audioEl.classList.add("hidden");
    playBtn.classList.add("hidden");
    ytFrame.classList.remove("hidden");
    ytFrame.src = song.url + (autoplay ? "?autoplay=1&rel=0" : "?rel=0");
    document.getElementById("disc").classList.toggle("playing", autoplay);
  } else if (kind === "audio" && isPlayableUrl(song.url)) {
    stopYoutube();
    stopExternalFrame();
    audioEl.classList.remove("hidden");
    playBtn.classList.remove("hidden");
    audioEl.src = song.url;
    if (autoplay) audioEl.play().catch(() => {});
    playBtn.textContent = autoplay ? "⏸" : "▶";
    document.getElementById("disc").classList.toggle("playing", autoplay);
  } else {
    // External link (not a direct audio file, not YouTube): play it inline,
    // right here on the album page, in a small bordered box - same as the
    // preview shown while creating the album - instead of sending the
    // visitor to a new tab or a different page.
    stopYoutube();
    audioEl.removeAttribute("src");
    audioEl.classList.add("hidden");
    playBtn.classList.add("hidden");
    ytFrame.classList.add("hidden");

    const frameWrap = getExternalSongFrame();
    const iframe = document.getElementById("external-song-iframe");
    iframe.src = song.url;
    frameWrap.classList.remove("hidden");

    statusEl.textContent =
      "Playing this link right here. If it stays blank, that source doesn't allow inline embedding.";
    statusEl.classList.remove("hidden");
    document.getElementById("disc").classList.remove("playing");
  }
}

function startSong() {
  if (
    !albumData ||
    !albumData.songs ||
    !albumData.songs.length ||
    currentTrack < 0
  )
    return;
  const song = albumData.songs[currentTrack];
  const kind = song.kind || (isPlayableUrl(song.url) ? "audio" : "external");
  if (kind === "youtube") return; // the iframe's autoplay param handles this
  if (kind === "external") return; // external embeds handle their own playback
  if (currentTrack === 0 && audioEl.ended) completedCycles = 0;
  if (kind === "audio" && isPlayableUrl(song.url) && audioEl.paused) {
    audioEl
      .play()
      .then(() => {
        document.getElementById("play-pause-btn").textContent = "⏸";
        document.getElementById("disc").classList.add("playing");
      })
      .catch(() => {});
  }
}

document.getElementById("play-pause-btn").addEventListener("click", () => {
  if (currentTrack === -1) return;
  const song = albumData.songs[currentTrack];
  const kind = song.kind || (isPlayableUrl(song.url) ? "audio" : "external");
  if (kind !== "audio" || !isPlayableUrl(song.url)) {
    document.getElementById("song-status").classList.remove("hidden");
  } else if (audioEl.paused) {
    if (audioEl.ended) completedCycles = 0;
    audioEl.play().catch(() => {});
    document.getElementById("play-pause-btn").textContent = "⏸";
    document.getElementById("disc").classList.add("playing");
  } else {
    audioEl.pause();
    document.getElementById("play-pause-btn").textContent = "▶";
    document.getElementById("disc").classList.remove("playing");
  }
});

audioEl.addEventListener("ended", () => {
  if (
    albumData &&
    albumData.songs &&
    currentTrack < albumData.songs.length - 1
  ) {
    playTrack(currentTrack + 1);
  } else if (
    albumData &&
    albumData.songs &&
    albumData.songs.length &&
    completedCycles < 1
  ) {
    completedCycles += 1;
    playTrack(0, true);
  } else {
    document.getElementById("play-pause-btn").textContent = "▶";
    document.getElementById("disc").classList.remove("playing");
  }
});

init();
