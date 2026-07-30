  // ---------- FAQ ACCORDIONS (independent per group) ----------
  (function(){
    document.querySelectorAll('.faq').forEach(group=>{
      const items = group.querySelectorAll('.acc-item');
      items.forEach(it=>{
        it.querySelector('.acc-q').addEventListener('click',()=>{
          const isOpen = it.classList.contains('open');
          items.forEach(x=>{x.classList.remove('open');x.querySelector('.acc-q').setAttribute('aria-expanded','false');});
          if(!isOpen){it.classList.add('open');it.querySelector('.acc-q').setAttribute('aria-expanded','true');}
        });
      });
    });
  })();
