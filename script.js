// 筑木·筑巢 — interactions + language switcher
(function () {
  'use strict';

  var currentLang = 'en';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function syncCompanyEnLine(lang) {
    var enLine = document.querySelector('.ccard__en');
    if (enLine) enLine.hidden = !(lang === 'zh' || lang === 'zh-TW');
  }

  function setLang(code) {
    if (!window.ArchiI18n) return;
    currentLang = ArchiI18n.apply(code);
    buildLangMenu(currentLang);
    syncCompanyEnLine(currentLang);
  }

  /* ---------- Language switcher (keyboard accessible) ---------- */
  function getLangOptions() {
    return Array.prototype.slice.call(document.querySelectorAll('#langMenu [role="option"]'));
  }

  function openLangMenu(focusIndex) {
    var menu = document.getElementById('langMenu');
    var btn = document.getElementById('langBtn');
    if (!menu || !btn) return;
    menu.removeAttribute('hidden');
    btn.setAttribute('aria-expanded', 'true');
    var opts = getLangOptions();
    var idx = typeof focusIndex === 'number' ? focusIndex : opts.findIndex(function (o) {
      return o.getAttribute('aria-selected') === 'true';
    });
    if (idx < 0) idx = 0;
    if (opts[idx]) opts[idx].focus();
  }

  function closeLangMenu(returnFocus) {
    var menu = document.getElementById('langMenu');
    var btn = document.getElementById('langBtn');
    if (menu) menu.setAttribute('hidden', '');
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      if (returnFocus) btn.focus();
    }
  }

  function toggleLangMenu() {
    var menu = document.getElementById('langMenu');
    if (!menu) return;
    if (menu.hasAttribute('hidden')) openLangMenu();
    else closeLangMenu(false);
  }

  function focusLangOption(delta) {
    var opts = getLangOptions();
    if (!opts.length) return;
    var i = opts.indexOf(document.activeElement);
    if (i < 0) i = opts.findIndex(function (o) { return o.getAttribute('aria-selected') === 'true'; });
    if (i < 0) i = 0;
    i = (i + delta + opts.length) % opts.length;
    opts[i].focus();
  }

  function buildLangMenu(active) {
    var menu = document.getElementById('langMenu');
    var current = document.getElementById('langCurrent');
    var btn = document.getElementById('langBtn');
    if (!menu || !window.ArchiI18n) return;

    menu.innerHTML = '';
    ArchiI18n.LANGS.forEach(function (lang) {
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('tabindex', '-1');
      li.setAttribute('data-lang', lang.code);
      li.setAttribute('aria-selected', lang.code === active ? 'true' : 'false');
      li.id = 'lang-opt-' + lang.code;
      li.textContent = lang.label;
      li.addEventListener('click', function () {
        setLang(lang.code);
        closeLangMenu(true);
      });
      menu.appendChild(li);
    });

    var activeMeta = ArchiI18n.LANGS.find(function (l) { return l.code === active; });
    if (current && activeMeta) current.textContent = activeMeta.label;
    if (btn) btn.setAttribute('aria-activedescendant', 'lang-opt-' + active);

    if (btn && !btn._langBound) {
      btn._langBound = true;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleLangMenu();
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLangMenu(0);
        } else if (e.key === 'Escape') {
          closeLangMenu(false);
        }
      });
      menu.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeLangMenu(true);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          focusLangOption(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          focusLangOption(-1);
        } else if (e.key === 'Home') {
          e.preventDefault();
          var opts = getLangOptions();
          if (opts[0]) opts[0].focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          var all = getLangOptions();
          if (all.length) all[all.length - 1].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var el = document.activeElement;
          if (el && el.getAttribute('role') === 'option') el.click();
        } else if (e.key === 'Tab') {
          closeLangMenu(false);
        }
      });
      document.addEventListener('click', function () { closeLangMenu(false); });
      menu.addEventListener('click', function (e) { e.stopPropagation(); });
    }
  }

  function initI18n() {
    if (!window.ArchiI18n) return;
    ArchiI18n.whenReady(function () {
      // Keep static HTML English if locales failed to load
      if (!ArchiI18n.T.en) {
        buildLangMenu('en');
        return;
      }
      currentLang = ArchiI18n.detect();
      if (!ArchiI18n.T[currentLang]) currentLang = 'en';
      ArchiI18n.apply(currentLang);
      buildLangMenu(currentLang);
      syncCompanyEnLine(currentLang);
    });
  }

  initI18n();

  /* ---------- Nav ---------- */
  var nav = document.getElementById('nav');
  var onScroll = function () { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Optimize tabs (ARIA + keyboard) ---------- */
  var optTabs = document.getElementById('optTabs');
  if (optTabs) {
    var buttons = Array.prototype.slice.call(optTabs.querySelectorAll('[role="tab"]'));
    var panes = Array.prototype.slice.call(document.querySelectorAll('[data-optpane]'));

    function activateTab(btn, focus) {
      var key = btn.getAttribute('data-opt');
      buttons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.setAttribute('tabindex', on ? '0' : '-1');
      });
      panes.forEach(function (p) {
        var on = p.getAttribute('data-optpane') === key;
        p.classList.toggle('is-active', on);
        if (on) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      });
      if (focus) btn.focus();
    }

    buttons.forEach(function (btn, index) {
      btn.addEventListener('click', function () { activateTab(btn, false); });
      btn.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          next = buttons[(index + 1) % buttons.length];
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          next = buttons[(index - 1 + buttons.length) % buttons.length];
        } else if (e.key === 'Home') {
          next = buttons[0];
        } else if (e.key === 'End') {
          next = buttons[buttons.length - 1];
        }
        if (next) {
          e.preventDefault();
          activateTab(next, true);
        }
      });
    });
  }

  /* ---------- FAQ ---------- */
  var faqItems = document.querySelectorAll('#faqList .faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) faqItems.forEach(function (o) { if (o !== item) o.open = false; });
    });
  });

  /* ---------- Reveal on scroll (respects reduced motion) ---------- */
  var targets = document.querySelectorAll('.rslide__panel, .card, .ccard, .shead, .vtable-wrap, .reasons__header');
  function revealAll(list) {
    list.forEach(function (el) {
      el.classList.add('is-revealed');
      el.style.opacity = '';
      el.style.transform = '';
      el.style.transition = '';
    });
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealAll(targets);
  } else {
    targets.forEach(function (el) { el.classList.add('will-reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          entry.target.classList.remove('will-reveal');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
    // Safety: never leave content permanently hidden
    window.setTimeout(function () {
      document.querySelectorAll('.will-reveal').forEach(function (el) {
        el.classList.add('is-revealed');
        el.classList.remove('will-reveal');
      });
    }, 4000);
  }
})();
