// Tap-to-flip fallback for touch devices where :hover doesn't behave reliably
document.addEventListener('DOMContentLoaded', function () {
  var cards = document.querySelectorAll('.flip-card');
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.toggle('flipped');
    });
  });
});
