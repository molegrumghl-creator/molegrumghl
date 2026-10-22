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

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    function isOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      setOpen(!isOpen());
    });

    nav.addEventListener("click", function (event) {
      if (event.target && event.target.closest && event.target.closest("a")) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!isOpen()) return;
      var header = toggle.closest(".site-header");
      if (header && !header.contains(event.target)) {
        setOpen(false);
      }
    });

    var wide = window.matchMedia("(min-width: 860px)");
    if (typeof wide.addEventListener === "function") {
      wide.addEventListener("change", function (event) {
        if (event.matches) setOpen(false);
      });
    }
  }

  function initYear() {
    var nodes = document.querySelectorAll("[data-year]");
    if (!nodes.length) return;
    var year = String(new Date().getFullYear());
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = year;
    }
  }

  function initReadingTime() {
    var body = document.querySelector("[data-article-body]");
    var output = document.querySelector("[data-reading-time]");
    if (!body || !output) return;
    var text = body.textContent || "";
    var words = text.trim().split(/\s+/).length;
    var minutes = Math.max(1, Math.ceil(words / 200));
    output.textContent = minutes + " min read";
  }

  function initSignupGuard() {
    var forms = document.querySelectorAll("form[data-signup]");
    for (var i = 0; i < forms.length; i++) {
      (function (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault(); // Stops the page redirect!
          
          var action = form.getAttribute("action") || "";
          var note = form.querySelector("[data-signup-status]");
          
          if (action.indexOf("#REPLACE") === 0) {
            if (note) {
              note.textContent = "The email signup isn't connected yet. Please check back shortly — or write to molegrumghl@gmail.com.";
              note.classList.add("is-visible");
            }
            return;
          }
          
          if (note) note.textContent = "Joining...";
          
          var data = new URLSearchParams();
          var formData = new FormData(form);
          formData.forEach(function(value, key){
              data.append(key, value);
          });

          fetch(action, {
            method: "POST",
            body: data,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

  function init() {
    initNav();
    initYear();
    initReadingTime();
    initSignupGuard();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
