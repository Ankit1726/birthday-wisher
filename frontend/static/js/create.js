if (!Auth.isLoggedIn()) window.location.href = "/";

const params = new URLSearchParams(window.location.search);
const editingSlug = params.get("slug");

let selectedTheme = "rose";
let selectedAnimations = new Set(["cake", "confetti"]);
let pendingPhotoFile = null;
let cropImage = null;
let cropOffsetX = 0;
let cropOffsetY = 0;
let cropScale = 1;
let cropDragging = false;
let cropStartX = 0;
let cropStartY = 0;
let uploadedPhotoId = null;
let songs = []; // {title, singer, url}
let savedAlbumUrl = "";

const bodyEl = document.getElementById("body-el");

// ---------- theme swatches ----------
document.querySelectorAll(".swatch").forEach((sw) => {
  sw.addEventListener("click", () => {
    document
      .querySelectorAll(".swatch")
      .forEach((s) => s.classList.remove("selected"));
    sw.classList.add("selected");
    selectedTheme = sw.dataset.t;
    bodyEl.setAttribute("data-theme", selectedTheme);
  });
});

// ---------- animation chips ----------
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    chip.classList.toggle("selected");
    const a = chip.dataset.a;
    if (chip.classList.contains("selected")) selectedAnimations.add(a);
    else selectedAnimations.delete(a);
  });
});

// ---------- photo dropzone ----------
const dropzone = document.getElementById("dropzone");
const photoInput = document.getElementById("photo-input");
const photoPreview = document.getElementById("photo-preview");
const dropzoneEmpty = document.getElementById("dropzone-empty");

dropzone.addEventListener("click", () => photoInput.click());
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    cropImage = new Image();
    cropImage.onload = () => {
      pendingPhotoFile = file;
      const frame = document.querySelector(".crop-frame");
      const frameSize = frame.clientWidth;
      cropScale = Math.max(
        frameSize / cropImage.naturalWidth,
        frameSize / cropImage.naturalHeight,
      );
      photoPreview.style.width = `${cropImage.naturalWidth * cropScale}px`;
      photoPreview.style.height = `${cropImage.naturalHeight * cropScale}px`;
      cropOffsetX = 0;
      cropOffsetY = 0;
      updateCropPreview();
    };
    cropImage.src = reader.result;
    photoPreview.src = reader.result;
    photoPreview.classList.remove("hidden");
    dropzoneEmpty.classList.add("hidden");
  };
  reader.readAsDataURL(file);
});

function updateCropPreview() {
  photoPreview.style.transform = `translate(-50%, -50%) translate(${cropOffsetX}px, ${cropOffsetY}px)`;
}

photoPreview.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  cropDragging = true;
  cropStartX = event.clientX - cropOffsetX;
  cropStartY = event.clientY - cropOffsetY;
  photoPreview.setPointerCapture(event.pointerId);
});
photoPreview.addEventListener("pointermove", (event) => {
  if (!cropDragging) return;
  cropOffsetX = event.clientX - cropStartX;
  cropOffsetY = event.clientY - cropStartY;
  updateCropPreview();
});
photoPreview.addEventListener("pointerup", () => {
  cropDragging = false;
});
photoPreview.addEventListener("pointercancel", () => {
  cropDragging = false;
});
photoPreview.addEventListener("click", (event) => event.stopPropagation());

function croppedPhoto() {
  if (!cropImage) return pendingPhotoFile;
  const frameSize = document.querySelector(".crop-frame").clientWidth;
  const size = frameSize / cropScale;
  const sourceX = (cropImage.naturalWidth - size) / 2 - cropOffsetX / cropScale;
  const sourceY =
    (cropImage.naturalHeight - size) / 2 - cropOffsetY / cropScale;
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 900;
  canvas
    .getContext("2d")
    .drawImage(
      cropImage,
      Math.max(0, Math.min(sourceX, cropImage.naturalWidth - size)),
      Math.max(0, Math.min(sourceY, cropImage.naturalHeight - size)),
      size,
      size,
      0,
      0,
      900,
      900,
    );
  return new Promise((resolve) =>
    canvas.toBlob(
      (blob) =>
        resolve(new File([blob], "cropped-photo.jpg", { type: "image/jpeg" })),
      "image/jpeg",
      0.88,
    ),
  );
}

