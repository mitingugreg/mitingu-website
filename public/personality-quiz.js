// Registration personality quiz (www.mitingu.com/personality).
// Wording comes from the JSON block the page writes (src/personality.mjs).
(function () {
  "use strict";
  var D = JSON.parse(document.getElementById("pq-data").textContent);
  var T = D.types;
  var $ = function (id) { return document.getElementById(id); };
  var views = ["start", "quiz", "result"];
  var qIndex = 0;
  var answers = [];
  var current = null;
  var viaQuiz = false;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Keep any utm_ codes from the email links, for every event and lead.
  var utm = {};
  try { utm = JSON.parse(sessionStorage.getItem("mitingu_utm") || "{}"); } catch (e) {}
  (location.search || "").replace(/^\?/, "").split("&").forEach(function (pair) {
    var bits = pair.split("=");
    var k = decodeURIComponent(bits[0] || "");
    if (/^utm_[a-z_]+$/.test(k) && bits[1]) utm[k] = decodeURIComponent(bits[1].replace(/\+/g, " ")).slice(0, 100);
  });
  try { sessionStorage.setItem("mitingu_utm", JSON.stringify(utm)); } catch (e) {}

  function track(name, params) {
    var p = {};
    Object.keys(utm).forEach(function (k) { p[k] = utm[k]; });
    Object.keys(params || {}).forEach(function (k) { p[k] = params[k]; });
    try { if (window.gtag) window.gtag("event", name, p); } catch (e) {}
  }

  function show(view, focusId) {
    views.forEach(function (v) { $("view-" + v).hidden = v !== view; });
    window.scrollTo(0, 0);
    if (focusId) { var el = $(focusId); if (el) el.focus({ preventScroll: true }); }
  }

  function iconSvg(name, size) {
    return '<svg aria-hidden="true" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="#160B2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + D.icons[name] + "</svg>";
  }

  // ----- Quiz -----
  function startQuiz() {
    qIndex = 0;
    answers = [];
    track("quiz_start", {});
    renderQuestion();
    show("quiz", "q-text");
  }

  function renderQuestion() {
    var q = D.questions[qIndex];
    $("q-text").textContent = q.q;
    $("q-count").textContent = (qIndex + 1) + " of " + D.questions.length;
    $("q-bar").setAttribute("aria-valuenow", String(qIndex + 1));
    $("q-fill").style.width = ((qIndex + 1) / D.questions.length * 100) + "%";
    var btns = document.querySelectorAll(".pq-answer");
    for (var i = 0; i < btns.length; i++) {
      btns[i].querySelector("span").textContent = q.a[i];
      btns[i].classList.remove("is-picked");
      btns[i].disabled = false;
    }
    $("q-back").hidden = qIndex === 0;
  }

  function score() {
    var counts = {};
    answers.forEach(function (k) { counts[k] = (counts[k] || 0) + 1; });
    var keys = Object.keys(counts);
    if (!keys.length || keys.length >= 4) return "juggler";
    var top = Math.max.apply(null, keys.map(function (k) { return counts[k]; }));
    var winners = keys.filter(function (k) { return counts[k] === top; });
    return winners.length === 1 ? winners[0] : "juggler";
  }

  document.querySelectorAll(".pq-answer").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var i = Number(btn.getAttribute("data-i"));
      answers[qIndex] = D.answerTypes[i];
      document.querySelectorAll(".pq-answer").forEach(function (b) { b.disabled = true; });
      btn.classList.add("is-picked");
      setTimeout(function () {
        if (qIndex < D.questions.length - 1) {
          qIndex += 1;
          renderQuestion();
          $("q-text").focus({ preventScroll: true });
        } else {
          var key = score();
          viaQuiz = true;
          track("quiz_complete", { personality: T[key].name });
          location.hash = key;
        }
      }, reduceMotion ? 60 : 320);
    });
  });

  $("q-back").addEventListener("click", function () {
    if (qIndex > 0) { qIndex -= 1; answers.length = qIndex; renderQuestion(); }
  });

  // ----- Result -----
  function confetti() {
    var box = $("r-burst");
    box.innerHTML = "";
    if (reduceMotion) return;
    var colours = ["#FFD23F", "#2EC4B6", "#FF5CA8", "#FF8A5B", "#B9A6FF", "#ffffff", "#D1006E"];
    for (var i = 0; i < 46; i++) {
      var s = document.createElement("span");
      var angle = Math.random() * Math.PI * 2;
      var dist = 120 + Math.random() * 300;
      s.style.setProperty("--x", Math.round(Math.cos(angle) * dist) + "px");
      s.style.setProperty("--y", Math.round(Math.sin(angle) * dist * 0.7 + 120) + "px");
      s.style.setProperty("--r", Math.round(Math.random() * 540 - 270) + "deg");
      s.style.background = colours[i % colours.length];
      s.style.animationDelay = (Math.random() * 0.15) + "s";
      if (i % 3 === 0) s.style.borderRadius = "50%";
      box.appendChild(s);
    }
  }

  function showResult(key) {
    var t = T[key];
    current = key;
    $("r-badge").style.setProperty("--c", t.colour);
    $("r-badge").style.setProperty("--s", t.shadow);
    $("r-badge").innerHTML = iconSvg(t.icon, 76);
    $("r-name").textContent = t.name + "!";
    $("r-tag").textContent = t.tag;
    $("r-super").textContent = t.superpower;
    $("r-time").textContent = t.time;
    $("r-win").textContent = t.win;
    $("r-cta").textContent = t.cta;
    $("r-example").href = "mailto:" + D.exampleEmail + "?subject=" + encodeURIComponent("Example please: " + t.name);
    var shareUrl = D.pageUrl + "#" + key;
    $("r-linkedin").href = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(shareUrl);
    $("demo-fields").hidden = false;
    $("demo-form").classList.remove("is-done");
    $("d-msg").textContent = "Your link arrives within one working day.";
    document.title = "I'm " + t.name + " | What's your registration personality? | Mitingu";
    show("result", "r-name");
    confetti();
    track("result_view", { personality: t.name, via: viaQuiz ? "quiz" : "link" });
    viaQuiz = false;
  }

  $("r-book").addEventListener("click", function () { track("book_chat_click", { personality: current ? T[current].name : "" }); });
  $("r-example").addEventListener("click", function () { track("example_click", { personality: current ? T[current].name : "" }); });
  $("r-linkedin").addEventListener("click", function () { track("share", { method: "LinkedIn", personality: current ? T[current].name : "" }); });
  $("r-copy").addEventListener("click", function () {
    var url = D.pageUrl + "#" + (current || "");
    var btn = $("r-copy");
    var done = function () { btn.textContent = "Link copied"; setTimeout(function () { btn.textContent = "Copy link"; }, 2000); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done); else done();
    track("share", { method: "Copy link", personality: current ? T[current].name : "" });
  });

  var demoStarted = false;
  $("demo-form").addEventListener("focusin", function () {
    if (!demoStarted) { demoStarted = true; track("demo_form_start", { personality: current ? T[current].name : "" }); }
  });

  $("demo-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = $("d-email").value.trim();
    var web = $("d-web").value.trim();
    var msg = $("d-msg");
    $("d-email").removeAttribute("aria-invalid");
    $("d-web").removeAttribute("aria-invalid");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = "Please check your email address.";
      $("d-email").setAttribute("aria-invalid", "true");
      $("d-email").focus();
      return;
    }
    if (!/[a-z0-9-]+\.[a-z]{2,}/i.test(web)) {
      msg.textContent = "Please add your website, so we can use your branding.";
      $("d-web").setAttribute("aria-invalid", "true");
      $("d-web").focus();
      return;
    }
    if (!D.leadsBase) { msg.textContent = "Sorry, that isn't available right now. Please email " + D.exampleEmail + "."; return; }
    var btn = $("d-send");
    btn.disabled = true;
    msg.textContent = "Sending…";
    var source = "personality-quiz" + (Object.keys(utm).length ? " " + Object.keys(utm).map(function (k) { return k + "=" + utm[k]; }).join("&") : "");
    fetch(D.leadsBase + "/api/demo-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, website: web, event_type: "Something else", personality: current ? T[current].name : "", source: source, botcheck: $("d-botcheck").checked ? "on" : "" })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok && d.success, data: d }; });
    }).then(function (res) {
      btn.disabled = false;
      if (res.ok) {
        $("demo-fields").hidden = true;
        $("demo-form").classList.add("is-done");
        msg.textContent = "On it! Your demo site link will be with you within one working day. Check your inbox for a confirmation now.";
        track("generate_lead", { form: "personality_demo", personality: current ? T[current].name : "" });
      } else {
        msg.textContent = (res.data && res.data.message) || "Sorry, that didn't send. Please try again.";
      }
    }).catch(function () {
      btn.disabled = false;
      msg.textContent = "Sorry, that didn't send. Please try again in a moment, or email " + D.exampleEmail + ".";
    });
  });

  // ----- Routing -----
  document.querySelectorAll("[data-start]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      if (location.hash === "#quiz") startQuiz(); else location.hash = "quiz";
    });
  });

  function route() {
    var h = (location.hash || "").replace(/^#/, "");
    if (D.oldKeys[h]) { history.replaceState(null, "", location.pathname + location.search + "#" + D.oldKeys[h]); h = D.oldKeys[h]; }
    if (h === "quiz") { startQuiz(); return; }
    if (T[h]) { showResult(h); return; }
    document.title = "What's your registration personality? | Mitingu";
    show("start");
  }
  window.addEventListener("hashchange", route);
  route();
})();
