(() => {
  'use strict';
  const salesStatus = document.getElementById('sales-status');
  const brainUrl = typeof window.BRAIN_URL === 'string' ? window.BRAIN_URL.trim() : '';
  let destination;
  try {
    const url = new URL(brainUrl);
    if (url.protocol === 'https:' || url.protocol === 'http:') destination = url.href;
  } catch (_) { /* 未設定の場合は公開予定を案内します。 */ }
  document.querySelectorAll('.purchase').forEach(link => {
    if (destination) {
      link.href = destination;
    } else {
      link.addEventListener('click', () => {
        salesStatus.classList.add('highlight');
        salesStatus.setAttribute('tabindex', '-1');
        salesStatus.focus({ preventScroll: true });
      });
    }
  });
  if (destination) salesStatus.hidden = true;

  const dialog = document.getElementById('opening-dialog');
  const video = document.getElementById('opening-video');
  const trigger = document.getElementById('watch-video');
  const status = document.getElementById('video-status');
  const message = document.getElementById('opening-message');
  const seenKey = 'weekend30min-opening-seen';
  let seen = false;
  let available = false;
  let returnFocus = null;
  let loadTimer;
  try { seen = localStorage.getItem(seenKey) === '1'; } catch (_) {}
  function markSeen() {
    try { localStorage.setItem(seenKey, '1'); } catch (_) {}
  }
  function finish() {
    clearTimeout(loadTimer);
    video.pause();
    if (dialog.open) dialog.close();
    document.body.classList.remove('video-open');
    markSeen();
    const target = returnFocus || document.getElementById('main');
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
  async function playOpening(manual) {
    if (!available || typeof dialog.showModal !== 'function') return;
    returnFocus = manual ? trigger : null;
    video.currentTime = 0;
    message.textContent = '読み込み中です。スキップして本文へ進めます。';
    dialog.showModal();
    document.body.classList.add('video-open');
    loadTimer = setTimeout(() => {
      status.textContent = '動画を読み込めませんでした。本文をご覧ください。';
      finish();
    }, 15000);
    try {
      await video.play();
      clearTimeout(loadTimer);
      message.textContent = '';
      markSeen();
    } catch (_) {
      clearTimeout(loadTimer);
      message.textContent = '再生ボタンを押すか、スキップして本文へ進んでください。';
    }
  }
  document.getElementById('skip-video').addEventListener('click', finish);
  dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
  video.addEventListener('ended', finish);
  video.addEventListener('playing', () => { clearTimeout(loadTimer); message.textContent = ''; });
  video.addEventListener('error', () => {
    available = false;
    status.textContent = 'オープニング動画は準備中です。';
    if (dialog.open) finish();
  });
  trigger.addEventListener('click', () => {
    if (available) playOpening(true);
    else status.textContent = 'オープニング動画は準備中です。本文をご覧ください。';
  });
  // 存在を確認してから設定し、動画未配置でも本文をそのまま表示します。
  const controller = new AbortController();
  const probeTimer = setTimeout(() => controller.abort(), 5000);
  fetch('assets/video/opening.mp4', { method: 'HEAD', signal: controller.signal })
    .then(response => {
      if (!response.ok || (response.headers.get('content-type') || '').includes('text/html')) return;
      available = true;
      video.src = 'assets/video/opening.mp4';
      status.textContent = '約30秒のオープニング動画';
      if (!seen) playOpening(false);
    })
    .catch(() => { /* 動画なし・通信不可でもLPを表示できます。 */ })
    .finally(() => clearTimeout(probeTimer));
})();
