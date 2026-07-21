/* ============================================================
   PLATE2PURPOSE MOTION ENGINE — p2p.js
   Zero dependencies. Scroll reveals, counters, kinetic text,
   tilt cards, navbar state, preloader, scroll progress.
   Respects prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader (never traps the page: max 1.2s) ---------- */
  function initPreloader() {
    var pre = document.querySelector(".p2p-preloader");
    if (!pre) return;
    var done = function () { pre.classList.add("is-done"); };
    if (document.readyState === "complete") {
      setTimeout(done, 250);
    } else {
      window.addEventListener("load", function () { setTimeout(done, 250); });
    }
    setTimeout(done, 1200); // hard cap — never let a spinner hold the page hostage
  }

  /* ---------- Navbar scroll state ---------- */
  function initNav() {
    var nav = document.querySelector(".p2p-nav");
    if (!nav) return;
    var update = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- Scroll progress bar ---------- */
  function initProgress() {
    if (document.querySelector(".p2p-progress")) return;
    var bar = document.createElement("div");
    bar.className = "p2p-progress";
    document.body.appendChild(bar);
    var update = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------- Viewport check used by reveals + counters.
     IntersectionObserver is used when available, but a geometric
     fallback (initial pass + scroll listener) guarantees content
     is never stuck invisible if IO doesn't fire. ---------- */
  function inViewport(el, ratio) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * (ratio || 0.94) && r.bottom > 0 && r.width > 0 && r.height > 0;
  }

  function onView(els, ratio, fire) {
    var pending = Array.prototype.slice.call(els);
    var sweep = function () {
      if (!pending.length) return;
      pending = pending.filter(function (el) {
        if (inViewport(el, ratio)) { fire(el); return false; }
        return true;
      });
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            fire(entry.target);
            io.unobserve(entry.target);
            pending = pending.filter(function (el) { return el !== entry.target; });
          }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
      pending.forEach(function (el) { io.observe(el); });
    }
    // geometric fallback — cheap, throttled to rAF
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { sweep(); ticking = false; });
    };
    sweep();
    setTimeout(sweep, 350);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("load", sweep);
  }

  /* ---------- Scroll reveals: [data-reveal], stagger via [data-reveal-stagger] ---------- */
  function initReveals() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    // auto-stagger children of containers marked data-reveal-stagger
    document.querySelectorAll("[data-reveal-stagger]").forEach(function (wrap) {
      var step = parseFloat(wrap.getAttribute("data-reveal-stagger")) || 0.1;
      wrap.querySelectorAll("[data-reveal]").forEach(function (el, i) {
        el.style.setProperty("--reveal-delay", (i * step).toFixed(2) + "s");
      });
    });

    if (reducedMotion) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    onView(els, 0.94, function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Count-up numbers: <span data-count="12500" data-decimals="0" data-suffix="+"> ---------- */
  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;

    var animate = function (el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var suffix = el.getAttribute("data-suffix") || "";
      var prefix = el.getAttribute("data-prefix") || "";
      var dur = parseInt(el.getAttribute("data-duration") || "1800", 10);
      if (reducedMotion) {
        el.textContent = prefix + target.toLocaleString("en-IN", { maximumFractionDigits: decimals }) + suffix;
        return;
      }
      var start = null;
      var ease = function (t) { return 1 - Math.pow(1 - t, 4); };
      var tick = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var val = target * ease(p);
        el.textContent = prefix + val.toLocaleString("en-IN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    var fired = [];
    onView(els, 0.9, function (el) {
      if (fired.indexOf(el) !== -1) return;
      fired.push(el);
      animate(el);
    });
  }

  /* ---------- Kinetic headline: [data-split] words rise one by one ---------- */
  function initSplit() {
    document.querySelectorAll("[data-split]").forEach(function (el) {
      if (reducedMotion) return;
      var base = parseFloat(el.getAttribute("data-split-delay")) || 0;
      var step = 0.08;
      var walk = function (node) {
        var kids = Array.prototype.slice.call(node.childNodes);
        kids.forEach(function (child) {
          if (child.nodeType === 3) {
            var frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) {
                frag.appendChild(document.createTextNode(part));
              } else {
                var w = document.createElement("span");
                w.className = "p2p-word";
                var inner = document.createElement("span");
                inner.textContent = part;
                w.appendChild(inner);
                frag.appendChild(w);
              }
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1) {
            if (child.classList.contains("p2p-grad-text")) {
              // background-clip:text breaks if we transform inner spans —
              // animate the gradient element itself as one word instead
              var wrap2 = document.createElement("span");
              wrap2.className = "p2p-word";
              node.replaceChild(wrap2, child);
              wrap2.appendChild(child);
            } else {
              walk(child);
            }
          }
        });
      };
      walk(el);
      // assign sequential delays now that all words exist
      el.querySelectorAll(".p2p-word > span").forEach(function (s, i) {
        s.style.animationDelay = (base + i * step) + "s";
      });
    });
  }

  /* ---------- 3D tilt cards: [data-tilt] ---------- */
  function initTilt() {
    if (reducedMotion) return;
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      var strength = parseFloat(card.getAttribute("data-tilt")) || 8;
      card.classList.add("p2p-tilt");
      if (!card.querySelector(".p2p-tilt-shine")) {
        var shine = document.createElement("div");
        shine.className = "p2p-tilt-shine";
        card.appendChild(shine);
      }
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.style.transform =
          "perspective(900px) rotateX(" + ((0.5 - y) * strength) + "deg) rotateY(" + ((x - 0.5) * strength) + "deg) translateY(-6px)";
        card.style.setProperty("--mx", (x * 100) + "%");
        card.style.setProperty("--my", (y * 100) + "%");
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Smooth same-page anchors ---------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      });
    });
  }

  /* ---------- Active nav link ---------- */
  function initActiveNav() {
    var path = location.pathname.split("/").pop().replace(".html", "") || "index";
    document.querySelectorAll(".p2p-nav .nav-link").forEach(function (link) {
      var href = (link.getAttribute("href") || "").replace(".html", "").replace(/^\.\//, "");
      if (href === path) link.classList.add("active");
    });
  }

  function boot() {
    initPreloader();
    initNav();
    initProgress();
    initReveals();
    initCounters();
    initSplit();
    initTilt();
    initAnchors();
    initActiveNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();