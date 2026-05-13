/* ═══════════════════════════════════════════════════════════════
   SiderOXY — map.js (loaded on azienda.html)
   Leaflet interactive map of the production plants.
   - Renders ONLY the 2 production plants (Stabilimento 1, Stabilimento 2).
     The registered office (Sede legale, Via Ivanoe Bonomi 160) is NOT
     shown on the map — it remains in legal/company info and footer.
   - If Leaflet (window.L) is missing or fails to init, the CSS-only
     "cartina" fallback styled in main.css remains visible.
   - The host #stabMap div has min-height set in CSS so the container
     always has a visible area regardless of map state.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  if (typeof L === 'undefined') return;
  var mapEl = document.getElementById('stabMap');
  if(!mapEl) return;

  /* Coordinates (Pievesestina di Cesena, FC) for the 2 production plants only. */
  var locations = [
    { coords: [44.19033, 12.20847], num: '01',  title: 'Via Fossalta 3305',                                   sub: 'Stabilimento storico · 12.000 m²' },
    { coords: [44.18234, 12.21202], num: '02',  title: 'Via della Cooperazione 447',                          sub: 'Espansione 2023 · 10.000 m²' }
  ];

  var map;
  try {
    map = L.map('stabMap', {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: false
    }).setView([44.186, 12.210], 14);
  } catch(err){
    /* If Leaflet fails to init for any reason, leave the CSS fallback visible. */
    return;
  }

  /* Dark tile layer (free, no auth) — falls back gracefully if blocked.
     If tiles are blocked by network, the CSS fallback under the
     map element remains visible until the layer responds. */
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  var pinIcon = L.divIcon({
    className: '',
    html: '<div style="width:18px;height:18px;background:rgba(192,21,12,.95);border:2px solid #fff;border-radius:50%;box-shadow:0 0 12px rgba(192,21,12,.7)"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  var bounds = [];
  locations.forEach(function(loc){
    L.marker(loc.coords, {icon: pinIcon}).addTo(map)
      .bindPopup(
        '<strong style="color:#c0150c;font-family:\'Bebas Neue\',sans-serif;letter-spacing:.06em">' + loc.num + ' · ' + loc.title + '</strong>' +
        '<br><span style="font-size:12px">' + loc.sub + '</span>'
      );
    bounds.push(loc.coords);
  });

  /* Fit all 3 markers in view comfortably. */
  try {
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
  } catch(err){ /* ignore */ }

  window.stabMapObj = map;

  /* Re-fit on first scroll into view (handles initial 0-size cases). */
  var fitted = false;
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting && !fitted){
        fitted = true;
        map.invalidateSize();
        try { map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 }); } catch(err){}
        obs.disconnect();
      }
    });
  }, {threshold: 0.15});
  obs.observe(mapEl);
})();
