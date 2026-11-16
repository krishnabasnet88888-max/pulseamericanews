(function(){
  'use strict';
  var root = document.documentElement;

  var bL = document.getElementById('btnLight'), bD = document.getElementById('btnDark');
  if (bL && bD) {
    function setTheme(t){
      root.setAttribute('data-theme', t);
      var d = t === 'dark';
      bD.setAttribute('aria-pressed', String(d));
      bL.setAttribute('aria-pressed', String(!d));
      try{ localStorage.setItem('pan-theme', t); }catch(e){}
    }
    bL.addEventListener('click', function(){ setTheme('light'); });
    bD.addEventListener('click', function(){ setTheme('dark'); });
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onScheme = function(e){
      try{ if(localStorage.getItem('pan-theme')) return; }catch(x){}
      setTheme(e.matches ? 'dark' : 'light');
    };
    if (mq.addEventListener) mq.addEventListener('change', onScheme);
    else if (mq.addListener) mq.addListener(onScheme);
  }

  var mBtn = document.getElementById('menuBtn'), mMenu = document.getElementById('mobileMenu');
  if (mBtn && mMenu) {
    mBtn.addEventListener('click', function(){
      var o = mMenu.classList.toggle('open');
      mBtn.setAttribute('aria-expanded', String(o));
      mBtn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    });
  }

  var bar = document.getElementById('bar'), art = document.querySelector('.article'), tick = false;
  if (bar && art) {
    var onScroll = function(){
      if (tick) return; tick = true;
      requestAnimationFrame(function(){
        var r = art.getBoundingClientRect(), total = r.height - window.innerHeight;
        var done = Math.min(Math.max(-r.top, 0), Math.max(total, 1));
        bar.style.width = (total > 0 ? (done / total) * 100 : 0) + '%';
        tick = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  var toc = document.getElementById('toc');
  if (toc) {
    var wide = window.matchMedia('(min-width: 1100px)');
    var sync = function(){ toc.open = wide.matches; };
    sync();
    if (wide.addEventListener) wide.addEventListener('change', sync);

    var links = [].slice.call(toc.querySelectorAll('a'));
    var heads = links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(es){
        es.forEach(function(en){
          if (!en.isIntersecting) return;
          var i = heads.indexOf(en.target);
          links.forEach(function(l){ l.classList.remove('active'); });
          if (i > -1) links[i].classList.add('active');
        });
      }, { rootMargin: '-80px 0px -70% 0px' });
      heads.forEach(function(h){ if (h) io.observe(h); });
    }
  }

  var form = document.querySelector('.capture form');
  if (form) {
    var box = form.closest('.capture');
    var input = form.querySelector('input[type="email"]');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var v = (input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      box.classList.add('is-done');
      if (window.dataLayer) window.dataLayer.push({ event: 'alert_signup', article: location.pathname });
      fetch('/api/sentencing-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v, case: 'naresh-bhatt', source: location.pathname })
      }).catch(function(){});
    });
  }

  var shareBtn = document.getElementById('shareBtn'), url = location.href;
  var copyBtn = document.getElementById('copyBtn'), copyTxt = document.getElementById('copyTxt'), tId;
  function flash(m){
    if (!copyTxt) return;
    copyTxt.textContent = m;
    clearTimeout(tId);
    tId = setTimeout(function(){ copyTxt.textContent = 'Copy link'; }, 2000);
  }
  if (shareBtn) shareBtn.addEventListener('click', function(){
    if (navigator.share) navigator.share({ title: document.title, url: url }).catch(function(){});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function(){ flash('Link copied'); });
  });
  if (copyBtn) copyBtn.addEventListener('click', function(){
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function(){ flash('Copied'); }, function(){ flash('Press Ctrl+C'); });
    else flash('Press Ctrl+C');
  });
})();