/* Boot: render shared navbar/footer, theme, mobile menu, then start the router. */
(function () {
  var root = document.documentElement, KEY = 'rc-theme', $ = function (s) { return document.querySelector(s); };
  RC.setTheme = function (t) { root.setAttribute('data-theme', t); try { localStorage.setItem(KEY, t); } catch (e) {} };
  var saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
  root.setAttribute('data-theme', saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  $('#navbar').innerHTML = RC.ui.navbar();
  $('#footer').innerHTML = RC.ui.footer();

  $('#theme').addEventListener('click', function () { RC.setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); });
  var menu = $('#mobile'), burger = $('#burger');
  function toggle(open) { menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : ''; }
  RC.closeMenu = function () { toggle(false); };
  burger.addEventListener('click', function () { toggle(!menu.classList.contains('open')); });
  addEventListener('resize', function () { if (innerWidth > 980) toggle(false); });

  RC.router.render();
  RC.store.list(); RC.state.notifyRecovery();   /* reading storage may repair damaged data: tell the user once */
})();
