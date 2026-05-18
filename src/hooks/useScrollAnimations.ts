import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimations() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {

        // ── Hero: cinematic entrance on load ──────────────────────────────────
        gsap.from('.hero-content', {
          y: 70,
          opacity: 0,
          duration: 1.4,
          ease: 'expo.out',
          delay: 0.2,
        });
        gsap.from('.hero-card', {
          x: 50,
          opacity: 0,
          duration: 1.5,
          ease: 'expo.out',
          delay: 0.55,
        });
        gsap.from('.hero-stat', {
          y: 24,
          opacity: 0,
          stagger: 0.1,
          duration: 1,
          ease: 'expo.out',
          delay: 0.85,
        });

        // ── Hero: parallax on scroll out ──────────────────────────────────────
        gsap.to('.hero-content', {
          y: -110,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
        gsap.to('.hero-card', {
          y: -55,
          scale: 0.94,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.8,
          },
        });

        // ── Section headings — every .section-heading fades up on enter ───────
        gsap.utils.toArray<HTMLElement>('.section-heading').forEach((el) => {
          gsap.from(el, {
            y: 48,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          });
        });

        // ── StatsBanner — numbers rise on enter ───────────────────────────────
        gsap.from('.stat-number', {
          opacity: 0,
          y: 24,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: '.stats-banner',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });

        // ── HowItWorks — cards dealt from a deck ──────────────────────────────
        const howCards = gsap.utils.toArray<HTMLElement>('.how-card');
        const directions = [-1, 0, 1];
        howCards.forEach((card, i) => {
          gsap.from(card, {
            x: directions[i] * 70,
            y: directions[i] === 0 ? 70 : 20,
            scale: 0.88,
            opacity: 0,
            duration: 1,
            ease: 'power4.out',
            delay: i * 0.15,
            scrollTrigger: {
              trigger: '.how-grid',
              start: 'top 78%',
              toggleActions: 'play none none none',
            },
          });
        });

        // ── FarmerJourney — steps cascade in ─────────────────────────────────
        gsap.utils.toArray<HTMLElement>('.journey-card').forEach((card, i) => {
          gsap.from(card, {
            y: 60,
            opacity: 0,
            scale: 0.92,
            duration: 0.85,
            ease: 'power3.out',
            delay: i * 0.12,
            scrollTrigger: {
              trigger: '.journey-grid',
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          });
        });
        gsap.from('.journey-strip', {
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.journey-strips',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        });

        // ── WarehouseSection — depth parallax on two images ───────────────────
        // Silo (foreground) moves slower → feels closer to camera
        gsap.to('.warehouse-img-left', {
          y: -55,
          ease: 'none',
          scrollTrigger: {
            trigger: '#warehouse-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
        // Farmer (background) moves faster → feels farther away
        gsap.to('.warehouse-img-right', {
          y: -100,
          ease: 'none',
          scrollTrigger: {
            trigger: '#warehouse-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
        gsap.from('.warehouse-chip', {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.warehouse-chips',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        });

        // ── RolesSection — slide in from opposing sides ───────────────────────
        gsap.from('.role-card-left', {
          x: -80,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.roles-grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });
        gsap.from('.role-card-right', {
          x: 80,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          delay: 0.1,
          scrollTrigger: {
            trigger: '.roles-grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });

        // ── Features — staggered cascade ──────────────────────────────────────
        gsap.from('.feature-card', {
          y: 50,
          opacity: 0,
          scale: 0.96,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        });

        // ── CTA — scale up + image parallax ──────────────────────────────────
        gsap.from('.cta-inner', {
          scale: 0.94,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.cta-inner',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
        gsap.to('.cta-parallax-img', {
          y: -70,
          ease: 'none',
          scrollTrigger: {
            trigger: '.cta-inner',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
          },
        });

      });

      return () => ctx.revert();
    }, 120);

    return () => clearTimeout(timer);
  }, []);
}
