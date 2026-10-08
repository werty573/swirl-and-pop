/* Swirl & Pop: concept build by Portside Digital */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fmt = n => Math.round(n).toLocaleString("en-US");

  /* ---------- data (prices in TT$) ---------- */
  const TREATS = [
    { id: "softserve", name: "Soft Serve", img: "img/softserve-sky.jpg", alt: "Soft serve cone held up against a blue sky", c: "#A8E6DD",
      blurb: "Creamy swirls on tap. The headliner at weddings and big birthdays.",
      ps: 1800, mo: 1200, inc: "Machine + mix for 50 servings + basic delivery", badge: "Crowd fave" },
    { id: "slushy", name: "Slushy", img: "img/slushy.jpg", alt: "Three slushy machines with blue, red and green slush", c: "#8FB8FF",
      blurb: "Ice-cold and neon-bright. Just what a hot Trini afternoon needs.",
      ps: 995, mo: 595, inc: "Machine + 50 cups + flavours + delivery" },
    { id: "snowcone", name: "Snow Cone", img: "img/snowcone-red.jpg", alt: "Red snow cone in a foam cup", c: "#FF9AA8",
      blurb: "Shaved ice, sweet syrup and a big dose of nostalgia.",
      ps: 850, mo: 495, inc: "Machine + ice + syrup + 50 cups + delivery" },
    { id: "popcorn", name: "Popcorn", img: "img/popcorn.jpg", alt: "Popcorn machine full of fresh popcorn", c: "#FFD66B",
      blurb: "Guests can smell it from the gate and follow it all the way to the cart.",
      ps: 850, mo: 495, inc: "Machine + kernels + 50 bags + delivery" },
    { id: "cotton", name: "Cotton Candy", img: "img/cottoncandy.jpg", alt: "Pink cotton candy held up to the sky", c: "#FFB3D1",
      blurb: "Pink clouds on a stick, spun fresh in front of the kids.",
      ps: 850, mo: 495, inc: "Machine + floss sugar + 50 sticks + delivery" },
    { id: "hotdog", name: "Hot Dogs", img: "img/hotdog.jpg", alt: "Loaded hot dog with mustard and peppers", c: "#FFB774",
      blurb: "Roller grill, buns, sausages. Fills people up between the sweet stuff.",
      ps: 795, mo: 395, inc: "Machine + hot dogs + 50 buns + delivery" },
  ];
  const EXTRA_PER_50 = 300;

  /* ---------- toast ---------- */
  const toast = $("#toast");
  let tt;
  const say = msg => {
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(tt);
    tt = setTimeout(() => toast.classList.remove("on"), msg.length > 120 ? 6500 : 3200);
  };
  document.addEventListener("click", e => {
    const d = e.target.closest(".demo");
    if (d) { e.preventDefault(); say(d.dataset.msg); }
  });

  /* ---------- treat cards ---------- */
  const track = $("#treatsTrack");
  track.innerHTML = TREATS.map(t => `
    <article class="tcard" style="--c:${t.c}" data-id="${t.id}">
      ${t.badge ? `<span class="badge">${t.badge}</span>` : ""}
      <div class="tcard-img"><img src="${t.img}" alt="${t.alt}" loading="lazy"></div>
      <h3>${t.name}</h3>
      <p>${t.blurb}</p>
      <p class="inc" data-ps="${t.inc}" data-mo="Machine + basic setup. Delivery &amp; ingredients extra.">${t.inc}</p>
      <div class="price">
        <b><small>TT$</small><span class="amt" data-ps="${t.ps}" data-mo="${t.mo}">${fmt(t.ps)}</span></b>
        <button class="add-to" type="button" data-id="${t.id}" aria-pressed="false">+ Add</button>
      </div>
    </article>`).join("");

  // pricing mode toggle with number tween
  const mode = $(".mode");
  const modeNote = $("#modeNote");
  $$(".mode-btn").forEach(b => b.addEventListener("click", () => {
    const m = b.dataset.mode;
    if (mode.dataset.mode === m || (!mode.dataset.mode && m === "ps")) return;
    mode.dataset.mode = m;
    $$(".mode-btn").forEach(x => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", x === b); });
    modeNote.textContent = m === "ps" ? "Machine + ingredients for 50 servings + basic delivery." : "Machine + basic setup. Delivery & ingredients priced separately.";
    $$(".tcard .amt").forEach(el => {
      const to = +el.dataset[m];
      const from = +el.textContent.replace(/,/g, "");
      if (reduce || !window.gsap) { el.textContent = fmt(to); return; }
      const o = { v: from };
      gsap.to(o, { v: to, duration: .7, ease: "power3.out", onUpdate: () => el.textContent = fmt(o.v) });
    });
    $$(".tcard .inc").forEach(el => el.innerHTML = el.dataset[m]);
  }));

  /* ---------- party builder ---------- */
  const state = { occasion: "Birthday", guests: 50, machines: new Set(["softserve", "popcorn"]), staff: false };
  const chipsWrap = $("#machineChips");
  chipsWrap.innerHTML = TREATS.map(t => `
    <button type="button" class="mchip" style="--c:${t.c}" data-id="${t.id}" aria-pressed="false">
      <b>${t.name}</b><small>from $${fmt(t.ps)}</small>
    </button>`).join("");

  const guests = $("#guests"), guestOut = $("#guestOut");
  const rLines = $("#rLines"), rTotal = $("#rTotal"), receipt = $("#receipt");
  let shownTotal = 0;

  function syncButtons() {
    $$(".mchip").forEach(c => { const on = state.machines.has(c.dataset.id); c.classList.toggle("is-on", on); c.setAttribute("aria-pressed", on); });
    $$(".add-to").forEach(c => { const on = state.machines.has(c.dataset.id); c.classList.toggle("is-on", on); c.setAttribute("aria-pressed", on); c.textContent = on ? "✓ Added" : "+ Add"; });
  }

  function render(bump = true) {
    const g = state.guests;
    guestOut.textContent = g >= 1000 ? "1000+" : g;
    guests.style.setProperty("--p", ((g - 25) / (1000 - 25) * 100) + "%");
    $("#rGuests").textContent = g >= 1000 ? "1000+" : g;
    $("#rOcc").textContent = state.occasion;
    const dv = $("#date").value;
    $("#rDate").textContent = dv ? new Date(dv + "T12:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "date TBC";

    const blocks = Math.ceil(Math.max(0, g - 50) / 50);
    let total = 0, html = "";
    TREATS.filter(t => state.machines.has(t.id)).forEach(t => {
      total += t.ps;
      html += `<li><span class="lbl">${t.name} · Party Starter</span><span class="dots"></span><span class="amt">${fmt(t.ps)}</span></li>`;
      if (blocks) {
        total += blocks * EXTRA_PER_50;
        html += `<li class="sub"><span class="lbl">+ ${blocks * 50} extra servings</span><span class="dots"></span><span class="amt">${fmt(blocks * EXTRA_PER_50)}</span></li>`;
      }
    });
    if (state.staff) html += `<li class="sub"><span class="lbl">Attendant</span><span class="dots"></span><span class="amt">quoted</span></li>`;
    rLines.innerHTML = html || `<li class="empty">Pick a treat to start your order</li>`;

    const n = state.machines.size;
    $("#rNote").textContent = (n > 1 ? `${n} machines: ask about our multi-machine discount. ` : "") +
      `Delivery outside the basic zone (${$("#area").value}) runs $150–$800 depending on location.`;

    if (reduce || !window.gsap) rTotal.textContent = fmt(total);
    else { const o = { v: shownTotal }; gsap.to(o, { v: total, duration: .6, ease: "power2.out", onUpdate: () => rTotal.textContent = fmt(o.v) }); }
    shownTotal = total;
    if (bump && !reduce) { receipt.classList.remove("bump"); void receipt.offsetWidth; receipt.classList.add("bump"); }
    syncButtons();
  }

  function toggleMachine(id) {
    state.machines.has(id) ? state.machines.delete(id) : state.machines.add(id);
    render();
  }
  chipsWrap.addEventListener("click", e => { const b = e.target.closest(".mchip"); if (b) toggleMachine(b.dataset.id); });
  track.addEventListener("click", e => {
    const b = e.target.closest(".add-to"); if (!b) return;
    const adding = !state.machines.has(b.dataset.id);
    toggleMachine(b.dataset.id);
    if (adding) say(`${TREATS.find(t => t.id === b.dataset.id).name} added to your party builder ↓`);
  });
  $$(".chips[data-single] .chip").forEach(c => c.addEventListener("click", () => {
    $$(".chips[data-single] .chip").forEach(x => x.classList.toggle("is-on", x === c));
    state.occasion = c.textContent; render();
  }));
  guests.addEventListener("input", () => { state.guests = +guests.value; render(false); });
  guests.addEventListener("change", () => render());
  $("#date").addEventListener("change", () => render());
  $("#area").addEventListener("change", () => render(false));
  $("#staff").addEventListener("change", e => { state.staff = e.target.checked; render(); });
  // earliest bookable date: tomorrow
  const tmr = new Date(Date.now() + 864e5); $("#date").min = tmr.toISOString().slice(0, 10);

  $("#sendWa").addEventListener("click", () => {
    if (!state.machines.size) { say("Pick at least one treat first 🙂"); return; }
    const names = TREATS.filter(t => state.machines.has(t.id)).map(t => t.name).join(", ");
    const msg = `Hi! I'd like to book: ${names}\n${state.occasion}, ${$("#rGuests").textContent} guests\n${$("#rDate").textContent} · ${$("#area").value}${state.staff ? "\n+ attendant please" : ""}\nEstimate: TT$${rTotal.textContent}`;
    say("Demo: on the live site this opens WhatsApp with:\n\n" + msg);
  });
  render(false);

  /* ---------- popcorn particles (hero) ---------- */
  const cv = $("#pops"), ctx = cv.getContext("2d");
  const hero = $(".hero"), kettle = $("#kettle"), cart = $("#cart");
  let W = 0, H = 0, dpr = 1, pops = [], heroOn = true, last = 0, acc = 0;
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = hero.clientWidth; H = hero.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener("resize", size);
  const origin = () => {
    const k = kettle.getBoundingClientRect(), h = hero.getBoundingClientRect();
    return { x: k.left - h.left + k.width / 2, y: k.top - h.top + k.height * .18 };
  };
  const spawn = (n = 1, power = 1) => {
    const o = origin();
    for (let i = 0; i < n; i++) pops.push({
      x: o.x + (Math.random() - .5) * 40, y: o.y,
      vx: (Math.random() - .5) * 5 * power, vy: -(5 + Math.random() * 6) * power,
      r: 6 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - .5) * .2, life: 0,
      tint: Math.random() < .5 ? "#FFF7D6" : "#FFE59A",
    });
  };
  const drawPop = p => {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.lineWidth = 2.5; ctx.strokeStyle = "#2B1838"; ctx.fillStyle = p.tint;
    const r = p.r;
    [[0, 0, r], [r * .8, -r * .4, r * .7], [-r * .7, -r * .5, r * .65], [r * .1, -r * .95, r * .6]].forEach(([x, y, rr]) => {
      ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    ctx.restore();
  };
  const tick = t => {
    requestAnimationFrame(tick);
    if (!heroOn) return;
    const dt = Math.min(48, t - last || 16); last = t;
    acc += dt;
    if (!reduce && acc > 420) { acc = 0; spawn(1, .9); }
    ctx.clearRect(0, 0, W, H);
    pops = pops.filter(p => p.y < H + 40 && p.life < 400);
    pops.forEach(p => { p.vy += .32 * dt / 16; p.x += p.vx * dt / 16; p.y += p.vy * dt / 16; p.rot += p.vr; p.life++; drawPop(p); });
  };
  requestAnimationFrame(tick);
  new IntersectionObserver(([e]) => heroOn = e.isIntersecting).observe(hero);
  cart.addEventListener("click", () => {
    spawn(reduce ? 6 : 22, 1.25);
    if (window.gsap && !reduce) {
      gsap.fromTo("#awning", { scaleY: .82 }, { scaleY: 1, duration: .8, ease: "elastic.out(1.1,.35)" });
      gsap.fromTo("#cart", { rotate: -2 }, { rotate: 0, duration: .9, ease: "elastic.out(1,.3)", transformOrigin: "50% 100%" });
    }
  });

  /* ---------- sprinkle cursor trail ---------- */
  if (fine && !reduce) {
    const cols = ["#FF7AAE", "#A8E6DD", "#FFD66B", "#E8364F", "#8FB8FF"];
    let lt = 0;
    addEventListener("pointermove", e => {
      const now = performance.now(); if (now - lt < 45) return; lt = now;
      const s = document.createElement("span"); s.className = "spr";
      s.style.background = cols[Math.random() * cols.length | 0];
      s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px";
      document.body.appendChild(s);
      const a = s.animate([
        { transform: `translate(-50%,-50%) rotate(${Math.random() * 180}deg)`, opacity: 1 },
        { transform: `translate(${(Math.random() - .5) * 40}px, ${30 + Math.random() * 30}px) rotate(${Math.random() * 360}deg)`, opacity: 0 },
      ], { duration: 800, easing: "cubic-bezier(.2,.6,.4,1)" });
      a.onfinish = () => s.remove();
    }, { passive: true });
  }

  /* ---------- nav hide / dock ---------- */
  const nav = $(".nav");
  let ly = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    nav.classList.toggle("hide", y > 300 && y > ly);
    ly = y;
  }, { passive: true });

  if (!window.gsap || reduce) {
    if (window.gsap && reduce) { gsap.set(".swirl-svg .tier", { strokeDashoffset: 0 }); }
    return;
  }

  /* ================= GSAP ================= */
  gsap.registerPlugin(ScrollTrigger);
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: .11 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
      const id = a.getAttribute("href"); if (id.length < 2) return;
      const t = $(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: id === "#top" ? 0 : -20 });
    }));
  }

  // progress bar
  gsap.to(".progress span", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });

  // hero intro
  const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
  intro.from(".kicker", { y: 20, opacity: 0, duration: .6 })
    .from(".hero-title .line>span", { yPercent: 110, duration: 1, stagger: .1 }, "<.1")
    .from(".hero-sub, .hero-ctas, .hero-facts", { y: 24, opacity: 0, duration: .8, stagger: .08 }, "-=.6")
    .from("#cart", { x: () => innerWidth * .6, duration: 1.4, ease: "power3.out" }, .2)
    .from(".wheel", { rotate: 540, duration: 1.4, ease: "power3.out" }, "<")
    .from("#awning", { scaleY: 0, duration: 1, ease: "elastic.out(1,.45)" }, "-=.3")
    .from(".bubble", { scale: 0, duration: .9, stagger: .12, ease: "back.out(2)" }, "-=.8")
    .from(".stage-tag", { scale: 0, duration: .5, ease: "back.out(3)" }, "-=.3")
    .add(() => spawn(16, 1.2), "-=1");

  // floating bubbles idle
  $$(".bubble").forEach((b, i) => gsap.to(b, { y: i % 2 ? 12 : -12, rotate: i % 2 ? -4 : 4, duration: 2.6 + i * .4, yoyo: true, repeat: -1, ease: "sine.inOut" }));

  // hero scroll-out: cart rolls away, bubbles drift
  const heroOut = gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .6 } });
  heroOut.to("#cart", { x: () => innerWidth * .45, ease: "none" }, 0)
    .to(".wheel", { rotate: 720, ease: "none" }, 0)
    .to(".b1", { yPercent: -120 }, 0).to(".b2", { yPercent: -200 }, 0).to(".b3", { yPercent: -60, xPercent: 60 }, 0)
    .to(".hero-copy", { yPercent: -18, opacity: .2, ease: "none" }, 0);

  // marquee: endless loop, speeds up & skews with scroll velocity
  const mq = $(".marquee-track");
  const loop = gsap.to(mq, { xPercent: -50, ease: "none", duration: 22, repeat: -1 });
  ScrollTrigger.create({
    trigger: ".marquee", start: "top bottom", end: "bottom top",
    onUpdate: s => {
      const v = s.getVelocity();
      gsap.to(loop, { timeScale: 1 + Math.min(Math.abs(v) / 300, 5) * Math.sign(v || 1), duration: .2, overwrite: true });
      gsap.to(mq, { skewX: gsap.utils.clamp(-12, 12, -v / 120), duration: .4, overwrite: "auto" });
      gsap.delayedCall(.25, () => { gsap.to(loop, { timeScale: 1, duration: .8 }); gsap.to(mq, { skewX: 0, duration: .8 }); });
    },
  });

  // headings rise
  $$(".h2").forEach(h => gsap.from(h, { y: 50, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: h, start: "top 88%" } }));

  const mm = gsap.matchMedia();

  // treats: pinned horizontal scroll on desktop
  mm.add("(min-width: 980px)", () => {
    const dist = () => track.scrollWidth - innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: ".treats", start: "top top", end: () => "+=" + dist(), pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    $$(".tcard").forEach((c, i) => gsap.from(c, {
      y: 120, rotate: i % 2 ? 6 : -6, opacity: 0, duration: .9, ease: "back.out(1.4)",
      scrollTrigger: { trigger: c, containerAnimation: tween, start: "left 95%" },
    }));
  });
  mm.add("(max-width: 979px)", () => {
    gsap.from(".tcard", { y: 60, opacity: 0, stagger: .1, duration: .8, ease: "back.out(1.4)", scrollTrigger: { trigger: ".treats-pin", start: "top 85%" } });
  });

  // how it works: the swirl builds as you scroll
  const svg = $(".swirl-svg");
  const tierCols = { t1: "#FF7AAE", t2: "#FFB3D1", t3: "#FF7AAE", t4: "#FFB3D1" };
  const tierW = { t1: 46, t2: 44, t3: 40, t4: 28 };
  const tiers = ["t1", "t2", "t3", "t4"].map(k => {
    const outline = $(".tier." + k, svg);
    outline.setAttribute("stroke-width", tierW[k] + 9);
    const fill = outline.cloneNode(); fill.classList.add("fill");
    fill.setAttribute("stroke-width", tierW[k]); fill.style.stroke = tierCols[k];
    outline.after(fill);
    const len = outline.getTotalLength();
    [outline, fill].forEach(p => { p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
    return [outline, fill];
  });
  // sprinkles
  const sg = $(".sprinkles", svg);
  const sc = ["#FFD66B", "#A8E6DD", "#E8364F", "#FFF4E6", "#8FB8FF"];
  for (let i = 0; i < 26; i++) {
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("width", 12); r.setAttribute("height", 4); r.setAttribute("rx", 2);
    r.setAttribute("fill", sc[i % sc.length]);
    const x = 80 + Math.random() * 140, y = 70 + Math.random() * 130;
    r.setAttribute("x", x); r.setAttribute("y", y);
    r.setAttribute("transform", `rotate(${Math.random() * 180} ${x + 6} ${y + 2})`);
    sg.appendChild(r);
  }
  // sprinkles sit above the swirl
  svg.appendChild(sg);
  gsap.set(sg.children, { opacity: 0, y: -260 });
  gsap.set(".swirl-svg .cone, .swirl-svg .waffle", { y: 60, opacity: 0 });

  const steps = $$(".step"), howNum = $("#howNum");
  const setStep = i => {
    steps.forEach((s, j) => s.classList.toggle("is-on", j === i));
    howNum.textContent = String(i + 1).padStart(2, "0");
  };
  const how = gsap.timeline({
    scrollTrigger: {
      trigger: ".how-pin", start: "top top", end: "+=260%", pin: true, scrub: .7,
      onUpdate: s => setStep(Math.min(3, Math.floor(s.progress * 4.0001))),
    },
  });
  how.to(".swirl-svg .cone, .swirl-svg .waffle", { y: 0, opacity: 1, duration: .5, ease: "back.out(2)" })
    .to(tiers[0], { strokeDashoffset: 0, duration: .6 }, "<.2")
    .to(tiers[1], { strokeDashoffset: 0, duration: .8 }, "+=.25")
    .to(tiers[2], { strokeDashoffset: 0, duration: .8 }, "+=.25")
    .to(tiers[3], { strokeDashoffset: 0, duration: .5 }, "+=.25")
    .to(sg.children, { opacity: 1, y: 0, duration: .6, stagger: .015, ease: "bounce.out" }, "<.2")
    .to(svg, { rotate: -4, scale: 1.04, duration: .4, ease: "sine.inOut" }, "<.3");

  // builder entrance
  gsap.from(".builder", { x: -60, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".build-grid", start: "top 80%" } });
  gsap.from(".receipt-wrap", { y: 90, rotate: 4, opacity: 0, duration: 1.1, ease: "back.out(1.5)", scrollTrigger: { trigger: ".build-grid", start: "top 80%" } });

  // events: sticky stack, earlier cards shrink back as the next one lands
  const evs = $$(".ev");
  evs.forEach((ev, i) => {
    ev.style.setProperty("--i", i);
    if (i === evs.length - 1) return;
    gsap.to(ev, {
      scale: .9 + i * .015, ease: "none",
      scrollTrigger: { trigger: evs[i + 1], start: "top bottom", end: "top 30%", scrub: true },
    });
  });
  evs.forEach(ev => gsap.from($("img", ev), { scale: 1.25, ease: "none", scrollTrigger: { trigger: ev, start: "top bottom", end: "top top", scrub: true } }));

  // flavours bounce in; scoops wobble
  gsap.from(".flv", { y: 80, rotate: (i) => [-5, 3, -2][i], opacity: 0, stagger: .12, duration: .9, ease: "back.out(1.6)", scrollTrigger: { trigger: ".flavours", start: "top 82%" } });
  gsap.from(".biz", { clipPath: "inset(0 50% 0 50% round 32px)", duration: 1.2, ease: "power3.inOut", scrollTrigger: { trigger: ".biz", start: "top 80%" } });

  // faq
  gsap.from("details", { y: 30, opacity: 0, stagger: .07, duration: .6, ease: "power2.out", scrollTrigger: { trigger: ".qa", start: "top 85%" } });

  // CTA: words pop like kernels
  gsap.from(".cta-title > span", { scale: 0, rotate: () => gsap.utils.random(-14, 14), stagger: .12, duration: .9, ease: "back.out(2.4)", scrollTrigger: { trigger: ".cta", start: "top 70%" } });
  gsap.from(".cta-awning", { yPercent: -100, duration: .9, ease: "bounce.out", scrollTrigger: { trigger: ".cta", start: "top 80%" } });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
