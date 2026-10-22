// 筑木·筑巢 — interactions + language switcher
(function () {
  'use strict';

  var currentLang = 'zh';

  function initI18n() {
    if (!window.ArchiI18n) return;
    currentLang = ArchiI18n.detect();
    ArchiI18n.apply(currentLang);
    buildLangMenu(currentLang);
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
      li.setAttribute('data-lang', lang.code);
      if (lang.code === active) li.setAttribute('aria-selected', 'true');
      li.textContent = lang.label;
      li.addEventListener('click', function () {
        setLang(lang.code);
        closeLangMenu();
      });
      menu.appendChild(li);
    });

    var activeMeta = ArchiI18n.LANGS.find(function (l) { return l.code === active; });
    if (current && activeMeta) current.textContent = activeMeta.label;

    if (btn && !btn._langBound) {
      btn._langBound = true;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleLangMenu();
      });
      document.addEventListener('click', function () { closeLangMenu(); });
      menu.addEventListener('click', function (e) { e.stopPropagation(); });
    }
  }

  function toggleLangMenu() {
    var menu = document.getElementById('langMenu');
    var btn = document.getElementById('langBtn');
    if (!menu || !btn) return;
    var open = menu.hasAttribute('hidden');
    if (open) {
      menu.removeAttribute('hidden');
      btn.setAttribute('aria-expanded', 'true');
    } else {
      closeLangMenu();
    }
  }

  function closeLangMenu() {
    var menu = document.getElementById('langMenu');
    var btn = document.getElementById('langBtn');
    if (menu) menu.setAttribute('hidden', '');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function setLang(code) {
    if (!window.ArchiI18n) return;
    currentLang = ArchiI18n.apply(code);
    buildLangMenu(currentLang);
    syncCompanyEnLine(currentLang);
  }

  function syncCompanyEnLine(lang) {
    var enLine = document.querySelector('.ccard__en');
    if (enLine) enLine.hidden = !(lang === 'zh' || lang === 'zh-TW');
  }

  initI18n();
  syncCompanyEnLine(currentLang);

  // Nav shadow on scroll
  var nav = document.getElementById('nav');
  var onScroll = function () { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu toggle
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

  // Optimize tabs
  var optTabs = document.getElementById('optTabs');
  if (optTabs) {
    var buttons = optTabs.querySelectorAll('button');
    var panes = document.querySelectorAll('.optpane');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-opt');
        buttons.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        panes.forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('data-optpane') === key);
        });
      });
    });
  }

  // FAQ single-open accordion
  var faqItems = document.querySelectorAll('#faqList .faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) faqItems.forEach(function (o) { if (o !== item) o.open = false; });
    });
  });

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    var targets = document.querySelectorAll('.rslide__panel, .card, .ccard, .shead, .vtable-wrap, .reasons__header');
    targets.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.style.opacity = '1';
          el.style.transform = 'none';
          io.unobserve(el);
        }
      });
    }, { threshold: 0.1 });
    targets.forEach(function (el) { io.observe(el); });
  }
})();
