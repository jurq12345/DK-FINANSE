// DK Finanse — front-end interactions (no build step, no dependencies)

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeroSlider();
  initCounters();
  initScrollReveal();
  initScrollTopButton();
  initForms();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* ---------------- mobile navigation ---------------- */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Accordion-style submenu on mobile (tap "Oferta" to expand instead of hover)
  const subParent = nav.querySelector('.has-sub > a');
  if (subParent) {
    subParent.addEventListener('click', (e) => {
      if (window.innerWidth > 900) return;
      const parentLi = subParent.closest('.has-sub');
      const alreadyOpen = parentLi.classList.contains('is-open');
      if (!alreadyOpen) {
        e.preventDefault();
        parentLi.classList.add('is-open');
      }
    });
  }

  // Close mobile menu after a link is clicked
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

/* ---------------- hero slider ---------------- */
function initHeroSlider() {
  const root = document.getElementById('hero-slider');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.slide'));
  const dotsWrap = document.getElementById('slider-dots');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  let current = slides.findIndex((s) => s.classList.contains('is-active'));
  if (current === -1) current = 0;
  let timer = null;
  const AUTOPLAY_MS = 5500;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Slajd ${i + 1}`);
    if (i === current) dot.classList.add('is-active');
    dot.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(dot);
  });

  function render() {
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  function goTo(index, userTriggered) {
    current = (index + slides.length) % slides.length;
    render();
    if (userTriggered) restartAutoplay();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function restartAutoplay() {
    clearInterval(timer);
    timer = setInterval(next, AUTOPLAY_MS);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1, true));
  nextBtn.addEventListener('click', () => goTo(current + 1, true));

  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', restartAutoplay);

  // pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(timer);
    else restartAutoplay();
  });

  restartAutoplay();
}

/* ---------------- animated counters ---------------- */
function initCounters() {
  const counters = document.querySelectorAll('.counter-num');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.countTo, 10) || 0;
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach((c) => observer.observe(c));
}

/* ---------------- reveal-on-scroll ---------------- */
function initScrollReveal() {
  const selectors = [
    '.trust-item', '.offer-row', '.step', '.testimonial-card',
    '.visual-card', '.intro-copy', '.contact-form'
  ];
  const targets = document.querySelectorAll(selectors.join(','));
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach((el) => {
    el.setAttribute('data-reveal', '');
    observer.observe(el);
  });
}

/* ---------------- scroll-to-top button ---------------- */
function initScrollTopButton() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------------- forms (static site — no backend) ---------------- */
function initForms() {
  document.querySelectorAll('form[data-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const note = form.parentElement.querySelector('[data-note]') ||
                   form.nextElementSibling;

      if (note && note.hasAttribute('data-note')) {
        note.hidden = false;
      }

      form.reset();
    });
  });
}
