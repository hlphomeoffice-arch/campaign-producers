(() => {
  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const form = document.querySelector('[data-form]');
  const mobileCta = document.querySelector('[data-mobile-cta]');
  const contactSection = document.querySelector('#start');
  const year = document.querySelector('[data-year]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (year) year.textContent = new Date().getFullYear();

  const setHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 18);
  };

  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  const closeNav = () => {
    if (!navToggle || !nav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
  };

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
      document.body.classList.toggle('nav-open', !isOpen);
    });

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeNav();
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    revealItems.forEach((item) => item.setAttribute('data-observed', ''));
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
  }

  document.querySelectorAll('details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('details[open]').forEach((openDetail) => {
        if (openDetail !== detail) openDetail.removeAttribute('open');
      });
    });
  });

  if (form) {
    form.addEventListener('submit', () => {
      const submit = form.querySelector('button[type="submit"]');
      if (!submit) return;
      submit.disabled = true;
      submit.textContent = 'Sending your brief…';
    });
  }

  if (mobileCta && contactSection && 'IntersectionObserver' in window) {
    const syncMobileCta = () => {
      const rect = contactSection.getBoundingClientRect();
      mobileCta.classList.toggle('is-hidden', rect.top < window.innerHeight && rect.bottom > 0);
    };
    const contactObserver = new IntersectionObserver(syncMobileCta, { threshold: [0, 0.08] });
    contactObserver.observe(contactSection);
    window.addEventListener('scroll', syncMobileCta, { passive: true });
    window.addEventListener('resize', syncMobileCta);
    mobileCta.addEventListener('click', () => mobileCta.classList.add('is-hidden'));
    syncMobileCta();
  }
})();
