/* ===========================
   時間帯で背景を切り替える
   朝（夜明け） 5:00〜8:00
   昼          8:00〜17:30（今のまま）
   夕暮れ      17:30〜19:30
   夜（ライトアップ） 19:30〜翌5:00
   時刻は見ている人の端末の時計で判断する
   =========================== */
(function () {
  var PHASES = ['dawn', 'day', 'dusk', 'night'];

  // 時刻（0:00からの分数）から時間帯を返す。区切りちょうどは新しい時間帯
  function phaseOf(date) {
    var m = date.getHours() * 60 + date.getMinutes();
    if (m >= 5 * 60 && m < 8 * 60) return 'dawn';
    if (m >= 8 * 60 && m < 17 * 60 + 30) return 'day';
    if (m >= 17 * 60 + 30 && m < 19 * 60 + 30) return 'dusk';
    return 'night';
  }

  // 背景の上に重ねる色の層を用意する（昼は何も重ねない）
  function buildSky() {
    if (document.querySelector('.time-sky')) return;
    var sky = document.createElement('div');
    sky.className = 'time-sky';
    sky.setAttribute('aria-hidden', 'true');
    ['dawn', 'dusk', 'night'].forEach(function (p) {
      var layer = document.createElement('div');
      layer.className = 'sky-layer sky-' + p;
      sky.appendChild(layer);
    });
    document.body.insertBefore(sky, document.body.firstChild);
  }

  var manual = null; // テスト用に手動で固定した時間帯

  function apply() {
    var p = manual || phaseOf(new Date());
    if (document.body.getAttribute('data-time') !== p) {
      document.body.setAttribute('data-time', p);
    }
  }

  // テストや確認のために外から使えるようにしておく
  window.TimeBg = {
    phaseOf: phaseOf,
    set: function (p) { manual = PHASES.indexOf(p) >= 0 ? p : null; apply(); },
    current: function () { return document.body.getAttribute('data-time'); }
  };

  function init() {
    var q = new URLSearchParams(location.search).get('time');
    if (q && PHASES.indexOf(q) >= 0) manual = q;
    buildSky();
    // 開いた瞬間はフェードなしで表示し、その後の切り替えだけゆっくり変える
    document.body.classList.add('time-bg-instant');
    apply();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.remove('time-bg-instant');
      });
    });
    // ページを開いたまま時間が過ぎても切り替わるよう、1分ごとに確認する
    setInterval(apply, 60 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
