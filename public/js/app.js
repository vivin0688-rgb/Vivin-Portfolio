"use strict";

/* =========================================================
   VIVIN'S PORTFOLIO — MAIN APPLICATION
   Notifications, messages and mobile navigation
========================================================= */

/* =========================
   1. NOTIFICATION SYSTEM
========================= */

let notificationTimer = null;

function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");

  if (!notification) {
    console.warn("Notification element was not found.");
    return;
  }

  clearTimeout(notificationTimer);

  notification.textContent = message;

  notification.className = "notification";
  notification.classList.add("show");

  if (type === "error") {
    notification.classList.add("error");
  } else {
    notification.classList.add("success");
  }

  notificationTimer = setTimeout(() => {
    notification.classList.remove("show");
  }, 3500);
}

/* =========================
   2. FORM MESSAGE SYSTEM
========================= */

function showMessage(element, message, type = "") {
  if (!element) {
    console.warn("Message element was not found.");
    return;
  }

  element.textContent = message;
  element.className = "form-message";

  if (type === "success" || type === "error") {
    element.classList.add(type);
  }
}

/* =========================
   3. MOBILE NAVIGATION
========================= */

function initializeNavigation() {
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  if (!menuToggle || !navLinks) {
    return;
  }

  function closeMenu() {
    navLinks.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (
      !menuToggle.contains(event.target) &&
      !navLinks.contains(event.target)
    ) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      closeMenu();
    }
  });
}

/* =========================
   4. ACTIVE NAVIGATION LINK
========================= */

function initializeActiveNavigation() {
  const sections = document.querySelectorAll(
    "main section[id]"
  );

  const links = document.querySelectorAll(
    ".nav-links .nav-link"
  );

  if (!sections.length || !links.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const currentId = entry.target.id;

        links.forEach((link) => {
          const isActive =
            link.getAttribute("href") === `#${currentId}`;

          link.classList.toggle("active", isActive);
        });
      });
    },
    {
      root: null,
      rootMargin: "-25% 0px -60% 0px",
      threshold: 0
    }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });
}

/* =========================
   5. GLOBAL ERROR HANDLING
========================= */

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unexpected application error:", event.reason);
});

/* =========================
   6. INITIALIZE APPLICATION
========================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  initializeActiveNavigation();

  console.log("Vivin Portfolio application initialized.");
});

/* =========================
   7. SHARE FUNCTIONS
========================= */

window.showNotification = showNotification;
window.showMessage = showMessage;