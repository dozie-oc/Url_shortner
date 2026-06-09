/* =========================================================
   SnapLink – app.js
   Handles: shortener widget, navbar, reveals, stats counter,
            pricing toggle, hamburger menu, QR code generator
   ========================================================= */

'use strict';

// ── HELPERS ──────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch { return false; }
}

function randomSlug(len = 7) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function formatNumber(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + 'K';
  return String(n);
}

// ── NAVBAR SCROLL ─────────────────────────────────────────
(function initNavbar() {
  const navbar = $('#navbar');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// ── HAMBURGER MENU ────────────────────────────────────────
(function initHamburger() {
  const btn  = $('#hamburger');
  const menu = $('#mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', !open);
  });

  // close on link click
  $$('.mobile-link', menu).forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', true);
    });
  });
})();

// ── SCROLL REVEAL ─────────────────────────────────────────
(function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          // Stagger siblings in the same grid/flex parent
          const siblings = $$('.reveal', e.target.parentElement);
          const idx = siblings.indexOf(e.target);
          e.target.style.transitionDelay = `${idx * 60}ms`;
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach(el => observer.observe(el));
})();

// ── STAT COUNTER ANIMATION ────────────────────────────────
(function initStats() {
  const cards = $$('.stat-num[data-target]');
  if (!cards.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 4);

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const val = Math.round(easeOut(progress) * target);
      el.textContent = formatNumber(val);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  cards.forEach(el => observer.observe(el));
})();

// ── PRICING TOGGLE ────────────────────────────────────────
(function initPricingToggle() {
  const toggle = $('#billing-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const isAnnual = toggle.getAttribute('aria-checked') === 'true';
    const next = !isAnnual;
    toggle.setAttribute('aria-checked', next);

    $$('.price-amount').forEach(el => {
      const val = next ? el.dataset.annual : el.dataset.monthly;
      el.textContent = val;
    });
  });
})();

// ── QR CODE GENERATOR (pure canvas, no library) ───────────
// Minimal QR-like visual pattern for demo purposes.
// In production, wire up a real QR library (e.g. qrcode.js).
function drawQR(canvas, text) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Seed a deterministic grid from text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  const modules = 21; // QR version 1 = 21×21
  const cell = Math.floor(size / modules);
  ctx.fillStyle = '#111827';

  // Helper for finder patterns (3 corners)
  function finder(ox, oy) {
    ctx.fillStyle = '#111827';
    ctx.fillRect(ox * cell, oy * cell, 7 * cell, 7 * cell);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect((ox + 1) * cell, (oy + 1) * cell, 5 * cell, 5 * cell);
    ctx.fillStyle = '#111827';
    ctx.fillRect((ox + 2) * cell, (oy + 2) * cell, 3 * cell, 3 * cell);
  }

  finder(0, 0);
  finder(modules - 7, 0);
  finder(0, modules - 7);

  // Data modules (pseudo-random from hash)
  let seed = Math.abs(hash);
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      // Skip finder regions
      if ((row < 8 && col < 8) || (row < 8 && col >= modules - 8) || (row >= modules - 8 && col < 8)) continue;
      seed ^= seed << 13; seed ^= seed >> 7; seed ^= seed << 17;
      if (seed & 1) {
        ctx.fillStyle = '#111827';
        ctx.fillRect(col * cell, row * cell, cell, cell);
      }
    }
  }
}

