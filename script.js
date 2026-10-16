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
    ceria:    { label: "Ceria",    color: "var(--ceria)", tag: "Lagu yang bikin senyum sendiri.",
      songs: [["Baby","Justin Bieber","justin"],["Love Story","Taylor Swift","taylor"],["thank u, next","Ariana Grande","ariana"],["One Time","Justin Bieber","justin"],["Side to Side","Ariana Grande","ariana"]] },
    romantis: { label: "Romantis", color: "var(--taylor)", tag: "Buat yang lagi jatuh cinta.",
      songs: [["Love Me Harder","Ariana Grande","ariana"],["Just Like Magic","Ariana Grande","ariana"],["Get You","Daniel Caesar","daniel"],["Blessed","Daniel Caesar","daniel"],["Delicate","Taylor Swift","taylor"]] },
    galau:    { label: "Galau",    color: "var(--galau)", tag: "Boleh sedih dulu, ditemenin lagu ini.",
      songs: [["All Too Well","Taylor Swift","taylor"],["Ghost","Justin Bieber","justin"],["ghostin","Ariana Grande","ariana"],["Always","Daniel Caesar","daniel"],["Anti-Hero","Taylor Swift","taylor"]] }
  };

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
      '<h2 class="mood-title">' + m.label + '</h2><p class="mood-tag">' + m.tag + '</p>' +
      '<button class="chip shuffle" type="button">Acak urutan</button>';
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

  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("artist")) {
      e.preventDefault();
      artistFx(e.target, null);
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest(".shuffle")) { renderMood(currentMood, true); return; }

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
  renderMood("santai");
  syncFavs();
  showPage("home");

  // animasi cover hanya sekali saat pertama dibuka
  setTimeout(function () { document.body.classList.remove("intro"); }, 1600);
