/* Part 12: small drag-and-drop helper (HTML5 drag events). Only switched on for mouse/trackpad devices;
   touch users keep the move up / move down buttons. */
RC.dnd = (function () {
  var ok = false;
  try { ok = 'draggable' in document.createElement('span') && matchMedia('(pointer: fine)').matches; } catch (e) {}
  function clear(root) { [].forEach.call(root.querySelectorAll('.dnd-before,.dnd-after'), function (x) { x.classList.remove('dnd-before', 'dnd-after'); }); }
  /* o.item: selector of draggable rows. o.handle: selector of the grip (defaults to the row itself).
     o.group(el): rows only accept drops from the same group. o.cls: class put on the root while dragging (used to collapse long rows). o.onDrop(fromEl, toEl, below). */
  function bind(root, o) {
    if (!ok || !root) return; var drag = null;
    function target(e) {
      var t = e.target.closest && e.target.closest(o.item);
      return t && t !== drag.el && root.contains(t) && (!o.group || o.group(t) === drag.group) ? t : null;
    }
    function end() { if (drag) drag.el.classList.remove('dnd-drag'); if (o.cls) root.classList.remove(o.cls); clear(root); drag = null; }
    root.addEventListener('dragstart', function (e) {
      var h = e.target.closest && e.target.closest(o.handle || o.item); if (!h || !root.contains(h)) return;
      var it = h.closest(o.item); if (!it) return;
      drag = { el: it, group: o.group ? o.group(it) : '' };
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', 'rc-drag'); e.dataTransfer.setDragImage(it, 16, 16); } catch (x) {}
      setTimeout(function () { if (drag) { it.classList.add('dnd-drag'); if (o.cls) root.classList.add(o.cls); } }, 0);
    });
    root.addEventListener('dragover', function (e) {
      if (!drag) return; var t = target(e); clear(root); if (!t) return;
      e.preventDefault(); e.dataTransfer.dropEffect = 'move';
      var r = t.getBoundingClientRect(); t.classList.add(e.clientY > r.top + r.height / 2 ? 'dnd-after' : 'dnd-before');
    });
    root.addEventListener('drop', function (e) {
      if (!drag) return; var t = target(e); if (!t) return; e.preventDefault();
      var r = t.getBoundingClientRect(), below = e.clientY > r.top + r.height / 2, from = drag.el; end(); o.onDrop(from, t, below);
    });
    root.addEventListener('dragend', end);
  }
  return { supported: ok, bind: bind };
})();