// ---------- songs ----------
function renderSongs() {
  const list = document.getElementById("song-list");
  if (!songs.length) {
    list.innerHTML = "";
    return;
  }
  list.innerHTML = songs
    .map(
      (s, i) => `
    <div class="song-item">
      <div class="meta">${escapeHtml(s.title)}<small>${escapeHtml(s.singer || "")}</small></div>
      <button class="remove" data-i="${i}" type="button">✕</button>
    </div>
  `,
    )
    .join("");
  list.querySelectorAll(".remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      songs.splice(parseInt(btn.dataset.i, 10), 1);
      renderSongs();
    });
  });
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

// ---------- song URL: detect + preview inline, no page change ----------
function detectSongUrl(rawUrl) {
  const url = rawUrl.trim();
  const ytMatch = url.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i,
  );
  if (ytMatch) {
    return {
      kind: "youtube",
      url: `https://www.youtube.com/embed/${ytMatch[1]}`,
    };
  }
  if (url.startsWith("/api/media/") || /\.(mp3|wav|ogg|m4a)(\?|$)/i.test(url)) {
    return { kind: "audio", url };
  }
  return { kind: "external", url };
}

function renderSongPreview(rawUrl) {
  let preview = document.getElementById("song-url-preview");
  if (!preview) {
    preview = document.createElement("div");
    preview.id = "song-url-preview";
    preview.style.marginTop = "10px";
    document
      .getElementById("song-url")
      .insertAdjacentElement("afterend", preview);
  }
  if (!rawUrl) {
    preview.innerHTML = "";
    return;
  }
  const { kind, url } = detectSongUrl(rawUrl);
  if (kind === "youtube") {
    preview.innerHTML = `<iframe src="${escapeHtml(url)}" style="width:100%;aspect-ratio:16/9;border:none;border-radius:12px;" allow="autoplay"></iframe>`;
  } else if (kind === "audio") {
    preview.innerHTML = `<audio controls style="width:100%" src="${escapeHtml(url)}"></audio>`;
  } else {
    preview.innerHTML = `<iframe src="${escapeHtml(url)}" style="width:100%;height:220px;border:1px solid var(--hairline);border-radius:12px;"></iframe><div style="color:var(--muted);font-size:0.75rem;margin-top:6px;">Previewing right here - if it stays blank, this source blocks inline embedding, but the link will still be saved and playable on the album page.</div>`;
  }
}

// Live-preview as soon as a URL is typed/pasted, without leaving this page.
document.getElementById("song-url").addEventListener("input", (e) => {
  renderSongPreview(e.target.value.trim());
});

document
  .getElementById("add-song-link-btn")
  .addEventListener("click", async () => {
    const title = document.getElementById("song-title").value.trim();
    const singer = document.getElementById("song-singer").value.trim();
    const rawUrl = document.getElementById("song-url").value.trim();
    if (!title || !rawUrl) {
      alert(
        "Add a song title and a link first (YouTube link or a direct audio URL both work).",
      );
      return;
    }
    const button = document.getElementById("add-song-link-btn");
    button.disabled = true;
    button.textContent = "Adding...";

    const detected = detectSongUrl(rawUrl);

    try {
      // Try the backend first - it may normalize/host the link server-side.
      const res = await apiFetch("/api/media/song/fetch", {
        method: "POST",
        body: JSON.stringify({ url: rawUrl }),
      });
      songs.push({
        title,
        singer,
        url: res.url || detected.url,
        kind: res.kind || detected.kind,
      });
    } catch (err) {
      // Backend fetch didn't work - don't block the user. Save the link
      // directly using client-side detection so "add url song" always
      // succeeds, and it will still preview/play on the album page.
      songs.push({ title, singer, url: detected.url, kind: detected.kind });
    }

    renderSongs();
    document.getElementById("song-title").value = "";
    document.getElementById("song-singer").value = "";
    document.getElementById("song-url").value = "";
    renderSongPreview("");
    button.disabled = false;
    button.textContent = "Fetch & add audio";
  });

const songFileInput = document.getElementById("song-file-input");
document
  .getElementById("upload-song-btn")
  .addEventListener("click", () => songFileInput.click());
