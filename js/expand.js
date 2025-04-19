// expand.js
function attachExpandableListeners() {
  const expandableHeaders = document.querySelectorAll('.expandable-header');

  expandableHeaders.forEach(header => {
    // Avoid attaching duplicate listeners
    if (!header.dataset.listenerAttached) {
      header.addEventListener('click', function () {
        const section = header.closest('.expandable-section');
        const content = section.querySelector('.expandable-content');
        const toggle = section.querySelector('.expandable-toggle');

        section.classList.toggle('expanded');
        toggle.textContent = section.classList.contains('expanded') ? '−' : '+';
        content.style.display = section.classList.contains('expanded') ? 'block' : 'none';
      });
      header.dataset.listenerAttached = 'true';
    }
  });
}

// Run on initial load (for static content)
document.addEventListener('DOMContentLoaded', attachExpandableListeners);
