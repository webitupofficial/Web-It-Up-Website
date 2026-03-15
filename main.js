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

  // --- Awwwards Features: Cursor & Magnetic ---
  const cursor = document.querySelector('.cursor');
  const cursorFollower = document.querySelector('.cursor-follower');
  
  if(cursor && cursorFollower) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;
    
    // QuickTo for high performance
    const xSet = gsap.quickSetter(cursor, "x", "px");
    const ySet = gsap.quickSetter(cursor, "y", "px");
    const fxSet = gsap.quickSetter(cursorFollower, "x", "px");
    const fySet = gsap.quickSetter(cursorFollower, "y", "px");
    
    window.addEventListener("mousemove", e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      xSet(mouseX);
      ySet(mouseY);
    });
    
    // Follower animation loop
    gsap.ticker.add(() => {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      fxSet(followerX);
      fySet(followerY);
    });
    
    // Hover effects
    document.querySelectorAll('a, button, .magnetic-link, .magnetic-btn, .portfolio-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovered');
        cursorFollower.classList.add('hovered');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovered');
        cursorFollower.classList.remove('hovered');
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
      });
    });

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

    gsap.fromTo(".footer-giant-text", 
      { scale: 0.8, opacity: 0, y: 100 }, 
      { 
        scrollTrigger: { trigger: ".footer", scroller: scrollContainer, start: "top 95%", end: "bottom bottom", scrub: 1 }, 
        scale: 1, opacity: 1, y: 0 
      }
    );
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
