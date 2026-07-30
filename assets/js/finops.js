  // ---------- DPS COVERAGE ACCORDION ----------
  document.querySelectorAll('#dpsAccordion .dpsa-item').forEach(item=>{
    item.querySelector('.dpsa-q').addEventListener('click', ()=>{
      item.classList.toggle('open');
    });
  });

  // ---------- BEFORE/AFTER SLIDER ----------
  document.querySelectorAll('[data-ba]').forEach(slider=>{
    const before = slider.querySelector('.ba-before');
    const handle = slider.querySelector('.ba-handle');
    let dragging = false;
    function setPct(pct){
      pct = Math.max(2, Math.min(98, pct));
      before.style.clipPath = `inset(0 ${100-pct}% 0 0)`;
      handle.style.left = pct + '%';
      handle.setAttribute('aria-valuenow', Math.round(pct));
    }
    function pctFromClientX(clientX){
      const rect = slider.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }
    handle.addEventListener('pointerdown', e=>{ dragging = true; handle.setPointerCapture(e.pointerId); });
    window.addEventListener('pointermove', e=>{ if(dragging) setPct(pctFromClientX(e.clientX)); });
    window.addEventListener('pointerup', ()=>{ dragging = false; });
    slider.addEventListener('click', e=>{
      if(e.target.closest('.ba-handle')) return;
      setPct(pctFromClientX(e.clientX));
    });
    handle.setAttribute('tabindex', '0');
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', 'Before and after comparison');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    handle.addEventListener('keydown', e=>{
      const cur = parseFloat(handle.style.left) || 50;
      if(e.key === 'ArrowLeft'){ setPct(cur - 4); e.preventDefault(); }
      if(e.key === 'ArrowRight'){ setPct(cur + 4); e.preventDefault(); }
    });
    setPct(50);
  });
