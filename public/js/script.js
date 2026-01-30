// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

document.addEventListener("DOMContentLoaded", () => {

  // ================= LINE CLAMP =================
  function initializeLineClamp() {
    const listingTitles = document.querySelectorAll('.listing-title');

    const testEl = document.createElement('div');
    testEl.style.cssText = 'display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;';
    const supportsLineClamp = 'webkitLineClamp' in testEl.style;

    listingTitles.forEach(title => {
      const originalText = title.getAttribute('data-text') || title.textContent;

      if (supportsLineClamp) {
        title.style.display = '-webkit-box';
        title.style.webkitLineClamp = '2';
        title.style.webkitBoxOrient = 'vertical';
        title.style.overflow = 'hidden';
      } else {
        if (originalText.length > 70) {
          title.textContent = originalText.substring(0, 70) + "...";
          title.title = originalText;
        }
      }
    });
  }
  initializeLineClamp();


  // ================= WISHLIST (ONLY ONE HANDLER) =================
  const wishlistButtons = document.querySelectorAll(".wishlist-btn");

  wishlistButtons.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const listingId = btn.dataset.id;

      try {
        const res = await fetch(`/wishlist/${listingId}`, {
          method: "POST",
          headers: { "Accept": "application/json" }
        });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        if (data.success) {
          btn.classList.toggle("active");
        }
      } catch (err) {
        console.error("Wishlist error:", err);
      }
    });
  });


  // ================= TAX TOGGLE =================
  const taxSwitch = document.getElementById("switchCheckDefault");
  if (taxSwitch) {
    const taxInfos = document.querySelectorAll(".tax-info");

    function updateTax() {
      taxInfos.forEach(info => {
        info.style.display = taxSwitch.checked ? "inline" : "none";
      });
    }

    updateTax();
    taxSwitch.addEventListener("change", updateTax);
  }


  // ================= FILTER SYSTEM - CORRECTED =================
  const filters = document.querySelectorAll(".filter[data-filter]");
  const currentLocationSpan = document.getElementById("current-location");
  const noResults = document.getElementById("no-results");
  const listingCards = document.querySelectorAll('#listings-grid .col');
  const listingsGrid = document.getElementById('listings-grid');

  filters.forEach(filter => {
    filter.addEventListener("click", () => {
      filters.forEach(f => f.classList.remove("active"));
      filter.classList.add("active");

      const filterCategory = filter.dataset.filter;
      const filterText = filter.querySelector("p").textContent;
      currentLocationSpan.textContent = filterText === "Trending" ? "All Locations" : filterText;

      let visibleCount = 0;

      listingCards.forEach(card => {
        const cardCategory = card.dataset.category;

        if (filterCategory === "all" || cardCategory === filterCategory) {
          card.style.display = "block";
          visibleCount++;
        } else {
          card.style.display = "none";
        }
      });

      if (visibleCount === 0) {
        listingsGrid.style.display = "none";
        noResults.style.display = "block";
      } else {
        listingsGrid.style.display = ""; // ✅ FIXED: Empty string to remove inline style
        noResults.style.display = "none";
      }
    });
  });


  // ================= IMAGE FADE LOAD =================
  const images = document.querySelectorAll('.listing-image');
  images.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    img.onload = () => img.style.opacity = '1';
    if (img.complete) img.style.opacity = '1';
  });


  // ================= SMOOTH SCROLL =================
  const exploreButton = document.querySelector('a[href="#listings"]');
  if (exploreButton) {
    exploreButton.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('listings').scrollIntoView({ behavior: 'smooth' });
    });
  }

});
