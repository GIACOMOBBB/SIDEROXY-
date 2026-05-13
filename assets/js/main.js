/* ═══════════════════════════════════════════════════════════════
   SiderOXY — main.js (shared across all pages)
   Aggregated: smoothness, lang switch, nav, scroll, splash,
   reveal-on-scroll, counters, GSAP animations, helpers.
   ═══════════════════════════════════════════════════════════════ */

/* ── A. SMOOTHNESS / progress bar / passive listeners ── */
/* ════════════════════════════════════════════
   SMOOTHNESS JS
   Aggregato unico, zero dipendenze esterne,
   usa passive listeners per non bloccare lo scroll.
   ════════════════════════════════════════════ */
(function(){
  'use strict';

  // ── A. Progress bar ──
  var prog = document.createElement('div');
  prog.className = 'scroll-progress';
  prog.id = 'scroll-progress';
  document.addEventListener('DOMContentLoaded', function(){
    document.body.prepend(prog);
  });

  function updateProgress(){
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    prog.style.width = pct + '%';
  }

  // ── B. Nav scrolled state ──
  function updateNavState(){
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    if(scrollTop > 40){
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
  }

  // Single scroll handler (RAF throttled)
  var ticking = false;
  function onScroll(){
    if(!ticking){
      requestAnimationFrame(function(){
        updateProgress();
        updateNavState();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // ── C. Reveal on scroll (Intersection Observer) ──
  if('IntersectionObserver' in window){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    // Auto-attacco: tutte le .stag, .sh, .sp, e altri elementi principali
    // ricevono data-reveal se non ce l'hanno già
    document.addEventListener('DOMContentLoaded', function(){
      var selectors = [
        '.stag', '.sh', '.sp',
        '.qual-c', '.hxg', '.hx-app', '.hx-spec-i',
        '.sc2', '.mc', '.pfi',
        '.qual-csat-i', '.stab-c', '.mag-i',
        '.chi-g > div', '.ni2'
      ];
      selectors.forEach(function(sel){
        document.querySelectorAll(sel).forEach(function(el){
          if(!el.hasAttribute('data-reveal') && !el.classList.contains('rv')){
            el.setAttribute('data-reveal','');
          }
        });
      });

      // Grid stagger sui wrapper di più card
      var staggerSelectors = [
        '.qual-g', '.hxgr', '.hx-apps-g', '.hx-spec',
        '.sett-g', '.qual-csat-g'
      ];
      staggerSelectors.forEach(function(sel){
        document.querySelectorAll(sel).forEach(function(el){
          el.setAttribute('data-reveal-stagger','');
        });
      });

      // Inizializzo l'observer su tutti gli elementi marcati
      document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(function(el){
        observer.observe(el);
      });

      // Primo check per elementi già visibili
      setTimeout(function(){
        updateProgress();
        updateNavState();
      }, 50);
    });
  } else {
    // Fallback: se no IntersectionObserver, rendo tutto visibile subito
    document.addEventListener('DOMContentLoaded', function(){
      document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(function(el){
        el.classList.add('is-in');
      });
    });
  }

  // ── D. Smooth anchor scroll (override nativo per avere offset nav) ──
  document.addEventListener('click', function(e){
    var link = e.target.closest('a[href^="#"]');
    if(!link) return;
    var href = link.getAttribute('href');
    if(href === '#' || href.length < 2) return;
    var target = document.querySelector(href);
    if(!target) return;
    e.preventDefault();
    var navHeight = 72; // altezza nav approssimativa
    var top = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top: top, behavior: 'smooth' });
  });

})();

/* ── B. LANG / NAV / SCROLL / SPLASH / counters / showM / pfF ── */
/* ── LANG ── */
function setLang(l){
  document.querySelectorAll('[data-it]').forEach(function(el){
    el.classList.toggle('lang-hidden', l !== 'it');
  });
  document.querySelectorAll('[data-en]').forEach(function(el){
    el.classList.toggle('lang-hidden', l !== 'en');
  });
  document.querySelectorAll('.lo').forEach(function(x){ x.classList.remove('a'); });
  var btn = document.getElementById('btn-' + l);
  if(btn) btn.classList.add('a');
  try{ localStorage.setItem('lang', l); }catch(e){}
}
(function(){
  var saved = ''; try{ saved = localStorage.getItem('lang')||''; }catch(e){}
  setLang(saved === 'en' ? 'en' : 'it');
})();
document.getElementById('btn-it')?.classList.add('a');

/* ── NAV ── */
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('s',scrollY>50),{passive:true});

/* ── SCROLL HELPER ── */
function scroll2(id){document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}


/* ════════════════════════════════════════════
   SPLASH — triple-laser realistic cut effect
   - Laser 1 (red): cuts SIDER from left to right
   - Laser 2 (white): cuts OXY starting from the Y on the right side, moving leftward
   - Laser 3 (multi): cuts the Italian flag + "CUT & BEND BY SIDEROXY" caption underneath
   - All three lasers are synchronized to finish at the same moment
   - Speed: adjust SPLASH_LASER_SPEED
   ════════════════════════════════════════════ */
(function(){
  const splash=document.getElementById('splash');
  const canvas=document.getElementById('splashLaserCanvas');
  const sourceSvg=document.getElementById('splashLogoSource');
  const sourceSubline=document.getElementById('splashSublineSource');
  if(!splash||!canvas||!sourceSvg||!sourceSubline) return;

  // 0.75 = slower, 1.00 = normal cinematic, 1.25 = faster, 3.70 = brisk
  var SPLASH_LASER_SPEED=3.7;

  const W=canvas.width,H=canvas.height,SC=1.42,MW=Math.round(W/SC),MH=Math.round(H/SC),PX=W/1600;
  const LOGO_VIEW_W=724,LOGO_VIEW_H=106,SUB_VIEW_W=724,SUB_VIEW_H=44;
  const ctx=canvas.getContext('2d',{alpha:true});
  const cutCanvas=document.createElement('canvas');cutCanvas.width=W;cutCanvas.height=H;
  const hotCanvas=document.createElement('canvas');hotCanvas.width=W;hotCanvas.height=H;
  const maskCanvas=document.createElement('canvas');maskCanvas.width=MW;maskCanvas.height=MH;
  const cut=cutCanvas.getContext('2d',{alpha:true});
  const hot=hotCanvas.getContext('2d',{alpha:true});
  const maskCtx=maskCanvas.getContext('2d',{willReadFrequently:true});
  let sparks=[],targetFrames=260;

  function svgToImage(svgEl,w,h){return new Promise((resolve,reject)=>{
    const svg=svgEl.cloneNode(true);
    svg.removeAttribute('id');svg.removeAttribute('class');svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('width',w);svg.setAttribute('height',h);
    const xml=new XMLSerializer().serializeToString(svg);
    const url=URL.createObjectURL(new Blob([xml],{type:'image/svg+xml;charset=utf-8'}));
    const img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=e=>{URL.revokeObjectURL(url);reject(e)};img.src=url;
  })}

  function createCrispOverlay(){
    const stage=splash.querySelector('.splash-stage');
    if(!stage||stage.querySelector('.splash-crisp-logo'))return;
    const crisp=sourceSvg.cloneNode(true);
    crisp.removeAttribute('id');crisp.removeAttribute('class');crisp.classList.add('splash-crisp-logo');
    crisp.setAttribute('aria-hidden','true');crisp.setAttribute('focusable','false');
    crisp.querySelectorAll('path').forEach(function(p){
      const f=(p.getAttribute('fill')||'').toLowerCase();
      const isRed=f.includes('93.301')||f.includes('237')||f.includes('#e31')||f.includes('14.447');
      p.setAttribute('fill','none');p.setAttribute('stroke',isRed?'#ff1b12':'#f7f8ff');p.setAttribute('stroke-width','2.45');p.setAttribute('stroke-linejoin','round');p.setAttribute('stroke-linecap','round');p.setAttribute('vector-effect','non-scaling-stroke');p.removeAttribute('filter');p.removeAttribute('style');
    });
    const sub=sourceSubline.cloneNode(true);
    sub.removeAttribute('id');sub.removeAttribute('class');sub.classList.add('splash-crisp-subline');
    sub.setAttribute('aria-hidden','true');sub.setAttribute('focusable','false');
    sub.querySelectorAll('path').forEach(function(p){
      const f=(p.getAttribute('fill')||'#fff').toLowerCase();
      p.setAttribute('fill','none');
      p.setAttribute('stroke',f);
      p.setAttribute('stroke-width','2.05');
      p.setAttribute('stroke-linejoin','round');
      p.setAttribute('stroke-linecap','square');
      p.setAttribute('vector-effect','non-scaling-stroke');
    });
    sub.querySelectorAll('text').forEach(function(t){
      t.setAttribute('fill','none');t.setAttribute('stroke','#f7f8ff');t.setAttribute('stroke-width','1.35');t.setAttribute('stroke-linejoin','round');t.setAttribute('paint-order','stroke');
    });
    // Keep the Italian flag as a true three-stripe outline in the final crisp vector overlay.
    const ns='http://www.w3.org/2000/svg';
    const stripeA=document.createElementNS(ns,'line');
    stripeA.setAttribute('x1','66');stripeA.setAttribute('y1','8');stripeA.setAttribute('x2','66');stripeA.setAttribute('y2','20');
    stripeA.setAttribute('stroke','#f7f8ff');stripeA.setAttribute('stroke-width','1.35');stripeA.setAttribute('vector-effect','non-scaling-stroke');
    const stripeB=document.createElementNS(ns,'line');
    stripeB.setAttribute('x1','132');stripeB.setAttribute('y1','8');stripeB.setAttribute('x2','132');stripeB.setAttribute('y2','20');
    stripeB.setAttribute('stroke','#e31b23');stripeB.setAttribute('stroke-width','1.35');stripeB.setAttribute('vector-effect','non-scaling-stroke');
    sub.appendChild(stripeA);sub.appendChild(stripeB);
    stage.appendChild(crisp);stage.appendChild(sub);
  }

  function layoutMain(){const logoW=Math.floor(MW*.88),logoH=Math.floor(logoW*LOGO_VIEW_H/LOGO_VIEW_W);return {w:logoW,h:logoH,x:Math.floor((MW-logoW)/2),y:Math.floor(MH*.22)}}
  function layoutSub(){const main=layoutMain(),subW=main.w,subH=Math.floor(subW*SUB_VIEW_H/SUB_VIEW_W*1.16);return {w:subW,h:subH,x:main.x,y:main.y+main.h+Math.floor(MH*.052)}}

  function colorClass(r,g,b,a){
    if(a<24)return 0;
    if(g>r*1.25&&g>b*1.25&&g>90)return 3;      // green flag
    if(r>g*1.45&&r>b*1.25&&r>100)return 1;      // SIDER / red flag
    if(Math.max(r,g,b)-Math.min(r,g,b)<50)return 2; // OXY gray, white stripe, slogan (neutral only)
    return 0;
  }

  function buildSequence(img,layout,colorFilter,reverse){
    maskCtx.clearRect(0,0,MW,MH);maskCtx.drawImage(img,layout.x,layout.y,layout.w,layout.h);
    const data=maskCtx.getImageData(0,0,MW,MH).data,mask=new Uint8Array(MW*MH),cmap=new Uint8Array(MW*MH);
    for(let i=0;i<mask.length;i++){const a=data[i*4+3],r=data[i*4],g=data[i*4+1],b=data[i*4+2],c=colorClass(r,g,b,a);if(c&&(!colorFilter||colorFilter.indexOf(c)>=0)){mask[i]=1;cmap[i]=c}}
    const is=(x,y)=>x>=0&&x<MW&&y>=0&&y<MH&&mask[y*MW+x];
    const col=(x,y)=>x>=0&&x<MW&&y>=0&&y<MH?(cmap[y*MW+x]||2):2;
    const isB=(x,y)=>{if(!is(x,y))return false;const cc=col(x,y);return !is(x-1,y)||!is(x+1,y)||!is(x,y-1)||!is(x,y+1)||col(x-1,y)!==cc||col(x+1,y)!==cc||col(x,y-1)!==cc||col(x,y+1)!==cc};
    const vis=new Uint8Array(MW*MH),D=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]],chains=[];
    for(let y=0;y<MH;y++){for(let x=0;x<MW;x++){
      if(!isB(x,y)||vis[y*MW+x])continue;
      const pts=[];let cx=x,cy=y,pd=0;
      for(let n=0;n<MW*MH;n++){
        const id=cy*MW+cx;if(vis[id]&&n>0)break;vis[id]=1;pts.push([cx*SC,cy*SC,col(cx,cy)]);
        let found=false;for(const off of [0,-1,1,-2,2,3,-3,4]){const di=(pd+off+8)%8,nx=cx+D[di][0],ny=cy+D[di][1];if(isB(nx,ny)&&!vis[ny*MW+nx]){pd=di;cx=nx;cy=ny;found=true;break}}
        if(!found)break;
      }
      if(pts.length>4)chains.push(pts);
    }}
    // Merge chains whose endpoints are close in space (heals broken contours, e.g. the G in SIDERFLANGE).
    const used=new Array(chains.length).fill(false),mergedC=[];
    for(let i=0;i<chains.length;i++){
      if(used[i])continue;
      let cur=chains[i].slice();used[i]=true;let ext=true;
      while(ext){
        ext=false;const lp=cur[cur.length-1];let bi=-1,bd=Infinity;
        for(let j=0;j<chains.length;j++){
          if(used[j])continue;
          const d=Math.hypot(chains[j][0][0]-lp[0],chains[j][0][1]-lp[1]);
          if(d<bd){bd=d;bi=j}
        }
        if(bi>=0&&bd<14*PX){cur=cur.concat(chains[bi]);used[bi]=true;ext=true}
      }
      mergedC.push(cur);
    }
    if(reverse){for(let ci=0;ci<mergedC.length;ci++){const ch=mergedC[ci];let k=0,mx=-Infinity;for(let i=0;i<ch.length;i++)if(ch[i][0]>mx){mx=ch[i][0];k=i}if(k>0)mergedC[ci]=ch.slice(k).concat(ch.slice(0,k))}}
    mergedC.sort((a,b)=>{const ax=a.reduce((s,p)=>s+p[0],0)/a.length,bx=b.reduce((s,p)=>s+p[0],0)/b.length;return reverse?(bx-ax):(ax-bx)});
    const startX=reverse?W:W/2,startY=H/2;
    const seq=[];let lx=mergedC[0]?mergedC[0][0][0]:startX,ly=mergedC[0]?mergedC[0][0][1]:startY;
    for(const ch of mergedC){const sx=ch[0][0],sy=ch[0][1];const jumpSteps=Math.max(3,Math.round(Math.hypot(sx-lx,sy-ly)/(8*PX)));for(let i=1;i<=jumpSteps;i++)seq.push({x:lx+(sx-lx)*i/jumpSteps,y:ly+(sy-ly)*i/jumpSteps,b:false});for(const p of ch)seq.push({x:p[0],y:p[1],b:true,c:p[2]||2});lx=ch[ch.length-1][0];ly=ch[ch.length-1][1]}
    return {seq,idx:0,hx:seq[0]?seq[0].x:startX,hy:seq[0]?seq[0].y:startY,lastX:null,lastY:null,done:false,steps:1};
  }

  function strokeColor(c,hotLine){
    if(c===1)return hotLine?'rgba(255,70,32,.96)':'rgba(255,30,22,.97)';
    if(c===3)return hotLine?'rgba(60,255,125,.92)':'rgba(34,177,76,.95)';
    return hotLine?'rgba(255,255,248,.96)':'rgba(246,248,255,.96)';
  }
  function addCut(state,x,y,c){if(state.lastX===null)return;cut.beginPath();cut.moveTo(state.lastX,state.lastY);cut.lineTo(x,y);cut.strokeStyle=strokeColor(c,false);cut.lineWidth=2.55*PX;cut.lineCap='round';cut.lineJoin='round';cut.shadowBlur=0;cut.stroke();cut.beginPath();cut.moveTo(state.lastX,state.lastY);cut.lineTo(x,y);cut.strokeStyle='rgba(0,0,0,.44)';cut.lineWidth=.8*PX;cut.stroke()}
  function addHot(state,x,y,c){if(state.lastX===null)return;hot.beginPath();hot.moveTo(state.lastX,state.lastY);hot.lineTo(x,y);hot.strokeStyle=strokeColor(c,true);hot.lineWidth=2.75*PX;hot.lineCap='round';hot.lineJoin='round';hot.shadowColor=c===1?'rgba(255,42,20,.28)':c===3?'rgba(60,255,125,.2)':'rgba(255,255,255,.22)';hot.shadowBlur=2.7*PX;hot.stroke();hot.shadowBlur=0}
  function fadeHot(){hot.globalCompositeOperation='destination-out';hot.globalAlpha=.062;hot.fillStyle='black';hot.fillRect(0,0,W,H);hot.globalCompositeOperation='source-over';hot.globalAlpha=1}
  function spark(x,y){if(Math.random()>.78)return;const count=2+Math.floor(Math.random()*4);for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=(1.4+Math.random()*4.1)*PX;sparks.push({x,y,px:x,py:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.35,life:.24+Math.random()*.48,sz:(.45+Math.random()*1.25)*PX})}}
  function drawCutter(x,y){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,128,36,.34)';ctx.beginPath();ctx.arc(x,y,4.6*PX,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,235,170,.82)';ctx.beginPath();ctx.arc(x,y,1.85*PX,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.94)';ctx.beginPath();ctx.arc(x,y,.78*PX,0,Math.PI*2);ctx.fill();ctx.restore()}
  function advance(state){if(state.done)return;for(let i=0;i<state.steps;i++){if(state.idx>=state.seq.length){state.done=true;break}const p=state.seq[state.idx++];state.hx=p.x;state.hy=p.y;if(p.b){addCut(state,p.x,p.y,p.c||2);addHot(state,p.x,p.y,p.c||2);spark(p.x,p.y);state.lastX=p.x;state.lastY=p.y}else{state.lastX=null;state.lastY=null}}}

  let siderState=null,oxyState=null,subState=null;
  function frame(){
    ctx.clearRect(0,0,W,H);ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
    const vg=ctx.createRadialGradient(W/2,H/2,H*.25,W/2,H/2,H*.88);vg.addColorStop(0,'rgba(20,0,0,.035)');vg.addColorStop(1,'rgba(0,0,0,.74)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    ctx.drawImage(cutCanvas,0,0);fadeHot();advance(siderState);advance(oxyState);advance(subState);ctx.drawImage(hotCanvas,0,0);
    if(siderState&&!siderState.done)drawCutter(siderState.hx,siderState.hy);
    if(oxyState&&!oxyState.done)drawCutter(oxyState.hx,oxyState.hy);
    if(subState&&!subState.done)drawCutter(subState.hx,subState.hy);
    const next=[];for(const p of sparks){const a=Math.max(0,p.life);ctx.beginPath();ctx.moveTo(p.px,p.py);ctx.lineTo(p.x,p.y);ctx.strokeStyle=`rgba(255,${Math.floor(115+a*125)},32,${a*.7})`;ctx.lineWidth=p.sz*.62;ctx.lineCap='round';ctx.stroke();ctx.fillStyle=`rgba(255,${Math.floor(150+a*100)},80,${a*.82})`;ctx.beginPath();ctx.arc(p.x,p.y,p.sz*.42,0,Math.PI*2);ctx.fill();p.px=p.x;p.py=p.y;p.x+=p.vx;p.y+=p.vy;p.vy+=.065*PX;p.vx*=.94;p.life-=.035;if(p.life>0)next.push(p)}sparks=next;
    const finished=siderState&&oxyState&&subState&&siderState.done&&oxyState.done&&subState.done;
    if(!finished||sparks.length)requestAnimationFrame(frame);else setTimeout(()=>{splash.classList.add('laser-complete');setTimeout(()=>splash.classList.add('fade-out'),360);setTimeout(()=>splash.classList.add('done'),980)},300)
  }

  Promise.all([svgToImage(sourceSvg,724,106),svgToImage(sourceSubline,724,44)]).then(([logo,sub])=>{
    createCrispOverlay();
    siderState=buildSequence(logo,layoutMain(),[1],false);   // SIDER: red, left-to-right
    oxyState  =buildSequence(logo,layoutMain(),[2],true);    // OXY:   white, right-to-left (starts from Y)
    subState  =buildSequence(sub ,layoutSub() ,null ,false); // flag + caption: all colors, left-to-right
    const longestLen=Math.max(siderState.seq.length,oxyState.seq.length,subState.seq.length);
    targetFrames=Math.max(100,Math.ceil(longestLen/(7*SPLASH_LASER_SPEED*PX)));
    siderState.steps=Math.max(1,Math.ceil(siderState.seq.length/targetFrames));
    oxyState.steps  =Math.max(1,Math.ceil(oxyState.seq.length /targetFrames));
    subState.steps  =Math.max(1,Math.ceil(subState.seq.length /targetFrames));
    requestAnimationFrame(frame);
  }).catch(()=>{setTimeout(()=>{splash.classList.add('fade-out');setTimeout(()=>splash.classList.add('done'),620)},900)})
})();

