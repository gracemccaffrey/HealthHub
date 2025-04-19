document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    // Toggle the mobile menu and the hamburger/X icon
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      
      // Toggle between hamburger and X
      if (mobileMenu.classList.contains('active')) {
        hamburger.innerHTML = '&times;'; // Change to X
      } else {
        hamburger.innerHTML = '&#9776;'; // Change back to hamburger
      }
    });

    // Close the mobile menu when a link is clicked
    document.querySelectorAll('.mobile-menu a').forEach(link =>
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        hamburger.innerHTML = '&#9776;'; // Reset hamburger to its original state
      })
    );
  }
});
