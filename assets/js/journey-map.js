// Floating map that follows the Journey page's timeline as you scroll,
// flying between real coordinates and drawing an animated flight arc for
// each transition. Only runs when .journey-map-panel is actually visible
// (CSS hides it below a width threshold) - checked via computed style
// rather than duplicating that breakpoint number here.
document.addEventListener("DOMContentLoaded", function () {
  var panel = document.querySelector(".journey-map-panel");
  var mapEl = document.getElementById("journey-map");
  if (!panel || !mapEl || typeof L === "undefined") {
    return;
  }
  if (window.getComputedStyle(panel).display === "none") {
    return;
  }

  var points = Array.prototype.map.call(
    document.querySelectorAll(".journey-point"),
    function (el) {
      return {
        lat: parseFloat(el.getAttribute("data-lat")),
        lng: parseFloat(el.getAttribute("data-lng")),
        place: el.getAttribute("data-place"),
        el: el,
      };
    }
  );

  if (!points.length) {
    return;
  }

  var map = L.map("journey-map", {
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: false,
  }).setView([points[0].lat, points[0].lng], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 12,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  function makeMarker(point, active) {
    var icon = L.divIcon({
      className: "journey-marker" + (active ? " journey-marker-active" : ""),
      iconSize: [12, 12],
    });
    return L.marker([point.lat, point.lng], { icon: icon, title: point.place }).addTo(map);
  }

  function setMarkerActive(marker, active) {
    var el = marker.getElement();
    if (el) {
      el.classList.toggle("journey-marker-active", active);
    }
  }

  // A gentle arc between two points rather than a straight line, echoing a
  // flight path. Offsets the midpoint perpendicular to the great-line by a
  // fraction of the distance between the two points.
  function arcPoints(from, to, steps) {
    var midLat = (from.lat + to.lat) / 2;
    var midLng = (from.lng + to.lng) / 2;
    var dx = to.lng - from.lng;
    var dy = to.lat - from.lat;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var offset = Math.min(dist * 0.15, 6);
    var controlLat = midLat + offset * (dx === 0 ? 1 : dx / dist) * -1;
    var controlLng = midLng + offset * (dy === 0 ? 1 : dy / dist);

    var pts = [];
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var lat =
        (1 - t) * (1 - t) * from.lat + 2 * (1 - t) * t * controlLat + t * t * to.lat;
      var lng =
        (1 - t) * (1 - t) * from.lng + 2 * (1 - t) * t * controlLng + t * t * to.lng;
      pts.push([lat, lng]);
    }
    return pts;
  }

  function animateFlight(from, to) {
    var steps = 40;
    var fullPath = arcPoints(from, to, steps);
    var line = L.polyline([], { color: "#0288d1", weight: 2.5, opacity: 0.85 }).addTo(map);

    var i = 0;
    var revealMs = 900;
    var start = null;

    function frame(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / revealMs, 1);
      var count = Math.floor(progress * steps);
      line.setLatLngs(fullPath.slice(0, count + 1));
      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }
    requestAnimationFrame(frame);
  }

  var activeIndex = 0;
  var maxVisitedIndex = 0;
  var markers = new Array(points.length);
  markers[0] = makeMarker(points[0], true);

  var pendingIndex = null;
  var debounceTimer = null;

  // Camera movement (pan/zoom) always happens, both directions - scrolling
  // back up re-visits an earlier location. The arc itself is only ever
  // drawn once per segment, the first time genuinely new forward ground is
  // covered, anchored to the furthest point reached so far rather than
  // wherever the camera currently happens to be - so re-tracing already
  // -covered ground (in either direction) never redraws a route.
  function goTo(index) {
    if (index === activeIndex) return;
    var to = points[index];

    setMarkerActive(markers[activeIndex], false);
    if (!markers[index]) {
      markers[index] = makeMarker(to, true);
    } else {
      setMarkerActive(markers[index], true);
    }

    map.flyTo([to.lat, to.lng], 5, { duration: 1.3 });

    if (index > maxVisitedIndex) {
      animateFlight(points[maxVisitedIndex], to);
      maxVisitedIndex = index;
    }

    activeIndex = index;
  }

  // Scrolling can cross several points at once (fast scroll, or a restored
  // scroll position on load) - debounce so only the final settled point
  // triggers a single transition, instead of each one stomping the last.
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = points.findIndex(function (p) {
          return p.el === entry.target;
        });
        if (index === -1) return;
        pendingIndex = index;
      });

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        if (pendingIndex !== null) {
          goTo(pendingIndex);
          pendingIndex = null;
        }
      }, 150);
    },
    { threshold: 0, rootMargin: "-40% 0px -40% 0px" }
  );

  points.forEach(function (p) {
    observer.observe(p.el);
  });
});
