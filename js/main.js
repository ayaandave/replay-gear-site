const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ .";

// ---------- Ambient canvas background ----------
(function ambientBackground(){
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, particles, rafId = null;

  function resize(){
    width = canvas.width = window.innerWidth * devicePixelRatio;
    height = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }

  function makeParticles(){
    const count = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 24000));
    particles = Array.from({length: count}, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: (Math.random() * 1.6 + 0.6) * devicePixelRatio,
      vx: (Math.random() - 0.5) * 0.12 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.12 * devicePixelRatio,
      hue: Math.random() > 0.55 ? 'accent' : 'chrome',
      alpha: Math.random() * 0.35 + 0.15,
    }));
  }

  function drawFrame(){
    ctx.clearRect(0, 0, width, height);
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x < -10) p.x = width + 10; if(p.x > width + 10) p.x = -10;
      if(p.y < -10) p.y = height + 10; if(p.y > height + 10) p.y = -10;
      const color = p.hue === 'accent' ? `rgba(61,139,255,${p.alpha})` : `rgba(200,214,228,${p.alpha * 0.8})`;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = p.r * 4;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(){
    drawFrame();
    rafId = requestAnimationFrame(loop);
  }

  resize();
  makeParticles();
  drawFrame();
  if(!REDUCED){
    loop();
    document.addEventListener('visibilitychange', () => {
      if(document.hidden){ if(rafId) cancelAnimationFrame(rafId); rafId = null; }
      else if(!rafId){ loop(); }
    });
  }
  window.addEventListener('resize', () => { resize(); makeParticles(); if(REDUCED) drawFrame(); });
})();

function flapText(el, text){
  if(REDUCED){ el.textContent = text; return; }
  text.split('').forEach(ch => {
    const span = document.createElement('span');
    span.className = 'flap';
    span.textContent = ch === ' ' ? ' ' : ch;
    el.appendChild(span);
    if(ch === ' ') return;
    let ticks = 8 + Math.floor(Math.random()*6), count = 0;
    const iv = setInterval(() => {
      span.textContent = CHARS[Math.floor(Math.random()*CHARS.length)];
      if(++count >= ticks){ span.textContent = ch; clearInterval(iv); }
    }, 40);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  flapText(document.getElementById('flap1'), 'GIVE GEAR.');
  flapText(document.getElementById('flap2'), 'FUEL DREAMS.');
});

// ---------- Ticker ----------
const stats = ["65 ITEMS DONATED","44 KIDS EQUIPPED","$6,777.60 RAISED","$0 COST TO FAMILIES","$5,000 GIVEN TO AIM FOR SEVA","JUST GETTING STARTED"];
const tickerEl = document.getElementById('ticker');
if(tickerEl){
  const build = stats.map(s => `<span><b>${s.split(' ')[0]}</b> ${s.split(' ').slice(1).join(' ')}</span>`).join('');
  tickerEl.innerHTML = build + build;
}

// ---------- Mobile nav ----------
const burger = document.getElementById('navBurger');
const mobilePanel = document.getElementById('mobilePanel');
if(burger && mobilePanel){
  burger.addEventListener('click', () => {
    const isOpen = mobilePanel.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });
  mobilePanel.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobilePanel.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---------- Interactive field (now the primary page navigator) ----------
const zones = document.querySelectorAll('.zone, .endzone');
const ball = document.getElementById('ball');
const hud = document.getElementById('hudTarget');
zones.forEach(z => {
  z.addEventListener('mouseenter', () => {
    if(!ball) return;
    let topPct = z.classList.contains('endzone') ? (z.classList.contains('top') ? 6 : 94) : parseFloat(z.style.top);
    ball.style.top = topPct + '%';
    if(hud) hud.textContent = 'TARGET: ' + (z.querySelector('.zone-label')?.textContent || z.textContent.trim()).toUpperCase();
  });
  z.addEventListener('focus', () => z.dispatchEvent(new Event('mouseenter')));
  z.addEventListener('click', () => {
    if(z.dataset.href){ window.location.href = z.dataset.href; return; }
    const target = document.querySelector(z.dataset.target);
    if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

const fieldWrap = document.getElementById('fieldWrap');
const field = document.getElementById('field-el');
if(fieldWrap && field && !REDUCED){
  fieldWrap.addEventListener('mousemove', (e) => {
    const r = fieldWrap.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    field.style.transform = `rotateX(${52 - py*8}deg) rotateZ(${px*4}deg)`;
  });
  fieldWrap.addEventListener('mouseleave', () => { field.style.transform = 'rotateX(52deg) rotateZ(0deg)'; });
}

// ---------- Tilt cards (quarter/roster cards + trading cards) ----------
document.querySelectorAll('.tilt-card, .trading-card-inner').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    if(REDUCED) return;
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const px = x / r.width - 0.5, py = y / r.height - 0.5;
    card.style.transform = `rotateX(${-py*8}deg) rotateY(${px*10}deg) translateZ(4px)`;
    card.style.setProperty('--mx', x + 'px');
    card.style.setProperty('--my', y + 'px');
  });
  card.addEventListener('mouseleave', () => { card.style.transform = 'rotateX(0) rotateY(0)'; });
});

// ---------- Flip cards (Get Involved roster) ----------
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', (e) => {
    if(e.target.closest('a')) return; // let the back-face CTA link navigate normally
    card.classList.toggle('flipped');
    card.setAttribute('aria-pressed', card.classList.contains('flipped') ? 'true' : 'false');
  });
  card.addEventListener('keydown', (e) => {
    if((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a')){ e.preventDefault(); card.click(); }
  });
});

// ---------- Team coins (Meet the Team) ----------
document.querySelectorAll('.team-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
    card.setAttribute('aria-pressed', card.classList.contains('flipped') ? 'true' : 'false');
  });
  card.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); card.click(); }
  });
});

// ---------- FAQ accordion ----------
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  q.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => {
      o.classList.remove('open');
      o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if(!wasOpen){
      item.classList.add('open');
      q.setAttribute('aria-expanded', 'true');
    }
  });
});
