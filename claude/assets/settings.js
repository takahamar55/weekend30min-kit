// 公開前にここだけ差し替える（index.html は再生成しなくてよい）
window.kitLpSettings = {
  // Brain の商品ページ URL。10/20 の Brain 登録後に入れる。空なら「販売開始予定」表示になる
  brainUrl: "",
  // 空のときにボタンに出す文言
  pendingLabel: "販売ページ（Brain）は 10月下旬 公開予定です",
  pendingNote: "先着10名の早割 14,800円は、販売開始と同時にご案内します。",
  // オープニング動画（assets/video/opening.mp4）が置けたら true
  openingVideo: false,
  openingSeconds: 30,
};
