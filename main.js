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
    // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
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
  document.querySelectorAll('.nav-links a[data-scroll-to], .hero-btn-wrapper a[data-scroll-to]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetAttr = link.getAttribute('href');
        const target = document.querySelector(targetAttr);
        if(target) locoScroll.scrollTo(target);
    });
  });

  // GSAP MatchMedia for Responsive Animations
  let mm = gsap.matchMedia();

  // Desktop Animations
  mm.add("(min-width: 769px)", () => {
    const heroTimeline = gsap.timeline({ defaults: { ease: "power4.out" } });
    heroTimeline.to(".reveal-text", { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, delay: 0.2 });

    gsap.from(".about-text", {
      scrollTrigger: { trigger: ".about", scroller: scrollContainer, start: "top 70%" },
      y: 50, opacity: 0, duration: 1, ease: "power3.out"
    });

    gsap.from(".services .section-title", {
      scrollTrigger: { trigger: ".services", scroller: scrollContainer, start: "top 85%" },
      x: -50, opacity: 0, duration: 1, ease: "power3.out"
    });

    gsap.from(".card", {
      scrollTrigger: { trigger: ".cards-container", scroller: scrollContainer, start: "top 80%" },
      y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power2.out"
    });

    gsap.from(".portfolio-card", {
      scrollTrigger: { trigger: ".portfolio-carousel", scroller: scrollContainer, start: "top 80%" },
      x: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out"
    });

    gsap.from(".footer-heading, .footer-col", {
      scrollTrigger: { trigger: ".footer", scroller: scrollContainer, start: "top 80%" },
      y: 30, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out"
    });
  });

  // Mobile Animations (Lightened)
  mm.add("(max-width: 768px)", () => {
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTimeline.to(".reveal-text", { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.1 });

    gsap.from(".about-text", {
      scrollTrigger: { trigger: ".about", scroller: scrollContainer, start: "top 85%" },
      y: 30, opacity: 0, duration: 0.6, ease: "power2.out"
    });

    gsap.from(".services .section-title", {
      scrollTrigger: { trigger: ".services", scroller: scrollContainer, start: "top 90%" },
      y: 20, opacity: 0, duration: 0.6, ease: "power2.out"
    });

    gsap.from(".card", {
      scrollTrigger: { trigger: ".cards-container", scroller: scrollContainer, start: "top 85%" },
      y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out"
    });

    gsap.from(".portfolio-card", {
      scrollTrigger: { trigger: ".portfolio-carousel", scroller: scrollContainer, start: "top 85%" },
      y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out"
    });

    gsap.from(".footer-heading, .footer-col", {
      scrollTrigger: { trigger: ".footer", scroller: scrollContainer, start: "top 90%" },
      y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out"
    });
  });

  // Update ScrollTrigger after every refresh
  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
  ScrollTrigger.refresh();
});
