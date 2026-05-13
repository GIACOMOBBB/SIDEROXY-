/* ═══════════════════════════════════════════════════════════════
   SiderOXY — portfolio.js (loaded on portfolio.html only)
   - Lightbox open/close (lbO, lbX)
   - Portfolio filter (pfF)
   - Auto-apply ?filter= from URL on load (with graceful fallback)
   ═══════════════════════════════════════════════════════════════ */

/* ── LIGHTBOX ── */
function lbO(c, t, d, m, s){
  var isEN = document.getElementById('HR') && document.getElementById('HR').classList.contains('en');
  var ids = ['lb-c','lb-t','lb-d','lb-m','lb-s1','lb-lbl-lav','lb-lbl-mat','lb-lbl-note','lb-note-txt'];
  var values = [c, t, d, m, s || (isEN ? 'Photo' : 'Foto'),
                isEN ? 'Process' : 'Lavorazione',
                isEN ? 'Material' : 'Materiale',
                isEN ? 'Notes' : 'Note',
                isEN ? 'Add a description of the work or client.' : 'Aggiungi una descrizione del lavoro o del cliente.'];
  ids.forEach(function(id, i){
    var el = document.getElementById(id);
    if(el) el.textContent = values[i];
  });
  var lb = document.getElementById('lb');
  if(lb){ lb.classList.add('on'); lb.classList.add('open'); }
  document.body.style.overflow = 'hidden';
}

function lbX(){
  var lb = document.getElementById('lb');
  if(lb){ lb.classList.remove('on'); lb.classList.remove('open'); }
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e){
  if(e.key === 'Escape') lbX();
});

/* ── PORTFOLIO FILTER ── */
function pfF(btn, cat){
  document.querySelectorAll('.pff-b').forEach(function(b){ b.classList.remove('a'); });
  if(btn) btn.classList.add('a');
  var visibleCount = 0;
  document.querySelectorAll('.pfi').forEach(function(item){
    var m = (cat === 'all' || item.dataset.c === cat);
    if(m) visibleCount++;
    item.style.opacity      = m ? '1' : '0.1';
    item.style.filter       = m ? 'none' : 'grayscale(1)';
    item.style.pointerEvents = m ? 'auto' : 'none';
  });
  return visibleCount;
}

/* ── AUTO-APPLY FILTER FROM ?filter= QUERYSTRING ──
   Sector slugs from the home Settori cards are mapped to the
   internal portfolio data-c categories. If a slug doesn't match
   any item, fall back gracefully to "all". */
(function(){
  var params = new URLSearchParams(location.search);
  var slug = params.get('filter');
  if(!slug) return;

  var slugMap = {
    'movimento-terra'    : 'sol',
    'oil-gas'            : 'oil',
    'drilling'           : 'drl',
    'energie-alternative': 'sol',   // no dedicated category yet → reuse closest
    'strutturale'        : 'str',
    'hardox'             : 'hardox',
    's1100'              : 's1100',
    'meccanica'          : 'nav'
  };
  var cat = slugMap[slug] || slug;

  function apply(){
    // find a matching button if exists; otherwise fall back to "all"
    var match = null;
    document.querySelectorAll('.pff-b').forEach(function(b){
      var oc = b.getAttribute('onclick') || '';
      if(oc.indexOf("'" + cat + "'") > -1 && !match) match = b;
    });
    if(match){
      var n = pfF(match, cat);
      if(n === 0){
        // graceful fallback: show everything
        var allBtn = document.querySelector('.pff-b');
        if(allBtn) pfF(allBtn, 'all');
      }
    } else {
      var allBtn = document.querySelector('.pff-b');
      if(allBtn) pfF(allBtn, 'all');
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
