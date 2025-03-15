const tmdbApiKey = "1dc4cbf81f0accf4fa108820d551dafc";


async function getFeaturedMovies() {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&language=fa-IR`
  );
  const data = await res.json();
  const movies = data.results.slice(0, 5);
  const slider = document.getElementById("slider");
  slider.innerHTML = "";

  movies.forEach((movie) => {
    slider.innerHTML += `
      <div class="w-full h-96 bg-cover bg-center snap-start" style="background-image: url('https://image.tmdb.org/t/p/original${movie.backdrop_path}')">
        <div class="bg-black bg-opacity-50 h-full flex flex-col justify-center items-center">
          <h2 class="text-3xl font-bold">${movie.title}</h2>
          <p class="mt-2">${movie.overview.slice(0, 100)}...</p>
          <a href="/freemovie/movie/index.html?id=${movie.id}" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
        </div>
      </div>
    `;
  });
}

async function getNewMovies() {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/now_playing?api_key=${tmdbApiKey}&language=fa-IR`
  );
  const data = await res.json();
  const movies = data.results;
  const container = document.getElementById("new-movies");
  container.innerHTML = "";

  movies.forEach((movie) => {
    container.innerHTML += `
      <div class="group relative">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="w-full h-auto rounded-lg shadow-lg">
        <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
          <h3 class="text-lg font-bold">${movie.title}</h3>
          <p class="text-sm">${movie.overview.slice(0, 100)}...</p>
          <a href="/freemovie/movie/index.html?id=${movie.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
        </div>
      </div>
    `;
  });
}

getFeaturedMovies();
getNewMovies();

document.getElementById("theme-toggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  const icon = document.querySelector("#theme-toggle i");
  icon.classList.toggle("fa-sun");
  icon.classList.toggle("fa-moon");
});

document.getElementById("menu-toggle").addEventListener("click", () => {
  document.getElementById("mobile-menu").classList.toggle("hidden");

});

// تابع اصلی برای جستجو با توکن
async function fetchWithToken(title) {
  try {
    const apiKey = tokens[currentTokenIndex];
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(
      title
    )}`;

    // نمایش انیمیشن لودینگ
    document.getElementById("loading").style.display = "block";

    const response = await fetch(url);
    const data = await response.json();
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    if (data.Response === "True") {
      let moviesHtml = '<div class="row">';
      data.Search.forEach((movie) => {
        const poster = movie.Poster !== "N/A" ? movie.Poster : "default.jpg";
        const imdbID = movie.imdbID.replace("tt", "");

        moviesHtml += `
                    <div class="col-6 col-md-4 col-lg-2 mb-4">
                        <div class="card">
                            <img src="${poster}" class="card-img-top" alt="${
          movie.Title
        }">
                            <div class="card-body">
                                <h5 class="card-title">${movie.Title}</h5>
                                <p class="card-text">سال: ${movie.Year}</p>
                                ${generateDownloadLinks(
                                  imdbID,
                                  movie.Year,
                                  movie.Type
                                )}
                                <button class="btn btn-info" onclick="showDetails('${
                                  movie.imdbID
                                }')">جزئیات</button>
                            </div>
                        </div>
                    </div>
                `;
      });
      moviesHtml += "</div>";
      resultsContainer.innerHTML = moviesHtml;
      resultsContainer.scrollIntoView({ behavior: "smooth" });
    } else {
      resultsContainer.innerHTML =
        '<div class="alert alert-danger">هیچ نتیجه‌ای پیدا نشد.</div>';
    }
  } catch (error) {
    console.error("خطا در درخواست:", error);
    document.getElementById("results").innerHTML =
      '<div class="alert alert-danger">خطا در درخواست: ' +
      error.message +
      "</div>";
  } finally {
    // مخفی کردن انیمیشن لودینگ
    document.getElementById("loading").style.display = "none";
  }
}

// تابع برای تولید لینک‌های دانلود
function generateDownloadLinks(imdbID, year, type) {
  if (type === "movie") {
    const originalDownloadLink = `https://berlin.saymyname.website/Movies/${year}/${imdbID}`;
    const backupDownloadLink = `https://tokyo.saymyname.website/Movies/${year}/${imdbID}`;

    return `
            <a href="${originalDownloadLink}" class="btn btn-primary mb-2">دانلود فیلم (لینک اصلی)</a><br>
            <a href="${backupDownloadLink}" class="btn btn-secondary mb-2">دانلود فیلم (لینک جایگزین)</a><br>
        `;
  } else if (type === "series") {
    return generateSeriesDownloadLinks(imdbID);
  }
  return "";
}

// تابع برای لینک‌های دانلود سریال
function generateSeriesDownloadLinks(imdbID) {
  let seasonsHtml = '<div class="accordion" id="seasonsAccordion">';
  for (let i = 1; i <= 4; i++) {
    seasonsHtml += `
            <div class="accordion-item">
                <h2 class="accordion-header" id="heading${i}">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="true" aria-controls="collapse${i}">
                        فصل ${i}
                    </button>
                </h2>
                <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}" data-bs-parent="#seasonsAccordion">
                    <div class="accordion-body">
                        ${generateQualityLinks(imdbID, i)}
                    </div>
                </div>
            </div>
        `;
  }
  seasonsHtml += "</div>";
  return seasonsHtml;
}

// تابع برای لینک‌های کیفیت
function generateQualityLinks(imdbID, season) {
  let qualityLinks = "";
  for (let quality = 1; quality <= 4; quality++) {
    const downloadLink = `https://subtitle.saymyname.website/DL/filmgir/?i=tt${imdbID}&f=${season}&q=${quality}`;
    qualityLinks += `<a href="${downloadLink}" class="btn btn-success mb-2">دانلود فصل ${season} با کیفیت ${quality}</a><br>`;
  }
  return qualityLinks;
}

// تابع برای نمایش جزئیات فیلم
async function showDetails(imdbID) {
  const apiKey = tokens[currentTokenIndex];
  const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`;
  const response = await fetch(url);
  const movie = await response.json();
  const modalBody = document.getElementById("movieDetails");
  modalBody.innerHTML = `
        <p><strong>عنوان:</strong> ${movie.Title}</p>
        <p><strong>سال:</strong> ${movie.Year}</p>
        <p><strong>ژانر:</strong> ${movie.Genre}</p>
        <p><strong>کارگردان:</strong> ${movie.Director}</p>
        <p><strong>بازیگران:</strong> ${movie.Actors}</p>
        <p><strong>خلاصه:</strong> ${movie.Plot}</p>
    `;
  const modal = new bootstrap.Modal(document.getElementById("movieModal"));
  modal.show();
}

// تابع debounce برای جلوگیری از درخواست‌های مکرر
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// رویداد برای جستجوی زنده
document.getElementById("title").addEventListener(
  "input",
  debounce(function () {
    const title = this.value;
    if (title.length > 2) {
      fetchWithToken(title);
    } else {
      document.getElementById("results").innerHTML = "";
    }
  }, 300)
);

