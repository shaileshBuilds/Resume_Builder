/* Templates page (Part 9): the full gallery over the real template registry.
   Search, category chips, ATS-only toggle, sorting, favorites (saved in this browser), preview, full preview mode
   and Use Template. Every thumbnail is drawn by the same renderer the resume itself uses.
   Replaces the Part 4 gallery (loaded after pages.js); the sample switcher and "create resume" flow are kept. */
(function () {
  var U = RC.ui, TP = RC.templates, M = RC.model, esc = M.esc;

  /* ---------- sample resumes used for previews ---------- */
  var SAMPLES = [
    ['experienced', 'Experienced', function () { return RC.sample.experienced; }],
    ['fresher', 'Fresh graduate', function () { return RC.sample.fresher; }],
    ['sparse', 'Short resume', function () {
      return M.blank({ personalInfo: { fullName: 'Sam Taylor', jobTitle: 'Office Assistant', email: 'sam.taylor@example.com' },
        experience: [{ company: 'Harbor Dental', position: 'Receptionist', startDate: '2023-02', current: true, achievements: ['Manage a 40-patient daily schedule'] }] });
    }]
  ];
  var dataFor = function (k) { return SAMPLES.filter(function (s) { return s[0] === k; })[0][2](); };
  var sampleChips = function (cur) { return SAMPLES.map(function (s) { return '<button type="button" class="chip' + (s[0] === cur ? ' on' : '') + '" data-s="' + s[0] + '">' + s[1] + '</button>'; }).join(''); };

  /* ---------- favorites: saved locally, validated against the registry ---------- */
  var FKEY = 'rc-fav-templates', favs = [], warned = false, onFav = null;
  function favLoad() {
    var ids = [];
    try { var a = JSON.parse(localStorage.getItem(FKEY) || '[]'); if (Array.isArray(a)) ids = a.filter(function (x, i) { return typeof x === 'string' && TP.get(x) && a.indexOf(x) === i; }); } catch (e) {}
    favs = ids;
  }
  function favSave() {
    try { localStorage.setItem(FKEY, JSON.stringify(favs)); }
    catch (e) { if (!warned) { warned = true; U.toast('Browser storage is blocked, so favorites will last only until you close this tab.'); } }
  }
  favLoad();
  RC.favorites = {
    list: function () { return favs.slice(); },
    has: function (id) { return favs.indexOf(id) > -1; },
    toggle: function (id) {
      if (!TP.get(id)) return false;
      var i = favs.indexOf(id); if (i > -1) favs.splice(i, 1); else favs.push(id);
      favSave(); return i < 0;
    }
  };
  addEventListener('storage', function (e) { if (e.key === FKEY) { favLoad(); if (onFav) onFav(); } });

  /* ---------- sorting ---------- */
  var POPULAR = ['executive-classic', 'modern-sidebar', 'career-standard', 'ats-clean', 'professional-prime', 'corporate-modern', 'minimal-one', 'developer-pro', 'fresher-start',
    'contemporary-pro', 'leadership', 'creative-split', 'senior-executive', 'ats-professional', 'research-scholar', 'elegant-minimal', 'software-engineer', 'graduate-pro'];
  var CAT_ORDER = ['Executive', 'Corporate', 'Professional', 'Modern', 'Creative', 'ATS', 'Minimal', 'Fresher', 'Technical', 'Academic'];
  var isAts = function (t) { return /^ATS/.test(t.ats); };
  var SORTS = [['popular', 'Popular'], ['newest', 'Newest'], ['ats', 'ATS'], ['minimal', 'Minimal'], ['creative', 'Creative']];

  /* ---------- small markup helpers ---------- */
  var HEART = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
  var SEARCH = '<svg class="gs-i" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
  function badge(t) { return isAts(t) ? '<span class="tag ' + (t.ats === 'ATS-friendly' ? 'ats-f' : 'ats-c') + '" title="' + (t.ats === 'ATS-friendly' ? 'Plain, single-column structure that parsers read most reliably' : 'Structured layout that applicant tracking systems can still read') + '">' + esc(t.ats) + '</span>' : ''; }
  function favBtn(t, on) { return '<button type="button" class="fav" data-a="fav" aria-pressed="' + on + '" aria-label="' + (on ? 'Remove ' : 'Add ') + esc(t.name) + (on ? ' from favorites' : ' to favorites') + '">' + HEART + '</button>'; }

  function useTemplate(id) {
    var t = TP.get(id); if (!t) return;
    var r = RC.store.create({ name: 'My ' + t.name + ' resume', templateId: id });
    if (r.ok) { U.toast('Resume created with ' + t.name + '. Find it on your dashboard.', 'ok'); location.hash = '#/dashboard'; } else U.toast(r.error);
  }

  RC.pages.templates = function (el) {
    var all = TP.list(), idx = {}, cats = [];
    all.forEach(function (t, i) { idx[t.id] = i; if (cats.indexOf(t.category) < 0) cats.push(t.category); });
    cats.sort(function (a, b) { var x = CAT_ORDER.indexOf(a), y = CAT_ORDER.indexOf(b); return (x < 0 ? 99 : x) - (y < 0 ? 99 : y) || (a < b ? -1 : 1); });
    var catCount = {}; all.forEach(function (t) { catCount[t.category] = (catCount[t.category] || 0) + 1; });
    var popRank = function (t) { var i = POPULAR.indexOf(t.id); return i < 0 ? 1000 + idx[t.id] : i; };
    var CMP = {
      popular: function (a, b) { return popRank(a) - popRank(b); },
      newest: function (a, b) { return idx[b.id] - idx[a.id]; },
      ats: function (a, b) { var r = function (t) { return t.ats === 'ATS-friendly' ? 0 : t.ats === 'ATS-compatible' ? 1 : 2; }; return r(a) - r(b); },
      minimal: function (a, b) { var r = function (t) { return t.category === 'Minimal' ? 0 : t.category === 'ATS' ? 1 : t.ats === 'ATS-friendly' ? 2 : isAts(t) ? 3 : 4; }; return r(a) - r(b); },
      creative: function (a, b) { var r = function (t) { return t.category === 'Creative' ? 0 : t.category === 'Modern' ? 1 : /Design/.test(t.ats) ? 2 : 3; }; return r(a) - r(b); }
    };
    var S = { q: '', cat: 'All', ats: false, fav: false, sort: 'popular' }, visible = [];

    el.innerHTML = U.pageHeader('Templates', 'Browse ' + all.length + ' resume layouts. Every thumbnail is drawn by the same renderer your resume uses, so what you see is what you get.') +
      '<div class="wrap pg"><div class="gtools">' +
      '<div class="grow"><div class="gsearch">' + SEARCH + '<input id="gq" type="search" placeholder="Search templates, e.g. minimal" aria-label="Search templates" autocomplete="off"><button type="button" class="gclear" id="gx" aria-label="Clear search" hidden>&times;</button></div>' +
      '<label class="gsort"><span>Sort by</span><select id="gs" aria-label="Sort templates">' + SORTS.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="grow"><button type="button" class="chip gtoggle" id="ga" aria-pressed="false" title="Show only ATS-friendly and ATS-compatible templates">ATS only</button>' +
      '<button type="button" class="chip gtoggle" id="gf" aria-pressed="false">' + HEART.replace('width="18" height="18"', 'width="15" height="15"') + ' Favorites <b id="gfn">0</b></button>' +
      '<button type="button" class="chip" id="gr" disabled>Reset filters</button><span class="gcount" id="gc" role="status" aria-live="polite"></span></div>' +
      '<div class="chips gcats" role="group" aria-label="Filter by category"><button type="button" class="chip on" data-c="All">All <small>' + all.length + '</small></button>' +
      cats.map(function (c) { return '<button type="button" class="chip" data-c="' + esc(c) + '">' + esc(c) + ' <small>' + catCount[c] + '</small></button>'; }).join('') + '</div></div>' +
      '<div class="gg" id="tg"></div><div id="ge"></div></div>';

    var grid = el.querySelector('#tg'), $ = function (s) { return el.querySelector(s); };
    var sample = dataFor('experienced'), cards = {};

    /* one card per template, built once; filtering only hides, shows and reorders them */
    all.forEach(function (t) {
      var w = document.createElement('div'), on = RC.favorites.has(t.id);
      w.innerHTML = '<article class="tcard gcard" data-id="' + t.id + '"><div class="g-th"><div class="g-open" role="button" tabindex="0" data-a="preview" aria-label="Preview ' + esc(t.name) + '">' + TP.preview(sample, t.id) + '</div>' + favBtn(t, on) + '</div>' +
        '<div class="g-meta"><h3>' + esc(t.name) + '</h3><div class="g-tags"><span class="tag cat">' + esc(t.category) + '</span>' + badge(t) + '</div><p class="g-d">' + esc(t.description) + '</p></div>' +
        '<div class="g-act"><button type="button" class="btn btn-o btn-sm" data-a="preview">Preview</button><button type="button" class="btn btn-p btn-sm" data-a="use">Use Template</button></div></article>';
      cards[t.id] = w.firstElementChild; grid.appendChild(cards[t.id]);
    });
    TP.fit(grid);

    function matches(t, terms) {
      if (S.cat !== 'All' && t.category !== S.cat) return false;
      if (S.ats && !isAts(t)) return false;
      if (S.fav && !RC.favorites.has(t.id)) return false;
      if (!terms.length) return true;
      var hay = (t.name + ' ' + t.category + ' ' + t.ats + ' ' + t.description + ' ' + t.id.replace(/-/g, ' ')).toLowerCase();
      return terms.every(function (w) { return hay.indexOf(w) > -1; });
    }
    function dirty() { return !!(S.q.trim() || S.cat !== 'All' || S.ats || S.fav || S.sort !== 'popular'); }
    function draw() {
      var terms = S.q.toLowerCase().split(/\s+/).filter(Boolean), cmp = CMP[S.sort] || CMP.popular;
      var sorted = all.slice().sort(function (a, b) { return cmp(a, b) || idx[a.id] - idx[b.id]; });
      visible = [];
      sorted.forEach(function (t) { var ok = matches(t, terms), c = cards[t.id]; c.hidden = !ok; grid.appendChild(c); if (ok) visible.push(t.id); });
      TP.fit(grid);
      $('#gc').textContent = 'Showing ' + visible.length + ' of ' + all.length + ' templates';
      $('#gr').disabled = !dirty(); $('#gx').hidden = !S.q;
      $('#ga').setAttribute('aria-pressed', S.ats); $('#ga').classList.toggle('on', S.ats);
      $('#gf').setAttribute('aria-pressed', S.fav); $('#gf').classList.toggle('on', S.fav);
      $('#gfn').textContent = RC.favorites.list().length;
      el.querySelectorAll('.gcats .chip').forEach(function (b) { b.classList.toggle('on', b.dataset.c === S.cat); });
      var ge = $('#ge');
      if (visible.length) ge.innerHTML = '';
      else if (S.fav && !RC.favorites.list().length && !S.q.trim() && S.cat === 'All' && !S.ats)
        ge.innerHTML = U.empty('heart', 'No favorites yet', 'Select the heart on any template to save it here. Favorites stay in this browser.', '<button type="button" class="btn btn-p" data-a="reset">Browse all templates</button>');
      else ge.innerHTML = U.empty('search-x', 'No templates match', (S.q.trim() ? 'Nothing matches \u201C' + esc(S.q.trim()) + '\u201D with the current filters. ' : 'No templates fit the current filters. ') + 'Try a different word, or clear the filters.', '<button type="button" class="btn btn-p" data-a="reset">Reset filters</button>');
      U.icons();
    }
    function reset() {
      S = { q: '', cat: 'All', ats: false, fav: false, sort: 'popular' };
      $('#gq').value = ''; $('#gs').value = 'popular'; draw();
    }
    function refreshFav(id) {
      var ids = id ? [id] : all.map(function (t) { return t.id; });
      ids.forEach(function (i) {
        var b = cards[i].querySelector('.fav'), t = TP.get(i), on = RC.favorites.has(i);
        b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + t.name + (on ? ' from favorites' : ' to favorites'));
      });
      $('#gfn').textContent = RC.favorites.list().length;
      if (S.fav) draw();
    }
    onFav = function () { if (document.body.contains(el)) refreshFav(); };
    function toggleFav(id) {
      var on = RC.favorites.toggle(id); refreshFav(id);
      U.toast(on ? 'Added to favorites' : 'Removed from favorites'); return on;
    }

    /* ---------- preview (modal) ---------- */
    function openPreview(id, key) {
      var t = TP.get(id), cur = key || 'experienced';
      var d = U.modal({
        title: esc(t.name), wide: true,
        actions: [{ label: 'Close' }, { label: 'Full preview', value: 'full' }, { label: 'Use Template', kind: 'btn-p', value: 'use' }],
        body: '<div class="pvbar"><p>' + esc(t.description) + ' <b>' + esc(t.category) + '</b>' + (isAts(t) ? ' &middot; <b>' + esc(t.ats) + '</b>' : '') + '</p>' +
          '<button type="button" class="chip gtoggle' + (RC.favorites.has(id) ? ' on' : '') + '" data-pf aria-pressed="' + RC.favorites.has(id) + '">' + HEART.replace('width="18" height="18"', 'width="15" height="15"') + ' Favorite</button></div>' +
          '<div class="pv-sw">' + sampleChips(cur) + '</div><div class="pv-big" id="big"></div>',
        onClose: function (v) { if (v === 'use') useTemplate(id); else if (v === 'full') openFull(id, cur); }
      });
      var big = d.querySelector('#big');
      function show() { big.innerHTML = TP.preview(dataFor(cur), id); TP.fit(big); }
      d.querySelector('.pv-sw').addEventListener('click', function (e) {
        var b = e.target.closest('[data-s]'); if (!b) return; cur = b.dataset.s;
        d.querySelectorAll('[data-s]').forEach(function (c) { c.classList.toggle('on', c === b); }); show();
      });
      d.querySelector('[data-pf]').addEventListener('click', function (e) {
        var b = e.currentTarget, on = toggleFav(id); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
      });
      show();
    }

    /* ---------- full preview mode: the whole resume, all pages, with next/previous template ---------- */
    function openFull(id, key) {
      var order = visible.indexOf(id) > -1 ? visible.slice() : all.map(function (t) { return t.id; });
      var pos = order.indexOf(id), cur = key || 'experienced';
      var d = document.createElement('dialog'); d.className = 'fullpv'; d.setAttribute('aria-label', 'Full preview');
      d.innerHTML = '<div class="fp-bar"><div class="fp-title"><b id="fpn"></b><span id="fpm"></span></div><div class="pv-sw fp-sw">' + sampleChips(cur) + '</div>' +
        '<div class="fp-act"><button type="button" class="btn btn-o btn-sm" data-n="-1" aria-label="Previous template">&larr; Prev</button><span class="fp-pos" id="fpp"></span><button type="button" class="btn btn-o btn-sm" data-n="1" aria-label="Next template">Next &rarr;</button>' +
        '<button type="button" class="chip gtoggle" id="fpf" aria-pressed="false">' + HEART.replace('width="18" height="18"', 'width="15" height="15"') + ' Favorite</button>' +
        '<button type="button" class="btn btn-p btn-sm" data-u>Use Template</button><button type="button" class="btn btn-o btn-sm" data-x>Close</button></div></div>' +
        '<div class="fp-stage"><div class="fp-page" id="fpg"></div></div>';
      var page = d.querySelector('#fpg'), ro = window.ResizeObserver ? new ResizeObserver(fitFull) : null;
      function fitFull() {
        var r = page.firstElementChild; if (!r || !page.clientWidth) return;
        var s = page.clientWidth / 794; r.style.transformOrigin = '0 0'; r.style.transform = 'scale(' + s + ')'; page.style.height = Math.ceil(r.offsetHeight * s) + 'px';
      }
      function show() {
        var t = TP.get(order[pos]), on = RC.favorites.has(t.id);
        page.innerHTML = TP.renderResume(dataFor(cur), t.id);
        d.querySelector('#fpn').textContent = t.name;
        d.querySelector('#fpm').textContent = t.category + (isAts(t) ? ' \u00B7 ' + t.ats : '');
        d.querySelector('#fpp').textContent = (pos + 1) + ' / ' + order.length;
        d.querySelector('[data-n="-1"]').disabled = pos === 0; d.querySelector('[data-n="1"]').disabled = pos === order.length - 1;
        var f = d.querySelector('#fpf'); f.classList.toggle('on', on); f.setAttribute('aria-pressed', on);
        d.querySelector('.fp-stage').scrollTop = 0; fitFull();
      }
      d.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.dataset.x !== undefined) d.close('x');
        else if (b.dataset.u !== undefined) d.close('use');
        else if (b.dataset.n) { pos = Math.max(0, Math.min(order.length - 1, pos + (+b.dataset.n))); show(); }
        else if (b.id === 'fpf') { toggleFav(order[pos]); show(); }
        else if (b.dataset.s) { cur = b.dataset.s; d.querySelectorAll('[data-s]').forEach(function (c) { c.classList.toggle('on', c === b); }); show(); }
      });
      function onKey(e) {
        if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
        if (e.key === 'ArrowRight' && pos < order.length - 1) { pos++; show(); } else if (e.key === 'ArrowLeft' && pos > 0) { pos--; show(); }
      }
      d.addEventListener('keydown', onKey);
      d.addEventListener('close', function () { var v = d.returnValue, last = order[pos]; if (ro) ro.disconnect(); d.remove(); if (v === 'use') useTemplate(last); });
      document.body.appendChild(d); d.showModal(); if (ro) ro.observe(page); show();
    }

    /* ---------- events ---------- */
    var timer; $('#gq').addEventListener('input', function (e) { clearTimeout(timer); var v = e.target.value; timer = setTimeout(function () { S.q = v; draw(); }, 120); $('#gx').hidden = !v; });
    $('#gx').addEventListener('click', function () { S.q = ''; $('#gq').value = ''; draw(); $('#gq').focus(); });
    $('#gs').addEventListener('change', function (e) { S.sort = e.target.value; draw(); });
    $('#ga').addEventListener('click', function () { S.ats = !S.ats; draw(); });
    $('#gf').addEventListener('click', function () { S.fav = !S.fav; draw(); });
    $('#gr').addEventListener('click', reset);
    $('.gcats').addEventListener('click', function (e) { var b = e.target.closest('[data-c]'); if (!b) return; S.cat = b.dataset.c; draw(); });
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return;
      var c = b.closest('.gcard'), id = c && c.dataset.id, a = b.dataset.a;
      if (a === 'reset') reset();
      else if (a === 'fav') toggleFav(id);
      else if (a === 'preview') openPreview(id);
      else if (a === 'use') useTemplate(id);
    });
    el.addEventListener('keydown', function (e) {
      var o = e.target.closest('.g-open'); if (o && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openPreview(o.closest('.gcard').dataset.id); }
    });
    draw();
  };
})();
