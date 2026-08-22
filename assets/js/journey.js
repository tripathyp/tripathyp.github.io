// Reveals each journey stop as it scrolls into view, echoing the page's
// own "travelling down the route" narrative. Respects reduced-motion via CSS.
document.addEventListener("DOMContentLoaded", function () {
  var stops = document.querySelectorAll(".journey-stop");
  if (!("IntersectionObserver" in window) || !stops.length) {
    return;
  }

  stops.forEach(function (stop) {
    stop.classList.add("journey-reveal");
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("journey-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
  );

  stops.forEach(function (stop) {
    observer.observe(stop);
  });
});
