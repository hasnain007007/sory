(() => {
  "use strict";

  const sky = document.getElementById("sky");
  const cursorPill = document.getElementById("cursor-pill");
  const whisper = document.getElementById("whisper");
  const burstLayer = document.getElementById("burst-layer");
  const rainLayer = document.getElementById("rain-layer");
  const forgiveBtn = document.getElementById("forgive-btn");

  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = !isFinePointer || window.matchMedia("(max-width: 768px)").matches;

  /* ── Stars ── */
  function createStars() {
    const count = isMobile ? 28 : 55;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");
      star.className = "star";
      const size = 1 + Math.random() * 2.2;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = 40 + Math.random() * 50;
      const twinkle = 3 + Math.random() * 5;
      const dx = (Math.random() - 0.5) * 40;
      const dy = 20 + Math.random() * 60;
      const oMin = 0.15 + Math.random() * 0.25;
      const oMax = 0.45 + Math.random() * 0.45;

      if (Math.random() > 0.7) star.classList.add(Math.random() > 0.5 ? "gold" : "purple");

      star.style.cssText = `
        width:${size}px;height:${size}px;
        left:${x}%;top:${y}%;
        --dx:${dx}px;--dy:${dy}px;
        --o-min:${oMin};--o-max:${oMax};
        animation-duration:${duration}s,${twinkle}s;
        animation-delay:${-Math.random() * duration}s,${-Math.random() * twinkle}s;
      `;
      frag.appendChild(star);
    }
    sky.appendChild(frag);
  }

  /* ── Burst: Pooh loves Shahzadi ── */
  let burstCount = 0;
  const MAX_BURSTS = isMobile ? 8 : 14;

  function spawnBurst(x, y, heart) {
    if (burstCount > MAX_BURSTS) return;
    burstCount += 1;

    const text = document.createElement("span");
    text.className = "burst-text";
    text.textContent = heart ? "Pooh loves Shahzadi 💕" : "Pooh loves Shahzadi 💫";
    const fx = (Math.random() - 0.5) * 60;
    text.style.left = `${x}px`;
    text.style.top = `${y}px`;
    text.style.setProperty("--fx", `${fx}px`);
    text.style.transform = "translate(-50%, -50%)";
    burstLayer.appendChild(text);

    const starsN = isMobile ? 3 : 5;
    for (let i = 0; i < starsN; i++) {
      const s = document.createElement("span");
      s.className = "burst-star";
      s.textContent = "✦";
      const ox = (Math.random() - 0.5) * 70;
      const oy = (Math.random() - 0.5) * 40;
      const sfx = (Math.random() - 0.5) * 50;
      s.style.left = `${x + ox}px`;
      s.style.top = `${y + oy}px`;
      s.style.setProperty("--fx", `${sfx}px`);
      s.style.animationDelay = `${i * 0.05}s`;
      burstLayer.appendChild(s);
      s.addEventListener("animationend", () => s.remove());
    }

    text.addEventListener("animationend", () => {
      text.remove();
      burstCount = Math.max(0, burstCount - 1);
    });
  }

  /* ── Forgive rain ── */
  let raining = false;

  function startRain() {
    if (raining || prefersReduced) {
      forgiveBtn.textContent = "💜 thank you, my shahzadi";
      forgiveBtn.classList.add("accepted");
      return;
    }
    raining = true;
    forgiveBtn.textContent = "💜 thank you, my shahzadi";
    forgiveBtn.classList.add("accepted");

    const total = isMobile ? 45 : 80;
    const duration = 4500;

    for (let i = 0; i < total; i++) {
      setTimeout(() => {
        const isPetal = Math.random() > 0.4;
        const el = document.createElement("span");
        el.className = isPetal ? "petal" : "rain-star";
        if (!isPetal) el.textContent = Math.random() > 0.5 ? "✦" : "★";

        const left = Math.random() * 100;
        const fallDur = 2.5 + Math.random() * 2.5;
        const sx = (Math.random() - 0.5) * 80;
        const rot = `${180 + Math.random() * 360}deg`;

        el.style.left = `${left}%`;
        el.style.setProperty("--sx", `${sx}px`);
        el.style.setProperty("--rot", rot);
        el.style.animationDuration = `${fallDur}s`;
        el.style.animationDelay = `${Math.random() * 0.3}s`;
        rainLayer.appendChild(el);
        el.addEventListener("animationend", () => el.remove());
      }, (i / total) * duration * 0.55);
    }

    setTimeout(() => {
      raining = false;
    }, duration + 3000);
  }

  /* ── Desktop cursor ── */
  let mouseX = 0;
  let mouseY = 0;
  let sparkleTimer = 0;

  function initCursor() {
    if (!isFinePointer || isMobile) return;

    document.body.classList.add("has-custom-cursor");
    cursorPill.classList.add("visible");
    cursorPill.textContent = "🐻 Pooh";

    document.addEventListener(
      "mousemove",
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorPill.style.left = `${mouseX}px`;
        cursorPill.style.top = `${mouseY}px`;

        const now = performance.now();
        if (!prefersReduced && now - sparkleTimer > 55) {
          sparkleTimer = now;
          spawnSparkle(mouseX, mouseY);
        }
      },
      { passive: true }
    );

    document.addEventListener("mouseover", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;

      if (t.closest("#forgive-btn") || t === forgiveBtn) {
        cursorPill.textContent = "💍";
        cursorPill.classList.add("ring");
        whisper.classList.remove("show");
        return;
      }

      cursorPill.classList.remove("ring");
      cursorPill.textContent = "🐻 Pooh";

      const textEl = t.closest("p, h1, h2, h3, li, .letter-greeting, .letter-signoff, .hero-sub, .section-lead, .forgive-sub, .footer p");
      if (textEl && !t.closest("button") && !t.closest("a.scroll-hint")) {
        whisper.classList.add("show");
        whisper.style.left = `${mouseX}px`;
        whisper.style.top = `${mouseY}px`;
      } else {
        whisper.classList.remove("show");
      }
    });

    document.addEventListener("mouseout", (e) => {
      const related = e.relatedTarget;
      if (!(related instanceof Element) || !related.closest("p, h1, h2, h3, li, .letter-greeting, .letter-signoff, .hero-sub, .section-lead, .forgive-sub, .footer p")) {
        whisper.classList.remove("show");
      }
    });

    document.addEventListener(
      "mousemove",
      () => {
        if (whisper.classList.contains("show")) {
          whisper.style.left = `${mouseX}px`;
          whisper.style.top = `${mouseY}px`;
        }
      },
      { passive: true }
    );
  }

  const sparkles = [];
  const MAX_SPARKLES = 18;

  function spawnSparkle(x, y) {
    if (sparkles.length >= MAX_SPARKLES) {
      const old = sparkles.shift();
      old.remove();
    }
    const s = document.createElement("span");
    s.className = "sparkle";
    const ox = (Math.random() - 0.5) * 16;
    const oy = (Math.random() - 0.5) * 16;
    s.style.left = `${x + ox}px`;
    s.style.top = `${y + oy + 10}px`;
    document.body.appendChild(s);
    sparkles.push(s);
    s.addEventListener("animationend", () => {
      s.remove();
      const i = sparkles.indexOf(s);
      if (i >= 0) sparkles.splice(i, 1);
    });
  }

  /* ── Click / tap anywhere ── */
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (e.target.closest("#forgive-btn")) return;
      if (e.target.closest("a.scroll-hint")) return;
      spawnBurst(e.clientX, e.clientY, !isFinePointer || isMobile);
    },
    { passive: true }
  );

  forgiveBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    spawnBurst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, true);
    startRain();
  });

  /* ── Scroll reveal ── */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (prefersReduced) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
    );
    els.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 0.08}s`;
      io.observe(el);
    });
  }

  /* ── Init ── */
  createStars();
  initCursor();
  initReveal();
})();
