document.addEventListener("DOMContentLoaded", () => {
  const filters = document.querySelectorAll(".filter");

  filters.forEach(filter => {
    filter.addEventListener("click", () => {
      const category = filter.innerText.trim();
      window.location.href = `/listings/category/${category}`;
    });
  });
});




