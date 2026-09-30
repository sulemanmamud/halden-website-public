(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------- Header: solid after hero, hide on scroll down ---------- */
  const header = $('#header');
  const hero = $('.hero');
  let lastY = window.scrollY;

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('.menu-btn');
  const menu = $('#mobile-menu');
  const setMenu = open => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
    header.classList.remove('is-hidden');
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });

  /* ---------- Scroll reveal ---------- */
  const reveals = $$('.reveal');
  reveals.forEach(el => {
    const i = el.parentElement ? $$(':scope > .reveal', el.parentElement).indexOf(el) : 0;
    el.style.setProperty('--d', `${Math.max(i, 0) * 110}ms`);
  });
  const show = el => el.classList.add('is-in');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(show);
  } else {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  }
  // Anything already scrolled past (anchor jumps, fast flicks) shows immediately.
  const revealPassed = () => {
    const vh = window.innerHeight;
    reveals.forEach(el => { if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < vh) show(el); });
  };

  /* ---------- Count-up stats ---------- */
  const counters = $$('[data-count]');
  const countUp = el => {
    const end = Number(el.dataset.count);
    if (reduceMotion) return;
    const start = performance.now();
    const dur = 1400;
    const step = t => {
      const p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); }
    }), { threshold: 0.6 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---------- Parallax ---------- */
  const heroImg = $('img[data-parallax="hero"]');
  const bandImg = $('img[data-parallax="band"]');

  /* ---------- Active nav link ---------- */
  const navLinks = $$('.header nav a');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const heroBottom = hero.offsetHeight - 80;

    header.classList.toggle('is-solid', y > heroBottom);
    if (!menu.classList.contains('is-open')) {
      if (y <= heroBottom || y < lastY - 4) header.classList.remove('is-hidden');
      else if (y > lastY + 4) header.classList.add('is-hidden');
    }
    lastY = y;

    revealPassed();

    if (!reduceMotion) {
      if (heroImg && y < vh) heroImg.style.transform = `translate3d(0, ${y * 0.22}px, 0) scale(1.04)`;
      if (bandImg) {
        const r = bandImg.parentElement.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
          bandImg.style.transform = `translate3d(0, ${p * -15}%, 0)`;
        }
      }
    }

    const mid = vh * 0.4;
    let current = null;
    sections.forEach(s => { const r = s.getBoundingClientRect(); if (r.top < mid && r.bottom > mid) current = s.id; });
    navLinks.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === `#${current}`)));
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Product dialog ---------- */
  const PIECES = {
    ryke: {
      name: 'Ryke Coat', cloth: 'Double-faced cashmere velvet', price: '€ 2,480', eyebrow: 'Outerwear',
      desc: 'Unlined, so the cloth can move. Two faces of cashmere joined by hand, with no seam allowance to show inside.',
      images: [['ryke-front', 'Ryke Coat, front', 600], ['ryke-back', 'Ryke Coat, back', 600]],
      specs: [['Cloth', '100% cashmere, woven in Biella'], ['Made', 'Berlin atelier, 14 days'], ['Fit', 'Cut to the shoulder, falls below the knee'], ['Care', 'Brush after wear. Rest between days.']],
    },
    holm: {
      name: 'Holm Knit', cloth: 'Extra-fine merino', price: '€ 890', eyebrow: 'Knitwear',
      desc: 'A cable that does not announce itself. Knitted fully-fashioned, so each panel is shaped rather than cut.',
      images: [['holm', 'Holm Knit, navy cable merino', 340]],
      specs: [['Cloth', '100% extra-fine merino, 16.5 micron'], ['Made', 'Copenhagen atelier, 6 days'], ['Fit', 'Close at the wrist, relaxed at the body'], ['Care', 'Hand wash cold. Dry flat.']],
    },
    vale: {
      name: 'Vale Trouser', cloth: 'Wool twill', price: '€ 720', eyebrow: 'Tailoring',
      desc: 'A high rise and a single pleat. The hem is left long so it can be finished to the wearer at the appointment.',
      images: [['vale', 'Vale Trouser', 600]],
      specs: [['Cloth', '100% wool twill, 290 g/m²'], ['Made', 'London atelier, 9 days'], ['Fit', 'High rise, straight leg, unfinished hem'], ['Care', 'Steam. Dry clean rarely.']],
    },
    norr: {
      name: 'Norr Bag', cloth: 'Vegetable-tanned leather', price: '€ 1,240', eyebrow: 'Leather',
      desc: 'One piece of leather, folded and stitched by hand. It darkens where it is carried.',
      images: [['norr', 'Norr Bag', 690]],
      specs: [['Leather', 'Vegetable-tanned calf, Tuscany'], ['Made', 'Berlin atelier, 12 days'], ['Size', '38 × 28 × 12 cm'], ['Care', 'Condition twice a year.']],
    },
  };

  const dialog = $('#piece');
  const gallery = $('#piece-gallery');
  let opener = null;

  const openPiece = key => {
    const p = PIECES[key];
    if (!p) return;
    $('#piece-eyebrow').textContent = p.eyebrow;
    $('#piece-title').textContent = p.name;
    $('#piece-cloth').textContent = p.cloth;
    $('#piece-desc').textContent = p.desc;
    $('#piece-price').textContent = p.price;
    gallery.innerHTML = p.images.map(([img, alt, w]) =>
      `<picture><source type="image/avif" srcset="img/${img}-${w}.avif"><img src="img/${img}-${w}.webp" alt="${alt}" width="${w}" height="${Math.round(w * 4 / 3)}" decoding="async"></picture>`
    ).join('');
    $('#piece-specs').innerHTML = p.specs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
    $('#piece-enquire').dataset.piece = p.name;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    history.replaceState(null, '', `#piece-${key}`);
  };
  const closePiece = () => {
    if (dialog.open) dialog.close();
  };

  $$('.card[data-piece]').forEach(card => card.addEventListener('click', () => { opener = card; openPiece(card.dataset.piece); }));
  $('[data-close]', dialog).addEventListener('click', closePiece);
  dialog.addEventListener('click', e => { if (e.target === dialog) closePiece(); });
  dialog.addEventListener('close', () => {
    if (location.hash.startsWith('#piece-')) history.replaceState(null, '', location.pathname + location.search);
    opener && opener.focus({ preventScroll: true });
  });
  $('#piece-enquire').addEventListener('click', e => {
    const piece = e.currentTarget.dataset.piece;
    const select = $('#f-piece');
    if (piece) select.value = piece;
    closePiece();
  });

  // Deep link: /#piece-ryke opens that piece.
  const deep = location.hash.match(/^#piece-(\w+)$/);
  if (deep && PIECES[deep[1]]) {
    $('#wardrobe').scrollIntoView();
    opener = $(`.card[data-piece="${deep[1]}"]`);
    openPiece(deep[1]);
  }

  /* ---------- Appointment form → composed email ---------- */
  const form = $('#appointment');
  const status = $('#form-status');
  const dateInput = $('#f-date');
  dateInput.min = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    if (!name) {
      form.elements.name.focus();
      status.textContent = 'Your name, please. Nothing else is required.';
      return;
    }
    const d = form.elements.date.value ? new Date(form.elements.date.value + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Flexible';
    const lines = [
      `Name: ${name}`,
      `Atelier: ${form.elements.city.value}`,
      `Interested in: ${form.elements.piece.value}`,
      `Preferred date: ${d}`,
      form.elements.note.value.trim() ? `\n${form.elements.note.value.trim()}` : '',
    ].filter(Boolean);
    const subject = `Appointment — ${form.elements.piece.value} — ${form.elements.city.value}`;
    window.location.href = `mailto:atelier@halden.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    status.textContent = 'Your email is open with the request written. The house replies within two days.';
  });

  $('#year').textContent = new Date().getFullYear();
})();
