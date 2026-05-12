/* ============================================================
   SPARKMEDIAX — PREMIUM SPA JAVASCRIPT
   ============================================================ */

(function () {
  "use strict";

  /* ==================== PAGE CONTENT REGISTRY ====================
       This registry allows pages to be loaded from separate .html files.
       If a page's content is not found in the DOM, the router will
       attempt to fetch it from the corresponding file.
       To use separate files: put page inner HTML in files like
       'pages/home.html', 'pages/about.html', etc.
    */
  const PAGE_FILE_MAP = {
    home: "pages/home.html",
    about: "pages/about.html",
    services: "pages/services.html",
    "patient-journey": "pages/patient-journey.html",
    problem: "pages/problem.html",
    "digital-presence": "pages/digital-presence.html",
    solutions: "pages/solutions.html",
    "web-development": "pages/web-development.html",
    "web-benefits": "pages/web-benefits.html",
    "digital-card": "pages/digital-card.html",
    "social-media": "pages/social-media.html",
    "growth-system": "pages/growth-system.html",
    "why-us": "pages/why-us.html",
    process: "pages/process.html",
    packages: "pages/packages.html",
    contact: "pages/contact.html",
    "privacy-policy": "pages/privacy-policy.html",
    terms: "pages/terms.html",
    "refund-policy": "pages/refund-policy.html",
    "cookie-policy": "pages/cookie-policy.html",
  };

  /* ==================== SPA ROUTER ==================== */
  class Router {
    constructor() {
      this.routes = [];
      this.currentRoute = null;
      this.isNavigating = false;
      this.init();
    }

    init() {
      // Handle browser back/forward
      window.addEventListener("popstate", (e) => {
        const hash = window.location.hash.slice(1) || "home";
        this.navigate(hash, false);
      });

      // Intercept all link clicks with data-route or hash href
      document.addEventListener("click", (e) => {
        const link = e.target.closest('a[data-route], a[href^="#"]');
        if (!link) return;

        const route =
          link.getAttribute("data-route") || link.getAttribute("href").slice(1);
        if (!route) return;

        e.preventDefault();
        this.navigate(route);
      });

      // Initial route
      const initialHash = window.location.hash.slice(1) || "home";
      this.navigate(initialHash, false);
    }

    register(route, handler) {
      this.routes.push({ route, handler });
    }

    async navigate(route, pushState = true) {
      if (this.isNavigating || route === this.currentRoute) return;
      if (!route) route = "home";

      this.isNavigating = true;
      const prevRoute = this.currentRoute;
      this.currentRoute = route;

      // Update URL
      if (pushState) {
        history.pushState(null, null, "#" + route);
      }

      // Close mobile menu if open
      closeMobileMenu();

      // Update nav active state
      updateNavActive(route);

      // Find target section
      const targetSection = document.getElementById(route);

      if (targetSection) {
        // Section exists in DOM — just switch
        await this.switchSection(prevRoute, targetSection);
      } else {
        // Try to fetch from external file
        try {
          const filePath = PAGE_FILE_MAP[route];
          if (filePath) {
            const response = await fetch(filePath);
            if (response.ok) {
              const html = await response.text();
              const section = document.createElement("section");
              section.id = route;
              section.className = "page-section";
              section.innerHTML = html;
              document.getElementById("app").appendChild(section);
              await this.switchSection(prevRoute, section);
            } else {
              throw new Error("File not found");
            }
          } else {
            throw new Error("No file mapping");
          }
        } catch (err) {
          console.warn(
            `Route "${route}" not found in DOM or external files. Falling back to home.`,
          );
          this.currentRoute = "home";
          window.location.hash = "#home";
          const homeSection = document.getElementById("home");
          if (homeSection) {
            await this.switchSection(prevRoute, homeSection);
          }
        }
      }

      this.isNavigating = false;
    }

    async switchSection(prevRoute, targetSection) {
      // Fade out current section
      const currentActive = document.querySelector(".page-section.active");
      if (currentActive) {
        currentActive.classList.remove("visible");
        await delay(300);
        currentActive.classList.remove("active");
      }

      // Activate new section
      targetSection.classList.add("active");
      // Force reflow
      void targetSection.offsetHeight;
      await delay(50);
      targetSection.classList.add("visible");

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "instant" });

      // Re-init reveal animations for new section
      initRevealAnimations(targetSection);

      // Re-init counters if any
      initCounters(targetSection);

      // Update page title
      updatePageTitle(this.currentRoute);
    }
  }

  /* ==================== DELAY UTILITY ==================== */
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /* ==================== UPDATE NAV ACTIVE ==================== */
  function updateNavActive(route) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
      const linkRoute = link.getAttribute("data-route");
      if (linkRoute === route) {
        link.classList.add("active");
      }
    });
    document.querySelectorAll(".mobile-link").forEach((link) => {
      link.classList.remove("active");
      const linkRoute = link.getAttribute("data-route");
      if (linkRoute === route) {
        link.classList.add("active");
      }
    });
  }

  /* ==================== UPDATE PAGE TITLE ==================== */
  function updatePageTitle(route) {
    const titles = {
      home: "SparkMediaX — Digital Marketing Agency for Doctors",
      about: "About Us — SparkMediaX",
      services: "Our Services — SparkMediaX",
      "patient-journey": "Patient Journey — SparkMediaX",
      problem: "The Problem — SparkMediaX",
      "digital-presence": "Digital Presence — SparkMediaX",
      solutions: "Solutions — SparkMediaX",
      "web-development": "Website Development — SparkMediaX",
      "web-benefits": "Website Benefits — SparkMediaX",
      "digital-card": "Digital Business Card — SparkMediaX",
      "social-media": "Social Media Branding — SparkMediaX",
      "growth-system": "Growth System — SparkMediaX",
      "why-us": "Why Choose Us — SparkMediaX",
      process: "Our Process — SparkMediaX",
      packages: "Packages & Pricing — SparkMediaX",
      contact: "Contact — SparkMediaX",
      "privacy-policy": "Privacy Policy — SparkMediaX",
      terms: "Terms of Service — SparkMediaX",
      "refund-policy": "Refund Policy — SparkMediaX",
      "cookie-policy": "Cookie Policy — SparkMediaX",
    };
    document.title = titles[route] || "SparkMediaX";
  }

  /* ==================== PRELOADER ==================== */
  function initPreloader() {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const preloader = document.getElementById("preloader");
        if (preloader) {
          preloader.classList.add("hidden");
          setTimeout(() => {
            preloader.style.display = "none";
          }, 600);
        }
        // Init floating buttons entrance
        initFloatingButtons();
      }, 1600);
    });
  }

  /* ==================== SCROLL PROGRESS ==================== */
  function initScrollProgress() {
    const progressBar = document.getElementById("scroll-progress");
    if (!progressBar) return;

    window.addEventListener(
      "scroll",
      () => {
        const scrollTop = window.scrollY;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = progress + "%";
      },
      { passive: true },
    );
  }

  /* ==================== NAVBAR SCROLL ==================== */
  function initNavbarScroll() {
    const nav = document.getElementById("main-nav");
    if (!nav) return;

    let lastScroll = 0;
    window.addEventListener(
      "scroll",
      () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
          nav.classList.add("scrolled");
        } else {
          nav.classList.remove("scrolled");
        }
        lastScroll = currentScroll;
      },
      { passive: true },
    );
  }

  /* ==================== MOBILE MENU ==================== */
  let mobileOverlay = null;

  function createMobileOverlay() {
    mobileOverlay = document.createElement("div");
    mobileOverlay.className = "mobile-menu-overlay";
    mobileOverlay.addEventListener("click", closeMobileMenu);
    document.body.appendChild(mobileOverlay);
  }

  function openMobileMenu() {
    const menu = document.getElementById("mobile-menu");
    const hamburger = document.getElementById("nav-hamburger");
    if (!menu) return;

    menu.classList.add("open");
    if (hamburger) hamburger.classList.add("active");
    if (mobileOverlay) mobileOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMobileMenu() {
    const menu = document.getElementById("mobile-menu");
    const hamburger = document.getElementById("nav-hamburger");
    if (!menu) return;

    menu.classList.remove("open");
    if (hamburger) hamburger.classList.remove("active");
    if (mobileOverlay) mobileOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  function initMobileMenu() {
    createMobileOverlay();

    const hamburger = document.getElementById("nav-hamburger");
    if (hamburger) {
      hamburger.addEventListener("click", () => {
        const menu = document.getElementById("mobile-menu");
        if (menu.classList.contains("open")) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });
    }

    const mobileClose = document.getElementById("mobile-close");
    if (mobileClose) {
      mobileClose.addEventListener("click", closeMobileMenu);
    }

    // Mobile link clicks
    document.querySelectorAll(".mobile-link").forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenu();
      });
    });
  }

  /* ==================== CUSTOM CURSOR ==================== */
  function initCursor() {
    const cursor = document.getElementById("cursor-follower");
    if (!cursor || window.innerWidth < 768) return;

    const dot = cursor.querySelector(".cursor-dot");
    const ring = cursor.querySelector(".cursor-ring");

    let mouseX = 0,
      mouseY = 0;
    let dotX = 0,
      dotY = 0;
    let ringX = 0,
      ringY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Smooth follow animation
    function animateCursor() {
      dotX += (mouseX - dotX) * 0.2;
      dotY += (mouseY - dotY) * 0.2;
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;

      dot.style.left = dotX + "px";
      dot.style.top = dotY + "px";
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover detection
    const hoverTargets =
      "a, button, input, select, textarea, .intro-card, .pricing-card, .team-card, .value-card";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.add("hovering");
      }
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.remove("hovering");
      }
    });

    // Hide when leaving window
    document.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      cursor.style.opacity = "1";
    });
  }

  /* ==================== REVEAL ON SCROLL ==================== */
  function initRevealAnimations(scope) {
    const container = scope || document;
    const reveals = container.querySelectorAll(".reveal:not(.revealed)");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    reveals.forEach((el) => observer.observe(el));
  }

  /* ==================== COUNTER ANIMATION ==================== */
  function initCounters(scope) {
    const container = scope || document;
    const counters = container.querySelectorAll(
      ".stat-number[data-target], .problem-stat-number[data-target]",
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );

    counters.forEach((el) => {
      // Reset counter if re-entering view
      el.textContent = "0";
      observer.observe(el);
    });
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute("data-target"));
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* ==================== FLOATING BUTTONS ==================== */
  function initFloatingButtons() {
    const buttons = document.querySelectorAll(".float-btn");
    buttons.forEach((btn, i) => {
      btn.classList.add("float-btn-enter");
      btn.style.animationDelay = i * 0.15 + "s";
    });
  }

  /* ==================== BACK TO TOP ==================== */
  function initBackToTop() {
    const btn = document.getElementById("back-to-top");
    if (!btn) return;

    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 500) {
          btn.classList.add("visible");
        } else {
          btn.classList.remove("visible");
        }
      },
      { passive: true },
    );

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ==================== PRICING TOGGLE ==================== */
  function initPricingToggle() {
    const toggleBtn = document.getElementById("pricing-toggle");
    const labels = document.querySelectorAll(".toggle-label");
    if (!toggleBtn) return;

    let isMonthly = false;

    labels.forEach((label) => {
      label.addEventListener("click", () => {
        isMonthly = label.getAttribute("data-period") === "monthly";
        toggleBtn.classList.toggle("active", isMonthly);
        labels.forEach((l) => l.classList.remove("active"));
        label.classList.add("active");
        updatePricingDisplay(isMonthly);
      });
    });

    toggleBtn.addEventListener("click", () => {
      isMonthly = !isMonthly;
      toggleBtn.classList.toggle("active", isMonthly);
      labels.forEach((l) => {
        l.classList.toggle(
          "active",
          l.getAttribute("data-period") ===
            (isMonthly ? "monthly" : "one-time"),
        );
      });
      updatePricingDisplay(isMonthly);
    });
  }

  function updatePricingDisplay(isMonthly) {
    document.querySelectorAll(".pricing-value").forEach((el) => {
      const value = isMonthly
        ? el.getAttribute("data-monthly")
        : el.getAttribute("data-one-time");
      if (value) el.textContent = value;
    });
    document.querySelectorAll(".pricing-period-one-time").forEach((el) => {
      el.style.display = isMonthly ? "none" : "inline";
    });
    document.querySelectorAll(".pricing-period-monthly").forEach((el) => {
      el.style.display = isMonthly ? "inline" : "none";
    });
  }

  /* ==================== APPOINTMENT MODAL ==================== */
  window.openAppointmentModal = function (packageName) {
    const modal = document.getElementById("appointment-modal");
    if (!modal) return;

    // Pre-select package if provided
    if (packageName) {
      const packageSelect = modal.querySelector("#af-package");
      if (packageSelect) {
        const options = packageSelect.options;
        for (let i = 0; i < options.length; i++) {
          if (options[i].value.includes(packageName)) {
            packageSelect.selectedIndex = i;
            break;
          }
        }
      }
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Focus first input after animation
    setTimeout(() => {
      const firstInput = modal.querySelector("input, select");
      if (firstInput) firstInput.focus();
    }, 400);
  };

  function closeAppointmentModal() {
    const modal = document.getElementById("appointment-modal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  function initModal() {
    const modal = document.getElementById("appointment-modal");
    if (!modal) return;

    const closeBtn = document.getElementById("modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeAppointmentModal);
    }

    // Close on overlay click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeAppointmentModal();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        closeAppointmentModal();
      }
    });
  }

  /* ==================== WHATSAPP FORM SUBMISSION ==================== */
  function formatWhatsAppMessage(data, formType) {
    let message = "";
    const separator = "━━━━━━━━━━━━━━━━━━\n";
    const header =
      formType === "appointment"
        ? "📋 *NEW DEMO BOOKING REQUEST*\n"
        : "📩 *NEW CONTACT INQUIRY*\n";

    message += separator;
    message += header;
    message += separator + "\n";

    if (data.name) message += "👤 *Name:* " + data.name + "\n";
    if (data.specialty) message += "🏥 *Specialty:* " + data.specialty + "\n";
    if (data.phone) message += "📱 *Phone/WhatsApp:* " + data.phone + "\n";
    if (data.email) message += "📧 *Email:* " + data.email + "\n";
    if (data.city) message += "📍 *City:* " + data.city + "\n";
    if (data.package) message += "📦 *Package:* " + data.package + "\n";

    // Appointment-specific fields
    if (formType === "appointment") {
      if (data.budget) message += "💰 *Budget:* " + data.budget + "\n";
      if (data.date) message += "📅 *Preferred Date:* " + data.date + "\n";
      if (data.time) message += "🕐 *Preferred Time:* " + data.time + "\n";
      if (data.currentPresence)
        message += "🌐 *Current Presence:* " + data.currentPresence + "\n";
    }

    if (data.message) message += "💬 *Message:* " + data.message + "\n";

    message += "\n" + separator;
    message += "⏰ *Sent from SparkMediaX Website*";
    message +=
      "\n📅 *Date:* " +
      new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });

    return message;
  }

  function sendToWhatsApp(phone, message) {
    const encodedMessage = encodeURIComponent(message);
    const url = "https://wa.me/" + phone + "?text=" + encodedMessage;
    window.open(url, "_blank");
  }

  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = {
        name: form.querySelector("#cf-name").value.trim(),
        specialty: form.querySelector("#cf-specialty").value,
        phone: form.querySelector("#cf-phone").value.trim(),
        email: form.querySelector("#cf-email").value.trim(),
        city: form.querySelector("#cf-city").value.trim(),
        package: form.querySelector("#cf-package").value,
        message: form.querySelector("#cf-message").value.trim(),
      };

      // Validation
      if (!data.name || !data.specialty || !data.phone || !data.city) {
        showToast("Please fill all required fields.", "error");
        return;
      }

      const message = formatWhatsAppMessage(data, "contact");
      sendToWhatsApp("919531649590", message);
      showToast("Redirecting to WhatsApp...", "success");
      form.reset();
    });
  }

  function initAppointmentForm() {
    const form = document.getElementById("appointment-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = {
        name: form.querySelector("#af-name").value.trim(),
        specialty: form.querySelector("#af-specialty").value,
        phone: form.querySelector("#af-phone").value.trim(),
        email: form.querySelector("#af-email").value.trim(),
        city: form.querySelector("#af-city").value.trim(),
        package: form.querySelector("#af-package").value,
        budget: form.querySelector("#af-budget").value,
        date: form.querySelector("#af-date").value,
        time: form.querySelector("#af-time").value,
        currentPresence: form.querySelector("#af-current").value,
        message: form.querySelector("#af-message").value.trim(),
      };

      // Validation
      if (!data.name || !data.specialty || !data.phone || !data.city) {
        showToast("Please fill all required fields.", "error");
        return;
      }

      const message = formatWhatsAppMessage(data, "appointment");
      sendToWhatsApp("919531649590", message);
      showToast("Redirecting to WhatsApp...", "success");
      closeAppointmentModal();
      form.reset();
    });
  }

  /* ==================== TOAST NOTIFICATIONS ==================== */
  function showToast(message, type) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const icons = {
      success: "fas fa-check",
      error: "fas fa-exclamation",
      info: "fas fa-info",
    };

    const toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.innerHTML =
      '<div class="toast-icon"><i class="' +
      icons[type] +
      '"></i></div><span>' +
      message +
      "</span>";
    container.appendChild(toast);

    // Trigger show animation
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    // Auto remove
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 3500);
  }

  /* ==================== SMOOTH SCROLL FOR HASH LINKS (fallback) ==================== */
  function initSmoothScroll() {
    // This is handled by the router, but for any edge cases:
    document
      .querySelectorAll('a[href^="#"]:not([data-route])')
      .forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          const href = this.getAttribute("href");
          if (href === "#") return;
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      });
  }

  /* ==================== MAGNETIC BUTTON EFFECT ==================== */
  function initMagneticButtons() {
    if (window.innerWidth < 768) return;

    document.querySelectorAll(".btn-magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform =
          "translate(" + x * 0.15 + "px, " + y * 0.15 + "px)";
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ==================== PARALLAX ON SCROLL ==================== */
  function initParallax() {
    if (window.innerWidth < 768) return;

    const elements = document.querySelectorAll(
      ".hero-float-icon, .hero-gradient-orb",
    );

    window.addEventListener(
      "scroll",
      () => {
        const scrollY = window.scrollY;
        elements.forEach((el, i) => {
          const speed = ((i % 3) + 1) * 0.03;
          const direction = i % 2 === 0 ? 1 : -1;
          el.style.transform =
            "translateY(" + scrollY * speed * direction + "px)";
        });
      },
      { passive: true },
    );
  }

  /* ==================== TILT EFFECT ON CARDS ==================== */
  function initTiltEffect() {
    if (window.innerWidth < 768) return;

    document
      .querySelectorAll(".intro-card, .value-card, .team-card, .advantage-card")
      .forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform =
            "translateY(-4px) perspective(800px) rotateX(" +
            -y * 5 +
            "deg) rotateY(" +
            x * 5 +
            "deg)";
        });

        card.addEventListener("mouseleave", () => {
          card.style.transform = "";
        });
      });
  }

  /* ==================== TYPING EFFECT FOR HERO (subtle) ==================== */
  function initHeroAnimation() {
    const heroTitle = document.querySelector(".hero-title");
    if (!heroTitle) return;

    const titleLines = heroTitle.querySelectorAll(".title-line");
    titleLines.forEach((line, i) => {
      line.style.opacity = "0";
      line.style.transform = "translateY(30px)";
      line.style.transition =
        "opacity 0.7s ease " +
        i * 0.15 +
        "s, transform 0.7s ease " +
        i * 0.15 +
        "s";
    });

    setTimeout(() => {
      titleLines.forEach((line) => {
        line.style.opacity = "1";
        line.style.transform = "translateY(0)";
      });
    }, 1800); // After preloader
  }

  /* ==================== PHONE NUMBER FORMATTING ==================== */
  function initPhoneFormatting() {
    document.querySelectorAll('input[type="tel"]').forEach((input) => {
      input.addEventListener("input", (e) => {
        let value = e.target.value.replace(/[^\d+\-\s()]/g, "");
        // If starts with just digits and length > 10, format as Indian
        if (value.replace(/\D/g, "").length >= 10) {
          const digits = value.replace(/\D/g, "");
          if (digits.length <= 5) {
            value = digits;
          } else if (digits.length <= 10) {
            value = digits.slice(0, 5) + " " + digits.slice(5);
          } else {
            value =
              "+" +
              digits.slice(0, 2) +
              " " +
              digits.slice(2, 7) +
              " " +
              digits.slice(7, 12);
          }
        }
        e.target.value = value;
      });
    });
  }

  /* ==================== SET MIN DATE FOR APPOINTMENT ==================== */
  function initDateConstraints() {
    const dateInput = document.getElementById("af-date");
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.setAttribute("min", today);
    }
  }

  /* ==================== FOOTER LINK HANDLING ==================== */
  function initFooterLinks() {
    document.querySelectorAll("#main-footer a[data-route]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const route = link.getAttribute("data-route");
        if (route) router.navigate(route);
      });
    });
  }

  /* ==================== PERFORMANCE: THROTTLE & DEBOUNCE ==================== */
  function throttle(fn, wait) {
    let lastTime = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        fn.apply(this, args);
      }
    };
  }

  function debounce(fn, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /* ==================== LAZY LOADING IMAGES (future proof) ==================== */
  function initLazyLoad() {
    if ("IntersectionObserver" in window) {
      const lazyImages = document.querySelectorAll("img[data-src]");
      const imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.getAttribute("data-src");
              img.removeAttribute("data-src");
              imageObserver.unobserve(img);
            }
          });
        },
        {
          rootMargin: "200px 0px",
        },
      );

      lazyImages.forEach((img) => imageObserver.observe(img));
    }
  }

  /* ==================== KEYBOARD NAVIGATION ==================== */
  function initKeyboardNav() {
    document.addEventListener("keydown", (e) => {
      // Tab key - add focus styles
      if (e.key === "Tab") {
        document.body.classList.add("keyboard-nav");
      }
    });

    document.addEventListener("mousedown", () => {
      document.body.classList.remove("keyboard-nav");
    });
  }

  /* ==================== REDUCED MOTION PREFERENCE ==================== */
  function initReducedMotion() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    function handleMotionChange(e) {
      if (e.matches) {
        document.documentElement.style.setProperty(
          "--transition-base",
          "0.01s linear",
        );
        document.documentElement.style.setProperty(
          "--transition-slow",
          "0.01s linear",
        );
        document.documentElement.style.setProperty(
          "--transition-spring",
          "0.01s linear",
        );
        document.body.classList.add("reduced-motion");
      } else {
        document.documentElement.style.setProperty(
          "--transition-base",
          "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        );
        document.documentElement.style.setProperty(
          "--transition-slow",
          "0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        );
        document.documentElement.style.setProperty(
          "--transition-spring",
          "0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        );
        document.body.classList.remove("reduced-motion");
      }
    }

    prefersReducedMotion.addEventListener("change", handleMotionChange);
    handleMotionChange(prefersReducedMotion);
  }

  /* ==================== DYNAMIC YEAR IN FOOTER ==================== */
  function initDynamicYear() {
    const yearElements = document.querySelectorAll(
      ".footer-copyright, .footer-bottom p",
    );
    yearElements.forEach((el) => {
      el.innerHTML = el.innerHTML.replace("2025", new Date().getFullYear());
    });
  }

  /* ==================== SECTION VISIBILITY OBSERVER (for SPA) ==================== */
  function initSectionVisibility() {
    // Ensure only active page section is in the DOM flow
    const observer = new MutationObserver(() => {
      const sections = document.querySelectorAll(".page-section");
      sections.forEach((section) => {
        if (!section.classList.contains("active")) {
          section.style.display = "none";
        } else {
          section.style.display = "";
        }
      });
    });

    const app = document.getElementById("app");
    if (app) {
      observer.observe(app, {
        subtree: false,
        childList: true,
        attributes: true,
        attributeFilter: ["class"],
      });

      // Also observe each section for class changes
      const sections = document.querySelectorAll(".page-section");
      sections.forEach((section) => {
        observer.observe(section, {
          attributes: true,
          attributeFilter: ["class"],
        });
      });
    }
  }

  /* ==================== EMBEDDED DYNAMIC CONTENT INJECTION ==================== */
  // This function can be called to dynamically inject page content
  // if it's not already in the DOM. Useful for code-splitting.
  function injectPageContent(pageId, htmlContent) {
    const existing = document.getElementById(pageId);
    if (existing) return existing;

    const section = document.createElement("section");
    section.id = pageId;
    section.className = "page-section";
    section.innerHTML = htmlContent;
    section.style.display = "none";
    document.getElementById("app").appendChild(section);
    return section;
  }

  // Expose for external use
  window.SparkMediaX = {
    router: null,
    injectPage: injectPageContent,
    navigate: function (route) {
      if (this.router) this.router.navigate(route);
    },
    openModal: function (pkg) {
      openAppointmentModal(pkg);
    },
    showToast: showToast,
  };

  /* ==================== SCROLL-TRIGGERED ANIMATIONS ENHANCEMENT ==================== */
  function initScrollAnimations() {
    // Stagger children animations
    const staggerContainers = document.querySelectorAll(
      ".intro-grid, .values-grid, .team-grid, .problems-grid, " +
        ".benefits-grid, .advantages-grid, .deliverables-grid, " +
        ".content-type-grid, .growth-services-grid, .social-platforms",
    );

    staggerContainers.forEach((container) => {
      const children = container.children;
      Array.from(children).forEach((child, i) => {
        if (!child.getAttribute("data-delay")) {
          child.setAttribute("data-delay", i * 80 + "");
          if (!child.classList.contains("reveal")) {
            child.classList.add("reveal");
          }
        }
      });
    });
  }

  /* ==================== LINK PRELOADING ==================== */
  function initLinkPreloading() {
    const preloadLinks = document.querySelectorAll("a[data-route]");
    preloadLinks.forEach((link) => {
      link.addEventListener(
        "mouseenter",
        () => {
          const route = link.getAttribute("data-route");
          const section = document.getElementById(route);
          // If section not in DOM, try prefetch
          if (!section && PAGE_FILE_MAP[route]) {
            const prefetch = document.createElement("link");
            prefetch.rel = "prefetch";
            prefetch.href = PAGE_FILE_MAP[route];
            document.head.appendChild(prefetch);
          }
        },
        { passive: true },
      );
    });
  }

  /* ==================== ERROR HANDLING ==================== */
  function initErrorHandling() {
    // Global error handler
    window.addEventListener("error", (e) => {
      console.warn("SparkMediaX: An error occurred:", e.message);
    });

    // Unhandled promise rejection
    window.addEventListener("unhandledrejection", (e) => {
      console.warn("SparkMediaX: Unhandled promise rejection:", e.reason);
    });
  }

  /* ==================== SERVICE WORKER REGISTRATION (optional) ==================== */
  function initServiceWorker() {
    // Uncomment below to enable PWA support
    // if ('serviceWorker' in navigator) {
    //     navigator.serviceWorker.register('/sw.js')
    //         .then(reg => console.log('SW registered'))
    //         .catch(err => console.warn('SW registration failed:', err));
    // }
  }

  /* ==================== ANALYTICS (placeholder) ==================== */
  function initAnalytics() {
    // Placeholder for Google Analytics or other tracking
    // window.dataLayer = window.dataLayer || [];
    // function gtag(){dataLayer.push(arguments);}
    // gtag('js', new Date());
    // gtag('config', 'GA_MEASUREMENT_ID');

    // Track page views on route change
    const originalNavigate = Router.prototype.navigate;
    Router.prototype.navigate = function (route, pushState) {
      const result = originalNavigate.call(this, route, pushState);
      // gtag('event', 'page_view', { page_title: route });
      return result;
    };
  }

  /* ==================== CONSOLE BRANDING ==================== */
  function initConsoleBranding() {
    const styles = [
      "color: #1E5EFF",
      "font-size: 20px",
      "font-weight: bold",
      "font-family: Poppins, sans-serif",
    ].join(";");

    const subStyles = [
      "color: #64748B",
      "font-size: 12px",
      "font-family: Inter, sans-serif",
    ].join(";");

    console.log("%c SparkMediaX ", styles);
    console.log("%c Premium Digital Marketing for Doctors ", subStyles);
    console.log("%c Built with precision and care. ", subStyles);
  }

  /* ==================== SCROLL SNAP (subtle, for hero only) ==================== */
  function initScrollBehavior() {
    // Only on the home hero, add a subtle scroll hint after a delay
    const heroScroll = document.querySelector(".hero-scroll-indicator");
    if (heroScroll) {
      setTimeout(() => {
        heroScroll.style.opacity = "1";
        heroScroll.style.transition = "opacity 1s ease";
      }, 3000);
    }
  }

  /* ==================== RESIZE HANDLER ==================== */
  function initResizeHandler() {
    const handleResize = debounce(() => {
      // Close mobile menu on resize to desktop
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }

      // Reinitialize cursor for desktop
      if (window.innerWidth >= 768) {
        const cursor = document.getElementById("cursor-follower");
        if (cursor) cursor.style.display = "";
      } else {
        const cursor = document.getElementById("cursor-follower");
        if (cursor) cursor.style.display = "none";
      }
    }, 250);

    window.addEventListener("resize", handleResize);
  }

  /* ==================== PRINT STYLES ==================== */
  function initPrintSupport() {
    window.addEventListener("beforeprint", () => {
      // Make all sections visible for printing
      document.querySelectorAll(".page-section").forEach((s) => {
        s.style.display = "block";
        s.style.opacity = "1";
        s.style.transform = "none";
      });
      // Hide non-essential elements
      document
        .querySelectorAll(
          "#main-nav, #floating-buttons, #back-to-top, #scroll-progress, #cursor-follower, .modal-overlay",
        )
        .forEach((el) => {
          el.style.display = "none";
        });
    });

    window.addEventListener("afterprint", () => {
      // Restore SPA behavior
      if (router && router.currentRoute) {
        document.querySelectorAll(".page-section").forEach((s) => {
          if (s.id !== router.currentRoute) {
            s.style.display = "none";
            s.classList.remove("active", "visible");
          } else {
            s.style.display = "";
            s.classList.add("active", "visible");
          }
        });
      }
      // Restore UI elements
      document
        .querySelectorAll(
          "#main-nav, #floating-buttons, #back-to-top, #scroll-progress",
        )
        .forEach((el) => {
          el.style.display = "";
        });
    });
  }

  /* ==================== ACCESSIBILITY ENHANCEMENTS ==================== */
  function initAccessibility() {
    // Add aria-current to active nav links
    const navObserver = new MutationObserver(() => {
      document.querySelectorAll(".nav-link.active").forEach((link) => {
        link.setAttribute("aria-current", "page");
      });
      document.querySelectorAll(".nav-link:not(.active)").forEach((link) => {
        link.removeAttribute("aria-current");
      });
    });

    const navLinks = document.querySelector(".nav-links");
    if (navLinks) {
      navObserver.observe(navLinks, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    // Skip to main content link (hidden but accessible)
    const skipLink = document.createElement("a");
    skipLink.href = "#app";
    skipLink.className = "skip-link";
    skipLink.textContent = "Skip to main content";
    skipLink.style.cssText =
      "position:absolute;top:-100%;left:50%;transform:translateX(-50%);background:#1E5EFF;color:#fff;padding:12px 24px;border-radius:0 0 8px 8px;z-index:99999;font-family:Poppins,sans-serif;font-size:14px;font-weight:600;";
    skipLink.addEventListener("focus", () => {
      skipLink.style.top = "0";
    });
    skipLink.addEventListener("blur", () => {
      skipLink.style.top = "-100%";
    });
    document.body.prepend(skipLink);

    // Ensure all interactive elements have focus styles
    const focusStyle = document.createElement("style");
    focusStyle.textContent = `
            body.keyboard-nav *:focus {
                outline: 2px solid #1E5EFF !important;
                outline-offset: 2px !important;
            }
            .skip-link:focus {
                outline: 2px solid #fff !important;
                outline-offset: 2px !important;
            }
        `;
    document.head.appendChild(focusStyle);
  }

  /* ==================== HERO MOCKUP ANIMATION ==================== */
  function initMockupAnimation() {
    const mockupContent = document.querySelector(".mockup-content");
    if (!mockupContent) return;

    // Subtle shimmer effect on mockup skeleton elements
    const skeletons = mockupContent.querySelectorAll(
      ".laptop-skeleton, .laptop-feature-card, .laptop-mini-card, .mockup-mini-card",
    );
    skeletons.forEach((skel, i) => {
      skel.style.animation = `shimmer 2.5s ease-in-out ${i * 0.3}s infinite`;
    });

    const shimmerStyle = document.createElement("style");
    shimmerStyle.textContent = `
            @keyframes shimmer {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
            }
        `;
    document.head.appendChild(shimmerStyle);
  }

  /* ==================== ECOSYSTEM NODE ANIMATION ==================== */
  function initEcosystemAnimation() {
    const ecosystem = document.querySelector(".ecosystem-visual");
    if (!ecosystem) return;

    const nodes = ecosystem.querySelectorAll(".ecosystem-node");
    const lines = ecosystem.querySelectorAll(".ecosystem-line");

    // Animate nodes on scroll into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            lines.forEach((line, i) => {
              line.style.transition =
                "opacity 0.6s ease " +
                i * 0.1 +
                "s, width 0.6s ease " +
                i * 0.1 +
                "s";
              line.style.opacity = "0.3";
            });
            nodes.forEach((node, i) => {
              node.style.opacity = "0";
              node.style.transform = "scale(0.5)";
              node.style.transition =
                "opacity 0.5s ease " +
                (i * 0.1 + 0.3) +
                "s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) " +
                (i * 0.1 + 0.3) +
                "s";
              setTimeout(() => {
                node.style.opacity = "1";
                node.style.transform =
                  node.classList.contains("node-1") ||
                  node.classList.contains("node-4")
                    ? "translateX(-50%) scale(1)"
                    : "scale(1)";
              }, 50);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(ecosystem);
  }

  /* ==================== FUNNEL BAR ANIMATION ==================== */
  function initFunnelAnimation() {
    const funnelVisual = document.querySelector(".funnel-visual");
    if (!funnelVisual) return;

    const bars = funnelVisual.querySelectorAll(".funnel-bar");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            bars.forEach((bar, i) => {
              const originalWidth =
                bar.style.width || getComputedStyle(bar).width;
              bar.style.width = "0%";
              bar.style.transition =
                "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) " +
                i * 0.15 +
                "s, transform 0.3s ease";
              setTimeout(() => {
                bar.style.width = originalWidth;
              }, 50);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(funnelVisual);
  }

  /* ==================== PHONE MOCKUP ANIMATION (Digital Card page) ==================== */
  function initPhoneMockupAnimation() {
    const phoneFrame = document.querySelector(
      ".dcard-phone-mockup .phone-frame",
    );
    if (!phoneFrame) return;

    // Subtle floating animation
    phoneFrame.style.animation = "phoneFloat 4s ease-in-out infinite";

    const phoneStyle = document.createElement("style");
    phoneStyle.textContent = `
            @keyframes phoneFloat {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-8px) rotate(1deg); }
            }
        `;
    document.head.appendChild(phoneStyle);
  }

  /* ==================== PROCESS TIMELINE LINE ANIMATION ==================== */
  function initProcessTimelineAnimation() {
    const timeline = document.querySelector(".journey-timeline");
    if (!timeline) return;

    const line = timeline.querySelector("::before");
    // Use a pseudo-element approach via CSS class
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timeline.classList.add("animate-line");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(timeline);

    const timelineLineStyle = document.createElement("style");
    timelineLineStyle.textContent = `
            .journey-timeline::before {
                transform: scaleY(0);
                transform-origin: top;
                transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .journey-timeline.animate-line::before {
                transform: scaleY(1);
            }
        `;
    document.head.appendChild(timelineLineStyle);
  }

  /* ==================== WHY US COMPARISON SLIDE IN ==================== */
  function initComparisonAnimation() {
    const comparison = document.querySelector(".whyus-comparison");
    if (!comparison) return;

    const genericCol = comparison.querySelector(".whyus-generic");
    const sparkCol = comparison.querySelector(".whyus-spark");

    if (genericCol) {
      genericCol.style.opacity = "0";
      genericCol.style.transform = "translateX(-30px)";
    }
    if (sparkCol) {
      sparkCol.style.opacity = "0";
      sparkCol.style.transform = "translateX(30px)";
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (genericCol) {
              genericCol.style.transition =
                "opacity 0.7s ease, transform 0.7s ease";
              genericCol.style.opacity = "1";
              genericCol.style.transform = "translateX(0)";
            }
            if (sparkCol) {
              sparkCol.style.transition =
                "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s";
              sparkCol.style.opacity = "1";
              sparkCol.style.transform = "translateX(0)";
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(comparison);
  }

  /* ==================== PRICING CARDS STAGGER ==================== */
  function initPricingAnimation() {
    const pricingGrid = document.querySelector(".pricing-grid");
    if (!pricingGrid) return;

    const cards = pricingGrid.querySelectorAll(".pricing-card");
    cards.forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(40px)";
      card.style.transition =
        "opacity 0.6s ease " +
        i * 0.15 +
        "s, transform 0.6s ease " +
        i * 0.15 +
        "s";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cards.forEach((card) => {
              card.style.opacity = "1";
              card.style.transform = card.classList.contains("pricing-featured")
                ? "scale(1.03)"
                : "translateY(0)";
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(pricingGrid);
  }

  /* ==================== CONTACT FORM SPLIT ANIMATION ==================== */
  function initContactAnimation() {
    const contactGrid = document.querySelector(".contact-grid");
    if (!contactGrid) return;

    const info = contactGrid.querySelector(".contact-info");
    const formWrapper = contactGrid.querySelector(".contact-form-wrapper");

    if (info) {
      info.style.opacity = "0";
      info.style.transform = "translateX(-30px)";
      info.style.transition = "opacity 0.7s ease, transform 0.7s ease";
    }
    if (formWrapper) {
      formWrapper.style.opacity = "0";
      formWrapper.style.transform = "translateX(30px)";
      formWrapper.style.transition =
        "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s";
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (info) {
              info.style.opacity = "1";
              info.style.transform = "translateX(0)";
            }
            if (formWrapper) {
              formWrapper.style.opacity = "1";
              formWrapper.style.transform = "translateX(0)";
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(contactGrid);
  }

  /* ==================== WEB DEVELOPMENT MOCKUP ANIMATION ==================== */
  function initWebDevAnimation() {
    const showcase = document.querySelector(".webdev-showcase");
    if (!showcase) return;

    const laptop = showcase.querySelector(".webdev-laptop");
    const mobile = showcase.querySelector(".webdev-mobile");

    if (laptop) {
      laptop.style.opacity = "0";
      laptop.style.transform =
        "translateY(40px) perspective(800px) rotateX(5deg)";
      laptop.style.transition =
        "opacity 0.8s ease, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";
    }
    if (mobile) {
      mobile.style.opacity = "0";
      mobile.style.transform = "translateY(40px)";
      mobile.style.transition =
        "opacity 0.8s ease 0.3s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s";
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (laptop) {
              laptop.style.opacity = "1";
              laptop.style.transform =
                "translateY(0) perspective(800px) rotateX(0deg)";
            }
            if (mobile) {
              mobile.style.opacity = "1";
              mobile.style.transform = "translateY(0)";
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(showcase);
  }

  /* ==================== TRUST STRIP MARQUEE (subtle) ==================== */
  function initTrustStripAnimation() {
    const strip = document.querySelector(".trust-strip-inner");
    if (!strip) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = strip.querySelectorAll(".trust-item");
            items.forEach((item, i) => {
              item.style.opacity = "0";
              item.style.transform = "translateY(10px)";
              item.style.transition =
                "opacity 0.5s ease " +
                i * 0.08 +
                "s, transform 0.5s ease " +
                i * 0.08 +
                "s";
              setTimeout(() => {
                item.style.opacity = "1";
                item.style.transform = "translateY(0)";
              }, 50);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(strip);
  }

  /* ==================== HOME CTA PARALLAX ==================== */
  function initCTAParallax() {
    const ctaBox = document.querySelector(".home-cta-box");
    if (!ctaBox || window.innerWidth < 768) return;

    window.addEventListener(
      "scroll",
      throttle(() => {
        const rect = ctaBox.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.top < windowHeight && rect.bottom > 0) {
          const progress =
            (windowHeight - rect.top) / (windowHeight + rect.height);
          const translateY = (progress - 0.5) * 20;
          ctaBox.style.transform = "translateY(" + translateY + "px)";
        }
      }, 16),
      { passive: true },
    );
  }

  /* ==================== FORM INPUT ANIMATIONS ==================== */
  function initFormAnimations() {
    document
      .querySelectorAll(
        ".form-group input, .form-group select, .form-group textarea",
      )
      .forEach((input) => {
        // Floating label effect on focus
        input.addEventListener("focus", () => {
          const group = input.closest(".form-group");
          if (group) group.classList.add("focused");
        });
        input.addEventListener("blur", () => {
          const group = input.closest(".form-group");
          if (group) group.classList.remove("focused");
        });
      });

    // Add focus style for form groups
    const formStyle = document.createElement("style");
    formStyle.textContent = `
            .form-group.focused label {
                color: #1E5EFF;
            }
            .form-group.focused input,
            .form-group.focused select,
            .form-group.focused textarea {
                border-color: #1E5EFF;
                background: #FFFFFF;
                box-shadow: 0 0 0 3px rgba(30, 94, 255, 0.06);
            }
        `;
    document.head.appendChild(formStyle);
  }

  /* ==================== SMOOTH NUMBER INPUT (prevent non-numeric in tel fields) ==================== */
  function initInputValidation() {
    document.querySelectorAll('input[type="tel"]').forEach((input) => {
      input.setAttribute("inputmode", "tel");
      input.setAttribute("autocomplete", "tel");
      input.setAttribute("pattern", "[+]?[0-9\\s\\-\\(\\)]{8,15}");
    });

    document.querySelectorAll('input[type="email"]').forEach((input) => {
      input.setAttribute("autocomplete", "email");
    });

    document.querySelectorAll('input[type="text"]').forEach((input) => {
      if (input.id.includes("name")) {
        input.setAttribute("autocomplete", "name");
      }
      if (input.id.includes("city")) {
        input.setAttribute("autocomplete", "address-level2");
      }
    });
  }

  /* ==================== VISUAL FEEDBACK ON FORM SUBMIT ==================== */
  function initSubmitFeedback() {
    document.querySelectorAll(".btn-submit").forEach((btn) => {
      const originalHTML = btn.innerHTML;

      btn.addEventListener("click", function () {
        if (this.closest("form") && !this.closest("form").checkValidity()) {
          this.style.animation = "shake 0.5s ease";
          setTimeout(() => {
            this.style.animation = "";
          }, 500);
        }
      });
    });

    const shakeStyle = document.createElement("style");
    shakeStyle.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20% { transform: translateX(-6px); }
                40% { transform: translateX(6px); }
                60% { transform: translateX(-4px); }
                80% { transform: translateX(4px); }
            }
        `;
    document.head.appendChild(shakeStyle);
  }

  /* ==================== COOKIE CONSENT (minimal, since we don't use cookies) ==================== */
  function initCookieConsent() {
    // Since we don't use cookies, no consent banner needed.
    // This is a placeholder if cookies are added later.
  }

  /* ==================== EXIT INTENT (desktop only, subtle) ==================== */
  function initExitIntent() {
    if (window.innerWidth < 768) return;

    let exitShown = false;
    document.addEventListener("mouseout", (e) => {
      if (e.clientY <= 0 && !exitShown) {
        exitShown = true;
        // Could show a modal here — for now just a subtle toast
        // showToast('Wait! Book a free demo before you go.', 'info');
      }
    });
  }

  /* ==================== ACTIVE PAGE INDICATOR IN FOOTER ==================== */
  function initFooterActiveState() {
    const currentRoute = window.location.hash.slice(1) || "home";
    document.querySelectorAll("#main-footer a[data-route]").forEach((link) => {
      const route = link.getAttribute("data-route");
      if (route === currentRoute) {
        link.style.color = "#FFFFFF";
        link.style.fontWeight = "600";
      }
    });

    // Update on route change
    const originalSwitch = Router.prototype.switchSection;
    Router.prototype.switchSection = async function (prevRoute, targetSection) {
      const result = await originalSwitch.call(this, prevRoute, targetSection);
      const current = this.currentRoute;
      document
        .querySelectorAll("#main-footer a[data-route]")
        .forEach((link) => {
          const route = link.getAttribute("data-route");
          if (route === current) {
            link.style.color = "#FFFFFF";
            link.style.fontWeight = "600";
          } else {
            link.style.color = "";
            link.style.fontWeight = "";
          }
        });
      return result;
    };
  }

  /* ==================== GRADIENT TEXT ANIMATION ==================== */
  function initGradientAnimation() {
    const gradientElements = document.querySelectorAll(".text-gradient");
    if (gradientElements.length === 0) return;

    // Subtle background position animation for gradient text
    const gradientStyle = document.createElement("style");
    gradientStyle.textContent = `
            .text-gradient {
                background-size: 200% 200%;
                animation: gradientShift 8s ease infinite;
            }
            @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            @media (prefers-reduced-motion: reduce) {
                .text-gradient {
                    animation: none;
                }
            }
        `;
    document.head.appendChild(gradientStyle);
  }

  /* ==================== STATS ROW COUNTER ANIMATION ==================== */
  function initProblemStatsAnimation() {
    const statsRow = document.querySelector(".problem-stats-row");
    if (!statsRow) return;

    const cards = statsRow.querySelectorAll(".problem-stat-card");
    cards.forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px) scale(0.95)";
      card.style.transition =
        "opacity 0.6s ease " +
        i * 0.15 +
        "s, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) " +
        i * 0.15 +
        "s";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cards.forEach((card) => {
              card.style.opacity = "1";
              card.style.transform = "translateY(0) scale(1)";
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(statsRow);
  }

  /* ==================== PRESENCE COMPARISON ANIMATION ==================== */
  function initPresenceComparisonAnimation() {
    const comparison = document.querySelector(".presence-comparison");
    if (!comparison) return;

    const sides = comparison.querySelectorAll(".comparison-side");
    const divider = comparison.querySelector(".comparison-divider");

    sides.forEach((side, i) => {
      side.style.opacity = "0";
      side.style.transform = "translateY(20px)";
      side.style.transition =
        "opacity 0.6s ease " +
        i * 0.2 +
        "s, transform 0.6s ease " +
        i * 0.2 +
        "s";
    });
    if (divider) {
      divider.style.opacity = "0";
      divider.style.transition = "opacity 0.6s ease 0.1s";
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            sides.forEach((side) => {
              side.style.opacity = "1";
              side.style.transform = "translateY(0)";
            });
            if (divider) divider.style.opacity = "1";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(comparison);
  }

  /* ==================== SOCIAL PLATFORM CARDS HOVER ENHANCEMENT ==================== */
  function initSocialCardEnhancement() {
    const cards = document.querySelectorAll(".social-platform-card");
    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        const icon = card.querySelector("i");
        if (icon) {
          icon.style.transform = "scale(1.2) rotate(-5deg)";
          icon.style.transition =
            "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
        }
      });
      card.addEventListener("mouseleave", () => {
        const icon = card.querySelector("i");
        if (icon) {
          icon.style.transform = "";
        }
      });
    });
  }

  /* ==================== DELIVERABLES COUNTER ANIMATION koushik ==================== */
  //   function initDeliverablesAnimation() {
  //     const deliverables = document.querySelectorAll(".deliverable-number");
  //     if (deliverables.length === 0) return;

  //     const observer = new IntersectionObserver(
  //       (entries) => {
  //         entries.forEach((entry) => {
  //           if (entry.isIntersecting) {
  //             const el = entry.target;
  //             const text = el.textContent;
  //             const number = parseInt(text.replace(/[^0-9]/g, ""));
  //             const suffix = text.replace(/[0-9]/g, "");

  //             if (!isNaN(number)) {
  //               const duration = 1500;
  //               const startTime = performance.now();

  //               function update(currentTime) {
  //                 const elapsed = currentTime - startTime;
  //                 const progress = Math.min(elapsed / duration, 1);
  //                 const eased = 1 - Math.pow(1 - progress, 3);
  //                 const current = Math.round(eased * number);
  //                 el.textContent = current + suffix;

  //                 if (progress < 1) {
  //                   requestAnimationFrame(update);
  //                 }
  //               }
  //               requestAnimationFrame(update);
  //             }
  //             observer.unobserve(el);
  //           }
  //         });
  //       },
  //       { threshold: 0.5 },
  //     );

  //     deliverables.forEach((el) => observer.observe(el));
  //   }

  /* ==================== DELIVERABLES RING & COUNTER ANIMATION ==================== */
  function initDeliverablesAnimation() {
    const container = document.querySelector(".deliverables-grid-v2");
    if (!container) return;

    const rings = container.querySelectorAll(".dcv-ring-progress");
    const numbers = container.querySelectorAll(".dcv-ring-number");
    const cards = container.querySelectorAll(".deliverable-card-v2");

    // Stagger entrance
    cards.forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(30px)";
      card.style.transition =
        "opacity 0.6s ease " +
        i * 0.12 +
        "s, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) " +
        i * 0.12 +
        "s, box-shadow 0.3s ease, border-color 0.3s ease";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate cards in
            cards.forEach((card) => {
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
            });

            // Animate ring strokes
            rings.forEach((ring, i) => {
              const circumference = 213.6; // 2 * PI * 34
              const percent =
                parseFloat(ring.getAttribute("data-percent")) || 100;
              const offset = circumference - (percent / 100) * circumference;
              ring.style.strokeDashoffset = circumference + "";

              setTimeout(
                () => {
                  ring.style.strokeDashoffset = offset + "";
                },
                400 + i * 150,
              );
            });

            // Animate numbers inside rings
            numbers.forEach((num, i) => {
              const text = num.textContent.trim();
              const match = text.match(/(\d+)/);
              if (!match) return;
              const target = parseInt(match[1]);
              const suffix = text.replace(match[1], "");
              const duration = 1200;
              const startTime = performance.now();

              function update(currentTime) {
                const elapsed = currentTime - startTime - i * 150;
                if (elapsed < 0) {
                  requestAnimationFrame(update);
                  return;
                }
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);
                num.textContent = current + suffix;
                if (progress < 1) requestAnimationFrame(update);
              }
              requestAnimationFrame(update);
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    observer.observe(container);
  }

  /* ==================== PROCESS STEP CONNECTOR LINE ==================== */
  function initProcessConnectors() {
    const processTimeline = document.querySelector(".process-timeline");
    if (!processTimeline) return;

    const steps = processTimeline.querySelectorAll(".process-step");
    steps.forEach((step, i) => {
      if (i < steps.length - 1) {
        const connector = document.createElement("div");
        connector.style.cssText =
          "width:2px;height:24px;background:linear-gradient(180deg,#1E5EFF,rgba(30,94,255,0.1));margin:0 auto;grid-column:2;opacity:0;transition:opacity 0.5s ease " +
          (i * 0.2 + 0.3) +
          "s;";
        step.after(connector);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const connectors = processTimeline.querySelectorAll(
              'div[style*="grid-column:2"]',
            );
            connectors.forEach((c) => (c.style.opacity = "1"));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(processTimeline);
  }

  /* ==================== MASTER INITIALIZATION ==================== */
  function init() {
    // Core
    const router = new Router();
    window.router = router;
    window.SparkMediaX.router = router;

    // UI
    initPreloader();
    initScrollProgress();
    initNavbarScroll();
    initMobileMenu();
    initCursor();
    initBackToTop();
    initModal();

    // Animations
    initRevealAnimations();
    initCounters();
    initHeroAnimation();
    initScrollAnimations();
    initMagneticButtons();
    initParallax();
    initTiltEffect();
    initMockupAnimation();
    initGradientAnimation();

    // Page-specific animations
    initEcosystemAnimation();
    initFunnelAnimation();
    initPhoneMockupAnimation();
    initProcessTimelineAnimation();
    initComparisonAnimation();
    initPricingAnimation();
    initContactAnimation();
    initWebDevAnimation();
    initTrustStripAnimation();
    initCTAParallax();
    initProblemStatsAnimation();
    initPresenceComparisonAnimation();
    initDeliverablesAnimation();
    initProcessConnectors();

    // Forms
    initContactForm();
    initAppointmentForm();
    initPhoneFormatting();
    initDateConstraints();
    initFormAnimations();
    initInputValidation();
    initSubmitFeedback();
    initPricingToggle();

    // Interactions
    initSocialCardEnhancement();
    initLinkPreloading();
    initSmoothScroll();

    // Footer
    initFooterLinks();
    initFooterActiveState();
    initDynamicYear();

    // Utilities
    initLazyLoad();
    initKeyboardNav();
    initReducedMotion();
    initSectionVisibility();
    initResizeHandler();
    initScrollBehavior();
    initErrorHandling();
    initPrintSupport();
    initAccessibility();
    initConsoleBranding();

    // Optional
    // initAnalytics();
    // initServiceWorker();
    // initCookieConsent();
    // initExitIntent();
  }

  // Launch when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
