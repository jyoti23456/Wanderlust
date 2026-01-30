const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const results = document.getElementById("searchResults");

async function doSearch(query) {
  if (!query) {
    results.innerHTML = "";
    return;
  }

  const res = await fetch(`/listings/search?q=${query}`);
  const data = await res.json();

  if (data.length === 0) {
    results.innerHTML = `<p class="no-result">No results found</p>`;
    return;
  }

  results.innerHTML = data.map(l => `
    <a href="/listings/${l._id}" class="search-item">
      <img src="${l.image.url}" />
      <div>
        <strong>${l.title}</strong>
        <p>${l.location}, ${l.country}</p>
      </div>
    </a>
  `).join("");
}

/* 🔹 Button click */
form.addEventListener("submit", (e) => {
  e.preventDefault(); // ❗ page reload stop
  doSearch(input.value.trim());
});

/* 🔹 Live typing */
input.addEventListener("input", () => {
  doSearch(input.value.trim());
});

