var pages = ["home", "artists", "albums", "mood", "playlist", "news", "about"];
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wipe = document.querySelector(".wipe");
  var current = "home", busy = false, currentMood = "santai";

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // ---------- data
  var MOODS = {
    santai:   { label: "Santai",   color: "var(--daniel)", tag: "Pelan, adem, cocok buat rebahan.",
      songs: [["Best Part","Daniel Caesar","daniel"],["imagine","Ariana Grande","ariana"],["cardigan","Taylor Swift","taylor"],["Peaches","Justin Bieber","justin"],["Japanese Denim","Daniel Caesar","daniel"]] },
    semangat: { label: "Semangat", color: "var(--justin)", tag: "Buat dengerin pas lagi gas-gasnya.",
      songs: [["Shake It Off","Taylor Swift","taylor"],["7 rings","Ariana Grande","ariana"],["Sorry","Justin Bieber","justin"],["Into You","Ariana Grande","ariana"],["Blank Space","Taylor Swift","taylor"]] },
    romantis: { label: "Romantis", color: "var(--taylor)", tag: "Buat yang lagi jatuh cinta.",
      songs: [["Love Me Harder","Ariana Grande","ariana"],["Just Like Magic","Ariana Grande","ariana"],["Get You","Daniel Caesar","daniel"],["Blessed","Daniel Caesar","daniel"],["Delicate","Taylor Swift","taylor"]] },
    galau:    { label: "Galau",    color: "var(--galau)", tag: "Boleh sedih dulu, ditemenin lagu ini.",
      songs: [["All Too Well","Taylor Swift","taylor"],["Ghost","Justin Bieber","justin"],["ghostin","Ariana Grande","ariana"],["Always","Daniel Caesar","daniel"],["Anti-Hero","Taylor Swift","taylor"]] }
  };

  var MOOD_FINAL = {"santai": [["Best Part", "Daniel Caesar", "daniel"], ["imagine", "Ariana Grande", "ariana"], ["cardigan", "Taylor Swift", "taylor"], ["Peaches", "Justin Bieber", "justin"], ["Japanese Denim", "Daniel Caesar", "daniel"], ["pov", "Ariana Grande", "ariana"], ["august", "Taylor Swift", "taylor"], ["Hold On", "Justin Bieber", "justin"]], "semangat": [["Shake It Off", "Taylor Swift", "taylor"], ["7 rings", "Ariana Grande", "ariana"], ["Sorry", "Justin Bieber", "justin"], ["Into You", "Ariana Grande", "ariana"], ["Blank Space", "Taylor Swift", "taylor"], ["Bad Blood", "Taylor Swift", "taylor"], ["What Do You Mean?", "Justin Bieber", "justin"], ["Do You Like Me?", "Daniel Caesar", "daniel"]], "romantis": [["Love Me Harder", "Ariana Grande", "ariana"], ["Just Like Magic", "Ariana Grande", "ariana"], ["Get You", "Daniel Caesar", "daniel"], ["Blessed", "Daniel Caesar", "daniel"], ["Delicate", "Taylor Swift", "taylor"], ["Lover", "Taylor Swift", "taylor"], ["Love Yourself", "Justin Bieber", "justin"], ["Love Me", "Justin Bieber", "justin"]], "galau": [["All Too Well", "Taylor Swift", "taylor"], ["Ghost", "Justin Bieber", "justin"], ["ghostin", "Ariana Grande", "ariana"], ["Always", "Daniel Caesar", "daniel"], ["Back to December", "Taylor Swift", "taylor"], ["Lonely", "Justin Bieber", "justin"], ["Don't Wanna Break Up Again", "Ariana Grande", "ariana"], ["Who Knows", "Daniel Caesar", "daniel"]]};
  for (var mk in MOOD_FINAL) { MOODS[mk].songs = MOOD_FINAL[mk]; }

  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5C6 16.3 3 13.2 3 9.6 3 7.2 4.8 5.5 7 5.5c1.9 0 3.5 1 5 3 1.5-2 3.1-3 5-3 2.2 0 4 1.700 4 4.100 0 3.600-3 6.700-9 10.900z"/></svg>';

  // ---------- favorit (tersimpan di browser)
  var favs = [];
  try { favs = JSON.parse(lsGet("soundcorner:favs") || "[]"); } catch (e) { favs = []; }
  if (!Array.isArray(favs)) { favs = []; }

  function favIndex(key) {
    for (var i = 0; i < favs.length; i++) { if (favs[i].a + "|" + favs[i].t === key) { return i; } }
    return -1;
  }
  function toggleFav(t, a, k) {
    var i = favIndex(a + "|" + t);
    if (i > -1) { favs.splice(i, 1); } else { favs.push({ t: t, a: a, k: k }); }
    lsSet("soundcorner:favs", JSON.stringify(favs));
    syncFavs();
  }
  function syncFavs() {
    var hs = document.querySelectorAll("[data-fav]");
    for (var i = 0; i < hs.length; i++) {
      hs[i].setAttribute("aria-pressed", favIndex(hs[i].dataset.artist + "|" + hs[i].dataset.song) > -1 ? "true" : "false");
    }
    var cnt = document.getElementById("favCount");
    cnt.textContent = favs.length ? favs.length : "";
    document.querySelector(".fav-link").classList.toggle("has-favs", favs.length > 0);
    renderPlaylist();
  }

  // ---------- baris lagu (dipakai halaman Mood dan Playlist)
  function rowHtml(t, a, k, i) {
    var on = favIndex(a + "|" + t) > -1;
    var at = 'data-song="' + t + '" data-artist="' + a + '" data-k="' + k + '"';
    return '<li class="song-row t-' + k + '" data-pkey="' + a + '|' + t + '" style="--i:' + i + '">' +
      '<div class="pic p-' + k + '" role="img" aria-label="' + a + '"></div>' +
      '<div><b>' + t + '</b><small>' + a + '</small></div>' +
      '<button class="heart" type="button" data-fav ' + at + ' aria-pressed="' + on + '" aria-label="Simpan ' + t + ' ke playlist">' + HEART + '</button>' +
      '<a class="round" href="https://open.spotify.com/search/' + encodeURIComponent(a + " " + t) + '" target="_blank" rel="noopener" data-play ' + at + ' aria-label="Play ' + t + ' on Spotify">' +
      '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 0.5v9l8-4.5z"/></svg></a></li>';
  }

  var PLAYLISTS = {"semangat": "0bpEWLJrzoXJXHT9mBb67L", "santai": "6y7biKAnGkkS7XnsEY7VbV", "romantis": "0pWgtZtw92erHUUmCcXDxQ", "galau": "1kNQ6gdb0imG26LemJi1lg"};
  function renderMood(name, shuffle) {
    var m = MOODS[name];
    if (!m) { return; }
    currentMood = name;
    var songs = m.songs.slice();
    if (shuffle) {
      for (var i = songs.length - 1; i > 0; i--) {
        var r = Math.floor(Math.random() * (i + 1)), t = songs[i];
        songs[i] = songs[r]; songs[r] = t;
      }
    }
    document.getElementById("moodPanel").style.setProperty("--m", m.color);
    document.getElementById("moodHead").innerHTML =
      '<h2 class="mood-title">' + m.label + ' <span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span></h2><p class="mood-tag">' + m.tag + '</p>' +
      '<button class="chip shuffle" type="button">Acak urutan</button> <button class="chip surprise" type="button">Kejutkan aku</button>' +
      (PLAYLISTS[name] ? '<p><a class="button playlist-btn" href="https://open.spotify.com/playlist/' + PLAYLISTS[name] + '" target="_blank" rel="noopener">Buka playlist ' + m.label + ' di Spotify</a></p>' : "");
    var html = "";
    for (var j = 0; j < songs.length; j++) { html += rowHtml(songs[j][0], songs[j][1], songs[j][2], j); }
    document.getElementById("songList").innerHTML = html;
    var chips = document.querySelectorAll("#mood .chips .chip");
    for (var c = 0; c < chips.length; c++) {
      chips[c].setAttribute("aria-pressed", chips[c].dataset.mood === name ? "true" : "false");
    }
  }

  function renderPlaylist() {
    var html = "";
    for (var i = 0; i < favs.length; i++) { html += rowHtml(favs[i].t, favs[i].a, favs[i].k, Math.min(i, 8)); }
    document.getElementById("plList").innerHTML = html;
    document.getElementById("plEmpty").hidden = favs.length > 0;
  }

  // ---------- tema terang / gelap
  var themeBtn = document.getElementById("themeBtn");
  function setTheme(t, save) {
    document.documentElement.setAttribute("data-theme", t);
    if (save) { lsSet("soundcorner:theme", t); }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.setAttribute("content", t === "dark" ? "#0F0E1F" : "#F1F0F6"); }
    themeBtn.setAttribute("aria-label", t === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap");
  }

  // ---------- warna aksen
  function setAccent(k, save) {
    var r = document.documentElement.style;
    var de = document.documentElement;
    if (k === "default" || !k) { de.removeAttribute("data-accent"); r.removeProperty("--accent"); r.removeProperty("--accent-text"); }
    else { de.setAttribute("data-accent", k); r.setProperty("--accent", "var(--" + k + ")"); r.setProperty("--accent-text", "var(--on-a)"); }
    var sws = document.querySelectorAll(".accent-menu [data-accent]");
    for (var s = 0; s < sws.length; s++) { sws[s].setAttribute("aria-pressed", sws[s].dataset.accent === (k || "default") ? "true" : "false"); }
    if (save) { lsSet("soundcorner:accent", k); document.getElementById("accentMenu").hidden = true; }
  }

  // ---------- pindah halaman
  function showPage(name) {
    current = name;
    for (var i = 0; i < pages.length; i++) {
      document.getElementById(pages[i]).classList.toggle("show", pages[i] === name);
    }
    var links = document.querySelectorAll(".menu a");
    for (var j = 0; j < links.length; j++) {
      var on = links[j].dataset.page === name;
      links[j].classList.toggle("active", on);
      if (on) { links[j].setAttribute("aria-current", "page"); }
      else { links[j].removeAttribute("aria-current"); }
    }
    document.querySelector(".fav-link").classList.toggle("active", name === "playlist");
    window.scrollTo(0, 0);
  }

  function go(name) {
    if (busy) { return; }
    if (name === current) { window.scrollTo(0, 0); return; }
    if (reduce) { showPage(name); return; }
    busy = true;
    wipe.className = "wipe in";
    setTimeout(function () { showPage(name); wipe.className = "wipe out"; }, 520);
    setTimeout(function () { wipe.className = "wipe"; busy = false; }, 1100);
  }

  // elemen yang naik satu per satu saat halaman dibuka
  var riseSel = "#home .hero > *, #home .section, .page-head, #artists .grid2 > *, #albums .grid2 > *, " +
    "#mood .chips, #mood .mood-panel, #playlist .pl-panel, #news .news-item, #about .about-block";
  var riseEls = document.querySelectorAll(riseSel), counts = {};
  for (var q = 0; q < riseEls.length; q++) {
    var pid = riseEls[q].closest(".page").id;
    counts[pid] = (counts[pid] || 0);
    riseEls[q].classList.add("rise");
    riseEls[q].style.setProperty("--i", Math.min(counts[pid], 7));
    counts[pid]++;
  }

  // ---------- efek klik: not balok beterbangan + riak / putar cover
  function burst(el, x, y, n) {
    if (reduce) { return; }
    if (!x && !y) {
      var r0 = el.getBoundingClientRect();
      x = r0.left + r0.width / 2; y = r0.top + r0.height / 2;
    }
    var color = getComputedStyle(el).getPropertyValue("--a").trim() || "currentColor";
    var glyphs = ["♪", "♫", "♬", "♩"];
    for (var i = 0; i < n; i++) {
      var note = document.createElement("span");
      note.className = "note";
      note.textContent = glyphs[i % glyphs.length];
      note.style.left = x + "px";
      note.style.top = y + "px";
      note.style.color = color;
      note.style.fontSize = (16 + Math.random() * 20) + "px";
      document.body.appendChild(note);
      var ang = Math.random() * Math.PI * 2, dist = 70 + Math.random() * 100;
      var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 50;
      var a = note.animate([
        { transform: "translate(-50%, -50%) scale(.4) rotate(0deg)", opacity: 1 },
        { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(1.1) rotate(" + ((Math.random() - .5) * 140) + "deg)", opacity: 0 }
      ], { duration: 900 + Math.random() * 400, easing: "cubic-bezier(.2, .8, .2, 1)" });
      a.onfinish = (function (node) { return function () { node.remove(); }; })(note);
    }
  }

  function artistFx(card, e) {
    if (reduce) { return; }
    var frame = card.querySelector(".frame");
    var rect = frame.getBoundingClientRect();
    var x = e && e.clientX ? e.clientX : rect.left + rect.width / 2;
    var y = e && e.clientY ? e.clientY : rect.top + rect.height / 2;
    var rip = document.createElement("span");
    rip.className = "ripple";
    rip.style.left = (x - rect.left) + "px";
    rip.style.top = (y - rect.top) + "px";
    frame.appendChild(rip);
    setTimeout(function () { rip.remove(); }, 850);
    frame.classList.remove("punch");
    void frame.offsetWidth;
    frame.classList.add("punch");
    burst(card, x, y, 12);
  }

  function albumFx(wrap, e) {
    if (reduce) { return; }
    wrap.classList.remove("flip");
    void wrap.offsetWidth;
    wrap.classList.add("flip");
    setTimeout(function () { wrap.classList.remove("flip"); }, 950);
    var card = wrap.closest(".album-card");
    var rect = wrap.getBoundingClientRect();
    burst(card, rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
  }

  // ---------- suara klik (dibuat langsung dengan Web Audio, tanpa file)
  var actx = null, soundOn = lsGet("soundcorner:sound") !== "off";
  function ac() {
    if (!actx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) { return null; } actx = new C(); }
    if (actx.state === "suspended") { actx.resume(); }
    return actx;
  }
  function note(f, at, d, type, v) {
    var a = ac(); if (!a) { return; }
    var t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v || 0.07, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + 0.03);
  }
  function seq(fs, gap, d, type, v) { for (var i = 0; i < fs.length; i++) { note(fs[i], i * gap, d, type, v); } }
  var ARTIST_NOTE = { daniel: 392, justin: 523, ariana: 659, taylor: 784 };
  var SFX = {
    tap:    function () { note(660, 0, 0.09, "sine", 0.05); },
    nav:    function () { seq([392, 523], 0.05, 0.14, "triangle", 0.06); },
    on:     function () { seq([784, 1047], 0.07, 0.18, "sine", 0.06); },
    off:    function () { seq([659, 494], 0.07, 0.16, "sine", 0.05); },
    play:   function () { seq([523, 659, 784], 0.06, 0.2, "triangle", 0.06); },
    album:  function () { seq([523, 659, 784, 1047], 0.06, 0.28, "sine", 0.05); },
    accent: function () { seq([740, 988], 0.05, 0.12, "sine", 0.05); },
    dark:   function () { seq([392, 294], 0.08, 0.2, "sine", 0.06); },
    light:  function () { seq([523, 698], 0.08, 0.2, "sine", 0.06); }
  };
  function sfx(n, k) {
    if (!soundOn) { return; }
    if (n === "artist") { var f = ARTIST_NOTE[k] || 523; note(f, 0, 0.35, "sine", 0.07); note(f * 2, 0.04, 0.25, "sine", 0.03); return; }
    if (SFX[n]) { SFX[n](); }
  }
  function syncSound() {
    var b = document.getElementById("soundToggle");
    if (b) { b.setAttribute("aria-pressed", soundOn ? "true" : "false"); }
  }
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.closest("#soundToggle")) { return; }
    var f = t.closest("[data-fav]");
    if (f) { sfx(f.getAttribute("aria-pressed") === "true" ? "off" : "on"); return; }
    if (t.closest("[data-play]")) { sfx("play"); return; }
    var ar = t.closest(".artist");
    if (ar) { var m = /t-(daniel|justin|ariana|taylor)/.exec(ar.className); sfx("artist", m && m[1]); return; }
    if (t.closest(".album-card .cover-wrap")) { sfx("album"); return; }
    if (t.closest(".accent-menu [data-accent]")) { sfx("accent"); return; }
    if (t.closest("#themeBtn")) { sfx(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"); return; }
    if (t.closest("[data-page]")) { sfx("nav"); return; }
    if (t.closest(".chip, .shuffle, .surprise, #accentBtn, #toTop")) { sfx("tap"); }
  }, true);

  // ---------- Play on Spotify: buka aplikasi Spotify langsung di hasil cari lagunya
  var IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  document.addEventListener("click", function (e) {
    var l = e.target.closest("[data-play]");
    if (!l || !l.getAttribute("data-song")) { return; }
    e.preventDefault();
    var q = l.getAttribute("data-artist") + " " + l.getAttribute("data-song"), web = l.href;
    function openWeb() { var w = window.open(web, "_blank"); if (w) { try { w.opener = null; } catch (er) {} } else { window.location.href = web; } }
    if (!IS_MOBILE) { openWeb(); return; }
    var left = false;
    function onVis() { if (document.hidden) { left = true; } }
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onVis);
    window.location.href = "spotify:search:" + encodeURIComponent(q);
    setTimeout(function () {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onVis);
      if (!left && !document.hidden) { openWeb(); }
    }, 1500);
  });

  // ---------- efek wow: hitung angka + muncul saat di-scroll
  (function () {
    var total = 0, mk; for (mk in MOODS) { total += MOODS[mk].songs.length; }
    var sg = document.getElementById("statSongs"); if (sg) { sg.setAttribute("data-n", total); }
    var done = false;
    function setAll() { var ns = document.querySelectorAll("#stats b"); for (var i = 0; i < ns.length; i++) { ns[i].textContent = ns[i].getAttribute("data-n"); } }
    function countUp() {
      if (done) { return; } done = true;
      var ns = document.querySelectorAll("#stats b"), t0 = null;
      function step(t) {
        if (t0 === null) { t0 = t; }
        var p = Math.min((t - t0) / 1200, 1), e = 1 - Math.pow(1 - p, 3);
        for (var i = 0; i < ns.length; i++) { ns[i].textContent = Math.round(ns[i].getAttribute("data-n") * e); }
        if (p < 1) { requestAnimationFrame(step); }
      }
      requestAnimationFrame(step);
    }
    var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || calm) { setAll(); return; }
    document.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) {
        if (es[i].isIntersecting) { es[i].target.classList.add("in"); io.unobserve(es[i].target); if (es[i].target.id === "stats") { countUp(); } }
      }
    }, { threshold: 0.12 });
    var els = document.querySelectorAll(".page .section, #stats");
    for (var k = 0; k < els.length; k++) { els[k].classList.add("reveal"); io.observe(els[k]); }
  })();

  // ---------- efek: latar ikut artis, kartu miring 3D, equalizer, tombol ke atas
  (function () {
    var amb = document.getElementById("ambient"), ambT = null;
    function ambOff() { amb.classList.remove("on"); }
    document.addEventListener("pointerover", function (e) {
      var c = e.target.closest(".artist, .album-card"); if (!c) { return; }
      var col = getComputedStyle(c).getPropertyValue("--a").trim(); if (!col) { return; }
      amb.style.setProperty("--amb", col); amb.classList.add("on"); clearTimeout(ambT);
      if (e.pointerType === "touch") { ambT = setTimeout(ambOff, 1800); }
    });
    document.addEventListener("pointerout", function (e) {
      var c = e.target.closest(".artist, .album-card");
      if (c && !c.contains(e.relatedTarget)) { ambOff(); }
    });

    var TILT = ".album-card .cover-wrap, .artist .frame";
    function tilt(e) {
      var el = e.target.closest(TILT); if (!el) { return; }
      if (e.pointerType === "touch" && e.type === "pointermove") { return; }
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", (x * 16).toFixed(1) + "deg"); el.style.setProperty("--rx", (-y * 16).toFixed(1) + "deg");
    }
    function untilt(e) {
      var el = e.target.closest ? e.target.closest(TILT) : null; if (!el) { return; }
      el.style.removeProperty("--rx"); el.style.removeProperty("--ry");
    }
    document.addEventListener("pointermove", tilt); document.addEventListener("pointerdown", tilt);
    document.addEventListener("pointerup", untilt); document.addEventListener("pointercancel", untilt);
    document.addEventListener("pointerout", function (e) {
      var el = e.target.closest(TILT); if (el && !el.contains(e.relatedTarget)) { untilt(e); }
    });

    var eqRow = null, eqT = null, EQ = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
    function eqClear() { if (eqRow) { var o = eqRow.querySelector(".eq"); if (o) { o.remove(); } eqRow = null; } }
    document.addEventListener("click", function (e) {
      var p = e.target.closest(".song-row [data-play]"); if (!p) { return; }
      var row = p.closest(".song-row"), b = row.querySelector("b");
      eqClear(); if (b) { b.insertAdjacentHTML("beforeend", EQ); eqRow = row; }
      clearTimeout(eqT); eqT = setTimeout(eqClear, 7000);
    });

    var tt = document.getElementById("toTop"), tick = false;
    var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.addEventListener("scroll", function () {
      if (tick) { return; } tick = true;
      requestAnimationFrame(function () { tt.classList.toggle("show", window.scrollY > 600); tick = false; });
    }, { passive: true });
    tt.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" }); });
  })();

  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("artist")) {
      e.preventDefault();
      artistFx(e.target, null);
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest(".shuffle")) { renderMood(currentMood, true); return; }
    if (e.target.closest(".surprise")) {
      var ks = Object.keys(MOODS), pick = ks[Math.floor(Math.random() * ks.length)];
      renderMood(pick, true); return;
    }
    if (e.target.closest("#soundToggle")) {
      soundOn = !soundOn; lsSet("soundcorner:sound", soundOn ? "on" : "off"); syncSound(); sfx("tap"); return;
    }
    var sw = e.target.closest(".accent-menu [data-accent]");
    if (sw) { setAccent(sw.dataset.accent, true); return; }
    if (e.target.closest("#accentBtn")) { var mn = document.getElementById("accentMenu"); mn.hidden = !mn.hidden; return; }
    if (!e.target.closest("#accentMenu")) { document.getElementById("accentMenu").hidden = true; }

    var fav = e.target.closest("[data-fav]");
    if (fav) {
      fav.classList.remove("pop");
      void fav.offsetWidth;
      fav.classList.add("pop");
      toggleFav(fav.dataset.song, fav.dataset.artist, fav.dataset.k);
      return;
    }

    var art = e.target.closest(".artist");
    if (art) { artistFx(art, e); return; }
    var cov = e.target.closest(".album-card .cover-wrap");
    if (cov) { albumFx(cov, e); return; }

    if (e.target.closest("#themeBtn")) {
      setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
      return;
    }

    var el = e.target.closest("[data-mood], [data-page]");
    if (!el) { return; }
    e.preventDefault();
    if (el.dataset.mood) { renderMood(el.dataset.mood); }
    if (el.dataset.page) { go(el.dataset.page); }
  });

  // mulai
  setTheme(document.documentElement.getAttribute("data-theme") || "light", false);
  setAccent(lsGet("soundcorner:accent") || "default", false);
  renderMood("santai");
  syncFavs();
  syncSound();
  showPage("home");

  // animasi cover hanya sekali saat pertama dibuka
  setTimeout(function () { document.body.classList.remove("intro"); }, 2800);
