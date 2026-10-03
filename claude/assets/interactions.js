(() => {
  const s = window.kitLpSettings || {};
  const links = document.querySelectorAll('[data-cta-link]');
  const notes = document.querySelectorAll('[data-cta-note]');
  const sticky = document.querySelector('[data-sticky]');
  const live = Boolean(s.brainUrl);

  links.forEach((a) => {
    if (live) {
      a.href = s.brainUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      a.classList.remove('is-pending');
    } else {
      a.removeAttribute('href');
      a.setAttribute('aria-disabled', 'true');
      a.classList.add('is-pending');
      if (!a.hasAttribute('data-sticky')) a.textContent = s.pendingLabel || '販売開始までお待ちください';
    }
  });
  notes.forEach((n) => { n.textContent = live ? '' : (s.pendingNote || ''); });

  // 追従ボタン: 販売中のみ・hero を過ぎたら出す
  if (sticky && live) {
    const hero = document.querySelector('#hero');
    const toggle = () => { sticky.hidden = window.scrollY < (hero ? hero.offsetHeight : 600); };
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
  }
})();
