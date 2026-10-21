(function () {
  "use strict";

  var D = window.EVENT_DATA;
  var E = D.event;
  var $ = function (sel) { return document.querySelector(sel); };

  // "?now=2026-10-22T10:00" permet de simuler une date pour les tests.
  var nowParam = new URLSearchParams(location.search).get("now");
  var NOW = nowParam ? new Date(nowParam) : new Date();

  var venueIndex = {};
  D.venues.forEach(function (v, i) { v.num = i + 1; venueIndex[v.id] = v; });

  var state = { day: null, venue: "", type: "", selectedVenue: null };

  /* ---------- Utilitaires ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function parseDay(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function isoDay(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function fmt(d, opts) { return d.toLocaleDateString("fr-FR", opts); }
  function hm(t) { return t ? t.replace(":", " h ").replace(/ h 00$/, " h") : ""; }
  function minutes(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }

  var days = [];
  for (var d = parseDay(E.start); d <= parseDay(E.end); d.setDate(d.getDate() + 1)) days.push(isoDay(d));
  var today = isoDay(NOW);
  var isDuring = days.indexOf(today) !== -1;

  function dateRangeLabel() {
    var s = parseDay(E.start), e = parseDay(E.end);
    return s.getDate() + "–" + e.getDate() + " " + fmt(e, { month: "long", year: "numeric" });
  }
  function directionsUrl(v) {
    var dest = (v.lat != null && v.lng != null) ? v.lat + "," + v.lng : v.address;
    return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(dest);
  }
  function sessionsFor(filter) {
    return D.sessions.filter(filter).sort(function (a, b) {
      return a.day === b.day ? a.start.localeCompare(b.start) : a.day.localeCompare(b.day);
    });
  }
  function emptyBlock(title, text) {
    return '<div class="empty"><strong>' + esc(title) + "</strong>" + esc(text) + "</div>";
  }
  function pin(v) { return '<span class="pin" aria-hidden="true">' + v.num + "</span>"; }

  /* ---------- Accueil ---------- */
  function renderHome() {
    $("#hero-kicker").textContent = E.edition + (E.organiser ? " · " + E.organiser : "");
    $("#hero-title").textContent = E.name + " " + E.year;
    $("#hero-meta").textContent = dateRangeLabel() + " · " + E.city;
    $("#hero-intro").textContent = E.intro;

    var icons = {
      cal: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
      pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
      info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>'
    };
    var progLabel = isDuring ? "Programme du jour" : "Programme";
    var progSub = isDuring
      ? fmt(NOW, { weekday: "long", day: "numeric", month: "long" })
      : "Les " + days.length + " journées, heure par heure";
    $("#quick").innerHTML =
      '<a href="#programme' + (isDuring ? "/" + today : "") + '"' + (isDuring ? ' class="is-today"' : "") + ">" +
        '<span class="quick__icon">' + icons.cal + "</span><span><strong>" + progLabel + "</strong><small>" + esc(progSub) + "</small></span></a>" +
      '<a href="#lieux"><span class="quick__icon">' + icons.pin + "</span><span><strong>Lieux &amp; carte</strong><small>Adresses et itinéraires</small></span></a>" +
      '<a href="#infos"><span class="quick__icon">' + icons.info + "</span><span><strong>Infos pratiques</strong><small>Accès, consignes, contacts</small></span></a>";

    $("#themes").innerHTML = E.themes.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    $("#themes-block").hidden = !E.themes.length;
  }

  /* ---------- Programme ---------- */
  function renderDays() {
    $("#days").innerHTML = days.map(function (iso) {
      var dt = parseDay(iso);
      return '<button class="day" role="tab" data-day="' + iso + '" aria-selected="' + (iso === state.day) + '">' +
        "<span>" + fmt(dt, { weekday: "long" }) + (iso === today ? '<em class="today">auj.</em>' : "") + "</span>" +
        "<strong>" + fmt(dt, { day: "numeric", month: "short" }) + "</strong></button>";
    }).join("");
  }

  function renderFilters() {
    var usedTypes = {}, usedVenues = {};
    D.sessions.forEach(function (s) { usedTypes[s.type] = 1; usedVenues[s.venue] = 1; });
    var venueOpts = D.venues.filter(function (v) { return usedVenues[v.id]; });
    var typeOpts = Object.keys(D.types).filter(function (k) { return usedTypes[k]; });
    var html = "";
    if (venueOpts.length > 1) {
      html += '<label>Lieu<select id="f-venue"><option value="">Tous les lieux</option>' +
        venueOpts.map(function (v) {
          return '<option value="' + esc(v.id) + '"' + (state.venue === v.id ? " selected" : "") + ">" + v.num + ". " + esc(v.name) + "</option>";
        }).join("") + "</select></label>";
    }
    if (typeOpts.length > 1) {
      html += '<label>Type<select id="f-type"><option value="">Tous les types</option>' +
        typeOpts.map(function (k) {
          return '<option value="' + k + '"' + (state.type === k ? " selected" : "") + ">" + esc(D.types[k]) + "</option>";
        }).join("") + "</select></label>";
    }
    $("#filters").innerHTML = html;
    $("#filters").hidden = !html;
  }

  function sessionStatus(s) {
    if (s.day !== today) return s.day < today ? "past" : "";
    var n = NOW.getHours() * 60 + NOW.getMinutes();
    var start = minutes(s.start), end = s.end ? minutes(s.end) : start + 60;
    if (n >= start && n < end) return "now";
    return n >= end ? "past" : "";
  }

  function renderTimeline() {
    $("#prog-sub").textContent = fmt(parseDay(state.day), { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " · " + E.city;

    if (!D.sessions.length) {
      $("#timeline").innerHTML = "<li>" + emptyBlock("Programme détaillé à venir", "Les horaires, sessions et lieux seront publiés ici dès leur confirmation.") + "</li>";
      return;
    }
    var list = sessionsFor(function (s) {
      return s.day === state.day && (!state.venue || s.venue === state.venue) && (!state.type || s.type === state.type);
    });
    if (!list.length) {
      $("#timeline").innerHTML = "<li>" + emptyBlock("Aucun événement", "Aucun événement ne correspond à ces critères pour cette journée.") + "</li>";
      return;
    }
    $("#timeline").innerHTML = list.map(function (s) {
      var v = venueIndex[s.venue];
      var st = sessionStatus(s);
      return '<li class="session' + (st ? " is-" + st : "") + '">' +
        '<div class="session__time">' + esc(hm(s.start)) + (s.end ? "<small>" + esc(hm(s.end)) + "</small>" : "") + "</div>" +
        "<div>" +
          (D.types[s.type] ? '<span class="badge">' + esc(D.types[s.type]) + "</span>" : "") +
          (st === "now" ? '<span class="badge badge--now">En cours</span>' : "") +
          "<h3>" + esc(s.title) + "</h3>" +
          (s.description ? "<p>" + esc(s.description) + "</p>" : "") +
          (v ? '<a class="venue-link" href="#lieux/' + esc(v.id) + '">' + pin(v) + esc(v.name) + "</a>"
             : (s.venue ? '<span class="muted">' + esc(s.venue) + "</span>" : "")) +
        "</div></li>";
    }).join("");
  }

  function renderProgramme() { renderDays(); renderFilters(); renderTimeline(); }

  $("#days").addEventListener("click", function (e) {
    var b = e.target.closest(".day");
    if (b) location.hash = "programme/" + b.dataset.day;
  });
  $("#filters").addEventListener("change", function (e) {
    if (e.target.id === "f-venue") state.venue = e.target.value;
    if (e.target.id === "f-type") state.type = e.target.value;
    renderTimeline();
  });

  /* ---------- Lieux & carte ---------- */
  var map = null, markers = {};

  function initMap() {
    if (map || !window.L) return;
    var located = D.venues.filter(function (v) { return v.lat != null && v.lng != null; });
    map = L.map("map", { scrollWheelZoom: false, tap: true }).setView([48.5734, 7.7521], 13); // Strasbourg
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    located.forEach(function (v) {
      var icon = L.divIcon({ className: "", html: '<div class="marker"><span>' + v.num + "</span></div>", iconSize: [34, 34], iconAnchor: [17, 34] });
      markers[v.id] = L.marker([v.lat, v.lng], { icon: icon, title: v.name, keyboard: true })
        .addTo(map)
        .on("click", function () { location.hash = "lieux/" + v.id; });
    });
    if (located.length > 1) {
      map.fitBounds(L.latLngBounds(located.map(function (v) { return [v.lat, v.lng]; })), { padding: [40, 40] });
    } else if (located.length === 1) {
      map.setView([located[0].lat, located[0].lng], 15);
    }
    $("#map-empty").hidden = located.length > 0;
  }

  function renderVenueList() {
    if (!D.venues.length) {
      $("#venue-list").innerHTML = "<li>" + emptyBlock("Lieux à confirmer", "La liste des lieux et leurs adresses seront publiées ici.") + "</li>";
      return;
    }
    $("#venue-list").innerHTML = D.venues.map(function (v) {
      var n = D.sessions.filter(function (s) { return s.venue === v.id; }).length;
      return '<li><button class="venue-item' + (state.selectedVenue === v.id ? " is-active" : "") + '" data-venue="' + esc(v.id) + '">' +
        pin(v) + "<span><strong>" + esc(v.name) + "</strong><small>" + esc(v.address || "Adresse à confirmer") + "</small>" +
        (n ? "<small>" + n + " événement" + (n > 1 ? "s" : "") + "</small>" : "") + "</span></button></li>";
    }).join("");
  }

  function renderVenuePanel() {
    var v = venueIndex[state.selectedVenue];
    if (!v) {
      $("#venue-panel").innerHTML = D.venues.length
        ? '<div class="card muted">Sélectionnez un lieu sur la carte ou dans la liste.</div>'
        : "";
      return;
    }
    var evs = sessionsFor(function (s) { return s.venue === v.id; });
    var byDay = {};
    evs.forEach(function (s) { (byDay[s.day] = byDay[s.day] || []).push(s); });
    var evHtml = Object.keys(byDay).map(function (day) {
      return "<dt>" + esc(fmt(parseDay(day), { weekday: "long", day: "numeric", month: "long" })) + "</dt><dd><ul>" +
        byDay[day].map(function (s) {
          return "<li><b>" + esc(hm(s.start)) + "</b>" + esc(s.title) + "</li>";
        }).join("") + "</ul></dd>";
    }).join("");

    $("#venue-panel").innerHTML =
      '<div class="card venue-detail">' +
        "<h2>" + pin(v) + esc(v.name) + "</h2>" +
        "<address>" + esc(v.address || "Adresse à confirmer") + "</address>" +
        "<dl>" +
          (v.access ? "<dt>Accès</dt><dd>" + esc(v.access) + "</dd>" : "") +
          (v.info ? "<dt>Informations utiles</dt><dd>" + esc(v.info) + "</dd>" : "") +
          (evHtml || "<dt>Événements</dt><dd class=\"muted\">Programme de ce lieu à venir.</dd>") +
        "</dl>" +
        '<div class="actions">' +
          (v.address || v.lat != null ? '<a class="btn" href="' + directionsUrl(v) + '" target="_blank" rel="noopener">Itinéraire</a>' : "") +
          (evs.length ? '<a class="btn btn--ghost" href="#programme/' + evs[0].day + "/" + esc(v.id) + '">Voir au programme</a>' : "") +
          (v.url ? '<a class="btn btn--ghost" href="' + esc(v.url) + '" target="_blank" rel="noopener">Site du lieu</a>' : "") +
        "</div>" +
      "</div>";
  }

  function selectVenue(id, fly) {
    state.selectedVenue = venueIndex[id] ? id : null;
    Object.keys(markers).forEach(function (k) {
      var el = markers[k].getElement();
      if (el) el.firstChild.classList.toggle("is-active", k === state.selectedVenue);
    });
    var v = venueIndex[state.selectedVenue];
    if (fly && map && v && markers[v.id]) map.setView([v.lat, v.lng], Math.max(map.getZoom(), 15));
    renderVenuePanel();
    renderVenueList();
  }

  $("#venue-list").addEventListener("click", function (e) {
    var b = e.target.closest("[data-venue]");
    if (!b) return;
    location.hash = "lieux/" + b.dataset.venue;
    if (window.matchMedia("(max-width: 899px)").matches) {
      $(".map-card").scrollIntoView({ block: "start" });
    }
  });

  /* ---------- Infos pratiques ---------- */
  function listCard(title, items) {
    return '<div class="card"><h2>' + esc(title) + "</h2><ul>" +
      items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></div>";
  }
  function contactCard(title, contacts) {
    return '<div class="card"><h2>' + esc(title) + '</h2><ul class="kv">' +
      contacts.map(function (c) {
        var val = c.href ? '<a href="' + esc(c.href) + '">' + esc(c.value) + "</a>" : esc(c.value);
        return "<li><span>" + esc(c.label) + "</span>" + val + "</li>";
      }).join("") + "</ul></div>";
  }

  function renderInfos() {
    var P = D.practical, html = "";
    var addressed = D.venues.filter(function (v) { return v.address; });
    if (addressed.length) {
      html += '<div class="card"><h2>Adresses des lieux</h2><ul class="addr-list">' +
        addressed.map(function (v) {
          return "<li>" + pin(v) + '<div><a href="#lieux/' + esc(v.id) + '"><strong>' + esc(v.name) + "</strong></a><br>" +
            esc(v.address) + '<br><a href="' + directionsUrl(v) + '" target="_blank" rel="noopener">Itinéraire</a></div></li>';
        }).join("") + "</ul></div>";
    }
    if (P.transport.length) html += listCard("Accès et transports", P.transport);
    if (P.instructions.length) html += listCard("Consignes aux participants", P.instructions);
    if (P.contacts.length) html += contactCard("Contacts", P.contacts);
    if (E.website) {
      html += '<div class="card"><h2>Organisation</h2><p style="margin:0">' + esc(E.name) + " " + esc(E.year) +
        " est organisée par " + esc(E.organiser) + '.<br><a href="' + esc(E.website) + '" target="_blank" rel="noopener">' +
        esc(E.website.replace(/^https?:\/\//, "").replace(/\/$/, "")) + "</a></p></div>";
    }
    if (!addressed.length && !P.transport.length && !P.instructions.length && !P.contacts.length) {
      html = emptyBlock("Informations pratiques à venir", "Adresses, accès et consignes seront publiés ici dès leur confirmation.") + html;
    }
    $("#infos").innerHTML = html;
  }

  /* ---------- Équipes ---------- */
  function renderTeam() {
    var T = D.team, html = "";
    T.sections.forEach(function (s) { html += listCard(s.title, s.items); });
    if (T.contacts.length) html += contactCard("Contacts coordination", T.contacts);
    $("#team").innerHTML = html || emptyBlock("Consignes à venir", "Les consignes destinées aux équipes seront publiées ici.");
  }

  /* ---------- Pied de page ---------- */
  $("#footer").innerHTML = "<span>" + esc(E.name + " " + E.year) + " · " + esc(dateRangeLabel()) + " · " + esc(E.city) + "</span>" +
    (E.website ? '<a href="' + esc(E.website) + '" target="_blank" rel="noopener">' + esc(E.organiser) + "</a>" : "");

  /* ---------- Routage ---------- */
  var ROUTES = ["accueil", "programme", "lieux", "infos", "equipes"];

  function route() {
    var parts = location.hash.replace(/^#\/?/, "").split("/");
    var view = ROUTES.indexOf(parts[0]) !== -1 ? parts[0] : "accueil";

    document.querySelectorAll(".view").forEach(function (s) { s.hidden = s.dataset.view !== view; });
    document.querySelectorAll("[data-route]").forEach(function (a) {
      if (a.dataset.route === view) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });

    if (view === "programme") {
      if (parts[1] && days.indexOf(parts[1]) !== -1) state.day = parts[1];
      if (parts[2] !== undefined) { state.venue = venueIndex[parts[2]] ? parts[2] : ""; }
      renderProgramme();
    }
    if (view === "lieux") {
      initMap();
      if (map) setTimeout(function () { map.invalidateSize(); selectVenue(parts[1], true); }, 0);
      else selectVenue(parts[1], false);
      if (!window.L) {
        $("#map-empty").hidden = false;
        $("#map-empty").innerHTML = "<p><strong>Carte indisponible</strong><br>Vérifiez votre connexion. La liste des lieux reste accessible ci-dessous.</p>";
      }
    }
    if (route.last !== view) window.scrollTo(0, 0);
    route.last = view;
  }

  state.day = isDuring ? today : days[0];
  renderHome();
  renderInfos();
  renderTeam();
  renderVenueList();
  window.addEventListener("hashchange", route);
  route();
})();
