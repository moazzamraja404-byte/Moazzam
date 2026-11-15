document.addEventListener("DOMContentLoaded", () => {

  /* =================================
     1. MOBILE NAVIGATION
     (pehle menuBtn / navLinks 2 baar declare the - isi se poori JS band ho jati thi)
  ================================= */

  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");

  function closeMenu() {
    if (!navLinks || !menuBtn) return;
    navLinks.classList.remove("active");
    menuBtn.textContent = "☰";
    menuBtn.setAttribute("aria-expanded", "false");
  }

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      const open = navLinks.classList.toggle("active");
      menuBtn.textContent = open ? "✕" : "☰";
      menuBtn.setAttribute("aria-expanded", String(open));
    });

    // link dabane par menu band
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    // bahar click ya Escape par band
    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }


  /* =================================
     2. ACTIVE MENU LINK (scroll ke hisab se)
  ================================= */

  const sectionIds = ["home", "about", "skills", "service", "work", "document", "contact"];
  // Work section ke time "Service" highlight rahe; contact par koi nahi
  const linkFor = { work: "service" };
  const menuLinks = document.querySelectorAll(".nav-links a");

  let spyTicking = false;

  function updateActiveLink() {
    const line = window.innerHeight * 0.35;
    let current = "home";

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) current = id;
    });

    const activeId = linkFor[current] || current;

    menuLinks.forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + activeId);
    });

    spyTicking = false;
  }

  window.addEventListener("scroll", () => {
    if (!spyTicking) {
      spyTicking = true;
      requestAnimationFrame(updateActiveLink);
    }
  }, { passive: true });

  window.addEventListener("resize", updateActiveLink);
  updateActiveLink();


  /* =================================
     3. COPYRIGHT YEAR
  ================================= */

  const yearElement = document.getElementById("year");
  if (yearElement) yearElement.textContent = new Date().getFullYear();


  /* =================================
     4. CONTACT FORM (seedha email par aata hai - Web3Forms)
  ================================= */

  const ACCESS_KEY = "db81c428-c6bd-4b76-8b7b-e93a4f6e9d1a";

  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    const submitBtn = contactForm.querySelector(".submit-btn");
    const btnHTML = submitBtn.innerHTML;
    const formStatus = document.getElementById("formStatus");

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const message = document.getElementById("message").value.trim();
      const requirement = document.querySelector('input[name="requirement"]:checked');

      if (!requirement) {
        formStatus.classList.add("error");
        formStatus.textContent = "Please select Graphics or Video.";
        return;
      }

      formStatus.classList.remove("error");
      formStatus.textContent = "Sending...";
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            access_key: ACCESS_KEY,
            subject: "New Portfolio Enquiry - " + requirement.value,
            from_name: "Portfolio Website",
            name: firstName + " " + lastName,
            email: email,
            phone: phone,
            requirement: requirement.value,
            message: message,
            botcheck: document.getElementById("botcheck").checked
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          formStatus.textContent = "Thank you! Your message has been sent. I will reply soon.";
          contactForm.reset();
        } else {
          throw new Error(result.message || "Failed");
        }
      } catch (error) {
        formStatus.classList.add("error");
        formStatus.textContent =
          "Message could not be sent. Please email me at moazzamraja404@gmail.com";
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnHTML;
      }
    });
  }

  /* =================================
     PROJECT GALLERY (card par click -> videos popup me)
  ================================= */

  const modal = document.getElementById("galleryModal");

  if (modal) {
    const panel = modal.querySelector(".gallery-panel");
    const player = document.getElementById("galleryPlayer");
    const titleEl = document.getElementById("galleryTitle");
    const subEl = document.getElementById("gallerySub");
    const countEl = document.getElementById("galleryCount");
    const listEl = document.getElementById("galleryList");
    const closeBtn = modal.querySelector(".gallery-close");

    let lastCard = null;
    let items = [];
    let index = 0;

    function setRatio(ratio) {
      const parts = ratio.split("/").map(Number);
      const w = parts[0] || 9;
      const h = parts[1] || 16;
      panel.style.setProperty("--player-ratio", w + " / " + h);
      panel.classList.toggle("landscape", w > h);
    }

    function select(i, autoplay) {
      index = (i + items.length) % items.length;
            player.src = items[index] + (autoplay ? "" : "#t=0.1");
      if (autoplay) {
        const p = player.play();
        if (p && p.catch) p.catch(() => {});
      }
      countEl.textContent = "Video " + (index + 1) + " of " + items.length;
      listEl.querySelectorAll(".gallery-thumb").forEach((btn, n) => {
        btn.classList.toggle("active", n === index);
        btn.setAttribute("aria-current", n === index ? "true" : "false");
      });
    }

    function openGallery(card) {
      items = (card.dataset.videos || "")
        .split(",").map(s => s.trim()).filter(Boolean);
      if (!items.length) return;

      lastCard = card;
      titleEl.textContent = card.dataset.title || "Videos";
      subEl.textContent = card.dataset.sub || "";
      setRatio(card.dataset.ratio || "9/16");

      listEl.innerHTML = "";
      items.forEach((src, n) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gallery-thumb";
        btn.setAttribute("aria-label", "Play video " + (n + 1));

        const v = document.createElement("video");
        v.src = src + "#t=0.5";
        v.muted = true;
        v.playsInline = true;
        v.preload = "metadata";

        const num = document.createElement("span");
        num.textContent = String(n + 1).padStart(2, "0");

        btn.append(v, num);
        btn.addEventListener("click", () => select(n, true));
        listEl.appendChild(btn);
      });

      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");

            select(0, false);         // popup khulne par video nahi chalega, tap karne par chalega
      closeBtn.focus();
    }

    function closeGallery() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");

      player.pause();
      player.removeAttribute("src");
      player.load();
      listEl.innerHTML = "";

      if (lastCard) lastCard.focus();
    }

    // card par click / Enter / Space
    document.querySelectorAll(".gallery-card").forEach(card => {
      card.addEventListener("click", () => openGallery(card));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openGallery(card);
        }
      });
    });

    // band karna: X button, bahar click, Esc
    modal.querySelectorAll("[data-close]").forEach(el => {
      el.addEventListener("click", closeGallery);
    });

    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("open")) return;

      if (e.key === "Escape") {
        closeGallery();
        return;
      }

      if (e.key === "Tab") {
        const focusable = Array.from(modal.querySelectorAll("button, video[controls]"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }


  /* =================================
     5. LIQUID ANIMATION (contact ke right side wala box)
     - 5 blobs cursor ke peeche chain me chalte hain
     - speed ke hisab se stretch / squash hote hain
     - SVG goo filter se aapas me jud kar liquid jaise lagte hain
     - cursor na ho to apne aap halka sa behte rehte hain
     - touch screen par bhi chalta hai
  ================================= */

  const box = document.getElementById("jellyBox");
  const scene = document.getElementById("liquidScene");

  if (box && scene) {

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lag = [0.14, 0.10, 0.075, 0.055, 0.04];   // chhota number = zyada peeche

    let w = box.clientWidth;
    let h = box.clientHeight;
    let scale = 1;

    const blobs = Array.from(scene.querySelectorAll(".liquid-blob")).map((el, i) => ({
      el,
      base: parseFloat(el.dataset.size) || 100,
      size: 100,
      x: w / 2,
      y: h / 2,
      angle: 0,
      k: lag[i] || 0.04
    }));

    function resize() {
      w = box.clientWidth;
      h = box.clientHeight;
      scale = w < 420 ? 0.7 : (w < 600 ? 0.85 : 1);

      blobs.forEach(b => {
        b.size = b.base * scale;
        b.el.style.width = b.size + "px";
        b.el.style.height = b.size + "px";
      });
    }

    resize();
    window.addEventListener("resize", resize);
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(box);

    // pointer
    let active = false;
    let px = w / 2;
    let py = h / 2;

    function setPointer(e) {
      const rect = box.getBoundingClientRect();
      px = e.clientX - rect.left;
      py = e.clientY - rect.top;
      active = true;
    }

    box.addEventListener("pointerenter", setPointer);
    box.addEventListener("pointermove", setPointer);
    box.addEventListener("pointerleave", () => { active = false; });
    box.addEventListener("pointercancel", () => { active = false; });
    box.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") active = false; });

    // sirf screen par dikhe tab animate karo
    let visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
      }).observe(box);
    }

    function frame(time) {
      requestAnimationFrame(frame);
      if (!visible) return;

      const t = time / 1000;
      let tx, ty;

      if (active) {
        const pad = blobs[0].size / 2;
        tx = Math.min(Math.max(px, pad * 0.4), w - pad * 0.4);
        ty = Math.min(Math.max(py, pad * 0.4), h - pad * 0.4);
      } else if (reduceMotion) {
        tx = w / 2;
        ty = h / 2;
      } else {
        tx = w / 2 + Math.cos(t * 0.8) * w * 0.22;
        ty = h / 2 + Math.sin(t * 1.1) * h * 0.2;
      }

      blobs.forEach((b, i) => {
        // pehla blob cursor ko, baaki apne se pehle wale ko follow karte hain
        const targetX = i === 0 ? tx : blobs[i - 1].x;
        const targetY = i === 0 ? ty : blobs[i - 1].y;

        const nx = b.x + (targetX - b.x) * b.k;
        const ny = b.y + (targetY - b.y) * b.k;

        const vx = nx - b.x;
        const vy = ny - b.y;
        const speed = Math.hypot(vx, vy);

        if (speed > 0.25) b.angle = Math.atan2(vy, vx);

        const stretch = Math.min(speed / 40, 0.45);
        const sx = 1 + stretch;
        const sy = 1 - stretch * 0.5;

        b.x = nx;
        b.y = ny;

        b.el.style.transform =
          "translate3d(" + (b.x - b.size / 2) + "px," + (b.y - b.size / 2) + "px,0) " +
          "rotate(" + b.angle + "rad) scale(" + sx + "," + sy + ")";
      });
    }

    requestAnimationFrame(frame);
  }

});