// ── URL SHORTENER WIDGET ──────────────────────────────────
(function initShortener() {
  const urlInput    = $('#url-input');
  const slugInput   = $('#custom-slug');
  const expirySelect = $('#expiry-select');
  const shortenBtn  = $('#shorten-btn');
  const resultWrap  = $('#result-wrap');
  const resultLink  = $('#result-link');
  const errorWrap   = $('#error-wrap');
  const errorMsg    = $('#error-msg');
  const copyBtn     = $('#copy-btn');
  const qrBtn       = $('#qr-btn');
  const qrWrap      = $('#qr-wrap');
  const qrCanvas    = $('#qr-canvas');
  const downloadQr  = $('#download-qr');

  let currentShortUrl = '';
  let qrVisible = false;

  function showError(msg) {
    errorMsg.textContent = msg;
    errorWrap.hidden = false;
    resultWrap.hidden = true;
  }

  function hideError() {
    errorWrap.hidden = true;
  }

  function showResult(shortUrl) {
    resultLink.href = shortUrl;
    resultLink.textContent = shortUrl;
    resultWrap.hidden = false;
    errorWrap.hidden = true;
    qrWrap.hidden = true;
    qrVisible = false;
    qrBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
      </svg>QR Code`;
  }

  async function handleShorten() {
    hideError();
    const rawUrl = urlInput.value.trim();

    if (!rawUrl) {
      showError('Please enter a URL to shorten.');
      urlInput.focus();
      return;
    }
    if (!isValidUrl(rawUrl)) {
      showError('Please enter a valid URL starting with http:// or https://');
      urlInput.focus();
      return;
    }

    // Simulate loading
    shortenBtn.classList.add('loading');
    shortenBtn.disabled = true;
    resultWrap.hidden = true;

    await sleep(900 + Math.random() * 400);

    const slug = slugInput.value.trim().replace(/[^a-zA-Z0-9-_]/g, '') || randomSlug();
    currentShortUrl = `https://snaplink.io/${slug}`;

    shortenBtn.classList.remove('loading');
    shortenBtn.disabled = false;

    showResult(currentShortUrl);

    // Scroll into view
    resultWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  shortenBtn.addEventListener('click', handleShorten);

  urlInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleShorten();
  });

  // ── COPY ──
  copyBtn.addEventListener('click', async () => {
    if (!currentShortUrl) return;
    try {
      await navigator.clipboard.writeText(currentShortUrl);
      const orig = copyBtn.innerHTML;
      copyBtn.innerHTML = '✓ Copied!';
      copyBtn.style.color = 'var(--clr-green)';
      await sleep(1800);
      copyBtn.innerHTML = orig;
      copyBtn.style.color = '';
    } catch {
      // Fallback for browsers that block clipboard
      const ta = document.createElement('textarea');
      ta.value = currentShortUrl;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyBtn.innerHTML = '✓ Copied!';
      await sleep(1800);
      copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy`;
    }
  });

  // ── QR CODE ──
  qrBtn.addEventListener('click', () => {
    qrVisible = !qrVisible;
    qrWrap.hidden = !qrVisible;
    if (qrVisible) {
      drawQR(qrCanvas, currentShortUrl);
      qrBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>Hide QR`;
    } else {
      qrBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
        </svg>QR Code`;
    }
  });

  // ── DOWNLOAD QR ──
  downloadQr.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'snaplink-qr.png';
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
  });

  // ── Slug validation: alphanumeric + dash only ──
  slugInput.addEventListener('input', () => {
    slugInput.value = slugInput.value.replace(/[^a-zA-Z0-9-_]/g, '');
  });
})();

// ── SMOOTH ANCHOR SCROLL (offset for fixed navbar) ────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── MOCK BAR HOVER ANIMATION ──────────────────────────────
(function initMockBars() {
  const bars = $$('.mock-bar');
  bars.forEach(bar => {
    bar.addEventListener('mouseenter', () => { bar.style.opacity = '0.9'; });
    bar.addEventListener('mouseleave', () => { bar.style.opacity = ''; });
  });
})();

// ── URL INPUT — live URL paste detection ──────────────────
(function initPasteDetect() {
  const input = $('#url-input');
  if (!input) return;

  input.addEventListener('paste', (e) => {
    // Give the browser time to update the input value
    setTimeout(() => {
      const val = input.value.trim();
      if (isValidUrl(val)) {
        input.style.borderColor = 'var(--clr-green)';
        setTimeout(() => { input.style.borderColor = ''; }, 1200);
      }
    }, 10);
  });

  input.addEventListener('input', () => {
    input.style.borderColor = '';
  });
})();

// ── FEATURE CARD TILT EFFECT ──────────────────────────────
(function initTilt() {
  if (window.matchMedia('(hover: none)').matches) return; // skip touch

  $$('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .4s cubic-bezier(.4,0,.2,1)';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform .12s linear';
    });
  });
})();

console.log('%c⚡ SnapLink', 'color:#9d5cf5;font-size:1.4rem;font-weight:900;');
console.log('%cBuilt with Flask · FastAPI · PostgreSQL', 'color:#94a3b8;font-size:.9rem;');
