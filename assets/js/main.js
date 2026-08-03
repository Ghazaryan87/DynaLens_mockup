  // Scroll reveal
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target);} });
  },{threshold:.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // ---------- HIDE TOP NAV WHILE FOOTER IS ON SCREEN ----------
  (function(){
    var nav = document.querySelector('nav');
    var footer = document.querySelector('footer');
    if(!nav || !footer) return;
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        nav.classList.toggle('site-nav-hidden', entry.isIntersecting);
      });
    }, { threshold: 0 });
    observer.observe(footer);
  })();

  // ---------- MOBILE NAV TOGGLE ----------
  (function(){
    const burger=document.getElementById('navBurger');
    const panel=document.getElementById('navMobile');
    if(!burger||!panel) return;
    burger.addEventListener('click',()=>{
      const open=panel.classList.toggle('open');
      burger.setAttribute('aria-expanded',open?'true':'false');
    });
    panel.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      panel.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
    }));
  })();

  // ---------- PARTNER BADGE CAROUSEL ----------
  document.querySelectorAll("[data-carousel]").forEach(track=>{
    const wrap = track.parentElement;
    const slides = Array.from(track.querySelectorAll(".ps-slide"));
    const dots = Array.from(wrap.querySelectorAll(".ps-dot"));
    if(!slides.length) return;
    let idx = 0, timer = null;
    function show(i){
      slides[idx].classList.remove("active");
      dots[idx] && dots[idx].classList.remove("active");
      idx = (i + slides.length) % slides.length;
      slides[idx].classList.add("active");
      dots[idx] && dots[idx].classList.add("active");
    }
    function next(){ show(idx + 1); }
    function startAutoplay(){ stopAutoplay(); timer = setInterval(next, 4000); }
    function stopAutoplay(){ if(timer) clearInterval(timer); }
    dots.forEach(d=>d.addEventListener("click", ()=>{
      show(parseInt(d.dataset.idx, 10));
      startAutoplay();
    }));
    startAutoplay();
  });

  // ---------- HIDE NAV "BOOK A DEMO" WHILE A BODY "BOOK A DEMO" CTA IS ON SCREEN ----------
  (function(){
    var navCta = document.querySelector('nav .nav-cta a.btn-primary');
    if(!navCta) return;

    var bodyCtas = Array.from(document.querySelectorAll('a')).filter(function(el){
      return !el.closest('nav') && /book a demo/i.test((el.textContent||'').trim());
    });
    if(!bodyCtas.length) return;

    var visible = new Set();
    function sync(){ navCta.classList.toggle('nav-cta-suppressed', visible.size > 0); }

    var observer, navEl = document.querySelector('nav');
    function build(){
      if(observer) observer.disconnect();
      visible.clear();
      var navHeight = navEl ? navEl.offsetHeight : 0;
      observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        sync();
      }, { rootMargin: (-navHeight) + 'px 0px 0px 0px', threshold: 0 });
      bodyCtas.forEach(function(el){ observer.observe(el); });
    }
    build();

    var resizeTimer;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    });
  })();

  // ---------- SCREENSHOT LIGHTBOX ----------
  (function(){
    var SEL = '.hc-shot img, .finops-visual.finops-shot img, .assist-visual.assist-shot img, .why-shot img, .why-shot-stack img';
    var lb = document.getElementById('shotLightbox');
    if(!lb) return;
    var lbImg = lb.querySelector('.lightbox-img');
    function openLightbox(img){
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      lb.classList.add('open');
      lb.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox(){
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    }
    document.addEventListener('click', function(e){
      var img = e.target.closest(SEL);
      if(img){ openLightbox(img); return; }
      if(lb.classList.contains('open') && (e.target === lb || e.target.closest('.lightbox-close'))){
        closeLightbox();
      }
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closeLightbox();
    });
  })();
