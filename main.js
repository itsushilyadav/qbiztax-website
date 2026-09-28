/**
 * QBIZTAX — Anti-Gravity Interactions
 * Particle canvas · Scroll reveal · Parallax · Nav · Animations · Form
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     1. PARTICLE CANVAS
  ══════════════════════════════════════════════ */
  (function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], raf;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.r  = Math.random() * 1.8 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.5 + 0.1;
        const palette = ['#4F46E5','#06B6D4','#7C3AED','#F59E0B','#10B981'];
        this.color = palette[Math.floor(Math.random() * palette.length)];
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle   = this.color;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function initParticleList() {
      particles = [];
      const count = Math.min(Math.floor((W * H) / 18000), 100);
      for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function drawConnections() {
      const maxDist = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < maxDist) {
            ctx.save();
            ctx.globalAlpha = (1 - dist/maxDist) * 0.06;
            ctx.strokeStyle = '#4F46E5';
            ctx.lineWidth   = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      particles.forEach(p => { p.update(); p.draw(); });
      raf = requestAnimationFrame(loop);
    }

    resize();
    initParticleList();
    loop();
    window.addEventListener('resize', () => { resize(); initParticleList(); });
  })();

  /* ══════════════════════════════════════════════
     2. NAV — SCROLL BEHAVIOUR + HAMBURGER
  ══════════════════════════════════════════════ */
  (function initNav() {
    const nav       = document.getElementById('main-nav');
    const hamburger = document.getElementById('hamburger');
    const links     = document.getElementById('nav-links');
    const navLinks  = document.querySelectorAll('.nav__link');
    const sections  = document.querySelectorAll('section[id], div[id]');

    // Scroll → add .scrolled class
    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 30);
      updateActiveLink();
    }

    // Active link tracking
    function updateActiveLink() {
      let current = '';
      sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 100) current = s.id;
      });
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
      });
    }

    // Hamburger toggle
    hamburger && hamburger.addEventListener('click', () => {
      links.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      hamburger.classList.toggle('is-open');
      if (hamburger.classList.contains('is-open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    });

    // Close menu on link click
    links && links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        hamburger.classList.remove('is-open');
        hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ══════════════════════════════════════════════
     3. SCROLL REVEAL — IntersectionObserver
  ══════════════════════════════════════════════ */
  (function initScrollReveal() {
    const els = document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-left, .reveal-right');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    els.forEach(el => observer.observe(el));
  })();

  /* ══════════════════════════════════════════════
     4. PARALLAX MOUSE TILT — Hero visual
  ══════════════════════════════════════════════ */
  (function initParallax() {
    const hero   = document.getElementById('hero');
    const visual = document.getElementById('hero-visual');
    const cards  = document.querySelectorAll('.float-card');
    const crystals = document.querySelectorAll('.crystal');

    if (!hero || !visual) return;

    let ticking = false;
    let mx = 0, my = 0;

    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      my = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;

      if (!ticking) {
        requestAnimationFrame(() => {
          visual.style.transform = `perspective(1000px) rotateY(${mx * 4}deg) rotateX(${-my * 3}deg)`;
          cards.forEach((c, i) => {
            const depth = (i + 1) * 6;
            c.style.transform = `translate(${mx * depth}px, ${my * depth}px)`;
          });
          crystals.forEach((c, i) => {
            const depth = (i + 1) * 10;
            c.style.transform = `translate(${mx * depth}px, ${my * depth}px) rotate(${mx * 15}deg)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    });

    hero.addEventListener('mouseleave', () => {
      visual.style.transform = '';
      cards.forEach(c => { c.style.transform = ''; });
      crystals.forEach(c => { c.style.transform = ''; });
    });
  })();

  /* ══════════════════════════════════════════════
     5. SCROLL PARALLAX — Depth layers
  ══════════════════════════════════════════════ */
  (function initScrollParallax() {
    const heroVisual = document.getElementById('hero-visual');

    function onScroll() {
      const scrollY = window.scrollY;
      if (heroVisual) {
        heroVisual.style.transform = `translateY(${scrollY * 0.15}px)`;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  /* ══════════════════════════════════════════════
     6. COUNTER ANIMATION — About stats
  ══════════════════════════════════════════════ */
  (function initCounters() {
    const counters = [
      { id: 'about-stat-1', end: 500, suffix: '+', label: 'Active Clients' },
      { id: 'about-stat-2', end: 12,  suffix: '+', label: 'Years Experience' },
      { id: 'about-stat-3', end: 98,  suffix: '%', label: 'Retention Rate' },
    ];

    counters.forEach(({ id, end, suffix }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const numEl = el.querySelector('.about__stat-num');
      if (!numEl) return;

      let hasRun = false;
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasRun) {
            hasRun = true;
            animateCount(numEl, end, suffix);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(el);
    });

    function animateCount(el, end, suffix) {
      const duration = 1800;
      const start    = performance.now();
      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        const value    = Math.round(eased * end);
        // Preserve gradient class
        el.innerHTML = value + suffix;
        el.className = 'about__stat-num gradient-text';
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  })();

  /* ══════════════════════════════════════════════
     7. SERVICE BAR CHART ANIMATION
  ══════════════════════════════════════════════ */
  (function initChartBars() {
    const bars = document.querySelectorAll('.bar');
    if (!bars.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bars = entry.target.querySelectorAll('.bar');
          bars.forEach((bar, i) => {
            const targetH = bar.style.height;
            bar.style.height = '0';
            setTimeout(() => {
              bar.style.transition = `height 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 80}ms`;
              bar.style.height = targetH;
            }, 200);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.service__chart-bars').forEach(c => observer.observe(c));
  })();

  /* ══════════════════════════════════════════════
     8. MAGNETIC BUTTON EFFECT
  ══════════════════════════════════════════════ */
  (function initMagneticBtns() {
    const btns = document.querySelectorAll('.btn--primary, .btn--nav');
    btns.forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width  / 2;
        const y = e.clientY - rect.top  - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  })();

  /* ══════════════════════════════════════════════
     9. CONTACT FORM — Submit handler + toast
  ══════════════════════════════════════════════ */
  (function initForm() {
    const form  = document.getElementById('contact-form');
    const toast = document.getElementById('form-toast');

    form && form.addEventListener('submit', e => {
      e.preventDefault();
      const btn  = form.querySelector('#contact-submit');
      const span = btn.querySelector('span');
      const orig = span.textContent;

      // Loading state
      span.textContent = 'Sending…';
      btn.style.opacity = '0.7';
      btn.disabled = true;

      // Simulate async submission (replace with actual fetch/Formspree/Netlify)
      setTimeout(() => {
        span.textContent = '✓ Request Sent!';
        btn.style.opacity = '1';
        btn.style.background = 'linear-gradient(135deg,#10B981,#059669)';
        form.reset();
        showToast();
        setTimeout(() => {
          span.textContent = orig;
          btn.disabled = false;
          btn.style.background = '';
        }, 3500);
      }, 1400);
    });

    // Footer form
    const footerForm = document.getElementById('footer-form');
    footerForm && footerForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = footerForm.querySelector('.footer__btn');
      btn.textContent = '✓ Done!';
      btn.style.background = '#10B981';
      footerForm.reset();
      setTimeout(() => {
        btn.textContent = 'Subscribe';
        btn.style.background = '';
      }, 3000);
    });

    function showToast() {
      if (!toast) return;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4500);
    }
  })();

  /* ══════════════════════════════════════════════
     10. SMOOTH SECTION TRANSITIONS — glowing cursor
  ══════════════════════════════════════════════ */
  (function initGlowCursor() {
    const cursor = document.createElement('div');
    cursor.style.cssText = `
      position:fixed;width:20px;height:20px;
      background:radial-gradient(circle,rgba(79,70,229,0.6),transparent);
      border-radius:50%;pointer-events:none;z-index:9998;
      transform:translate(-50%,-50%);
      transition:transform 0.1s ease,width 0.3s,height 0.3s,opacity 0.3s;
      opacity:0;mix-blend-mode:screen;
    `;
    document.body.appendChild(cursor);

    const trail = document.createElement('div');
    trail.style.cssText = `
      position:fixed;width:6px;height:6px;
      background:rgba(79,70,229,0.9);border-radius:50%;
      pointer-events:none;z-index:9998;transform:translate(-50%,-50%);
      transition:left 0.06s,top 0.06s;opacity:0;
    `;
    document.body.appendChild(trail);

    document.addEventListener('mousemove', e => {
      cursor.style.left    = e.clientX + 'px';
      cursor.style.top     = e.clientY + 'px';
      cursor.style.opacity = '1';
      trail.style.left     = e.clientX + 'px';
      trail.style.top      = e.clientY + 'px';
      trail.style.opacity  = '1';
    });

    document.querySelectorAll('.btn, a, .glass-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width  = '50px';
        cursor.style.height = '50px';
        cursor.style.background = 'radial-gradient(circle,rgba(79,70,229,0.35),transparent)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width  = '20px';
        cursor.style.height = '20px';
        cursor.style.background = 'radial-gradient(circle,rgba(79,70,229,0.6),transparent)';
      });
    });
  })();

  /* ══════════════════════════════════════════════
     11. PAGE LOAD ENTRANCE ANIMATION
  ══════════════════════════════════════════════ */
  (function initPageLoad() {
    // Stagger hero elements on first load
    const heroEls = [
      document.getElementById('hero-badge'),
      document.getElementById('hero-headline'),
      document.getElementById('hero-subheadline'),
      document.getElementById('hero-ctas'),
      document.getElementById('hero-trust'),
    ];

    heroEls.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = `opacity 0.7s ease ${i * 0.12}s, transform 0.7s ease ${i * 0.12}s`;
      setTimeout(() => {
        el.style.opacity   = '1';
        el.style.transform = 'none';
      }, 100 + i * 120);
    });

    // Hero visual entrance
    const visual = document.getElementById('hero-visual');
    if (visual) {
      visual.style.opacity   = '0';
      visual.style.transform = 'translateX(40px)';
      visual.style.transition = 'opacity 1s ease 0.4s, transform 1s ease 0.4s';
      setTimeout(() => {
        visual.style.opacity   = '1';
        visual.style.transform = 'none';
      }, 200);
    }
  })();

  /* ══════════════════════════════════════════════
     12. SECTION ACTIVE HIGHLIGHT — glassmorphism glow on hover
  ══════════════════════════════════════════════ */
  (function initCardHoverGlow() {
    document.querySelectorAll('.glass-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width)  * 100;
        const y = ((e.clientY - rect.top)  / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
        card.style.background = `
          radial-gradient(circle at ${x}% ${y}%, rgba(79,70,229,0.12) 0%, rgba(15,21,53,0.55) 60%)
        `;
      });
      card.addEventListener('mouseleave', () => {
        card.style.background = '';
      });
    });
  })();

  /* ══════════════════════════════════════════════
     13. SMOOTH ANCHOR SCROLL
  ══════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ══════════════════════════════════════════════
     14. INSIGHT CARD — hover ripple
  ══════════════════════════════════════════════ */
  document.querySelectorAll('.insight-card').forEach(card => {
    card.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute;left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        width:${size}px;height:${size}px;border-radius:50%;
        background:rgba(79,70,229,0.15);transform:scale(0);
        animation:ripple-anim 0.6s ease-out forwards;pointer-events:none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // Inject ripple keyframe
  const style = document.createElement('style');
  style.textContent = `@keyframes ripple-anim{to{transform:scale(2.5);opacity:0;}}`;
  document.head.appendChild(style);

})();
