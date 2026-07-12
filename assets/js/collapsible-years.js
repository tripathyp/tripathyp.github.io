document.addEventListener('DOMContentLoaded', function() {
  var collapsibleHeaders = document.querySelectorAll('.collapsible-header');
  var currentYear = String(new Date().getFullYear());

  collapsibleHeaders.forEach(function(header) {
    // Add click event listener to each header
    header.addEventListener('click', function() {
      // Toggle 'active' class on the header
      this.classList.toggle('active');

      // Find the immediate next sibling which should be the collapsible content
      var content = this.nextElementSibling;

      // Ensure it's the correct content div
      if (content && content.classList.contains('collapsible-content')) {
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      }
    });

    // Initialize: expand the current year by default, collapse the rest
    // We expect the 'collapsible-content' div to be the immediate sibling
    var initialContent = header.nextElementSibling;
    if (initialContent && initialContent.classList.contains('collapsible-content')) {
        if (header.id === currentYear) {
            header.classList.add('active');
            initialContent.style.display = "block";
        } else {
            initialContent.style.display = "none";
        }
    }
  });
});
