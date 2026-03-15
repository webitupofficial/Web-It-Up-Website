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

  // Custom navigation logic for locomotive (desktop)
  document.querySelectorAll('.nav-links a[data-scroll-to], .hero-btn-wrapper a[data-scroll-to], .pricing-card a[data-scroll-to], .cta-box a[data-scroll-to], .footer-links a[data-scroll-to]').forEach(link => {
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
      y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out"
    });

    gsap.from(".case-card", {
      scrollTrigger: { trigger: ".case-studies", scroller: scrollContainer, start: "top 75%" },
      y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power2.out"
    });
    
    gsap.from(".pricing-card", {
      scrollTrigger: { trigger: ".pricing", scroller: scrollContainer, start: "top 75%" },
      y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power2.out"
    });

    gsap.from(".card", {
      scrollTrigger: { trigger: ".cards-container", scroller: scrollContainer, start: "top 80%" },
      y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power2.out"
    });

    gsap.from(".portfolio-card", {
      scrollTrigger: { trigger: ".portfolio-carousel", scroller: scrollContainer, start: "top 80%" },
      x: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out"
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
    gsap.from(".case-card", { scrollTrigger: { trigger: ".case-studies", scroller: scrollContainer, start: "top 85%" }, ...standardFadeUp });
    gsap.from(".pricing-card", { scrollTrigger: { trigger: ".pricing", scroller: scrollContainer, start: "top 85%" }, ...standardFadeUp });
    gsap.from(".card", { scrollTrigger: { trigger: ".cards-container", scroller: scrollContainer, start: "top 85%" }, ...standardFadeUp });
    gsap.from(".portfolio-card", { scrollTrigger: { trigger: ".portfolio-carousel", scroller: scrollContainer, start: "top 85%" }, ...standardFadeUp });
    gsap.from(".contact-section, .footer-bottom", { scrollTrigger: { trigger: ".footer", scroller: scrollContainer, start: "top 90%" }, ...standardFadeUp });
  });

  // Update ScrollTrigger after every refresh
  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
  ScrollTrigger.refresh();
});
