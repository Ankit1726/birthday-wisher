(function () {
  const field = document.getElementById("hearts-field");
  if (!field) return;
  const GLYPHS = ["♥", "❤️", "✨", "🎂", "🍾"];
  const COUNT = window.innerWidth < 500 ? 10 : 18;

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement("span");
    el.className = "floating-heart";
    el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    el.style.left = Math.random() * 100 + "%";
    el.style.setProperty("--drift", Math.random() * 80 - 40 + "px");
    el.style.fontSize = 0.8 + Math.random() * 1.2 + "rem";
    const duration = 10 + Math.random() * 14;
    el.style.animationDuration = duration + "s";
    el.style.animationDelay = -(Math.random() * duration) + "s";
    field.appendChild(el);
  }
})();