/* reveal: GSAP */

/* counters: GSAP */

/* ── MACHINE TABS ── */
function showM(id,btn){
  if(!btn){
    document.querySelectorAll('.mta').forEach(function(el){
      if(el.getAttribute('onclick') && el.getAttribute('onclick').indexOf("'"+id+"'") > -1) btn = el;
    });
  }
  document.querySelectorAll('.mp').forEach(p=>p.classList.remove('a'));
  document.querySelectorAll('.mta').forEach(t=>t.classList.remove('a'));
  document.getElementById('mp-'+id)?.classList.add('a');
  btn.classList.add('a');
}

/* ── PORTFOLIO FILTER ── */
function pfF(btn,cat){
  document.querySelectorAll('.pff-b').forEach(b=>b.classList.remove('a'));
  btn.classList.add('a');
  document.querySelectorAll('.pfi').forEach(item=>{
        const m=cat==='all'||item.dataset.c===cat;
    item.style.opacity=m?'1':'0.1';
    item.style.filter=m?'none':'grayscale(1)';
    item.style.pointerEvents=m?'auto':'none';
  });
}

/* ── LANG BUTTON IDs ── */
document.querySelectorAll('.lo').forEach(b=>{
  const t=b.textContent.toLowerCase().trim();
  b.id='btn-'+t;
});

