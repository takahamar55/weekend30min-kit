(() => {
  const settings = window.kitLpSettings || {};
  const dialog = document.querySelector('#opening');
  const video = document.querySelector('[data-opening-video]');
  const launch = document.querySelector('[data-opening-launch]');
  if (!dialog || !video || !launch) return;
  if (!settings.openingVideo || typeof dialog.showModal !== 'function') {
    dialog.remove();
    return;
  }

  const play = dialog.querySelector('[data-opening-play]');
  const sound = dialog.querySelector('[data-opening-sound]');
  const status = dialog.querySelector('#opening-status');
  const secs = settings.openingSeconds || 30;
  const key = 'kit-opening-presented-v1';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let invocation = 0;
  let timeout = 0;
  let returnFocus = launch;

  // cookie もサーバー記録も使わない。保存できないブラウザでも動く
  const wasPresented = () => {
    for (const s of ['localStorage', 'sessionStorage']) {
      try { if (window[s].getItem(key) === '1') return true; } catch {}
    }
    return false;
  };
  const remember = () => {
    for (const s of ['localStorage', 'sessionStorage']) {
      try { window[s].setItem(key, '1'); } catch {}
    }
  };
  const updateSound = () => { sound.textContent = video.muted ? '音声をオン' : '音声をオフ'; };
  const defaultStatus = () => `約${secs}秒のオープニング。終了後、自動でLPへ進みます。`;

  const tryPlay = async () => {
    const current = ++invocation;
    play.hidden = true;
    try {
      await video.play();
    } catch {
      if (!dialog.open || current !== invocation) return;
      play.hidden = false;
      status.textContent = video.error
        ? '動画を読み込めませんでした。スキップしてLPをご覧ください。'
        : '再生ボタンを押すと始まります。スキップもできます。';
    }
  };
  const close = () => { if (dialog.open) dialog.close(); };
  const open = (manual = false) => {
    if (dialog.open) return;
    returnFocus = manual ? document.activeElement : launch;
    video.muted = !manual;
    updateSound();
    play.hidden = true;
    status.textContent = defaultStatus();
    dialog.showModal();
    document.documentElement.classList.add('opening-active');
    remember();
    video.src = video.dataset.src;
    if (!manual && reducedMotion.matches) {
      video.preload = 'metadata';
      play.hidden = false;
      status.textContent = 'オープニングを見る場合は、再生ボタンを押してください。';
      return;
    }
    tryPlay();
    timeout = window.setTimeout(() => {
      if (dialog.open && video.readyState < 3) {
        status.textContent = '動画を読み込み中です。待たずにスキップしてLPへ進むこともできます。';
      }
    }, 12000);
  };

  launch.hidden = false;
  launch.addEventListener('click', () => open(true));
  dialog.querySelector('[data-opening-close]').addEventListener('click', close);
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dialog.addEventListener('close', () => {
    ++invocation;
    window.clearTimeout(timeout);
    video.pause();
    video.removeAttribute('src');
    video.load();
    document.documentElement.classList.remove('opening-active');
    returnFocus?.focus({ preventScroll: true });
  });
  play.addEventListener('click', () => { video.muted = false; updateSound(); tryPlay(); });
  sound.addEventListener('click', () => { video.muted = !video.muted; updateSound(); if (video.paused) tryPlay(); });
  video.addEventListener('volumechange', updateSound);
  video.addEventListener('ended', close);
  video.addEventListener('playing', () => {
    if (!dialog.open) { video.pause(); return; }
    window.clearTimeout(timeout);
    play.hidden = true;
    status.textContent = defaultStatus();
  });
  video.addEventListener('error', () => {
    if (!dialog.open) return;
    window.clearTimeout(timeout);
    play.hidden = true;
    status.textContent = '動画を読み込めませんでした。スキップしてLPをご覧ください。';
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && dialog.open) video.pause(); });
  window.addEventListener('pagehide', close);
  if (!wasPresented()) open();
})();
