import './style.css'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import LocomotiveScroll from 'locomotive-scroll'

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Initialize Locomotive Scroll
  const scrollContainer = document.querySelector('[data-scroll-container]');

  const locoScroll = new LocomotiveScroll({
    el: scrollContainer,
    smooth: true,
    multiplier: 1,
    class: 'is-reveal'
  });

  // Sync Locomotive Scroll with ScrollTrigger
  locoScroll.on("scroll", ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(scrollContainer, {
    scrollTop(value) {
      return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight
      };
    },
    pinType: scrollContainer.style.transform ? "transform" : "fixed"
  });

  // Mobile Menu Logic
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-links a');

  if(menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileNav.classList.toggle('is-open');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('is-open');
        
        // Wait for menu close animation
        setTimeout(() => {
          const targetAttr = link.getAttribute('href');
          const target = document.querySelector(targetAttr);
          if(target) {
            locoScroll.scrollTo(target);
          } else if(targetAttr === '#home') {
            locoScroll.scrollTo(0);
          }
        }, 600);
      });
    });
  }

  // --- Phase 8: Hardware Pointer & Physics Trail ---
  const cursorCanvas = document.getElementById('cursor-canvas');
  
  if(cursorCanvas) {
    const ctx = cursorCanvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    cursorCanvas.width = width;
    cursorCanvas.height = height;

    window.addEventListener("resize", () => {
      width = window.innerWidth;
      height = window.innerHeight;
      cursorCanvas.width = width;
      cursorCanvas.height = height;
    });

    let targetX = width / 2;
    let targetY = height / 2;
    let currentX = width / 2;
    let currentY = height / 2;

    // History array for trail
    const pointerHistory = [];
    const maxHistory = 30; // Length of the trail

    // Sparkle particles array
    let sparkles = [];

    window.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    }, { capture: true, passive: true });

    // Mousedown Sparkle Burst (Capture phase to guarantee firing)
    window.addEventListener("mousedown", (e) => {
      for(let i=0; i<15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 5 + 2;
        sparkles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1, // 1.0 to 0.0
          size: Math.random() * 3 + 1
        });
      }
    }, { capture: true, passive: true });

    // Trail & Sparkle Render Loop
    function renderCursorEffects() {
      ctx.clearRect(0, 0, width, height);

      // Physics Interpolation for 0-lag smooth trailing
      currentX += (targetX - currentX) * 0.3;
      currentY += (targetY - currentY) * 0.3;

      // Push history EVERY FRAME for pure golden fluid behavior (vanishes on stop)
      pointerHistory.push({ x: currentX, y: currentY });
      if(pointerHistory.length > maxHistory) {
        pointerHistory.shift();
      }

      // 1. Draw Golden Trail
      if (pointerHistory.length > 1) {
        ctx.beginPath();
        for(let i = 0; i < pointerHistory.length - 1; i++) {
          const point = pointerHistory[i];
          const nextPoint = pointerHistory[i + 1];
          // Fade alpha based on position in history (older = more transparent)
          const alpha = (i / pointerHistory.length) * 0.8;
          
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(nextPoint.x, nextPoint.y);
          
          ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`; // Gold
          ctx.lineWidth = (i / pointerHistory.length) * 4; // Taper line
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }
      }

      // 2. Animate and Draw Sparkles
      for(let i = sparkles.length - 1; i >= 0; i--) {
        const p = sparkles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.vx *= 0.95; // friction
        p.vy *= 0.95;
        p.life -= 0.02; // fade out
        
        if(p.life <= 0) {
          sparkles.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 215, 0, ${p.life})`;
          ctx.fill();
        }
      }

      requestAnimationFrame(renderCursorEffects);
    }
    renderCursorEffects();

    // Magnetic logic
    document.querySelectorAll('.magnetic-btn, .magnetic-link').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const strength = el.dataset.strength || 30;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        gsap.to(el, {
          x: (dx / rect.width) * strength,
          y: (dy / rect.height) * strength,
          duration: 0.5,
          ease: "power2.out"
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
      });
    });
  }

  // --- Awwwards Features: Canvas Hero Background ---
  const canvas = document.getElementById("hero-canvas");
  if(canvas) {
    const ctx = canvas.getContext("2d");
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    for(let i=0; i<80; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 2 + 1,
            dx: (Math.random() - 0.5) * 0.5,
            dy: (Math.random() - 0.5) * 0.5
        });
    }

    function animateCanvas() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgba(199, 125, 255, 0.5)";
        particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;
            if(p.x < 0 || p.x > width) p.dx *= -1;
            if(p.y < 0 || p.y > height) p.dy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Connect nearby particles for a constellation effect
        ctx.strokeStyle = "rgba(199, 125, 255, 0.05)";
        ctx.lineWidth = 1;
        for(let i=0; i<particles.length; i++){
            for(let j=i+1; j<particles.length; j++){
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if(dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animateCanvas);
    }
    animateCanvas();
  }

  // Custom navigation logic for locomotive (desktop)
  document.querySelectorAll('.nav-links a[data-scroll-to], .hero-btn-wrapper a[data-scroll-to], .cta-box a[data-scroll-to], .footer-links a[data-scroll-to]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetAttr = link.getAttribute('href');
        const target = document.querySelector(targetAttr);
        if(target) locoScroll.scrollTo(target);
    });
  });

  // Counter Animation Logic
  const counters = document.querySelectorAll('.counter');
  let hasCounted = false;

  ScrollTrigger.create({
    trigger: '.trust-strip',
    scroller: scrollContainer,
    start: 'top 85%',
    onEnter: () => {
      if(!hasCounted && counters.length > 0) {
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          gsap.to(counter, {
            innerHTML: target,
            duration: 2,
            snap: { innerHTML: 1 },
            ease: "power2.out"
          });
        });
        hasCounted = true;
      }
    }
  });

  // Accordion Logic
  const accordions = document.querySelectorAll('.accordion-header');
  accordions.forEach(acc => {
    acc.addEventListener('click', function() {
      const isActive = this.classList.contains('active');
      
      // Close all others
      accordions.forEach(a => {
        a.classList.remove('active');
        a.nextElementSibling.style.maxHeight = null;
      });

      // Toggle current
      if (!isActive) {
        this.classList.add('active');
        const content = this.nextElementSibling;
        content.style.maxHeight = content.scrollHeight + "px";
      }

      // Update locomotive scroll after expansion
      setTimeout(() => locoScroll.update(), 400);
    });
  });

  // Testimonial Slider Logic
  const slider = document.getElementById('testimonial-slider');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  let currentSlide = 0;
  
  if(slider && prevBtn && nextBtn) {
    const slidesCount = document.querySelectorAll('.testimonial-card').length;
    
    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide > 0) ? currentSlide - 1 : slidesCount - 1;
      updateSlider();
    });
    
    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide < slidesCount - 1) ? currentSlide + 1 : 0;
      updateSlider();
    });
    
    function updateSlider() {
      slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    // Optional: Auto play
    setInterval(() => {
      currentSlide = (currentSlide < slidesCount - 1) ? currentSlide + 1 : 0;
      updateSlider();
    }, 5000);
  }

  // GSAP MatchMedia for Responsive Animations
  let mm = gsap.matchMedia();

  // Desktop Animations
  mm.add("(min-width: 769px)", () => {
    const heroTimeline = gsap.timeline({ defaults: { ease: "power4.out" } });
    heroTimeline.to(".reveal-text", { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, delay: 0.2 });

    gsap.from(".trust-item", {
      scrollTrigger: { trigger: ".trust-strip", scroller: scrollContainer, start: "top 85%" },
      y: 30, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power2.out"
    });

    gsap.from(".about-text", {
      scrollTrigger: { trigger: ".about", scroller: scrollContainer, start: "top 70%" },
      y: 50, opacity: 0, duration: 1, ease: "power3.out"
    });

    gsap.from(".process-step", {
      scrollTrigger: { trigger: ".process", scroller: scrollContainer, start: "top 70%" },
      x: -50, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power2.out"
    });

    gsap.from(".feature-item", {
      scrollTrigger: { trigger: ".why-us", scroller: scrollContainer, start: "top 75%" },
      y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power2.out"
    });

    gsap.from(".card", {
      scrollTrigger: { trigger: ".cards-container", scroller: scrollContainer, start: "top 80%" },
      y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power2.out"
    });

    gsap.from(".portfolio-card", {
      scrollTrigger: { trigger: ".portfolio-grid-wrapper", scroller: scrollContainer, start: "top 80%" },
      y: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out"
    });

    gsap.from(".footer-heading, .contact-details, .contact-form-wrapper, .footer-bottom", {
      scrollTrigger: { trigger: ".footer", scroller: scrollContainer, start: "top 80%" },
      y: 30, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out"
    });
  });

  // Mobile Animations (Lightened)
  mm.add("(max-width: 768px)", () => {
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTimeline.to(".reveal-text", { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.1 });

    const standardFadeUp = { 
      y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" 
    };

    gsap.from(".trust-item", { scrollTrigger: { trigger: ".trust-strip", scroller: scrollContainer, start: "top 85%" }, ...standardFadeUp });
    gsap.from(".about-text", { scrollTrigger: { trigger: ".about", scroller: scrollContainer, start: "top 85%" }, ...standardFadeUp });
    gsap.from(".process-step", { scrollTrigger: { trigger: ".process", scroller: scrollContainer, start: "top 85%" }, ...standardFadeUp });
    gsap.from(".feature-item", { scrollTrigger: { trigger: ".why-us", scroller: scrollContainer, start: "top 85%" }, ...standardFadeUp });
    gsap.from(".card", { scrollTrigger: { trigger: ".cards-container", scroller: scrollContainer, start: "top 85%" }, ...standardFadeUp });
    gsap.from(".portfolio-card", { scrollTrigger: { trigger: ".portfolio-grid-wrapper", scroller: scrollContainer, start: "top 85%" }, ...standardFadeUp });
    gsap.from(".contact-section, .footer-bottom", { scrollTrigger: { trigger: ".footer", scroller: scrollContainer, start: "top 90%" }, ...standardFadeUp });
  });

  // Update ScrollTrigger after every refresh
  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
  ScrollTrigger.refresh();
});
