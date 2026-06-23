/*
╔══════════════════════════════════════════════════════╗
║  script.js — Nissih Buctuan Portfolio                ║
║  ──────────────────────────────────────────────────  ║
║  SECTIONS:                                           ║
║    1.  Preloader animation                           ║
║    2.  Theme toggle (dark/light)                     ║
║    3.  Navbar scroll effect                          ║
║    4.  Smooth scroll navigation                      ║
║    5.  Hamburger mobile menu                         ║
║    6.  Interactive page background + particle canvas ║
║    7.  Typewriter effect (taglines)                  ║
║    8.  Intersection Observer (fade-in on scroll)     ║
║    9.  Animated stat counters                        ║
║   10.  Skill bar animations                          ║
║   11.  Radial chart animations                       ║
║   12.  Project filter buttons                        ║
║   13.  Project modal (click to expand)               ║
║   14.  Bag / Workspace reveal                        ║
║   15.  Resume modal                                  ║
║   16.  Contact form (mailto fallback)                ║
║   17.  Back-to-top button                            ║
║   18.  Activity source code viewer                   ║
║   19.  Footer year                                   ║
╚══════════════════════════════════════════════════════╝
*/


// ── Preloader ───────────────────────────────────
const preloader = document.getElementById('preloader');
const preBar    = document.getElementById('pre-bar');
const prePct    = document.getElementById('pre-pct');
let pct = 0;
const preInterval = setInterval(() => {
  pct += 10;
  preBar.style.width = pct + '%';
  prePct.textContent = pct + '%';
  if (pct >= 100) { clearInterval(preInterval); setTimeout(() => preloader.classList.add('done'), 300); }
}, 150);

// ── Theme ───────────────────────────────────────
const html = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
function applyTheme(t){ html.classList.toggle('dark', t==='dark'); themeBtn.textContent = t==='dark' ? '☀️' : '🌙'; }
let theme = localStorage.getItem('theme') || 'dark';
applyTheme(theme);
themeBtn.addEventListener('click', () => { theme = theme==='dark' ? 'light' : 'dark'; localStorage.setItem('theme', theme); applyTheme(theme); });

// ── Navbar scroll ───────────────────────────────
const navbar = document.getElementById('navbar');
let _navTick=false;
window.addEventListener('scroll',()=>{
  if(!_navTick){_navTick=true;requestAnimationFrame(()=>{
    navbar.classList.toggle('scrolled',scrollY>50);
    if(typeof btt!=='undefined') btt.classList.toggle('visible',scrollY>300);
    _navTick=false;
  });}
},{passive:true});

// ── Smooth scroll nav ───────────────────────────
document.querySelectorAll('a[href^="#"], .nav-links a, .mobile-menu a').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({behavior:'smooth'}); document.getElementById('mobileMenu').classList.remove('open'); }
  });
});

// ── Hamburger ───────────────────────────────────
document.getElementById('hamburger').addEventListener('click', () => document.getElementById('mobileMenu').classList.toggle('open'));
document.getElementById('mobileMenu').addEventListener('click', e => { if(e.target === e.currentTarget) e.currentTarget.classList.remove('open'); });

// ── Interactive background (cursor-driven gradients) + hero particles ──
const root = document.documentElement;
const mouse = { x: null, y: null };

function pointerFrom(e) {
  if (e.touches && e.touches[0]) return e.touches[0];
  return e;
}
// RAF-gated mousemove — one CSS var write per frame max
let _bgRaf=null, _mx=null, _my=null;
let _curX=42,_curY=32,_curX2=78,_curY2=72;
function scheduleBg(e){
  const p=pointerFrom(e);
  _mx=p.clientX; _my=p.clientY;
  mouse.x=_mx; mouse.y=_my;
  if(!_bgRaf) _bgRaf=requestAnimationFrame(writeBgVars);
}
function writeBgVars(){
  _bgRaf=null;
  if(_mx==null) return;
  const tx=(_mx/innerWidth)*100, ty=(_my/innerHeight)*100;
  _curX+=( tx-_curX)*0.10; _curY+=( ty-_curY)*0.10;
  _curX2+=((100-tx*0.72)-_curX2)*0.08;
  _curY2+=((100-ty*0.65)-_curY2)*0.08;
  root.style.setProperty('--cursor-x',  _curX.toFixed(1)+'%');
  root.style.setProperty('--cursor-y',  _curY.toFixed(1)+'%');
  root.style.setProperty('--cursor-x2', _curX2.toFixed(1)+'%');
  root.style.setProperty('--cursor-y2', _curY2.toFixed(1)+'%');
  if(Math.abs(tx-_curX)+Math.abs(ty-_curY)>0.1) _bgRaf=requestAnimationFrame(writeBgVars);
}
window.addEventListener('mousemove',  scheduleBg, {passive:true});
window.addEventListener('touchstart', scheduleBg, {passive:true});
window.addEventListener('touchmove',  scheduleBg, {passive:true});

