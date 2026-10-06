/* Reusable UI components: navbar, footer, button, page header, empty/loading states, toast, modal, confirm */
(function () {
  var U = RC.ui = {};
  var ic = function (n) { return n ? '<i data-lucide="' + n + '"></i>' : ''; };
  U.href = function (p) { return '#/' + p; };
  U.icons = function () { if (window.lucide) lucide.createIcons(); };

  U.button = function (label, o) {
    o = o || {};
    var cls = 'btn ' + (o.kind || 'btn-p'), a = o.attrs || '';
    return o.href !== undefined
      ? '<a class="' + cls + '" href="' + U.href(o.href) + '" ' + a + '>' + ic(o.icon) + label + '</a>'
      : '<button type="button" class="' + cls + '" ' + a + '>' + ic(o.icon) + label + '</button>';
  };

  U.pageHeader = function (title, sub, actions) {
    return '<header class="ph"><div class="wrap"><h1>' + title + '</h1>' + (sub ? '<p class="lead">' + sub + '</p>' : '') +
      (actions ? '<div class="cta-row">' + actions + '</div>' : '') + '</div></header>';
  };

  U.empty = function (icon, title, text, actions) {
    return '<div class="empty">' + '<div class="empty-i">' + ic(icon) + '</div><h2>' + title + '</h2><p>' + text + '</p>' +
      (actions ? '<div class="cta-row" style="justify-content:center">' + actions + '</div>' : '') + '</div>';
  };

  U.loading = function (text) {
    return '<div class="loading" role="status"><span class="spin"></span>' + (text || 'Loading…') + '</div>';
  };

  U.navbar = function () {
    var nav = RC.routes.filter(function (r) { return r.nav; });
    var li = nav.map(function (r) { return '<li><a href="' + U.href(r.p) + '">' + r.t + '</a></li>'; }).join('');
    var mob = nav.map(function (r) { return '<a href="' + U.href(r.p) + '">' + r.t + '</a>'; }).join('');
    return '<header class="nav"><div class="wrap">' +
      '<a href="#/" class="logo" aria-label="ResumeCraft Studio home"><i><i data-lucide="file-pen-line"></i></i>ResumeCraft</a>' +
      '<nav aria-label="Main"><ul class="links">' + li + '</ul></nav>' +
      '<div class="actions"><button class="icon-btn" id="theme" aria-label="Toggle dark mode"><i data-lucide="moon"></i></button>' +
      '<a href="#/login" class="btn btn-g hide-m">Login</a><a href="#/resume-builder" class="btn btn-p hide-m">Create Resume</a>' +
      '<button class="icon-btn burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mobile"><i data-lucide="menu"></i></button></div>' +
      '</div></header><nav class="mobile" id="mobile" aria-label="Mobile">' + mob +
      '<a href="#/dashboard">Dashboard</a><a href="#/login">Login</a><a href="#/resume-builder" class="btn btn-p">Create Resume</a></nav>';
  };

  // U.footer = function () {
  //   var cols = {};
  //   RC.routes.forEach(function (r) { if (r.f) (cols[r.f] = cols[r.f] || []).push(r); });
  //   var html = Object.keys(cols).map(function (k) {
  //     return '<div' + (cols[k].length > 6 ? ' class="fwide"' : '') + '><h4>' + k + '</h4><ul>' + cols[k].map(function (r) { return '<li><a href="' + U.href(r.p) + '">' + r.t + '</a></li>'; }).join('') + '</ul></div>';
  //   }).join('');
  //   return '<footer><div class="wrap"><div class="fgrid"><div><a href="#/" class="logo"><i><i data-lucide="file-pen-line"></i></i>ResumeCraft Studio</a>' +
  //     '<p style="color:var(--muted);margin-top:14px;max-width:300px;font-size:.92rem">Resumes that read well, for people and for software.</p></div>' + html +
  //     '</div><div class="fbot"><span>&copy; ' + new Date().getFullYear() + ' ResumeCraft Studio. All rights reserved.</span><span>Built in the browser. By Shaliesh Chauhan.</span></div></div></footer>';
  // };

  U.footer = function () {
    var cols = {};
  
    // Group routes by footer category
    RC.routes.forEach(function (r) {
      if (!r.f) return;
  
      if (!cols[r.f]) {
        cols[r.f] = [];
      }
  
      cols[r.f].push(r);
    });
  
    var html = Object.keys(cols).map(function (k) {
  
      /* =========================================
         SPECIAL TOOLS COLUMN
         ========================================= */
         if (k === 'Tools') {
          var tools = cols[k] || [];
        
          tools = tools.filter(function (r) {
            return ![
              'skill-suggestions',
              'jd-analyzer',
              'dashboard',
              'pricing'
            ].includes(r.p);
          });
        
          var leftTools = tools.slice(0, 5);
          var rightTools = tools.slice(5);
        
          return `
            <div class="ftools">
              <h4>Tools</h4>
        
              <div class="tools-links">
        
                <ul>
                  ${leftTools.map(function (r) {
                    return `
                      <li>
                        <a href="${U.href(r.p)}">${r.t}</a>
                      </li>
                    `;
                  }).join('')}
                </ul>
        
                <ul>
                  ${rightTools.map(function (r) {
                    return `
                      <li>
                        <a href="${U.href(r.p)}">${r.t}</a>
                      </li>
                    `;
                  }).join('')}
                </ul>
        
              </div>
            </div>
          `;
        }
  
      /* =========================================
         ALL OTHER FOOTER COLUMNS
         ========================================= */
      return `
        <div class="fcol">
  
          <h4>${k}</h4>
  
          <ul>
            ${cols[k].map(function (r) {
              return `
                <li>
                  <a href="${U.href(r.p)}">${r.t}</a>
                </li>
              `;
            }).join('')}
          </ul>
  
        </div>
      `;
  
    }).join('');
  
    /* =========================================
       COMPLETE FOOTER
       ========================================= */
  
    return `
      <footer>
  
        <div class="wrap">
  
          <div class="fgrid">
  
            <!-- BRAND -->
            <div class="fbrand">
  
              <a href="#/" class="logo">
                <i>
                  <i data-lucide="file-pen-line"></i>
                </i>
  
                <span>ResumeCraft Studio</span>
              </a>
  
              <p>
                Resumes that read well, for people and for software.
              </p>
  
            </div>
  
            ${html}
  
          </div>
  
          <!-- BOTTOM BAR -->
          <div class="fbot">
  
            <span>
              &copy; ${new Date().getFullYear()}
              ResumeCraft Studio. All rights reserved.
            </span>
  
            <span>
              Built in the browser. By Shaliesh Chauhan.
            </span>
  
          </div>
  
        </div>
  
      </footer>
    `;
  };

  U.toast = function (msg, type) {
    var t = document.createElement('div');
    t.className = 'toast ' + (type || ''); t.textContent = msg;
    document.getElementById('toasts').appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 300); }, 3400);
  };

  U.modal = function (o) {
    var d = document.createElement('dialog'); d.className = 'modal' + (o.wide ? ' wide' : '');
    d.setAttribute('aria-labelledby', 'm-title');
    d.innerHTML = '<div class="m-head"><h2 id="m-title">' + o.title + '</h2><button class="icon-btn" aria-label="Close" data-x><i data-lucide="x"></i></button></div>' +
      '<div class="m-body">' + o.body + '</div><div class="m-foot"></div>';
    var f = d.querySelector('.m-foot');
    (o.actions || []).forEach(function (a) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn ' + (a.kind || 'btn-o'); b.textContent = a.label;
      b.onclick = function () { d.close(a.value || 'ok'); }; f.appendChild(b);
    });
    d.querySelector('[data-x]').onclick = function () { d.close('x'); };
    d.addEventListener('click', function (e) { if (e.target === d) d.close('x'); });
    d.addEventListener('close', function () { var v = d.returnValue; d.remove(); if (o.onClose) o.onClose(v); });
    document.body.appendChild(d); U.icons(); d.showModal(); return d;
  };

  U.confirm = function (o) {
    return new Promise(function (res) {
      U.modal({
        title: o.title, body: '<p>' + o.text + '</p>',
        actions: [{ label: 'Cancel', value: 'no' }, { label: o.ok || 'Confirm', kind: o.danger ? 'btn-d' : 'btn-p', value: 'yes' }],
        onClose: function (v) { res(v === 'yes'); }
      });
    });
  };

  var bars = '<div class="bar a w"></div><div class="bar"></div><div class="bar m"></div><div class="bar a s"></div><div class="bar"></div><div class="bar m"></div><div class="bar"></div>';
  U.bars = bars;
  U.tcard = function (t) {
    return '<a href="#/resume-builder" class="tcard"><div class="tp ' + t.k + '" style="--c:' + t.c + '">' +
      (t.k === 'side' ? '<div class="col"></div><div>' + bars + '</div>' : '<div class="hd">' + (t.k === 'head' ? '' : bars.slice(0, 60)) + '</div>' + bars) +
      '</div><h3>' + t.n + '</h3><p>' + t.d + '</p></a>';
  };
})();
