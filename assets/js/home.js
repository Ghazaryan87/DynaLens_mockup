  // ---------- HERO CAROUSEL ----------
  (function(){
    const root = document.getElementById('heroCarousel');
    if(!root) return;
    const stage = document.getElementById('hcStage');
    const caption = document.getElementById('hcCaption');
    const slides = Array.from(root.querySelectorAll('.hc-slide'));
    const dots = Array.from(root.querySelectorAll('.hc-dot'));
    const n = slides.length;
    if(!n) return;
    let active = 0;
    let autoplayTimer = null;
    let idleTimer = null;

    function mode(){
      if(window.matchMedia('(min-width:901px)').matches) return 'desktop';
      if(window.matchMedia('(max-width:460px)').matches) return 'mobile';
      return 'tablet';
    }

    function reducedMotion(){
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function clearStateClasses(el){
      el.classList.remove('hc-pos-0','hc-pos-1','hc-pos-2','hc-pos-3','hc-pos-4',
        'hc-t-vis','hc-t-center','hc-t-left','hc-t-right','hc-m-vis');
    }

    function render(){
      const m = mode();
      slides.forEach((el,i)=>{
        clearStateClasses(el);
        const offset = (i - active + n) % n;
        if(m === 'desktop'){
          el.classList.add('hc-pos-'+offset);
        } else if(m === 'tablet'){
          if(offset === 0){ el.classList.add('hc-t-vis','hc-t-center'); }
          else if(offset === 1){ el.classList.add('hc-t-vis','hc-t-right'); }
          else if(offset === n-1){ el.classList.add('hc-t-vis','hc-t-left'); }
        } else {
          if(offset === 0){ el.classList.add('hc-m-vis'); }
        }
      });
      dots.forEach((d,i)=>d.classList.toggle('active', i === active));
      if(caption) caption.textContent = slides[active].dataset.caption || '';
    }

    function goTo(i){
      active = (i + n) % n;
      render();
    }
    function next(){ goTo(active + 1); }
    function prev(){ goTo(active - 1); }

    function startAutoplay(){
      stopAutoplay();
      if(reducedMotion()) return;
      autoplayTimer = setInterval(next, 4000);
    }
    function stopAutoplay(){
      if(autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
    function pauseThenResume(){
      stopAutoplay();
      if(idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(startAutoplay, 1500);
    }

    dots.forEach(d=>d.addEventListener('click', ()=>{
      goTo(parseInt(d.dataset.idx, 10));
      pauseThenResume();
    }));

    // ---- desktop scroll-scrub (wired here, populated fully in Task 2) ----
    let scrubStartY = null;
    let scrollIdleTimer = null;
    let rafPending = false;
    function onScroll(){
      if(mode() !== 'desktop') return;
      if(scrubStartY === null){
        const rect = root.getBoundingClientRect();
        scrubStartY = window.scrollY + rect.top;
      }
      if(rafPending) return;
      rafPending = true;
      requestAnimationFrame(()=>{
        rafPending = false;
        const progress = Math.min(1, Math.max(0, (window.scrollY - scrubStartY) / 600));
        const idx = Math.min(n - 1, Math.floor(progress * n));
        stopAutoplay();
        goTo(idx);
        if(scrollIdleTimer) clearTimeout(scrollIdleTimer);
        scrollIdleTimer = setTimeout(()=>{ setTimeout(startAutoplay, 1500); }, 150);
      });
    }
    window.addEventListener('scroll', onScroll, {passive:true});

    // ---- touch swipe (tablet + mobile; populated fully in Tasks 2-3) ----
    let touchStartX = null;
    stage.addEventListener('touchstart', (e)=>{
      if(mode() === 'desktop') return;
      touchStartX = e.touches[0].clientX;
    }, {passive:true});
    stage.addEventListener('touchend', (e)=>{
      if(mode() === 'desktop' || touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if(Math.abs(dx) < 40) return;
      if(dx < 0){ next(); } else { prev(); }
      pauseThenResume();
    }, {passive:true});

    window.addEventListener('resize', render);

    render();
    startAutoplay();
  })();

  // ---------- PROBLEM TABS ----------
  (function(){
    const tabs=document.querySelectorAll('#ptabs .ptab-item');
    const panels=document.querySelectorAll('#ptabs .ppanel-item');
    if(!tabs.length) return;
    const isAccordion=()=>window.matchMedia('(max-width:860px)').matches;
    tabs.forEach(t=>t.addEventListener('click',()=>{
      const idx=parseInt(t.dataset.idx);
      if(isAccordion() && t.classList.contains('active')){
        t.classList.remove('active');
        panels[idx].classList.remove('active');
        return;
      }
      tabs.forEach(x=>x.classList.remove('active'));
      panels.forEach(p=>p.classList.remove('active'));
      t.classList.add('active');
      panels[idx].classList.add('active');
    }));
  })();
