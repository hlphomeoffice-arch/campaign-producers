(() => {
  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const year = document.querySelector("[data-year]");
  const mobileCta = document.querySelector("[data-mobile-cta]");
  const hero = document.querySelector("#top");
  const contactSection = document.querySelector("#start");
  const form = document.querySelector("[data-campaign-form]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const setHeader = () => {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    }
  };

  setHeader();
  window.addEventListener("scroll", setHeader, { passive: true });

  const closeNav = () => {
    if (!navToggle || !nav) {
      return;
    }

    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      nav.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("nav-open", !isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNav();
      }
    });
  }

  const revealItems = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    revealItems.forEach((item) => item.setAttribute("data-observed", ""));

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  document.querySelectorAll(".faq-list details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) {
        return;
      }

      document.querySelectorAll(".faq-list details[open]").forEach((openDetail) => {
        if (openDetail !== detail) {
          openDetail.removeAttribute("open");
        }
      });
    });
  });

  if (form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const statusMessage = form.querySelector("[data-form-status]");
    const originalButtonHtml = submitButton ? submitButton.innerHTML : "";

    const valueOf = (formData, fieldName) => {
      const value = formData.get(fieldName);
      return value == null ? "" : String(value).trim();
    };

    const buildMessage = (formData) => {
      const sections = [
        ["What are you taking to market?", valueOf(formData, "product")],
        ["What needs to move?", valueOf(formData, "goal")],
        ["Who needs to act?", valueOf(formData, "audience")],
        ["Deadline", valueOf(formData, "deadline")],
        ["Available budget", valueOf(formData, "budget")],
        ["Existing team or suppliers", valueOf(formData, "existing_team") || "Not provided"]
      ];

      return sections.map(([heading, answer]) => `${heading}\n${answer}`).join("\n\n");
    };

    const showStatus = (message, state) => {
      if (!statusMessage) {
        return;
      }

      statusMessage.hidden = false;
      statusMessage.dataset.state = state;
      statusMessage.textContent = message;
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.reportValidity() || form.dataset.submitting === "true") {
        return;
      }

      const formData = new FormData(form);

      if (valueOf(formData, "website")) {
        return;
      }

      form.dataset.submitting = "true";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending…";
      }

      showStatus("Sending your campaign brief…", "sending");

      const payload = new URLSearchParams();
      payload.set("name", valueOf(formData, "name"));
      payload.set("email", valueOf(formData, "email"));
      payload.set("company", valueOf(formData, "company"));
      payload.set("budget", valueOf(formData, "budget"));
      payload.set("message", buildMessage(formData));
      payload.set("page", window.location.href);
      payload.set("website", "");

      try {
        await fetch(form.action, {
          method: "POST",
          mode: "no-cors",
          body: payload
        });

        form.reset();
        showStatus("Thank you. Your campaign brief has been submitted. Henk will be in touch shortly.", "success");
      } catch (error) {
        console.error("Campaign brief submission failed:", error);
        showStatus("The form could not be sent. Please email henk@campaignproducers.com directly.", "error");
      } finally {
        delete form.dataset.submitting;

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHtml;
        }
      }
    });
  }

  if (mobileCta && hero && contactSection) {
    const syncMobileCta = () => {
      const heroRect = hero.getBoundingClientRect();
      const contactRect = contactSection.getBoundingClientRect();
      const heroIsVisible = heroRect.bottom > 0 && heroRect.top < window.innerHeight;
      const contactIsVisible = contactRect.bottom > 0 && contactRect.top < window.innerHeight;

      mobileCta.classList.toggle("is-hidden", heroIsVisible || contactIsVisible);
    };

    window.addEventListener("scroll", syncMobileCta, { passive: true });
    window.addEventListener("resize", syncMobileCta);
    mobileCta.addEventListener("click", () => mobileCta.classList.add("is-hidden"));
    syncMobileCta();
  }
})();