const canvas = document.getElementById('particle-canvas');
const ctx = canvas && canvas.getContext('2d');
function resizeCanvas() {
  if (!canvas) return;
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Lightweight background dots (low CPU). Drawn on a single canvas with subtle parallax.
(function(){
  const bgAtmos = document.getElementById('bg-atmosphere');
  if(!bgAtmos) return;
  const bgCanvas = document.createElement('canvas');
  bgCanvas.id = 'bg-dots';
  bgCanvas.style.position = 'fixed';
  bgCanvas.style.inset = '0';
  bgCanvas.style.zIndex = '-2';
  bgCanvas.style.pointerEvents = 'none';
  bgAtmos.appendChild(bgCanvas);
  const g = bgCanvas.getContext('2d');
  let w=0,h=0;
  let dots = [];
  function makeDots(){
    dots = [];
    const cnt = innerWidth < 768 ? 26 : 60;
    for(let i=0;i<cnt;i++){
      dots.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: (Math.random()*2.4)+0.6,
        alpha: 0.15 + Math.random()*0.35,
        hueShift: Math.random()*40 - 10
      });
    }
  }
  function resizeBg(){ w=bgCanvas.width = innerWidth; h=bgCanvas.height = innerHeight; makeDots(); }
  resizeBg(); window.addEventListener('resize', resizeBg, {passive:true});

  let last=0, fps=30, step=1000/fps;
  function draw(ts){
    if(document.hidden){ last = ts; requestAnimationFrame(draw); return; }
    if(ts - last < step){ requestAnimationFrame(draw); return; }
    last = ts;
    g.clearRect(0,0,w,h);
    const dark = document.documentElement.classList.contains('dark');
    const cx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cursor-x')) || 50;
    const cy = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cursor-y')) || 50;
    const ox = (cx-50)/50 * 10; const oy = (cy-50)/50 * 6;
    for(const d of dots){
      const x = d.x + ox * (d.r*2);
      const y = d.y + oy * (d.r*2);
      g.beginPath();
      g.fillStyle = dark ? `rgba(160,180,255,${d.alpha*0.8})` : `rgba(45,85,170,${d.alpha})`;
      g.arc(x,y,d.r,0,Math.PI*2);
      g.fill();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

// Floating canvas animation disabled for improved performance.
// The hero background remains visible without extra CPU usage.


/* Floating canvas animation disabled.
function _animF(ts){
  requestAnimationFrame(_animF);
  if(document.hidden||ts-_fLast<_FSTEP) return;
  _fLast=ts;
  fCtx.clearRect(0,0,floatCanvas.width,floatCanvas.height);
  const dark=document.documentElement.classList.contains('dark');
  const pal=dark?_PALETTE_D:_PALETTE_L;
  for(const p of floats){
    p.twinkle+=.018; p.rotation+=p.rotSpeed;
    p.x+=p.speedX; p.y+=p.speedY;
    if(p.y<-20){p.y=floatCanvas.height+10;p.x=Math.random()*floatCanvas.width;}
    if(p.x<-20) p.x=floatCanvas.width+10;
    if(p.x>floatCanvas.width+20) p.x=-10;
    const a=Math.max(0,Math.min(1,p.opacity+Math.sin(p.twinkle)*.05));
    const rgb=pal[p.colorIdx];
    fCtx.save();
    fCtx.translate(p.x,p.y); fCtx.rotate(p.rotation);
    fCtx.globalAlpha=a;
    fCtx.strokeStyle=fCtx.fillStyle=\`rgba(\${rgb},\${a.toFixed(2)})\`;
    _drawFloat(fCtx,p);
    fCtx.restore();
  }
}
*/

// ── Typewriter ──────────────────────────────────
const texts = ["Video Editor", "Graphic Designer", "Social Media Engager", "Email Manager", "Aspiring Web Developer"];
let tIdx=0, charIdx=0, deleting=false;
const tyEl = document.getElementById('typing-text');
function type(){
  const cur = texts[tIdx];
  tyEl.textContent = deleting ? cur.slice(0,charIdx--) : cur.slice(0,charIdx++);
  let delay = deleting ? 50 : 100;
  if(!deleting && charIdx > cur.length){ delay = 2000; deleting = true; }
  else if(deleting && charIdx < 0){ deleting = false; tIdx = (tIdx+1) % texts.length; charIdx = 0; delay = 300; }
  setTimeout(type, delay);
}
type();

// ── IntersectionObserver ────────────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => { if(en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
}, {threshold:.15});
document.querySelectorAll(
  '.fade-in,.section-heading,.stat-card,.tl-row,.project-card,.exp-card,.skill-cat,.soft-card,.cert-card'
).forEach(el => io.observe(el));

// ── Animated counters ───────────────────────────
function animateCounter(el){
  const target = +el.dataset.target, suffix = el.dataset.suffix || '';
  let start = null;
  function step(ts){ if(!start) start=ts; const p = Math.min((ts-start)/2000,1); el.textContent = Math.floor(p*target)+suffix; if(p<1) requestAnimationFrame(step); }
  requestAnimationFrame(step);
}
new IntersectionObserver((entries) => {
  entries.forEach(en => { if(en.isIntersecting){ animateCounter(en.target); io.unobserve(en.target); } });
},{threshold:.5}).observe; // ← attach below per element
document.querySelectorAll('.stat-num[data-target]').forEach(el => {
  new IntersectionObserver((ens) => { ens.forEach(en => { if(en.isIntersecting){ animateCounter(en.target); } }); },{threshold:.5}).observe(el);
});

// Radial counters
document.querySelectorAll('.radial-pct[data-target]').forEach(el => {
  new IntersectionObserver((ens) => { ens.forEach(en => {
    if(en.isIntersecting){
      const t = +en.target.dataset.target; let start=null;
      function step(ts){ if(!start)start=ts; const p=Math.min((ts-start)/1600,1); en.target.textContent=Math.floor(p*t)+'%'; if(p<1)requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }
  }); },{threshold:.5}).observe(el);
});

// ── Skill bars ──────────────────────────────────
new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if(en.isIntersecting){
      en.target.querySelectorAll('.skill-bar-fill,.skill-bar-prog').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    }
  });
},{threshold:.3}).observe(document.getElementById('about'));
new IntersectionObserver((entries) => {
  entries.forEach(en => { if(en.isIntersecting) en.target.querySelectorAll('.skill-bar-prog').forEach(b => b.style.width = b.dataset.width+'%'); });
},{threshold:.3}).observe(document.getElementById('experience'));
new IntersectionObserver((entries) => {
  entries.forEach(en => { if(en.isIntersecting) en.target.querySelectorAll('.skill-bar-prog').forEach(b => b.style.width = b.dataset.width+'%'); });
},{threshold:.3}).observe(document.getElementById('skills'));

