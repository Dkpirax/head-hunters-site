(function () {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initIcons() {
    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          "stroke-width": 1.8
        }
      });
    }
  }

  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelectorAll(".site-nav a, .header-actions a");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    links.forEach((link) => {
      link.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initToasts() {
    const toast = document.querySelector(".toast");
    let toastTimer;
    if (!toast) return;

    const showToast = (message) => {
      clearTimeout(toastTimer);
      toast.textContent = message;
      toast.classList.add("show");
      toastTimer = setTimeout(() => toast.classList.remove("show"), 3600);
    };

    document.querySelectorAll("[data-toast]").forEach((item) => {
      item.addEventListener("click", (event) => {
        const message = item.getAttribute("data-toast");
        if (message) showToast(message);
        if (item.tagName === "BUTTON" || item.classList.contains("chat-button")) {
          event.preventDefault();
        }
      });
    });

    window.showHeadHuntersToast = showToast;
  }

  function initAccordions() {
    document.querySelectorAll(".accordion button").forEach((button) => {
      button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") === "true";
        document.querySelectorAll(".accordion button").forEach((other) => {
          other.setAttribute("aria-expanded", "false");
        });
        button.setAttribute("aria-expanded", String(!expanded));
      });
    });
  }

  function initSegments() {
    document.querySelectorAll(".segmented button").forEach((button) => {
      button.addEventListener("click", () => {
        button.parentElement.querySelectorAll("button").forEach((other) => {
          other.classList.remove("active");
        });
        button.classList.add("active");
      });
    });
  }

  function initPointerGlow() {
    document.querySelectorAll(".bento-card, .journey-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", `${x}%`);
        card.style.setProperty("--my", `${y}%`);
      });
    });
  }

  function animateCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    const runCounter = (el) => {
      const target = Number(el.getAttribute("data-count"));
      const duration = 900;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = "true";
          runCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach((counter) => observer.observe(counter));
  }

  function fallbackReveal() {
    const nodes = document.querySelectorAll(".reveal-up, .bento-card, .standard-layout, .split-grid, .jobs-grid, .story-grid, .consultant-card, .global-grid, .testimonial-grid blockquote, .resources-grid, .portal-grid, .faq-grid, .contact-grid");
    nodes.forEach((node) => {
      node.style.opacity = "0";
      node.style.transform = "translateY(28px)";
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.transition = "opacity 700ms ease, transform 700ms ease";
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });
    nodes.forEach((node) => observer.observe(node));
  }

  function initGsap() {
    if (prefersReduced) return;
    if (!window.gsap || !window.ScrollTrigger) {
      fallbackReveal();
      return;
    }

    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
    intro
      .from(".site-header", { y: -22, opacity: 0, duration: 0.8 })
      .from(".hero-title-word", { y: 54, opacity: 0, duration: 1.1, stagger: 0.075 }, "-=0.15")
      .from(".hero .reveal-up", { y: 32, opacity: 0, duration: 0.9, stagger: 0.1 }, "-=0.78")
      .from(".command-panel", { y: 36, opacity: 0, scale: 0.97, duration: 0.9 }, "-=0.65")
      .from(".journey-card", { y: 34, opacity: 0, duration: 0.9, stagger: 0.12 }, "-=0.45");

    gsap.utils.toArray(".bento-card").forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 84%"
        },
        y: 40,
        opacity: 0,
        scale: 0.96,
        delay: Math.min(index * 0.035, 0.18),
        duration: 0.85,
        ease: "power4.out"
      });
    });

    gsap.utils.toArray(".standard-layout, .split-grid, .jobs-grid, .story-grid, .consultant-card, .global-grid, .testimonial-grid blockquote, .resources-grid, .portal-grid, .faq-grid, .contact-grid").forEach((node) => {
      gsap.from(node, {
        scrollTrigger: {
          trigger: node,
          start: "top 82%"
        },
        y: 34,
        opacity: 0,
        duration: 0.9,
        ease: "power4.out"
      });
    });

    gsap.to(".hero-media img", {
      yPercent: 9,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    if (window.innerWidth > 900) {
      gsap.to(".section-heading", {
        scrollTrigger: {
          trigger: ".services",
          start: "top 15%",
          end: "top -18%",
          scrub: true
        },
        y: -24,
        opacity: 0.92
      });
    }
  }

  function initForms() {
    document.querySelectorAll("form button[type='button']").forEach((button) => {
      button.addEventListener("click", () => {
        if (window.showHeadHuntersToast) {
          window.showHeadHuntersToast(button.dataset.toast || "Demo action complete.");
        }
      });
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    initIcons();
    initNav();
    initToasts();
    initAccordions();
    initSegments();
    initPointerGlow();
    animateCounters();
    initForms();
    initGsap();
  });
})();
