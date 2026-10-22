/* ==========================================================================
   Molegru'm GHL — shared site JavaScript
   --------------------------------------------------------------------------
   Vanilla JS only. Loaded on every page with <script src="/js/main.js" defer>.

   What it does:
     1. Mobile navigation (hamburger) — open/close, Escape, outside click,
        close on link click, auto-close when resizing to desktop.
     2. Stamps the current year into the footer (keeps copyright current).
     3. Guards the email signup forms until MailerLite is connected:
        if the form action is still the placeholder, the submit is stopped
        and a short, honest message is shown instead of a dead form.
     4. Optional reading-time helper: if a page has an element with
        [data-reading-time], it fills it from the word count of
        [data-article-body] (200 words per minute, rounded up).

   Everything is defensive: if an element is missing, the script quietly
   does nothing. No dependencies, no build step.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. MOBILE NAVIGATION
     ------------------------------------------------------------------------ */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");

    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
      // Keep the label accurate for screen readers
      toggle.setAttribute(
        "aria-label",
        open ? "Close menu" : "Open menu"
      );
    }

    function isOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    function close() {
      if (isOpen()) setOpen(false);
    }

    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      setOpen(!isOpen());
    });

    // Close when a navigation link is chosen (in-page anchors, new page, etc.)
    nav.addEventListener("click", function (event) {
      var target = event.target;
      if (target && target.closest && target.closest("a")) {
        close();
      }
    });

    // Close on Escape, and return focus to the toggle
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        close();
        toggle.focus();
      }
    });

    // Close when clicking outside the header (only matters on mobile)
    document.addEventListener("click", function (event) {
      if (!isOpen()) return;
      var header = toggle.closest(".site-header");
      if (header && !header.contains(event.target)) {
        close();
      }
    });

    // Reset state when the viewport grows to desktop width
    var wide = window.matchMedia("(min-width: 860px)");
    function handleWide(event) {
      if (event.matches) close();
    }
    if (typeof wide.addEventListener === "function") {
      wide.addEventListener("change", handleWide);
    } else if (typeof wide.addListener === "function") {
      wide.addListener(handleWide); // older Safari fallback
    }
  }

  /* ------------------------------------------------------------------------
     2. FOOTER YEAR
     ------------------------------------------------------------------------ */
  function initYear() {
    var nodes = document.querySelectorAll("[data-year]");
    if (!nodes.length) return;

    var year = String(new Date().getFullYear());
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = year;
    }
  }

   /* ------------------------------------------------------------------------
     3. EMAIL SIGNUP HANDLER
     ------------------------------------------------------------------------ */
  function initSignupGuard() {
    var forms = document.querySelectorAll("form[data-signup]");

    for (var i = 0; i < forms.length; i++) {
      (function (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault(); // Stop the page from reloading/redirecting
          
          var action = form.getAttribute("action") || "";
          var note = form.querySelector("[data-signup-status]");
          
          if (action.indexOf("#REPLACE") === 0) {
            if (note) {
              note.textContent = "The email signup isn't connected yet. Please check back shortly — or write to molegrumghl@gmail.com.";
              note.classList.add("is-visible");
            }
            return;
          }
          
          // Real submission to MailerLite
          if (note) note.textContent = "Joining...";
          
          var data = new URLSearchParams();
          var formData = new FormData(form);
          formData.forEach(function(value, key){
              data.append(key, value);
          });

          fetch(action, {
            method: "POST",
            body: data,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            mode: "no-cors"
          }).then(function () {
            if (note) note.textContent = "Thanks — you're on the list. One email when it opens.";
            form.reset();
          }).catch(function () {
            if (note) note.textContent = "Something went wrong. Please try again or email molegrumghl@gmail.com.";
          });
        });
      })(forms[i]);
    }
  }

  /* ------------------------------------------------------------------------
     4. READING TIME (progressive enhancement)
     ------------------------------------------------------------------------ */
  function initReadingTime() {
    var body = document.querySelector("[data-article-body]");
    var output = document.querySelector("[data-reading-time]");

    if (!body || !output) return;

    var text = body.textContent || "";
    var words = text.trim().split(/\s+/).length;

    // 200 words per minute, never less than one minute
    var minutes = Math.max(1, Math.ceil(words / 200));
    output.textContent = minutes + " min read";
  }

  /* ------------------------------------------------------------------------
     BOOT
     ------------------------------------------------------------------------ */
  function init() {
    initNav();
    initYear();
    initSignupGuard();
    initReadingTime();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
