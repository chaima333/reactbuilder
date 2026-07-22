// VIFCO — shared scripts: nav, footer, reveal, counters
(function(){
const NAV_HTML = `
<nav class="nav" id="nav">
  <div class="container nav-inner">
    <a href="index.html" class="logo"><img src="assets/logo.png" alt="VIFCO"><span class="word">VIFCO</span></a>
    <ul class="nav-links" id="navLinks">
      <li><a href="index.html" data-page="home">Home</a></li>
      <li><a href="about.html" data-page="about">About</a></li>
      <li><a href="leadership.html" data-page="leadership">Leadership</a></li>
      <li class="has-sub"><a href="#" data-page="services">Services</a>
        <ul class="sub">
          <li><a href="services-finance.html">Finance &amp; Investment</a></li>
          <li><a href="services-ai.html">AI &amp; Tech Advisory</a></li>
          <li><a href="services-digital-banking.html">Digital Banking</a></li>
          <li><a href="services-esg.html">ESG &amp; Impact</a></li>
        </ul>
      </li>
      <li><a href="industries.html" data-page="industries">Industries</a></li>
      <li><a href="insights.html" data-page="insights">Insights</a></li>
      <li><a href="vi-platform.html" data-page="platform">VI Platform</a></li>
      <li class="has-sub"><a href="#" data-page="more">More</a>
        <ul class="sub">
          <li><a href="careers.html">Careers</a></li>
          <li><a href="academy.html">VIFCO Academy</a></li>
          <li><a href="client-portal.html">Client Portal</a></li>
        </ul>
      </li>
      <li><a href="contact.html" data-page="contact">Contact</a></li>
    </ul>
    <a href="contact.html" class="btn btn-primary">Request Advisory
      <svg class="arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
    <button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span></button>
  </div>
</nav>`;

const FOOTER_HTML = `
<footer class="footer">
  <div class="container">
    <div class="footer-top">
      <div>
        <a href="index.html" class="logo"><img src="assets/logo.png" alt="VIFCO"><span class="word">VIFCO</span></a>
        <p class="footer-desc">Visionary Investment Finance Company. Finance × AI × ESG advisory across Africa, MENA &amp; emerging markets.</p>
        <div class="footer-socials">
          <a href="#" aria-label="LinkedIn"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5.01A2.5 2.5 0 014.98 3.5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.07 3.77-2.07C21.2 8.63 22 11 22 14.1V21h-4v-6.15c0-1.47-.03-3.36-2.05-3.36-2.05 0-2.37 1.6-2.37 3.25V21h-4V9z"/></svg></a>
          <a href="#" aria-label="X"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2H21l-6.52 7.46L22 22h-6.84l-4.78-6.26L4.8 22H2l7.02-8.02L2 2h7l4.32 5.72L18.244 2z"/></svg></a>
          <a href="mailto:contact@vifco.co" aria-label="Mail"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <ul>
          <li><a href="services-finance.html">Finance &amp; Investment</a></li>
          <li><a href="services-ai.html">AI &amp; Tech Advisory</a></li>
          <li><a href="services-digital-banking.html">Digital Banking</a></li>
          <li><a href="services-esg.html">ESG &amp; Impact</a></li>
          <li><a href="vi-platform.html">VI Platform</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="about.html">About VIFCO</a></li>
          <li><a href="leadership.html">Leadership</a></li>
          <li><a href="industries.html">Industries</a></li>
          <li><a href="insights.html">Insights</a></li>
          <li><a href="careers.html">Careers</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Connect</h4>
        <ul>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="academy.html">VIFCO Academy</a></li>
          <li><a href="client-portal.html">Client Portal</a></li>
          <li><a href="mailto:contact@vifco.co">contact@vifco.co</a></li>
          <li><a href="#">Tunis · Paris · Wilmington · SF</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div>© 2026 VIFCO — Visionary Investment Finance Company. « Take your investments to the Visionary Attitude »</div>
      <div class="links"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div>
    </div>
  </div>
</footer>`;

function init(){
  const navHost = document.getElementById('site-nav');
  const footerHost = document.getElementById('site-footer');
  if(navHost) navHost.innerHTML = NAV_HTML;
  if(footerHost) footerHost.innerHTML = FOOTER_HTML;

  // active link
  const page = document.body.dataset.page;
  if(page){
    document.querySelectorAll('.nav-links a[data-page]').forEach(a=>{
      if(a.dataset.page===page) a.classList.add('active');
    });
  }

  // scroll
  const nav = document.getElementById('nav');
  window.addEventListener('scroll',()=>{
    if(nav) nav.classList.toggle('scrolled',window.scrollY>50);
  },{passive:true});

  // hamburger
  const ham = document.getElementById('hamburger');
  const nl = document.getElementById('navLinks');
  if(ham){
    ham.addEventListener('click',()=>{ham.classList.toggle('open');nl.classList.toggle('open')});
    nl.querySelectorAll('a').forEach(a=>{
      if(!a.parentElement.classList.contains('has-sub')){
        a.addEventListener('click',()=>{ham.classList.remove('open');nl.classList.remove('open')});
      }
    });
  }

  // reveal + counters
  function easeOut(t){return 1-Math.pow(1-t,3)}
  function animateCount(el){
    if(el.dataset.done) return; el.dataset.done='1';
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimal||'0',10);
    const suffix = el.dataset.suffix||'';
    const dur = 1800; const start = performance.now();
    function step(now){
      const p = Math.min((now-start)/dur,1); const e = easeOut(p);
      const v = target * e;
      el.textContent = (dec ? v.toFixed(dec) : Math.floor(v).toLocaleString('en-US')) + suffix;
      if(p<1) requestAnimationFrame(step);
      else el.textContent = (dec ? target.toFixed(dec) : Math.floor(target).toLocaleString('en-US')) + suffix;
    }
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(animateCount);
      if(e.target.matches('[data-count]')) animateCount(e.target);
      io.unobserve(e.target);
    });
  },{threshold:.15,rootMargin:'0px 0px -60px 0px'});
  document.querySelectorAll('.reveal, [data-count]').forEach(el=>io.observe(el));

  // immediate reveal for above-fold
  document.querySelectorAll('.page-hero .reveal, .hero .reveal').forEach(el=>el.classList.add('in'));
  document.querySelectorAll('.page-hero [data-count], .hero [data-count]').forEach(animateCount);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
else init();
})();
