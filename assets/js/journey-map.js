// Floating map that follows the Journey page's timeline as you scroll,
// flying between real coordinates and drawing an animated flight arc for
// each transition. Only runs on wide screens (matches the CSS breakpoint
// that shows .journey-map-panel) since a live map needs real room to work.
document.addEventListener("DOMContentLoaded", function () {
  var panel = document.querySelector(".journey-map-panel");
  var mapEl = document.getElementById("journey-map");
  if (!panel || !mapEl || window.innerWidth < 1500 || typeof L === "undefined") {
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

  function fadeMarker(marker) {
    var el = marker.getElement();
    if (el) {
      el.classList.remove("journey-marker-active");
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

  var currentIndex = 0;
  var markers = [makeMarker(points[0], true)];

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = points.findIndex(function (p) {
          return p.el === entry.target;
        });
        if (index <= currentIndex) return;

        var from = points[currentIndex];
        var to = points[index];

        fadeMarker(markers[markers.length - 1]);
        map.flyTo([to.lat, to.lng], 5, { duration: 1.3 });
        animateFlight(from, to);
        markers.push(makeMarker(to, true));
        currentIndex = index;
      });
    },
    { threshold: 0, rootMargin: "-40% 0px -40% 0px" }
  );

  points.forEach(function (p) {
    observer.observe(p.el);
  });
});
