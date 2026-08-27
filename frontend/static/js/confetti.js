const Confetti = (() => {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return { burst() {} };
  const ctx = canvas.getContext("2d");
  let particles = [];
  let running = false;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function colorPalette() {
    const styles = getComputedStyle(document.body);
    return [
      styles.getPropertyValue("--accent").trim() || "#ff4d6d",
      styles.getPropertyValue("--accent-2").trim() || "#ffb4c6",
      styles.getPropertyValue("--gold").trim() || "#f4c95d",
      "#ffffff",
    ];
  }

  function burst(originX = 0.5, originY = 0.35, count = 140) {
    const colors = colorPalette();
    const ox = originX * canvas.width;
    const oy = originY * canvas.height;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      particles.push({
        x: ox,
        y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 0,
        maxLife: 90 + Math.random() * 40,
      });
    }
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.vy += 0.12; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });
    particles = particles.filter(
      (p) => p.life < p.maxLife && p.y < canvas.height + 40,
    );
    if (particles.length) {
      requestAnimationFrame(tick);
    } else {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { burst };
})();
