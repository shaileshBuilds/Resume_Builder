/* Hash router: works when opened from a file or any static host. */
RC.router = (function () {
  function path() { return location.hash.replace(/^#\/?/, '').split('?')[0].replace(/\/$/, ''); }
  function render() {
    var p = path(), r = RC.routes.filter(function (x) { return x.p === p; })[0], el = document.getElementById('view');
    el.innerHTML = '';
    if (r) { RC.pages[p || 'home'](el); document.title = (p ? r.t + ' | ResumeCraft Studio' : 'ResumeCraft Studio | Build a Resume That Gets Noticed'); }
    else { RC.pages.notFound(el); document.title = 'Page not found | ResumeCraft Studio'; }
    document.querySelectorAll('.links a, .mobile a:not(.btn)').forEach(function (a) {
      a.getAttribute('href') === '#/' + p ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
    });
    RC.closeMenu && RC.closeMenu();
    window.scrollTo(0, 0); el.focus({ preventScroll: true });
    if (p === 'home' || p === '') RC.bindFaq(el);
    RC.ui.icons();
  }
  addEventListener('hashchange', render);
  return { render: render };
})();