// ── Radial circles ─────────────────────────────
// Animate radial circles when skills section is visible
const radialObserver = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      // Trigger each radial fill with a small stagger
      en.target.querySelectorAll('.radial-fill').forEach((c, i) => {
        setTimeout(() => {
          c.style.strokeDashoffset = c.dataset.offset;
        }, 300 + i * 150);
      });
      // Animate percentage counters
      en.target.querySelectorAll('.radial-pct[data-target]').forEach((el, i) => {
        setTimeout(() => {
          const target = +el.dataset.target;
          let start = null;
          function step(ts) {
            if (!start) start = ts;
            const p = Math.min((ts - start) / 1400, 1);
            el.textContent = Math.floor(p * target) + '%';
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }, 400 + i * 150);
      });
    }
  });
}, { threshold: 0.2 });

const skillsSection = document.getElementById('skills');
if (skillsSection) radialObserver.observe(skillsSection);

// ── Project filter ─────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const show = f === 'All' || card.dataset.category === f;
      if (show) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
        card.classList.remove('visible');
      }
    });
  });
});

// ── Project modal ──────────────────────────────────────────────────
// Opens when any project card is clicked.
// Reads all the data-* attributes from the clicked card.
const modal = document.getElementById('projectModal');

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {

    // ── Fill in image, title, description ──────────────────────────
    document.getElementById('modal-img').src              = card.dataset.img   || '';
    document.getElementById('modal-title').textContent    = card.dataset.title || '';
    document.getElementById('modal-desc').textContent     = card.dataset.desc  || '';

    // ── Build tag pills ────────────────────────────────────────────
    const tagsEl = document.getElementById('modal-tags');
    tagsEl.innerHTML = '';
    (card.dataset.tags || '').split(',').forEach(t => {
      if (!t.trim()) return;
      const s = document.createElement('span');
      s.className   = 'modal-tag';
      s.textContent = t.trim();
      tagsEl.appendChild(s);
    });

    // ── "View Output" button ────────────────────────────────────────
    // data-live should be the path to the activity HTML file,
    // e.g.  data-live="activity1.html"  or  data-live="activities/act1.html"
    const liveBtn  = document.getElementById('modalLiveBtn');
    const liveUrl  = card.dataset.live || '#';

    if (liveUrl && liveUrl !== '#') {
      // We have a real URL — show the button normally
      liveBtn.href = liveUrl;
      liveBtn.style.opacity    = '1';
      liveBtn.style.pointerEvents = 'auto';
      liveBtn.title = 'Open ' + liveUrl + ' in a new tab';
    } else {
      // No URL set yet — dim the button and show a tooltip hint
      liveBtn.href = '#';
      liveBtn.style.opacity       = '0.4';
      liveBtn.style.pointerEvents = 'none';
      liveBtn.title = 'Set data-live="yourfile.html" on the project card to enable this';
    }

    // ── Load activity HTML source code ─────────────────────────────
    const pid    = parseInt(card.dataset.id);
    const codeEl = document.getElementById('codeContent');
    if (pid >= 1 && pid <= 7 && ACTIVITY_CODES[pid - 1]) {
      codeEl.textContent = ACTIVITY_CODES[pid - 1];
    } else {
      codeEl.textContent = '// No source code available for this activity.';
    }

    // ── Reset code block to hidden state ───────────────────────────
    document.getElementById('codeBlock').style.display = 'none';
    document.getElementById('toggleCodeBtn').innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> View Code';

    // ── Open modal ─────────────────────────────────────────────────
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

if (modal) {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
}

function closeModal() {
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Bag / Workspace ────────────────────────────────
const bagBtn   = document.getElementById('bagBtn');
const bagFlap  = document.getElementById('bagFlap');
const bagStage = document.getElementById('bagStage');
const bagHint  = document.getElementById('bagHint');
const bagClose = document.getElementById('bagCloseHint');
const wiItems  = document.querySelectorAll('.workspace-item');
let bagOpen=false, bagLocked=false;
function openBag(){
  bagOpen=true; bagFlap.classList.add('open'); bagStage.classList.add('open');
  bagHint.style.display='none'; bagClose.classList.add('visible');
  wiItems.forEach((item,i)=>{
    const x=+item.dataset.x*4, y=+item.dataset.y*4;
    const d=+(item.style.getPropertyValue('--wi-delay'))||i*55;
    setTimeout(()=>{
      item.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) scale(1) rotate(0deg)`;
      item.style.opacity='1';
    },d);
  });
}
function closeBag(){
  bagOpen=false; bagFlap.classList.remove('open'); bagStage.classList.remove('open');
  bagHint.style.display=''; bagClose.classList.remove('visible');
  wiItems.forEach((item,i)=>setTimeout(()=>{
    item.style.transform='translate(-50%,-50%) scale(0) rotate(-20deg)';
    item.style.opacity='0';
  },i*28));
}
bagBtn.addEventListener('click',()=>{ bagLocked=true; bagOpen?closeBag():openBag(); setTimeout(()=>bagLocked=false,500); });
bagClose.addEventListener('click', closeBag);
bagStage.addEventListener('mouseenter',()=>{ if(!bagOpen&&!bagLocked) openBag(); });
bagStage.addEventListener('mouseleave',()=>{ if(bagOpen&&!bagLocked) closeBag(); });
// ── Resume modal ────────────────────────────────
function openResume(){const m=document.getElementById('resumeModal');m.style.display='flex';}
function closeResume(){const m=document.getElementById('resumeModal');m.style.display='none';}
document.getElementById('resumeModal').addEventListener('click',e=>{ if(e.target===e.currentTarget) closeResume(); });

// ── Contact form (EmailJS) ──────────────────────
document.getElementById('submitBtn').addEventListener('click', () => {
  const name    = document.getElementById('fname').value.trim();
  const email   = document.getElementById('femail').value.trim();
  const message = document.getElementById('fmsg').value.trim();
  const msgEl   = document.getElementById('formMsg');
  const btn     = document.getElementById('submitBtn');

  msgEl.className = 'form-msg';
  msgEl.style.display = 'none';

  if (!name || !email || !message) {
    msgEl.className = 'form-msg error';
    msgEl.textContent = 'Please fill in all fields before sending.';
    msgEl.style.display = 'block';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msgEl.className = 'form-msg error';
    msgEl.textContent = 'Please enter a valid email address.';
    msgEl.style.display = 'block';
    return;
  }

  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = 'Sending…';

  emailjs.send('service_kkrtmnr', 'template_1xanwzp', {
    from_name:  name,
    from_email: email,
    message:    message,
  })
  .then(() => {
    msgEl.className = 'form-msg success';
    msgEl.textContent = '✅ Message sent! I\'ll get back to you soon.';
    msgEl.style.display = 'block';
    document.getElementById('fname').value  = '';
    document.getElementById('femail').value = '';
    document.getElementById('fmsg').value   = '';
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  })
  .catch(err => {
    console.error('EmailJS error:', err);
    msgEl.className = 'form-msg error';
    msgEl.textContent = '❌ Something went wrong. Please email me directly at nmcbuctuan@nemsu.edu.ph';
    msgEl.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  });
});

// ── Back to top ─────────────────────────────────
const btt = document.getElementById('back-to-top');
// back-to-top visibility handled in the RAF-throttled scroll listener above
btt.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

// ── Activity source codes ──────────────────────
const ACTIVITY_CODES = [
`<!DOCTYPE html>
<html>
<head>
<title>Activity 1</title>

</head>
<body>

<center>

<h1>ACTIVITY 1</h1>

<img src="me.jpg" width="150" height="150">

<br><br>

<h2><b>ESTUDYANTE</b> <br> Buctuan, Nissih Michaelah C.</h2>

<e style = "background-color: violet;">
Minsan nakakatamad gimising sa umaga,<br> Lalo na kung araw-araw mo itong ginagawa.<br> Pero sa buhay estudyante masasanay ka rin,<br> Lalo na kung ito ang palaging gagawin.
<br><br>
Mga asignatura ay dapat lagi mong ipapasa,<br>Para sa huling markahan ‘di ka magpoproblema<br>Hindi maiiwasan ng pagkakataon,<br>Lalo na sa makabago nating panahon.
<br><br>
Mga nakaka-istress na proyekto,<br>Lalo na kapag sabay-sabay ito.<br>Minsan nakakasakit na nga ng ulo,<br>Pero kakayahain ito para may magandang grado.
<br><br>
Buhay nang estudyante, mahirap man ngunit masaya,<br>Lalo na kapag kasama ang kaibigan ay kay sigla.<br>Hindi natin malilimutan ang panahon na iyan,<br>Kahit ilang taon pa man ang magdaan.
</e>
</center>
</body>
</html>`,
`<!DOCTYPE html>
	<html>
	<head>
	<title> Activity 2 </title>
	</head>
	<body>

	<center>
	<h1 style = "color : purple; font-family: Times New Roman; font size =20;  "> My Favorite Hobby: Playing Guitar </h1>
	</center>

	<h2 style = "color: violet; font-family: Arial; font-size= 16;" > Why I Like This Hobby </h2>

	<p style = "font-family: Arial; font-size: 12px; ">
		Playing the guitar helps me relax and express myself through music. I enjoy learning new songs and experimenting with different styles, from <b> acoustic </b> ballads to more <i> energetic </i> rock riffs. It is a hobby that keeps me creative and productive. </p>

	<p style = "background-color: pink; font-family: Arial; font-size: 12px; ">
		I usually practice in the evening after my classes. Sometimes I play along with backing tracks, and other times I just improvise. This hobby also gives me the chance to bond with my friends when we have small jam sessions.</p>

	<h2 style = "color: tomato; font-family: Arial; font-size= 16; " > Interesting Facts </h2>
		
	<p style = "font-family: Arial; font-size: 12px; ">
		Learning to playh an instrument improves coordination and concentration. It also helps develop a good sense of rythm and timing. Over time, I notice that practicing the guitar improved my <e style = "background-color: violet;"> patience </e> and <u>discipline.</u></p>

	<p style = "font-family: Arial; font-size: 12px; ">
		Playing the guitar may seem difficult at first , but practicing consistently for just 15-20 minutes a day can lead to big improvements!</p>

	<hr>
	
	<p style = "text-align: right; font-family: Times New Roman; font-size: 8px;">
		This colorful info page was created as part of my HTML Lab 2 activity </p>
</body>
</html>`,
`<!DOCTYPE html>
<html>
<head>
<title>	Student Grade Report</title>
</head>

<center>
	<body style="font-family: Arial;">
	
	<h3 style="text-align: center;"> Activity 3</h3><br>
	<h1 style="text-align: center; color:blueviolet"> Student Grade Report</h1>
	<table style="width: 80%; margin: 20px auto; border-collapse: collapse ">
	

	<tr>

		<th style="border: 1px solid black; padding: 10px; text-align: center; background-color: pink;">Subject</th>
		<th style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; background-color: pink;">Instructor</th>
		<th style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; background-color: pink;">Prelim</th>
		<th style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; background-color: pink;">Midterm</th>
		<th style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; background-color: pink;">Final</th>
		<th style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; background-color: pink;">Remarks</th>
	
	</tr>
	<tr>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">HTML</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Mr. Santos</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">89</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">90</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">91</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Passed</th>
	</tr>

	<tr>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">CSS</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Ms. Cruz</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">88</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">87</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">90</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Passed</th>
	</tr>

	<tr>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">JavaScript</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Mr. Reyes</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">85</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">86</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">88</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Passed</th>
	</tr>

	<tr>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Database</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Ms. Lopez</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">90</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">92</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">91</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Passed</th>
	</tr>

	<tr>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Networking</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Mr. Garcia</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">87</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">89</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">90</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Passed</th>
	</tr>

	<tr>
		<td colspan="5" style = " border: 1px solid black; padding: 10px; text-align: right; padding: 15px; background-color: antiquewhite; width: 70%;"><b>Average Grade</b></td>
		<td style=" border: 1px solid black; padding: 10px; text-align: center; padding: 15px; background-color:violet  "><b>89</b></td>
	</tr>
	<tr>
		<td colspan="5" style="border: 1px solid black; padding: 10px; text-align: right; padding: 15px; background-color:antiquewhite "><b>General Remarks</b></td>
		<td  style="border: 1px solid black; padding: 10px; text-align: center; padding: 15px;  background-color:violet  "><b>Passed</b></td>
	</tr>
</table>
`,
`<!DOCTYPE html>
<html>
<head>
<title>Weekly Class Schedule</title>
</head>

<center>
	<body style="font-family: Arial;">
	
	<h3 style="text-align: center;"> Activity 4</h3><br>
	<h1 style="text-align: center;"> Weekly Class Schedule</h1>
	<table style="width: 80%; margin: 20px auto; border-collapse: collapse ">
	

	<tr>

		<th style="border: 1px solid black; padding: 10px; text-align: center; background-color: violet;">Time</th>
		<th style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; background-color: violet;">Monday</th>
		<th style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; background-color: violet;">Tuesday</th>
		<th style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; background-color: violet;">Wednesday</th>
		<th style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; background-color: violet;">Thursday</th>
		<th style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; background-color: violet;">Friday</th>
	
	</tr>
	<tr>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">8:00 - 9:00</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">HTML</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">CSS</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">HTML</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">CSS</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Lab</th>
	</tr>

	<tr>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">9:00 - 10:00</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Programming</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Database</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Programming</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Database</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Lab</th>
	</tr>

	<tr>
		<td colspan= "6"style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; background-color: pink"><b>LUNCH BREAK</b></th>
	</tr>

	<tr>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">1:00 - 2:00</td>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Networrking</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">OOP</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Networking</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">OOP</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Project</th>
	</tr>

	<tr>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">2:00 - 3:00</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Study</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Study</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Study</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Study</th>
		<td style="border: 1px solid black; padding: 10px; text-align: center;padding: 15px; ">Consultation</th>
	</tr>
</table>
`,
`<!DOCTYPE html>
<html>
<head>
<title>Activity 5</title>
</head>
<body>
<center>
	<h2>Activity 5</h2>
	
<table border= "1" cellpadding="15" >	
	<tr>
		<td>
		<table border = "1" cellpadding="15" >
			<tr>
				<td>Rubber</td>
				<td>Baby</td>
			</tr>

			<tr>
				<td>buggy</td>
				<td>bumpers</td>
			</tr>
		</table>
		</td>

		<td>
		<table border ="1" cellpadding="15" >
			<tr>
				<td>She</td>
				<td>sells</td>
			</tr>
			<tr>
				<td>sea</td>
				<td>shells</td>
			</tr>
		</table>
		</td>
	</tr>
</center>
</table>
</body>
</html>`,
`<!DOCTYPE html>
<html>
<head>
<title>Activity 6</title>
</head>
<body>
<center>
	<h2>Activity 6</h2>
	
<table border= "1" cellpadding="15" >	
	<tr>
		<td colspan =  "6" ; align="center">TOP</td>
	</tr>
	<tr>
		<td rowspan = "2" ; align= "center">LEFT</td>
		<td align: center>Middle Up</td>
		<td rowspan ="2" ; align= "center">RIGHT</td>
	</tr>
	<tr>
		<td align:"center">Middle Down</td>
	</tr>
	<tr>
		<td colspan = "3" ; align="center">BOTTOM</td>
	</tr>
		

</center>
</table>
</body>
</html>`,
`<!DOCTYPE html>
<html>
    <head>
        <title>ACTIVITY 7</title>
    </head>
    <body>
        <center>
            <table style="margin: 20px auto; width: 1000px; border-collapse: collapse; border: 1px solid black;">

                <tr>
                    <th colspan="3" style="border: 1px solid black; padding: 8px; background-color: tomato;">TYPE OF HTML LIST</th>
                </tr>

                <tr>
                    <td colspan="3" style="border: 1px solid black; padding: 8px; text-align: center;">MY FAVORITE THINGS</td>
                </tr>

                <tr>
                    <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                        <b>Favorite Color</b>
                        <ul>
                            <li>Blue</li>
                            <li>Red</li>
                            <li>Green</li>
                            <li>Yellow</li>
                            <li>Black</li>
                        </ul>
                    </td>

                    <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                        <b>Favorite Food</b>
                        <ul style="list-style-type: circle;">
                            <li>Pizza</li>
                            <li>Fried Chicken</li>
                            <li>Burger</li>
                            <li>Spaghetti</li>
                            <li>Ice Cream</li>
                        </ul>
                    </td>

                    <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                        <b>Favorite Animal</b>
                        <ul style="list-style-type: none;">
                            <li>Dog</li>
                            <li>Cat</li>
                            <li>Rabbit</li>
                            <li>Horse</li>
                            <li>Dolphin</li>
                        </ul>
                    </td>
                </tr>

                <tr>
                    <td colspan="3" style="border: 1px solid black; padding: 8px; text-align: center;">FAVORITE BRAND OF CAR</td>
                </tr>

                <tr>
                    <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                        <ul style="list-style-type: upper-alpha;">
                            <li>Kia</li>
                            <li>Jaguar</li>
                            <li>Honda</li>
                            <li>Aston Martin</li>
                        </ul>
                    </td>

                    <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                        <ul style="list-style-type: upper-roman;">
                            <li>Chevrolet</li>
                            <li>BMW</li>
                            <li>Hyundai</li>
                            <li>Ferrari</li>
                        </ul>
                    </td>

                    <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                        <ol>
                            <li>Mercedes-Benz</li>
                            <li>Toyota</li>
                            <li>Porsche</li>
                            <li>Lexus</li>
                            <li>Bugatti</li>
                        </ol>
                    </td>
                </tr>

            </table>
        </center>
</body>
</html>`
];

function toggleCode(){
  const block = document.getElementById('codeBlock');
  const btn   = document.getElementById('toggleCodeBtn');
  const isHidden = block.style.display === 'none';
  block.style.display = isHidden ? 'block' : 'none';
  btn.innerHTML = isHidden
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> Hide Code`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> View Code`;
}

function copyCode(){
  const code = document.getElementById('codeContent').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
}

// ── Footer year ─────────────────────────────────
document.getElementById('footerYear').textContent = new Date().getFullYear();

// ── Soft card hover — subtle 3D tilt ────────────────────────────
document.querySelectorAll('.soft-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width  - 0.5;
    const y  = (e.clientY - r.top)  / r.height - 0.5;
    card.querySelector('.radial-wrap').style.transform =
      `perspective(400px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.04)`;
  });
  card.addEventListener('mouseleave', () => {
    const wrap = card.querySelector('.radial-wrap');
    if (wrap) wrap.style.transform = '';
  });
});

// ── Generic 3D tilt for cards (stats, experience, skills, certificates) ──
function apply3DTilt(selector, opts = {}) {
  const strength = opts.strength ?? 10;
  const lift     = opts.lift ?? 10;
  document.querySelectorAll(selector).forEach(card => {
    card.style.willChange = 'transform';
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform =
        `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateZ(${lift}px) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = card.classList.contains('visible') ? '' : card.style.transform;
      card.style.transform = '';
    });
  });
}
apply3DTilt('.stat-card', {strength: 12, lift: 14});
apply3DTilt('.exp-card',  {strength: 7,  lift: 8});
apply3DTilt('.skill-cat', {strength: 7,  lift: 8});
apply3DTilt('.cert-card', {strength: 9,  lift: 10});
apply3DTilt('.project-card', {strength: 6, lift: 8});
apply3DTilt('.gallery-card', {strength: 6, lift: 8});

// ── Hero portrait — mouse-tracking 3D tilt + idle float ──
(() => {
  const wrap = document.querySelector('.hero-img-wrap');
  const blob = document.querySelector('.hero-blob');
  if (!wrap || !blob) return;
  let floatT = 0;
  let hovering = false;

  wrap.addEventListener('mousemove', e => {
    hovering = true;
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    blob.style.transform =
      `translateY(-10px) rotateX(${-y * 18}deg) rotateY(${x * 18}deg) scale(1.03)`;
  });
  wrap.addEventListener('mouseleave', () => { hovering = false; });

  // gentle idle float when not hovering
  function idleFloat() {
    if (!hovering) {
      floatT += 0.015;
      const fy = Math.sin(floatT) * 6;
      const rz = Math.sin(floatT * 0.6) * 2;
      blob.style.transform = `translateY(${fy}px) rotateZ(${rz}deg)`;
    }
    requestAnimationFrame(idleFloat);
  }
  idleFloat();
})();

// ── About photo — mouse-tracking 3D tilt ──
(() => {
  const wrap  = document.querySelector('.about-img');
  const inner = document.querySelector('.about-img-inner');
  if (!wrap || !inner) return;
  wrap.addEventListener('mousemove', e => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    inner.style.transform =
      `rotateX(${-y * 16}deg) rotateY(${x * 16}deg) translateZ(14px) scale(1.04)`;
  });
  wrap.addEventListener('mouseleave', () => { inner.style.transform = ''; });
})();