/* ── C. GSAP animations (robust) ── */
/* ═══════════════════════════════════════════════════════════════
   SiderOXY — Animazioni GSAP (versione robusta)
   - usa gsap.set + ScrollTrigger.create(onEnter) invece di gsap.from
   - trigger per singolo elemento, once:true, start 'top 95%'
   - rete di sicurezza: forza visibilità su window.load
   ═══════════════════════════════════════════════════════════════ */
(function(){
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[SiderOXY] GSAP non caricato, animazioni disabilitate');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Helper principale: anima una lista di elementi in stagger ── */
  function animateIn(els, opts) {
    if (!els) return;
    els = Array.from(els);
    if (!els.length) return;
    opts = opts || {};
    const y       = opts.y       != null ? opts.y       : 30;
    const x       = opts.x       != null ? opts.x       : 0;
    const dur     = opts.duration!= null ? opts.duration: 0.8;
    const stagger = opts.stagger != null ? opts.stagger : 0.08;
    const start   = opts.start   || 'top 92%';
    const ease    = opts.ease    || 'power3.out';

    // Stato iniziale (solo se non reduced motion)
    if (!REDUCE) {
      gsap.set(els, { opacity: 0, y: y, x: x });
    }

    // Un trigger per il primo elemento, anima tutti in stagger
    ScrollTrigger.create({
      trigger: els[0],
      start: start,
      once: true,
      onEnter: function() {
        gsap.to(els, {
          opacity: 1, y: 0, x: 0,
          duration: REDUCE ? 0.01 : dur,
          stagger: REDUCE ? 0   : stagger,
          ease: ease,
          overwrite: 'auto'
        });
      }
    });
  }

  /* ── Helper: anima un singolo elemento ── */
  function animateOne(el, opts) {
    if (!el) return;
    animateIn([el], opts);
  }

  /* ── NUMERI STRIP ─────────────────────────────────────────── */
  const nsEl = document.querySelector('.ns');
  if (nsEl) {
    animateIn(nsEl.querySelectorAll('.ni2'), {
      y: 50, stagger: 0.12, duration: 0.85, start: 'top 88%'
    });

    let counted = false;
    ScrollTrigger.create({
      trigger: nsEl, start: 'top 88%', once: true,
      onEnter: function() {
        if (counted) return; counted = true;
        document.querySelectorAll('.cv').forEach(function(el){
          const target = +el.dataset.t, proxy = { val: 0 };
          gsap.to(proxy, {
            val: target, duration: REDUCE ? 0.3 : 2.2, ease: 'power2.out',
            onUpdate: function(){
              el.textContent = target >= 1000
                ? Math.round(proxy.val).toLocaleString('it-IT')
                : String(Math.round(proxy.val));
            },
            onComplete: function(){
              el.textContent = target >= 1000
                ? target.toLocaleString('it-IT') : String(target);
            }
          });
        });
      }
    });
  }

  /* ── SETTORI ──────────────────────────────────────────────── */
  animateIn(document.querySelectorAll('.sett-g .sc2'), {
    y: 30, stagger: 0.06, duration: 0.7
  });

  /* ── CHI SIAMO ────────────────────────────────────────────── */
  const chiCols = document.querySelectorAll('.chi-g > *');
  if (chiCols.length >= 2) {
    animateOne(chiCols[0], { x: -40, y: 0, duration: 0.9 });
    animateOne(chiCols[1], { x:  40, y: 0, duration: 0.9 });
  }
  animateIn(document.querySelectorAll('.chi .mv'), {
    y: 25, stagger: 0.1, duration: 0.7, start: 'top 90%'
  });

  /* ── LAVORAZIONI ──────────────────────────────────────────── */
  animateIn(document.querySelectorAll('.lav-g .lc'), {
    y: 50, stagger: 0.1, duration: 0.85
  });

  /* ── MAGAZZINO STRIP ──────────────────────────────────────── */
  animateOne(document.querySelector('.mag .mag-t'), {
    x: -30, y: 0, duration: 0.8
  });
  animateIn(document.querySelectorAll('.mag .mag-i'), {
    y: 25, stagger: 0.08, duration: 0.7
  });

  /* ── MATERIALI ────────────────────────────────────────────── */
  animateIn(document.querySelectorAll('.mat-g .mc, .mat-g .mat-bann'), {
    y: 35, stagger: 0.07, duration: 0.8
  });

  /* ── HARDOX (split sx/dx + griglia) ───────────────────────── */
  const hxLay = document.querySelector('.hx .hx-lay');
  if (hxLay && hxLay.children.length >= 2) {
    animateOne(hxLay.children[0], { x: -40, y: 0, duration: 0.95 });
    animateOne(hxLay.children[1], { x:  40, y: 0, duration: 0.95 });
  }
  animateIn(document.querySelectorAll('.hx .hxg'), {
    y: 20, stagger: 0.06, duration: 0.6, start: 'top 88%'
  });

  /* ── MACCHINE ─────────────────────────────────────────────── */
  animateIn(document.querySelectorAll('.mac .mta'), {
    x: -25, y: 0, stagger: 0.08, duration: 0.6
  });
  const activePanel = document.querySelector('.mac .mp.a');
  if (activePanel) {
    animateOne(activePanel, { y: 25, duration: 0.85 });
  }

  // Cambio tab macchine: anima il pannello che diventa attivo
  document.querySelectorAll('.mta').forEach(function(tab){
    tab.addEventListener('click', function(){
      requestAnimationFrame(function(){
        const panel = document.querySelector('.mp.a');
        if (!panel) return;
        gsap.fromTo(panel,
          { opacity: 0, y: REDUCE ? 0 : 15 },
          { opacity: 1, y: 0, duration: REDUCE ? 0.01 : 0.5, ease: 'power2.out', overwrite: 'auto' }
        );
      });
    });
  });

  /* ── PORTFOLIO ────────────────────────────────────────────── */
  animateIn(document.querySelectorAll('.pfg .pfi'), {
    y: 40, stagger: 0.07, duration: 0.8
  });

  // Filtro portfolio: piccolo "settle" sugli item visibili
  document.querySelectorAll('.pff-b').forEach(function(btn){
    btn.addEventListener('click', function(){
      const visible = Array.from(document.querySelectorAll('.pfi'))
        .filter(function(i){ return parseFloat(i.style.opacity || '1') > 0.5; });
      if (!visible.length) return;
      gsap.fromTo(visible,
        { y: REDUCE ? 0 : 12, opacity: 0.4 },
        { y: 0, opacity: 1, duration: REDUCE ? 0.01 : 0.45,
          stagger: REDUCE ? 0 : 0.04, ease: 'power2.out', overwrite: 'auto' }
      );
    });
  });

  /* ── CERTIFICAZIONI ──────────────────────────────────────── */
  const certSec = document.querySelector('#cert');
  if (certSec) {
    const certCards = certSec.querySelectorAll('.cert-card, .cc, .nc2, [class*="cert-"]');
    if (certCards.length) {
      animateIn(certCards, { y: 30, stagger: 0.08, duration: 0.8 });
    } else {
      animateOne(certSec, { y: 30, duration: 0.9 });
    }
  }

  /* ── LAVORA CON NOI ──────────────────────────────────────── */
  animateOne(document.querySelector('.work .work-intro'), { y: 25, duration: 0.8 });
  animateIn(document.querySelectorAll('.work .role-card'), {
    y: 35, stagger: 0.1, duration: 0.8
  });
  animateOne(document.querySelector('.work .work-form-wrap'), { y: 30, duration: 0.9 });

  /* ── CONTATTI ────────────────────────────────────────────── */
  const contSec = document.querySelector('#contatti');
  if (contSec) {
    const blocks = contSec.querySelectorAll(':scope > div, .ct, .cti, .contact-card, [class*="ct-"]');
    if (blocks.length) {
      animateIn(blocks, { y: 30, stagger: 0.08, duration: 0.8 });
    }
  }

  /* ── SCORRI INDICATOR (hero) ─────────────────────────────── */
  const scIndicator = document.querySelector('.sc');
  if (scIndicator) {
    // Click → smooth scroll alla prima sezione dopo l'hero
    scIndicator.addEventListener('click', function(){
      const hero = document.querySelector('.hero');
      let target = hero ? hero.nextElementSibling : null;
      // Salta eventuali elementi non scrollabili (es. ticker piccolo)
      // → preferisci la sezione "numeri strip" se esiste
      const ns = document.querySelector('.ns');
      if (ns) target = ns;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      }
    });
    // Fade-out quando si scrolla via dall'hero
    window.addEventListener('scroll', function(){
      scIndicator.classList.toggle('hide', window.scrollY > 80);
    }, { passive: true });
  }

  /* ── BACK TO TOP ─────────────────────────────────────────── */
  const btt = document.querySelector('.btt');
  if (btt) {
    window.addEventListener('scroll', function(){
      btt.classList.toggle('vis', window.scrollY > 600);
    }, { passive: true });
    btt.addEventListener('click', function(){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── COOKIE BANNER ───────────────────────────────────────── */
  const cookie = document.querySelector('.cookie');
  if (cookie && !localStorage.getItem('sox_ck')) {
    setTimeout(function(){ cookie.classList.add('show'); }, 1000);
    cookie.querySelectorAll('.ck-acc, .ck-rej').forEach(function(b){
      b.addEventListener('click', function(){
        localStorage.setItem('sox_ck', '1');
        cookie.classList.remove('show');
      });
    });
  }

  /* ── HOVER MICRO-INTERAZIONI (solo .hxg, le altre card hanno tilt) ── */
  if (!REDUCE) {
    document.querySelectorAll('.hxg').forEach(function(card){
      card.addEventListener('mouseenter', function(){
        gsap.to(card, { y: -3, duration: 0.25, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', function(){
        gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });
      });
    });
  }

  /* ── REFRESH ScrollTrigger dopo caricamento immagini ─────── */
  window.addEventListener('load', function(){
    ScrollTrigger.refresh();

    /* ── RETE DI SICUREZZA ────────────────────────────────────
       Dopo 1.2s, qualsiasi elemento già nel viewport che è
       ancora a opacity 0 viene forzato visibile. Garantisce che
       il contenuto non resti mai nascosto, qualunque cosa accada
       con i trigger. */
    setTimeout(function(){
      const selectors = [
        '.sc2', '.lc', '.pfi', '.mta', '.mp.a', '.mc', '.mat-bann',
        '.hxg', '.mv', '.role-card', '.work-intro', '.work-form-wrap',
        '.mag-t', '.mag-i', '.ni2', '.chi-g > *', '.hx-lay > *'
      ];
      document.querySelectorAll(selectors.join(',')).forEach(function(el){
        const cs = getComputedStyle(el);
        if (parseFloat(cs.opacity) < 0.05) {
          gsap.to(el, {
            opacity: 1, y: 0, x: 0,
            duration: 0.5, ease: 'power2.out', overwrite: 'auto'
          });
        }
      });
    }, 1200);
  });

})();

/* ── D. Advanced animations (split text, scan-line, spotlight) ── */
/* ═══════════════════════════════════════════════════════════════
   SiderOXY — Animazioni avanzate
   1) Split text titoli .sh — char-by-char reveal su scroll
   2) Scan-line reveal su immagini (.hxim, .chi-img, .pfi)
   3) Spotlight + tilt 3D su card (.sc2, .mc, .role-card)
   ═══════════════════════════════════════════════════════════════ */
(function(){
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOUCH  = matchMedia('(pointer: coarse)').matches;

  /* ── 1. SPLIT TEXT TITOLI ────────────────────────────────── */
  function splitChars(el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    (function walk(node){
      if (node.nodeType === 3) {
        const txt = node.textContent;
        if (!txt) return;
        const frag = document.createDocumentFragment();
        for (const ch of txt) {
          if (/\s/.test(ch)) {
            frag.appendChild(document.createTextNode(ch));
          } else {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = ch;
            frag.appendChild(span);
          }
        }
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        Array.from(node.childNodes).forEach(walk);
      }
    })(el);
  }

  document.querySelectorAll('h2.sh').forEach(function(h2){
    splitChars(h2);
    // Anima solo i caratteri visibili (esclude lingua nascosta)
    const chars = h2.querySelectorAll('.char');
    if (!chars.length) return;
    if (!REDUCE) {
      gsap.set(chars, { opacity: 0, y: 30, rotateX: -55 });
    }
    ScrollTrigger.create({
      trigger: h2,
      start: 'top 88%',
      once: true,
      onEnter: function(){
        gsap.to(chars, {
          opacity: 1, y: 0, rotateX: 0,
          duration: REDUCE ? 0.01 : 0.7,
          stagger: REDUCE ? 0 : 0.022,
          ease: 'power3.out'
        });
      }
    });
  });

  /* ── 2. SCAN-LINE REVEAL IMMAGINI ────────────────────────── */
  function setupScan(container) {
    if (container.dataset.scan) return;
    container.dataset.scan = '1';

    // Garantisci position relative + overflow hidden
    const cs = getComputedStyle(container);
    if (cs.position === 'static') container.style.position = 'relative';
    if (cs.overflow !== 'hidden')  container.style.overflow = 'hidden';

    const target = container.querySelector('img, .img-ph');

    const line = document.createElement('div');
    line.className = 'scan-line';
    container.appendChild(line);

    if (target && !REDUCE) {
      gsap.set(target, { clipPath: 'inset(0% 0% 100% 0%)' });
    }

    ScrollTrigger.create({
      trigger: container,
      start: 'top 88%',
      once: true,
      onEnter: function(){
        if (REDUCE) {
          if (target) gsap.set(target, { clipPath: 'inset(0% 0% 0% 0%)' });
          return;
        }
        gsap.set(line, { opacity: 1, top: 0 });
        gsap.to(line, { top: '100%', duration: 1.3, ease: 'power2.inOut' });
        if (target) {
          gsap.to(target, {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.3, ease: 'power2.inOut'
          });
        }
        gsap.to(line, { opacity: 0, duration: 0.3, delay: 1.25 });
      }
    });
  }
  document.querySelectorAll('.hxim, .chi-img, .pfi').forEach(setupScan);

  /* ── 3. SPOTLIGHT + TILT 3D SU CARD ──────────────────────── */
  if (!TOUCH && !REDUCE) {
    document.querySelectorAll('.sc2, .mc, .role-card').forEach(function(card){
      card.classList.add('tilt-card');
      // Garantisci prospettiva sul genitore (una sola volta per genitore)
      const parent = card.parentElement;
      if (parent && !parent.dataset.persp) {
        parent.dataset.persp = '1';
        parent.style.perspective = '1200px';
      }

      card.addEventListener('mousemove', function(e){
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const dx = (x - r.width  / 2) / (r.width  / 2);
        const dy = (y - r.height / 2) / (r.height / 2);
        // Posizione spotlight (CSS variables)
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        // Tilt via GSAP (smoothing automatico)
        gsap.to(card, {
          rotationY: dx * 5,
          rotationX: -dy * 5,
          duration: 0.5,
          ease: 'power2.out',
          transformPerspective: 1200,
          transformOrigin: 'center',
          overwrite: 'auto'
        });
      });
      card.addEventListener('mouseleave', function(){
        gsap.to(card, {
          rotationY: 0, rotationX: 0,
          duration: 0.7, ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });
  }
})();

/* ── E. Advanced animations (round 2) ── */
/* ═══════════════════════════════════════════════════════════════
   SiderOXY — Animazioni avanzate
   1. Titoli split lettera-per-lettera (h2.sh)
   2. Spotlight + tilt 3D sulle card
   3. Scan-line reveal sulle immagini (effetto laser)
   ═══════════════════════════════════════════════════════════════ */
(function(){
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ──────────────────────────────────────────────────────────
     1. SPLIT TITLES — wraps each char into a span and animates
     ────────────────────────────────────────────────────────── */
  function splitText(el){
    if (el.dataset.split) return;
    el.dataset.split = '1';
    function walk(node){
      if (node.nodeType === 3) {                       // text node
        const text = node.textContent;
        if (!text) return;
        const frag = document.createDocumentFragment();
        // Itera per codepoint (gestisce accenti, emoji, ecc.)
        for (const ch of text) {
          if (ch === ' ' || ch === '\u00A0') {
            frag.appendChild(document.createTextNode('\u00A0'));
          } else if (ch === '\n' || ch === '\t') {
            // skip
          } else {
            const span = document.createElement('span');
            span.className = 'ch';
            span.textContent = ch;
            frag.appendChild(span);
          }
        }
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        Array.from(node.childNodes).forEach(walk);
      }
    }
    Array.from(el.childNodes).forEach(walk);
  }

  // Splitto TUTTI i titoli (anche IT/EN nascosti) così la lingua
  // non animata mostra sempre il testo. Ma animo solo quelli visibili.
  document.querySelectorAll('h2.sh').forEach(splitText);

  document.querySelectorAll('h2.sh').forEach(function(h){
    if (h.classList.contains('lang-hidden')) return;
    const chars = h.querySelectorAll('.ch');
    if (!chars.length) return;
    if (!REDUCE) {
      gsap.set(chars, { opacity: 0, y: 36, rotateX: -55 });
    }
    ScrollTrigger.create({
      trigger: h, start: 'top 88%', once: true,
      onEnter: function(){
        gsap.to(chars, {
          opacity: 1, y: 0, rotateX: 0,
          duration: REDUCE ? 0.01 : 0.7,
          stagger: REDUCE ? 0   : 0.022,
          ease: 'back.out(1.6)',
          overwrite: 'auto'
        });
      }
    });
  });

  /* ──────────────────────────────────────────────────────────
     2. SPOTLIGHT + 3D TILT sulle card
     ────────────────────────────────────────────────────────── */
  if (!REDUCE) {
    const tiltSel = '.sc2, .mc, .role-card, .lc';
    // Cache dei rect, invalidata sullo scroll
    let rectCache = new WeakMap();
    window.addEventListener('scroll', function(){
      rectCache = new WeakMap();
    }, { passive: true });
    window.addEventListener('resize', function(){
      rectCache = new WeakMap();
    }, { passive: true });

    document.querySelectorAll(tiltSel).forEach(function(card){
      // Garantisco position relative
      if (getComputedStyle(card).position === 'static') {
        card.style.position = 'relative';
      }

      // Inietto l'overlay spotlight
      const spot = document.createElement('div');
      spot.className = 'sox-spot';
      card.appendChild(spot);

      function getRect(){
        if (!rectCache.has(card)) {
          rectCache.set(card, card.getBoundingClientRect());
        }
        return rectCache.get(card);
      }

      card.addEventListener('mouseenter', function(){
        rectCache.set(card, card.getBoundingClientRect());
        spot.style.opacity = '1';
      });

      card.addEventListener('mousemove', function(e){
        const r = getRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const px = x / r.width;
        const py = y / r.height;

        spot.style.setProperty('--mx', (px * 100) + '%');
        spot.style.setProperty('--my', (py * 100) + '%');

        gsap.to(card, {
          rotateX: (py - 0.5) * -10,
          rotateY: (px - 0.5) *  10,
          transformPerspective: 900,
          transformOrigin: '50% 50%',
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      card.addEventListener('mouseleave', function(){
        spot.style.opacity = '0';
        gsap.to(card, {
          rotateX: 0, rotateY: 0,
          duration: 0.6,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      });
    });
  }

  /* ──────────────────────────────────────────────────────────
     3. SCAN-LINE REVEAL sulle immagini (effetto laser)
     ────────────────────────────────────────────────────────── */
  if (!REDUCE && 'IntersectionObserver' in window) {
    const scanSel = [
      '.lc img', '.lc .img-ph',
      '.hxim img', '.hxim .img-ph',
      '.pfi img', '.pfi .img-ph',
      '.mim img', '.mim .img-ph',
      '.chi-img img', '.chi-img .img-ph'
    ].join(',');

    document.querySelectorAll(scanSel).forEach(function(img){
      const wrap = img.parentElement;
      if (!wrap) return;
      // Marco come pending per la rete di sicurezza
      img.dataset.scanReveal = 'pending';
      // Stato iniziale: img clippata (invisibile)
      gsap.set(img, {
        clipPath: 'inset(0 0 100% 0)',
        webkitClipPath: 'inset(0 0 100% 0)'
      });

      const obs = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (!entry.isIntersecting) return;
          obs.unobserve(img);
          img.dataset.scanReveal = 'done';

          // Inietto la scan line
          const line = document.createElement('div');
          line.className = 'sox-scan';
          wrap.appendChild(line);

          const dur = 1.1;
          gsap.timeline()
            .set(line, { top: '0%', opacity: 0 })
            .to(line, { opacity: 1, duration: 0.15 }, 0)
            .to(img, {
              clipPath: 'inset(0 0 0 0)',
              webkitClipPath: 'inset(0 0 0 0)',
              duration: dur,
              ease: 'power2.inOut'
            }, 0.05)
            .to(line, {
              top: '100%',
              duration: dur,
              ease: 'power2.inOut'
            }, 0.05)
            .to(line, { opacity: 0, duration: 0.3 }, '-=0.18')
            .call(function(){
              if (line.parentNode) line.parentNode.removeChild(line);
            });
        });
      }, { rootMargin: '0px 0px -8% 0px' });

      obs.observe(img);
    });

    // Rete di sicurezza: dopo 1.5s qualunque immagine ancora "pending"
    // viene rivelata in modo soft
    window.addEventListener('load', function(){
      setTimeout(function(){
        document.querySelectorAll('[data-scan-reveal="pending"]').forEach(function(el){
          gsap.to(el, {
            clipPath: 'inset(0 0 0 0)',
            webkitClipPath: 'inset(0 0 0 0)',
            duration: 0.5,
            ease: 'power2.out'
          });
          el.dataset.scanReveal = 'done';
        });
      }, 1500);
    });
  }

  // Safety net per i caratteri split: dopo 1.5s, ogni .ch
  // ancora invisibile nel viewport viene forzato visibile.
  window.addEventListener('load', function(){
    setTimeout(function(){
      document.querySelectorAll('h2.sh:not(.lang-hidden) .ch').forEach(function(el){
        const cs = getComputedStyle(el);
        if (parseFloat(cs.opacity) < 0.05) {
          gsap.to(el, {
            opacity: 1, y: 0, rotateX: 0,
            duration: 0.4, ease: 'power2.out'
          });
        }
      });
    }, 1500);
  });
})();

/* ── F. Machine card image swap (data-img-src) ── */
/* ═══════════════════════════════════════════════════════════════
   SiderOXY — MACHINE CARD IMAGE SWAP
   Click su una .ms (card macchina) → cambia l'immagine in .mim
   del pannello corrente.

   COME AGGIUNGERE LE FOTO REALI:
   Su ogni <div class="ms"> aggiungi:
     data-img-src="percorso/foto.jpg"     ← URL/path immagine
     data-img-lbl="Etichetta breve"        ← (opzionale) etichetta placeholder
   Se non c'è data-img-src, mostra solo il placeholder con l'etichetta.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  // Per ogni pannello macchine, inizializza il sistema
  document.querySelectorAll('.mp').forEach(function(panel){
    const mim   = panel.querySelector('.mim');
    const cards = panel.querySelectorAll('.msg .ms');
    if (!mim || !cards.length) return;

    // Salvo il placeholder originale per poterlo ripristinare
    const originalPh = mim.innerHTML;

    // Pre-creo (se serve) il contenitore dell'immagine reale
    let realImg = mim.querySelector('.mim-real');
    if (!realImg) {
      realImg = document.createElement('img');
      realImg.className = 'mim-real';
      realImg.alt = '';
      mim.appendChild(realImg);
    }

    // Pre-fetch le immagini per evitare flash al primo click
    const preloaded = new Set();
    function preload(src){
      if (!src || preloaded.has(src)) return;
      const i = new Image();
      i.src = src;
      preloaded.add(src);
    }

    // Determina label automatica leggendo .msb visibile
    function autoLabel(card){
      const lblFromData = card.getAttribute('data-img-lbl');
      if (lblFromData) return lblFromData;
      const visMsb = Array.from(card.querySelectorAll('.msb'))
        .find(function(e){ return !e.classList.contains('lang-hidden'); });
      const visMsv = Array.from(card.querySelectorAll('.msv'))
        .find(function(e){ return !e.classList.contains('lang-hidden'); });
      const lbl = (visMsb ? visMsb.textContent.trim() : '');
      const val = (visMsv ? visMsv.textContent.trim() : '');
      return (lbl && val) ? (lbl + ' · ' + val) : (lbl || val || 'Macchina');
    }

    // Funzione di switch
    function activate(card){
      cards.forEach(function(c){ c.classList.remove('ms-active'); });
      card.classList.add('ms-active');

      const src = card.getAttribute('data-img-src');
      const lbl = autoLabel(card);

      // Trova/crea il placeholder dentro mim
      let ph = mim.querySelector('.img-ph');

      if (src) {
        // Mostra immagine reale
        preload(src);
        // Se l'src è diverso, ricarica
        if (realImg.getAttribute('src') !== src) {
          realImg.classList.remove('show');
          realImg.onload = function(){ realImg.classList.add('show'); };
          realImg.src = src;
        } else {
          realImg.classList.add('show');
        }
        // Nascondi placeholder
        if (ph) ph.style.opacity = '0';
      } else {
        // Nessuna immagine: mostra placeholder con label aggiornata
        realImg.classList.remove('show');
        if (!ph) {
          // Ricostruisco il placeholder se mancante
          mim.insertAdjacentHTML('afterbegin',
            '<div class="img-ph"><div class="img-ph-icon">⬡</div><div class="img-ph-lbl"></div></div>');
          ph = mim.querySelector('.img-ph');
        }
        ph.style.opacity = '1';
        const phLbl = ph.querySelector('.img-ph-lbl');
        if (phLbl) phLbl.textContent = lbl;
      }
    }

    // Pre-carica tutte le immagini del pannello (per swap istantaneo)
    cards.forEach(function(c){
      const s = c.getAttribute('data-img-src');
      if (s) preload(s);
    });

    // Attacca click handlers
    cards.forEach(function(card){
      card.addEventListener('click', function(){
        activate(card);
      });
    });

    // Attiva la prima card di default (mostra immagine se presente)
    activate(cards[0]);
  });

  // Quando si cambia tab principale (Taglio/Piega/Calandratura/Tec),
  // ri-applica la prima ms del nuovo pannello attivo
  document.querySelectorAll('.mta').forEach(function(tab){
    tab.addEventListener('click', function(){
      requestAnimationFrame(function(){
        const activePanel = document.querySelector('.mp.a');
        if (!activePanel) return;
        const firstActive = activePanel.querySelector('.msg .ms.ms-active');
        if (firstActive) firstActive.click();
      });
    });
  });
})();

/* ── G. Advanced animations (ticker reactive, parallax) ── */
/* ═══════════════════════════════════════════════════════════════
   SiderOXY — Animazioni avanzate (round 3) — JS
   - Ticker reattivo allo scroll
   - Parallax watermark HARDOX (CSS var) + 1981
   ═══════════════════════════════════════════════════════════════ */
(function(){
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ──────────────────────────────────────────────────────────
     1. TICKER REATTIVO ALLO SCROLL
     ────────────────────────────────────────────────────────── */
  const ticker = document.querySelector('.tki');
  if (ticker && !REDUCE) {
    // Disattivo l'animazione CSS originale
    ticker.style.animation = 'none';

    let pos          = 0;     // posizione corrente in px
    let scrollBoost  = 0;     // boost dovuto allo scroll utente
    let halfWidth    = 0;     // metà larghezza contenuto (loop point)
    let lastY        = window.scrollY;
    let lastT        = performance.now();
    let lastFrame    = performance.now();
    let running      = true;

    function measure(){
      // Il contenuto è duplicato → halfWidth è il punto di loop
      halfWidth = ticker.scrollWidth / 2;
    }
    measure();
    window.addEventListener('resize', measure);
    // Re-misuro dopo che fonts/immagini sono caricati
    window.addEventListener('load', measure);

    window.addEventListener('scroll', function(){
      const now = performance.now();
      const dy  = window.scrollY - lastY;
      const dt  = Math.max(1, now - lastT);
      // dy/dt = velocità in px/ms; amplifico e clampo
      scrollBoost += (dy / dt) * 28;
      if (scrollBoost >  3) scrollBoost =  3;
      if (scrollBoost < -3) scrollBoost = -3;
      lastY = window.scrollY;
      lastT = now;
    }, { passive: true });

    // Pausa quando la tab non è visibile (risparmio CPU)
    document.addEventListener('visibilitychange', function(){
      running = !document.hidden;
      if (running) {
        lastFrame = performance.now();
        requestAnimationFrame(loop);
      }
    });

    function loop(now){
      if (!running) return;
      const dt = Math.min(50, now - lastFrame);
      lastFrame = now;

      if (halfWidth > 0) {
        // Velocità base: stesso ritmo dei vecchi 36s ma in JS
        const baseSpeed = -(halfWidth / 36000); // px/ms (negativo = sx)
        // Boost: scroll giù → accelera, scroll su → rallenta o inverte
        const speed = baseSpeed - (scrollBoost * 0.08);
        pos += speed * dt;

        // Decadimento del boost
        scrollBoost *= 0.93;

        // Loop seamless
        while (pos < -halfWidth) pos += halfWidth;
        while (pos >  0)         pos -= halfWidth;

        ticker.style.transform = 'translate3d(' + pos.toFixed(2) + 'px,0,0)';
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ──────────────────────────────────────────────────────────
     2. PARALLAX su watermark HARDOX
     Animazione di --hx-py via scrub ScrollTrigger.
     ────────────────────────────────────────────────────────── */
  const hxSec = document.querySelector('.hx');
  if (hxSec && !REDUCE) {
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: hxSec,
      start: 'top bottom',
      end:   'bottom top',
      scrub: 0.6,
      onUpdate: function(self){
        // Da +60px a -120px attraverso la sezione
        const v = 60 - (self.progress * 180);
        hxSec.style.setProperty('--hx-py', v.toFixed(1) + 'px');
      }
    });
  }

  /* ──────────────────────────────────────────────────────────
     3. PARALLAX su "1981" (chi-yr) — elemento reale
     ────────────────────────────────────────────────────────── */
  const chiYr = document.querySelector('.chi-yr');
  if (chiYr && !REDUCE) {
    gsap.to(chiYr, {
      y: -55,
      ease: 'none',
      scrollTrigger: {
        trigger: '.chi',
        start: 'top bottom',
        end:   'bottom top',
        scrub: 0.5
      }
    });
  }

})();

/* ── H. Advanced animations round 4 (form engrave, counter shake, hover preview, cursor label) ── */
/* ═══════════════════════════════════════════════════════════════
   SiderOXY — Animazioni avanzate (round 4) — JS
   - Tab slide nelle macchine (override showM)
   - Form field engrave SVG al focus
   - Counter strip shake finale
   - Hover preview tooltip per .lc
   - Cursor VIEW label sopra .pfi
   ═══════════════════════════════════════════════════════════════ */
(function(){
  if (typeof gsap === 'undefined') return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOUCH  = matchMedia('(pointer: coarse)').matches;

  /* ──────────────────────────────────────────────────────────
     1. TAB SLIDE NELLE MACCHINE
     Override di showM con slide laterale + integra image swap.
     ────────────────────────────────────────────────────────── */
  // Pulizia dei vecchi listener su .mta (clone-replace)
  document.querySelectorAll('.mta').forEach(function(tab){
    const clone = tab.cloneNode(true);
    tab.parentNode.replaceChild(clone, tab);
  });

  const tabOrder = ['taglio','piega','cal','tec'];
  let curTabIdx = 0;
  let sliding   = false;

  // Trova quale è già attivo all'avvio
  const initialActive = document.querySelector('.mp.a');
  if (initialActive) {
    const id = initialActive.id.replace('mp-','');
    const i  = tabOrder.indexOf(id);
    if (i >= 0) curTabIdx = i;
  }

  // Helper: trigger swap immagine sulla card attiva del pannello
  function refreshActiveMs(panel){
    if (!panel) return;
    const ms = panel.querySelector('.msg .ms.ms-active') ||
               panel.querySelector('.msg .ms');
    if (ms) ms.click();
  }

  window.showM = function(id, btn){
    if (sliding) return;

    // Trova il pulsante se non passato
    if (!btn) {
      document.querySelectorAll('.mta').forEach(function(el){
        const oc = el.getAttribute('onclick');
        if (oc && oc.indexOf("'"+id+"'") > -1) btn = el;
      });
    }

    const oldPanel = document.querySelector('.mp.a');
    const newPanel = document.getElementById('mp-'+id);
    if (!newPanel || oldPanel === newPanel) return;

    const newIdx = tabOrder.indexOf(id);
    const dir    = (newIdx > curTabIdx) ? 1 : -1;
    curTabIdx    = newIdx >= 0 ? newIdx : curTabIdx;

    // Aggiorna stato dei tab pulsanti
    document.querySelectorAll('.mta').forEach(function(t){ t.classList.remove('a'); });
    if (btn) btn.classList.add('a');

    if (REDUCE) {
      // Niente animazione: switch istantaneo
      if (oldPanel) oldPanel.classList.remove('a');
      newPanel.classList.add('a');
      refreshActiveMs(newPanel);
      return;
    }

    sliding = true;

    // Slide-out del pannello vecchio
    gsap.to(oldPanel, {
      x: -60 * dir,
      opacity: 0,
      duration: 0.32,
      ease: 'power2.in',
      onComplete: function(){
        oldPanel.classList.remove('a');
        gsap.set(oldPanel, { clearProps: 'transform,opacity' });

        // Slide-in del pannello nuovo
        newPanel.classList.add('a');
        gsap.fromTo(newPanel,
          { x: 60 * dir, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out',
            onComplete: function(){
              gsap.set(newPanel, { clearProps: 'transform' });
              sliding = false;
              refreshActiveMs(newPanel);
            }
          });
      }
    });
  };

  /* ──────────────────────────────────────────────────────────
     2. FORM FIELD ENGRAVING al focus
     SVG injection: una scintilla percorre il perimetro del field.
     ────────────────────────────────────────────────────────── */
  if (!REDUCE) {
    const formInputs = document.querySelectorAll(
      '.finp input, .finp textarea, .finp select'
    );

    function spawnEngrave(el){
      const r = el.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return;

      const NS  = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'engrave-svg');
      svg.style.left   = r.left   + 'px';
      svg.style.top    = r.top    + 'px';
      svg.style.width  = r.width  + 'px';
      svg.style.height = r.height + 'px';

      const rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x', '0.75');
      rect.setAttribute('y', '0.75');
      rect.setAttribute('width',  Math.max(0, r.width  - 1.5));
      rect.setAttribute('height', Math.max(0, r.height - 1.5));
      rect.setAttribute('rx', '2');

      const perim   = (r.width + r.height) * 2;
      const sparkLn = Math.max(40, perim * 0.18);

      rect.setAttribute('stroke-dasharray', sparkLn + ' ' + (perim - sparkLn));
      rect.setAttribute('stroke-dashoffset', perim);
      svg.appendChild(rect);
      document.body.appendChild(svg);

      // Animazione: il dashoffset va da perim a 0 (un giro completo)
      const anim = rect.animate(
        [
          { strokeDashoffset: perim },
          { strokeDashoffset: 0 }
        ],
        { duration: 950, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }
      );
      // Fade-out finale e rimozione
      setTimeout(function(){
        svg.style.transition = 'opacity .25s';
        svg.style.opacity = '0';
        setTimeout(function(){ if (svg.parentNode) svg.remove(); }, 280);
      }, 900);
    }

    formInputs.forEach(function(el){
      el.addEventListener('focus', function(){ spawnEngrave(el); });
    });
  }

  /* ──────────────────────────────────────────────────────────
     3. COUNTER STRIP — shake finale
     Dopo che i counter finiscono, le ni2 fanno un thump verticale.
     ────────────────────────────────────────────────────────── */
  if (typeof ScrollTrigger !== 'undefined') {
    const nsEl = document.querySelector('.ns');
    if (nsEl && !REDUCE) {
      let thumped = false;
      ScrollTrigger.create({
        trigger: nsEl, start: 'top 88%', once: true,
        onEnter: function(){
          // Aspetta che i counter abbiano (quasi) finito (~2.4s) e thump
          setTimeout(function(){
            if (thumped) return; thumped = true;
            const items = nsEl.querySelectorAll('.ni2');
            gsap.timeline()
              .to(items, {
                y: 9, duration: 0.09, ease: 'power3.out',
                stagger: { each: 0.015, from: 'start' }
              })
              .to(items, {
                y: 0, duration: 0.22, ease: 'elastic.out(1, 0.45)'
              }, '>-0.02')
              .to(items, { clearProps: 'transform', duration: 0 });
          }, 2350);
        }
      });
    }
  }

  /* ──────────────────────────────────────────────────────────
     4. HOVER PREVIEW TOOLTIP per .lc (lavorazioni)
     ────────────────────────────────────────────────────────── */
  if (!TOUCH && !REDUCE) {
    const tt = document.createElement('div');
    tt.id = 'lc-tooltip';
    tt.innerHTML =
      '<div class="lc-tt-bar"></div>' +
      '<div class="lc-tt-title"></div>' +
      '<div class="lc-tt-meta"></div>' +
      '<div class="lc-tt-cta">→ Esplora</div>';
    document.body.appendChild(tt);

    const ttTitle = tt.querySelector('.lc-tt-title');
    const ttMeta  = tt.querySelector('.lc-tt-meta');

    function getVisible(el, sel){
      return Array.from(el.querySelectorAll(sel))
        .find(function(n){ return !n.classList.contains('lang-hidden'); });
    }

    document.querySelectorAll('.lav .lc, .lav-g .lc').forEach(function(lc){
      lc.addEventListener('mouseenter', function(){
        const tEl = getVisible(lc, '.lc-t');
        const sEl = lc.querySelector('.lc-s li');
        ttTitle.textContent = tEl ? tEl.textContent.trim() : '';
        // Estrae prima specifica tecnica
        let metaTxt = '';
        if (sEl) {
          const visStrong = getVisible(sEl, 'strong') ||
                            sEl.querySelector('strong');
          metaTxt = visStrong ? visStrong.textContent.trim() :
                                sEl.textContent.trim().split('·')[0];
        }
        ttMeta.textContent = metaTxt;
        tt.style.opacity = '1';
      });
      lc.addEventListener('mouseleave', function(){
        tt.style.opacity = '0';
      });
    });

    // Posizionamento sul cursore
    document.addEventListener('mousemove', function(e){
      if (parseFloat(tt.style.opacity || '0') > 0) {
        // Flip se troppo vicino al bordo destro
        const ttW = tt.offsetWidth;
        const ttH = tt.offsetHeight;
        let x = e.clientX + 22;
        let y = e.clientY + 22;
        if (x + ttW > window.innerWidth - 12)  x = e.clientX - ttW - 22;
        if (y + ttH > window.innerHeight - 12) y = e.clientY - ttH - 22;
        tt.style.left = x + 'px';
        tt.style.top  = y + 'px';
        tt.style.transform = 'none';
      }
    }, { passive: true });
  }

  /* ──────────────────────────────────────────────────────────
     5. CURSOR VIEW LABEL sopra le card portfolio
     ────────────────────────────────────────────────────────── */
  if (!TOUCH && !REDUCE) {
    const vl = document.createElement('div');
    vl.id = 'cursor-view-label';
    vl.textContent = '◉ VIEW';
    document.body.appendChild(vl);

    let onPfi = false;
    document.addEventListener('mouseover', function(e){
      const newOnPfi = !!(e.target.closest && e.target.closest('.pfi'));
      if (newOnPfi !== onPfi) {
        onPfi = newOnPfi;
        vl.style.opacity = onPfi ? '1' : '0';
      }
    });

    document.addEventListener('mousemove', function(e){
      if (onPfi) {
        vl.style.left = e.clientX + 'px';
        vl.style.top  = e.clientY + 'px';
      }
    }, { passive: true });
  }

})();

/* ── I. Laser cursor (disabled — kept for future toggle) ── */
/* ═══════════════════════════════════════════════════════════════
   SiderOXY — LASER CURSOR (lightweight)
   Versione alleggerita: attiva su tutto il sito ma sobria.
   - Niente trail (era 16 punti × frame)
   - Niente scintille ambient continue (solo al click)
   - Glow ridotto del 40%
   - Crosshair più sottile e corto
   - Su input/textarea/select il cursore di sistema resta visibile
   ═══════════════════════════════════════════════════════════════ */
(function(){
  return; // Laser cursor disabled: removes residual orange glow/halo.
  if (matchMedia('(pointer: coarse)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Cursor:none globale, eccetto su elementi di input
  const css = document.createElement('style');
  css.textContent =
    'html, body, body *:not(input):not(textarea):not(select):not([contenteditable="true"]){cursor:none!important}' +
    'input,textarea,select,[contenteditable="true"]{cursor:text!important}' +
    '#lcur{position:fixed;inset:0;pointer-events:none;z-index:99999}';
  document.head.appendChild(css);

  // Canvas overlay
  const cvs = document.createElement('canvas');
  cvs.id = 'lcur';
  document.body.appendChild(cvs);
  const ctx = cvs.getContext('2d');

  let W = 0, H = 0;
  let mx = -200, my = -200;
  let px = mx, py = my;
  let hovering = false;
  let visible  = false;
  const sparks = [];

  function resize(){
    W = cvs.width  = innerWidth;
    H = cvs.height = innerHeight;
  }
  resize();
  addEventListener('resize', resize);

  addEventListener('mousemove', function(e){
    mx = e.clientX; my = e.clientY; visible = true;
  }, { passive: true });

  addEventListener('mouseleave', function(){ visible = false; });
  addEventListener('mouseenter', function(){ visible = true; });

  // Detect hover su elementi cliccabili
  const interactiveSel = 'a,button,input[type="button"],input[type="submit"],' +
    '.lc,.sc2,.pfi,.mta,.pff-b,.role-card,.nc,.br,.bo,.lo,.sc,.ck-acc,.ck-rej,[onclick]';
  document.addEventListener('mouseover', function(e){
    hovering = !!(e.target.closest && e.target.closest(interactiveSel));
  });

  // Click → burst piccolo di scintille (ridotto da 22 → 14)
  addEventListener('mousedown', function(e){
    for (let i = 0; i < 14; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp  = 1 + Math.random() * 3.5;
      sparks.push({
        x: e.clientX, y: e.clientY,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        life: 1,
        size: 0.8 + Math.random() * 1.1
      });
    }
  });

  function draw(){
    requestAnimationFrame(draw);

    // Smooth follow
    px += (mx - px) * 0.34;
    py += (my - py) * 0.34;

    ctx.clearRect(0, 0, W, H);
    if (!visible) return;

    // ── SCINTILLE click ── (gestite anche se vuote, costo zero)
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x  += s.vx;
      s.y  += s.vy;
      s.vy += 0.09;
      s.vx *= 0.985;
      s.life -= 0.025;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      const g = 140 + ((Math.random() * 90) | 0);
      const b = 30  + ((Math.random() * 60) | 0);
      ctx.fillStyle = 'rgba(255,' + g + ',' + b + ',' + s.life + ')';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── GLOW ridotto (era radius 38 → ora 22) ──
    const radius = hovering ? 32 : 22;
    const glow = ctx.createRadialGradient(px, py, 0, px, py, radius);
    glow.addColorStop(0,    'rgba(255,120,30,0.36)');
    glow.addColorStop(0.4,  'rgba(224,26,16,0.13)');
    glow.addColorStop(1,    'rgba(192,21,12,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();

    // ── CORE bianco-caldo (più piccolo) ──
    ctx.shadowBlur  = 14;
    ctx.shadowColor = 'rgba(255,200,80,0.85)';
    ctx.fillStyle   = '#ffffee';
    ctx.beginPath();
    ctx.arc(px, py, hovering ? 3.4 : 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ── CROSSHAIR ridotto (era len 20 → ora 14) ──
    const len = hovering ? 18 : 14;
    ctx.strokeStyle = hovering
      ? 'rgba(255,160,40,0.45)'
      : 'rgba(255,160,40,0.22)';
    ctx.lineWidth = 0.9;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(px - len, py); ctx.lineTo(px - 6, py);
    ctx.moveTo(px + 6,   py); ctx.lineTo(px + len, py);
    ctx.moveTo(px, py - len); ctx.lineTo(px, py - 6);
    ctx.moveTo(px, py + 6);   ctx.lineTo(px, py + len);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── CERCHIO esterno solo in hover (mirino "lock") ──
    if (hovering) {
      ctx.strokeStyle = 'rgba(255,160,40,0.42)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(px, py, 13, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Niente più scintille ambient idle: era la causa principale
    // dell'effetto "alone arancione che copre tutto"
  }
  draw();
})();

/* ═══════════════════════════════════════════════════════════════
   ADDITIONS for multi-page refactor
   ═══════════════════════════════════════════════════════════════ */

/* ── J. Cookie banner — define closeCookie referenced in HTML ── */
function closeCookie(){
  var c = document.getElementById('cookie');
  if(c){ c.style.display = 'none'; }
  try{ localStorage.setItem('cookie-ack','1'); }catch(e){}
}
(function(){
  try{
    if(localStorage.getItem('cookie-ack') === '1'){
      var c = document.getElementById('cookie');
      if(c) c.style.display = 'none';
    }
  }catch(e){}
})();

/* ── K. Active nav state — mark current page in the nav ── */
(function(){
  function pageName(){
    var p = location.pathname.split('/').pop() || 'index.html';
    if(!p) p = 'index.html';
    return p;
  }
  var current = pageName();
  document.querySelectorAll('#nav .ni > li > a, #nav .ni .nav-sub a').forEach(function(a){
    var href = a.getAttribute('href') || '';
    var hrefPage = href.split('#')[0].split('/').pop();
    if(hrefPage === current || (current === 'index.html' && hrefPage === '')){
      a.classList.add('active');
      var li = a.closest('li'); if(li) li.classList.add('active');
    }
  });
})();

/* ── L. Mobile nav toggle ── */
(function(){
  var btn = document.getElementById('nav-burger');
  var nav = document.getElementById('nav');
  if(!btn || !nav) return;
  btn.addEventListener('click', function(){
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });
  document.querySelectorAll('#nav .ni a').forEach(function(a){
    a.addEventListener('click', function(){
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ── M. Smooth scroll-to-anchor on page load if URL has #hash ── */
window.addEventListener('load', function(){
  if(location.hash && location.hash.length > 1){
    var raw = location.hash.slice(1);
    /* Bridge for macchine.html tab UI: map common anchors to showM() tab ids */
    var tabMap = { 'taglio':'taglio', 'piega':'piega', 'calandratura':'cal', 'extra':'extra', 'ufficio-tecnico':'tec' };
    if(tabMap[raw] && typeof window.showM === 'function' && document.getElementById('mp-' + tabMap[raw])){
      try{ window.showM(tabMap[raw], null); }catch(e){}
      var sec = document.getElementById('macchine');
      if(sec){ setTimeout(function(){ sec.scrollIntoView({behavior:'smooth', block:'start'}); }, 400); }
      return;
    }
    var t = document.querySelector(location.hash);
    if(t){ setTimeout(function(){ t.scrollIntoView({behavior:'smooth', block:'start'}); }, 400); }
  }
});

/* ── N. Splash: only on index.html, only first session visit ── */
(function(){
  var splash = document.getElementById('splash');
  if(!splash) return;
  var page = (location.pathname.split('/').pop() || 'index.html');
  var isHome = (page === 'index.html' || page === '' );
  var seen = false;
  try{ seen = sessionStorage.getItem('splash-seen') === '1'; }catch(e){}
  if(!isHome || seen){
    splash.style.display = 'none';
    document.documentElement.classList.add('no-splash');
  } else {
    try{ sessionStorage.setItem('splash-seen','1'); }catch(e){}
  }
})();

/* ── O. Page-hero: pause video if reduced-motion preferred ── */
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('.page-hero-bg, .hero-bg-video').forEach(function(v){
      try{ v.pause(); v.removeAttribute('autoplay'); }catch(e){}
    });
  }
})();
