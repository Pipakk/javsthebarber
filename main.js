/* ═══════════════════════════════════════════════════════════════
   JAVS THE BARBER — main.js
   Hexagon canvas · Parallax · Scroll reveals · Gallery · Nav
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── Utilidades ── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* ══════════════════════════════════════
   1. HEXAGON CANVAS ENGINE
══════════════════════════════════════ */
class HexCanvas {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.opts   = {
      size:        opts.size        ?? 60,
      gap:         opts.gap         ?? 4,
      glowColor:   opts.glowColor   ?? 'rgba(255,255,255,0.9)',
      bgColor:     opts.bgColor     ?? 'transparent',
      pulseSpeed:  opts.pulseSpeed  ?? 0.6,
      opacity:     opts.opacity     ?? 1,
      animated:    opts.animated    ?? true,
      density:     opts.density     ?? 1,
      perspective: opts.perspective ?? false,
    };
    this.hexes  = [];
    this.time   = 0;
    this.raf    = null;
    this.resizeObs = new ResizeObserver(() => this._resize());
    this.resizeObs.observe(canvas.parentElement || canvas);
    this._resize();
    if (this.opts.animated) this._loop();
    else this._draw();
  }

  _hexPoints(cx, cy, r) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 180 * (60 * i - 30);
      pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    return pts;
  }

  _resize() {
    const par = this.canvas.parentElement || document.body;
    this.canvas.width  = par.offsetWidth  || window.innerWidth;
    this.canvas.height = par.offsetHeight || 200;
    this._buildGrid();
    if (!this.opts.animated) this._draw();
  }

  _buildGrid() {
    const { size, gap } = this.opts;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const r = size;
    const w = Math.sqrt(3) * r;
    const h = 2 * r;
    const hGap = w + gap;
    const vGap = h * 0.75 + gap * 0.5;

    this.hexes = [];

    const cols = Math.ceil(W / hGap) + 2;
    const rows = Math.ceil(H / vGap) + 2;

    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const cx = col * hGap + (row % 2 === 0 ? 0 : hGap / 2);
        const cy = row * vGap;
        this.hexes.push({
          cx, cy,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.5,
          brightness: 0.3 + Math.random() * 0.7,
        });
      }
    }
  }

  _draw() {
    const { ctx, canvas, hexes, opts, time } = this;
    const { size, gap, glowColor, bgColor, opacity, perspective } = opts;
    const r = size - gap / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.save();
    ctx.globalAlpha = opacity;

    for (const hex of hexes) {
      const pulse = (Math.sin(time * hex.speed + hex.phase) + 1) / 2;
      const bright = hex.brightness * (0.4 + pulse * 0.6);

      const pts = this._hexPoints(hex.cx, hex.cy, r);

      /* Borde luminoso estilo LED */
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < 6; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();

      /* Línea LED */
      ctx.strokeStyle = `rgba(255,255,255,${bright * 0.85})`;
      ctx.lineWidth = 1.5 + pulse * 1;
      ctx.stroke();

      /* Glow exterior */
      ctx.shadowColor  = glowColor;
      ctx.shadowBlur   = 6 + pulse * 12;
      ctx.strokeStyle  = `rgba(255,255,255,${bright * 0.5})`;
      ctx.lineWidth    = 0.5;
      ctx.stroke();
      ctx.shadowBlur   = 0;

      /* Relleno muy sutil */
      ctx.fillStyle = `rgba(255,255,255,${bright * 0.03})`;
      ctx.fill();
    }

    ctx.restore();
  }

  _loop() {
    const tick = (ts) => {
      this.time = ts / 1000;
      this._draw();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
  }
}

/* ══════════════════════════════════════
   2. HERO VIDEO — autoplay seguro
══════════════════════════════════════ */
function initHeroVideo() {
  const video = qs('.hero__video');
  if (!video) return;
  video.play().catch(() => {
    /* Si autoplay bloqueado (poco habitual con muted+playsinline), sin error */
  });
}