// ── Projects CTA card — subtle 3D tilt ──
apply3DTilt('.projects-cta', {strength: 5, lift: 6});

// ── Hero badge wobble on load ────────────────────────────────────
document.querySelectorAll('.hero-badge').forEach((b, i) => {
  b.style.opacity = '0';
  b.style.transform = 'scale(0.7)';
  setTimeout(() => {
    b.style.transition = 'opacity .5s, transform .5s cubic-bezier(.34,1.56,.64,1)';
    b.style.opacity = '1';
    b.style.transform = '';
  }, 800 + i * 200);
});



// ══════════════════════════════════════════════════════
// HORIZONTAL SCROLL CAROUSEL — Projects
// ══════════════════════════════════════════════════════
(function initProjectCarousel() {
  const track    = document.getElementById('projTrack');
  const grid     = document.getElementById('projectsGrid');
  const dotsWrap = document.getElementById('projDots');
  const btnPrev  = document.getElementById('projPrev');
  const btnNext  = document.getElementById('projNext');
  if (!track || !grid) return;

  // ── Build dot indicators ──────────────────────────
  function getVisibleCards() {
    return Array.from(grid.querySelectorAll('.project-card:not(.hidden)'));
  }

  let dots = [];
  function buildDots() {
    dotsWrap.innerHTML = '';
    dots = [];
    getVisibleCards().forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'hscroll-dot';
      d.setAttribute('aria-label', 'Go to project ' + (i + 1));
      d.addEventListener('click', () => scrollToCard(i));
      dotsWrap.appendChild(d);
      dots.push(d);
    });
  }
  buildDots();

  // ── Scroll to a card by index ─────────────────────
  function scrollToCard(idx) {
    const cards = getVisibleCards();
    if (!cards[idx]) return;
    const card     = cards[idx];
    const trackRect = track.getBoundingClientRect();
    const cardRect  = card.getBoundingClientRect();
    const offset    = cardRect.left - trackRect.left - (trackRect.width / 2) + (cardRect.width / 2);
    track.scrollBy({ left: offset, behavior: 'smooth' });
  }

  // ── Update active card styles + dots ─────────────
  let rafId = null;
  function updateActive() {
    rafId = null;
    const cards      = getVisibleCards();
    const trackRect  = track.getBoundingClientRect();
    const cx         = trackRect.left + trackRect.width / 2;

    let closestIdx = 0;
    let closestDist = Infinity;

    cards.forEach((card, i) => {
      const r    = card.getBoundingClientRect();
      const mid  = r.left + r.width / 2;
      const dist = Math.abs(mid - cx);
      card.classList.remove('hcard-active', 'hcard-prev', 'hcard-next', 'hcard-far');
      if (dist < closestDist) { closestDist = dist; closestIdx = i; }
    });

    cards.forEach((card, i) => {
      const diff = i - closestIdx;
      if      (diff === 0)              card.classList.add('hcard-active');
      else if (diff === -1)             card.classList.add('hcard-prev');
      else if (diff === 1)              card.classList.add('hcard-next');
      else                              card.classList.add('hcard-far');
    });

    dots.forEach((d, i) => d.classList.toggle('active', i === closestIdx));
  }

  track.addEventListener('scroll', () => {
    if (!rafId) rafId = requestAnimationFrame(updateActive);
  }, { passive: true });

  // Initial state
  setTimeout(updateActive, 100);

  // ── Arrow buttons ─────────────────────────────────
  function arrowScroll(dir) {
    const cards = getVisibleCards();
    const trackRect = track.getBoundingClientRect();
    const cx = trackRect.left + trackRect.width / 2;
    let closestIdx = 0, closestDist = Infinity;
    cards.forEach((c, i) => {
      const mid = c.getBoundingClientRect().left + c.getBoundingClientRect().width / 2;
      const d = Math.abs(mid - cx);
      if (d < closestDist) { closestDist = d; closestIdx = i; }
    });
    const next = Math.max(0, Math.min(cards.length - 1, closestIdx + dir));
    scrollToCard(next);
  }
  btnPrev.addEventListener('click', () => arrowScroll(-1));
  btnNext.addEventListener('click', () => arrowScroll(1));

  // ── Mouse / touch drag ────────────────────────────
  let isDragging = false, startX = 0, scrollStart = 0;

  track.addEventListener('mousedown', e => {
    isDragging = true; startX = e.pageX; scrollStart = track.scrollLeft;
    track.classList.add('dragging');
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    track.scrollLeft = scrollStart - (e.pageX - startX);
  });
  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');
    updateActive();
  });

  // ── Re-init on filter change ──────────────────────
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(() => { buildDots(); track.scrollLeft = 0; updateActive(); }, 80);
    });
  });
})();


// ══════════════════════════════════════════════════════
// 3D SCROLL REVEAL — all [data-3d-reveal] elements
// ══════════════════════════════════════════════════════
(function init3DReveal() {
  // Skip if prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-3d-reveal]').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, {
    threshold: 0.12,      // trigger when 12% visible
    rootMargin: '0px 0px -40px 0px'  // slightly before bottom edge
  });

  document.querySelectorAll('[data-3d-reveal]').forEach(el => observer.observe(el));
})();
