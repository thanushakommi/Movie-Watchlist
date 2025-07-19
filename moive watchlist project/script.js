const STORAGE_KEY = "movies";
const loadMovies = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
const saveMovies = data => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
const convertToEmbed = url => url.includes("watch?v=") ? url.replace("watch?v=", "embed/") : url;

/* ===========================================================
   Main logic (runs on every page)
=========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("movieForm");   // only on index.html
  const gridEl = document.getElementById("movieList");   // only on movies.html

  /* ------------------ INDEX.HTML ------------------ */
  if (form) {
    /* ➕ Add‑movie submit */
    form.addEventListener("submit", e => {
      e.preventDefault();
      const movie = {
        id: crypto.randomUUID(),
        title: form.title.value.trim(),
        genre: form.genre.value.trim(),
        year: form.year.value,
        rating: form.rating.value,
        poster: form.poster.value.trim(),
        trailer: form.trailer.value.trim(),
        status: form.status.value
      };
      const movies = loadMovies();
      movies.push(movie);
      saveMovies(movies);
      /* ✅ redirect so the user instantly sees the new card */
      window.location.href = "movies.html?added=1";
    });

    /* 🔍 Search button → redirect */
    document.getElementById("searchBtn").addEventListener("click", () => {
      const q = document.getElementById("searchInput").value.trim();
      const st = document.getElementById("statusFilter").value;
      window.location.href = `movies.html?search=${encodeURIComponent(q)}&status=${encodeURIComponent(st)}`;
    });
    return; // nothing else to do on index.html
  }

  /* ------------------ MOVIES.HTML ----------------- */
  if (gridEl) {
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const searchBtn = document.getElementById("searchBtn");

    /* 1️⃣  Initialise from URL params */
    const params = new URLSearchParams(location.search);
    searchInput.value = params.get("search") || "";
    statusFilter.value = params.get("status") || "";

    /* 2️⃣  Bind events */
    searchBtn.addEventListener("click", render);
    searchInput.addEventListener("input", render);
    statusFilter.addEventListener("change", render);

    /* delete via event‑delegation */
    gridEl.addEventListener("click", e => {
      if (!e.target.classList.contains("delete-btn")) return;
      const id = e.target.dataset.id;
      if (!confirm("Delete this movie?")) return;
      saveMovies(loadMovies().filter(m => m.id !== id));
      render();
    });

    /* show toast if just added */
    if (params.get("added")) {
      const toast = Object.assign(document.getElementById("toast"), {
        textContent: "Movie added ✔"
      });
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2000);
    }

    /* 3️⃣  First render */
    render();

    /* ---------- helpers ---------- */
    function render() {
      const q = searchInput.value.toLowerCase();
      const st = statusFilter.value;
      const list = loadMovies().filter(m =>
        m.title.toLowerCase().includes(q) && (st === "" || m.status === st)
      );
      gridEl.innerHTML = list.length ? list.map(card).join("") :
        "<p style='text-align:center;'>No movies found.</p>";
    }

    function card(m) {
      return `
        <div class="card">
          <img src="${m.poster}" alt="${m.title}">
          <div class="info">
            <h3>${m.title}</h3>
            <p>${m.genre} | ${m.year} | ⭐ ${m.rating}</p>
            <p>Status: ${m.status}</p>
            <iframe src="${convertToEmbed(m.trailer)}" allowfullscreen></iframe>
            <button class="delete-btn" data-id="${m.id}">Delete</button>
          </div>
        </div>`;
    }
  }
});