songFileInput.addEventListener("change", async () => {
  const file = songFileInput.files[0];
  if (!file) return;
  const title =
    document.getElementById("song-title").value.trim() ||
    file.name.replace(/\.[^.]+$/, "");
  const singer = document.getElementById("song-singer").value.trim();
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await apiFetch("/api/media/song", {
      method: "POST",
      body: form,
    });
    songs.push({ title, singer, url: res.url, kind: res.kind || "audio" });
    renderSongs();
  } catch (err) {
    alert("Song upload failed: " + err.message);
  }
  songFileInput.value = "";
});

// ---------- load existing album when editing ----------
async function loadExisting() {
  if (!editingSlug) return;
  try {
    const a = await apiFetch("/api/albums/" + editingSlug);
    document.getElementById("recipient-name").value = a.recipient_name;
    document.getElementById("birthday").value = a.birthday || "";
    document.getElementById("wish-message").value = a.wish_message;
    selectedTheme = a.theme;
    bodyEl.setAttribute("data-theme", selectedTheme);
    document
      .querySelectorAll(".swatch")
      .forEach((s) =>
        s.classList.toggle("selected", s.dataset.t === selectedTheme),
      );
    selectedAnimations = new Set(a.animations);
    document
      .querySelectorAll(".chip")
      .forEach((c) =>
        c.classList.toggle("selected", selectedAnimations.has(c.dataset.a)),
      );
    songs = a.songs || [];
    renderSongs();
    if (a.photo_id) {
      uploadedPhotoId = a.photo_id;
      photoPreview.src = "/api/media/" + a.photo_id;
      photoPreview.classList.remove("hidden");
      dropzoneEmpty.classList.add("hidden");
    }
  } catch (err) {
    console.error(err);
  }
}
loadExisting();

// ---------- save ----------
document.getElementById("save-btn").addEventListener("click", async () => {
  const errorEl = document.getElementById("save-error");
  const successEl = document.getElementById("save-success");
  errorEl.textContent = "";
  successEl.classList.add("hidden");

  const recipient_name = document.getElementById("recipient-name").value.trim();
  const birthday = document.getElementById("birthday").value;
  const wish_message = document.getElementById("wish-message").value;
  if (!recipient_name) {
    errorEl.textContent = "Please enter who this album is for.";
    return;
  }
  if (!birthday) {
    errorEl.textContent = "Please choose the birthday date for this album.";
    return;
  }

  const saveBtn = document.getElementById("save-btn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    if (pendingPhotoFile) {
      const form = new FormData();
      form.append("file", await croppedPhoto());
      const res = await apiFetch("/api/media/photo", {
        method: "POST",
        body: form,
      });
      uploadedPhotoId = res.media_id;
    }

    let album;
    if (editingSlug) {
      album = await apiFetch("/api/albums/" + editingSlug, {
        method: "PATCH",
        body: JSON.stringify({
          recipient_name,
          birthday,
          wish_message,
          theme: selectedTheme,
          animations: Array.from(selectedAnimations),
          photo_id: uploadedPhotoId,
          songs,
        }),
      });
    } else {
      album = await apiFetch("/api/albums", {
        method: "POST",
        body: JSON.stringify({
          recipient_name,
          birthday,
          wish_message,
          theme: selectedTheme,
          animations: Array.from(selectedAnimations),
        }),
      });
      album = await apiFetch("/api/albums/" + album.slug, {
        method: "PATCH",
        body: JSON.stringify({ photo_id: uploadedPhotoId, songs }),
      });
    }

    successEl.textContent = "Saved ✅ Share this link:";
    successEl.classList.remove("hidden");
    const link =
      window.location.origin + "/album?slug=" + encodeURIComponent(album.slug);
    savedAlbumUrl = link;
    document.getElementById("share-link").value = link;
    document.getElementById("view-link-btn").href = link;
    document.getElementById("link-row").classList.remove("hidden");
    const previewBtn = document.getElementById("preview-btn");
    previewBtn.disabled = false;
    previewBtn.textContent = "Open album preview";
  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save & Get Shareable Link";
  }
});

document.getElementById("preview-btn").addEventListener("click", () => {
  if (savedAlbumUrl) window.open(savedAlbumUrl, "_blank", "noopener");
});

document.getElementById("copy-link-btn").addEventListener("click", () => {
  const input = document.getElementById("share-link");
  input.select();
  navigator.clipboard.writeText(input.value);
});
