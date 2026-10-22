/* 筑木·筑巢 — i18n engine (translations in /locales/*.js) */
(function (global) {
  'use strict';

  var LANGS = [
    { code: 'en', label: 'English', htmlLang: 'en' },
    { code: 'zh', label: '简体中文', htmlLang: 'zh-CN' },
    { code: 'zh-TW', label: '繁體中文', htmlLang: 'zh-TW' },
    { code: 'ja', label: '日本語', htmlLang: 'ja' },
    { code: 'ko', label: '한국어', htmlLang: 'ko' },
    { code: 'es', label: 'Español', htmlLang: 'es' },
    { code: 'fr', label: 'Français', htmlLang: 'fr' }
  ];

  // Populated by locales/*.js script tags loaded before this file
  var T = global.ArchiLocales || Object.create(null);
  global.ArchiLocales = T;

  function get(lang, key) {
    var pack = T[lang] || T.en;
    if (pack && pack[key] != null) return pack[key];
    if (T.en && T.en[key] != null) return T.en[key];
    return key;
  }

  function apply(lang) {
    if (!T[lang]) lang = 'en';
    var year = String(new Date().getFullYear());
    var meta = LANGS.find(function (l) { return l.code === lang; }) || LANGS[0];
    document.documentElement.lang = meta.htmlLang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = get(lang, key);
      if (val == null) return;
      val = String(val).replace(/\{year\}/g, year);
      if (el.hasAttribute('data-i18n-html') || /<[a-z][\s\S]*>/i.test(val)) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', get(lang, el.getAttribute('data-i18n-aria')));
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      el.setAttribute('alt', get(lang, el.getAttribute('data-i18n-alt')));
    });

    var title = get(lang, 'meta.title');
    if (title) document.title = title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', get(lang, 'meta.desc'));

    var logos = document.querySelectorAll('.brand__logo, .footer__logo');
    var isZh = lang === 'zh' || lang === 'zh-TW';
    var src = isZh ? 'assets/img/logo_ZH.svg' : 'assets/img/logo_EN.svg';
    logos.forEach(function (img) { img.setAttribute('src', src); });

    try { localStorage.setItem('archiwood_lang', lang); } catch (e) {}
    document.dispatchEvent(new CustomEvent('archiwood:lang', { detail: { lang: lang } }));
    return lang;
  }

  function detect() {
    try {
      var saved = localStorage.getItem('archiwood_lang');
      if (saved && T[saved]) return saved;
    } catch (e) {}
    return 'en';
  }

  function whenReady(cb) {
    // Locales are sync via <script> tags — always ready after this file runs
    cb();
  }

  global.ArchiI18n = {
    LANGS: LANGS,
    T: T,
    get: get,
    apply: apply,
    detect: detect,
    whenReady: whenReady,
    ready: true
  };
})(window);