/* ══════════════════════════════════════
   3. HEXÁGONOS FONDO SECCIÓN (servicios)
   (inicializado con lazy observer en #16)
══════════════════════════════════════ */
function initBgHexes() { /* no-op: handled lazily */ }

/* ══════════════════════════════════════
   4. CTA FINAL HEX CANVAS
══════════════════════════════════════ */
function initCtaHex() {
  const canvas = qs('#ctaHexCanvas');
  if (!canvas) return;
  new HexCanvas(canvas, {
    size:      55,
    gap:       6,
    glowColor: 'rgba(255,255,255,0.9)',
    bgColor:   'transparent',
    opacity:   0.18,
    animated:  true,
    pulseSpeed: 0.5,
  });
}

/* ══════════════════════════════════════
   5. HEX DIVIDER STRIPS
══════════════════════════════════════ */
function initHexDividers() {
  qsa('[data-hex-strip]').forEach(canvas => {
    new HexCanvas(canvas, {
      size:      28,
      gap:       3,
      glowColor: 'rgba(255,255,255,0.9)',
      bgColor:   'transparent',
      opacity:   0.5,
      animated:  true,
      pulseSpeed: 1.2,
    });
  });
}

/* ══════════════════════════════════════
   6. (Partículas eliminadas por rendimiento)
══════════════════════════════════════ */
function initParticles() { /* no-op */ }

