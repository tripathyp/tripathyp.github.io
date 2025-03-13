document.addEventListener("DOMContentLoaded", function() {
  // Copy code functionality
  document.querySelectorAll('.copy-btn').forEach(function(button) {
    button.addEventListener('click', function() {
      const codeBlock = button.previousElementSibling.innerText;
      navigator.clipboard.writeText(codeBlock).then(function() {
        button.innerText = "Copied!";
        setTimeout(() => {
          button.innerText = "Copy Code";
        }, 2000);
      });
    });
  });

  // Section navigation functionality
  const sections = document.querySelectorAll('.book-section');
  let currentSection = 0;

  function showSection(index) {
    sections.forEach((section, i) => {
      section.style.display = (i === index) ? "block" : "none";
    });
  }

  // Show the first section on page load
  showSection(currentSection);

  // "Previous" button
  const prevBtn = document.getElementById('prev-section');
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      if (currentSection > 0) {
        currentSection--;
        showSection(currentSection);
      }
    });
  }

  // "Next" button
  const nextBtn = document.getElementById('next-section');
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      if (currentSection < sections.length - 1) {
        currentSection++;
        showSection(currentSection);
      }
    });
  }
});