/* ══════════════════════════════════════
   7. SCROLL REVEAL (IntersectionObserver)
══════════════════════════════════════ */
function initReveal() {
  const els = qsa('.reveal-up, .reveal-right, .reveal-scale');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════
   8. PARALLAX LIGERO — solo video y barbero
   (eliminado el scroll en canvas para rendimiento)
══════════════════════════════════════ */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  const heroVideo = qs('.hero__video');
  if (!heroVideo) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const sy = window.scrollY;
        heroVideo.style.transform = `translateY(${sy * 0.25}px) scale(1.05)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ══════════════════════════════════════
   9. MOUSE GLOW en hero (desktop)
══════════════════════════════════════ */
function initMouseGlow() {
  if (window.innerWidth < 900) return;

  const hero = qs('.hero');
  if (!hero) return;

  let glow = document.createElement('div');
  glow.style.cssText = `
    position: absolute;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 3;
    transform: translate(-50%,-50%);
    transition: opacity 0.3s;
    top: 0; left: 0;
  `;
  hero.appendChild(glow);

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    glow.style.left = (e.clientX - rect.left) + 'px';
    glow.style.top  = (e.clientY - rect.top)  + 'px';
  });
}

/* ══════════════════════════════════════
   10. NAVEGACIÓN: scroll state + menú móvil
══════════════════════════════════════ */
function initNav() {
  const nav       = qs('#nav');
  const menuBtn   = qs('#menuBtn');
  const navLinks  = qs('#navLinks');
  const overlay   = qs('#navOverlay');

  /* Scroll state */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }, { passive: true });

  /* Menú hamburguesa */
  const toggleMenu = () => {
    const open = navLinks.classList.toggle('open');
    menuBtn.classList.toggle('active', open);
    overlay.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  const closeMenu = () => {
    navLinks.classList.remove('open');
    menuBtn.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  menuBtn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  /* Cerrar menú al clicar link */
  qsa('.nav__link, .btn--nav', navLinks).forEach(el => {
    el.addEventListener('click', closeMenu);
  });
}

/* ══════════════════════════════════════
   11. GALERÍA TÁCTIL (El Local)
══════════════════════════════════════ */
function initGallery() {
  const gallery = qs('#localGallery');
  const prevBtn = qs('#galleryPrev');
  const nextBtn = qs('#galleryNext');
  const dotsWrap = qs('#galleryDots');
  if (!gallery) return;

  const slides = qsa('.local__slide', gallery);
  let current  = 0;
  let startX   = 0;
  let isDragging = false;

  /* Crear dots */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = qsa('.gallery-dot', dotsWrap);

  const goTo = (idx) => {
    current = clamp(idx, 0, slides.length - 1);
    const slideW = slides[0].offsetWidth + 16; // gap
    gallery.scrollTo({ left: current * slideW, behavior: 'smooth' });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  /* Detección de scroll snap manual */
  gallery.addEventListener('scroll', () => {
    const slideW = slides[0].offsetWidth + 16;
    const idx = Math.round(gallery.scrollLeft / slideW);
    if (idx !== current) {
      current = idx;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }
  }, { passive: true });

  /* Drag desktop */
  gallery.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - gallery.offsetLeft;
    gallery.style.userSelect = 'none';
  });
  gallery.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = e.pageX - gallery.offsetLeft;
    gallery.scrollLeft += (startX - x) * 0.5;
    startX = x;
  });
  ['mouseup','mouseleave'].forEach(ev => {
    gallery.addEventListener(ev, () => {
      isDragging = false;
      gallery.style.userSelect = '';
    });
  });
}

/* ══════════════════════════════════════
   12. CTA FLOTANTE MÓVIL
══════════════════════════════════════ */
function initCtaFloat() {
  const cta  = qs('#ctaFloat');
  const hero = qs('.hero');
  if (!cta || !hero) return;

  const obs = new IntersectionObserver((entries) => {
    const heroVisible = entries[0].isIntersecting;
    cta.classList.toggle('visible', !heroVisible);
  }, { threshold: 0.1 });

  obs.observe(hero);

  /* Ocultar cuando se llega al footer */
  const footer = qs('.footer');
  if (footer) {
    const obs2 = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) cta.classList.remove('visible');
    });
    obs2.observe(footer);
  }
}

/* ══════════════════════════════════════
   13. CARD TILT EFECTO 3D (desktop)
══════════════════════════════════════ */
function initCardTilt() {
  if (window.innerWidth < 900) return;

  qsa('.servicio-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = dy * -6;
      const rotY   = dx * 6;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s linear';
    });
  });
}

/* ══════════════════════════════════════
   14. PARALLAX SECCIONES — eliminado por rendimiento
   (los scroll listeners múltiples en móvil son costosos)
══════════════════════════════════════ */
function initSectionParallax() { /* no-op */ }

/* ══════════════════════════════════════
   15. SMOOTH ANCHOR SCROLL
══════════════════════════════════════ */
function initSmoothAnchors() {
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = qs(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ══════════════════════════════════════
   16. NÚMERO ANIMADO (rating)
══════════════════════════════════════ */
function initCountUp() {
  const targets = qsa('.badge-num');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const end   = parseFloat(el.textContent);
      let start   = 0;
      const step  = end / 60;
      const timer = setInterval(() => {
        start = Math.min(start + step, end);
        el.textContent = start.toFixed(1);
        if (start >= end) clearInterval(timer);
      }, 16);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  targets.forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════
   17. PERFORMANCE: lazy canvas init
══════════════════════════════════════ */
function initLazyCanvases() {
  /* bg hex del servicios lo iniciamos con IntersectionObserver */
  const hexBg = qs('#hexBgCanvas');
  if (!hexBg) return;

  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      new HexCanvas(hexBg, {
        size:       80,
        gap:        10,
        glowColor:  'rgba(201,169,110,0.6)',
        bgColor:    'transparent',
        opacity:    0.5,
        animated:   true,
        pulseSpeed: 0.4,
      });
      obs.disconnect();
    }
  }, { threshold: 0 });

  obs.observe(hexBg);
}

/* ══════════════════════════════════════
   INIT — DOMContentLoaded
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHeroVideo();
  initHexDividers();
  initCtaHex();
  initReveal();
  initParallax();
  initMouseGlow();
  initGallery();
  initCtaFloat();
  initCardTilt();
  initSectionParallax();
  initSmoothAnchors();
  initCountUp();
  initLazyCanvases();
});
