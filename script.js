// Toggling the theme mode
function onToggleThemePress() {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  document.getElementById("theme-toggle").textContent = isDarkMode ? "حالت روشن" : "حالت تاریک";
}

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", onToggleThemePress);

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "حالت روشن";
  }
});

// Fetch movie data from OMDB API
fetch("tokens.json")
  .then((response) => response.json())
  .then((data) => {
    const tokens = data.tokens;
    let currentTokenIndex = data.currentTokenIndex;

    async function fetchWithToken(title) {
      try {
        const apiKey = tokens[currentTokenIndex];
        const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(title)}`;

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
                  <img src="${poster}" class="card-img-top" alt="${movie.Title}">
                  <div class="card-body">
                    <h5 class="card-title">${movie.Title}</h5>
                    <p class="card-text">سال: ${movie.Year}</p>
                    ${generateDownloadLinks(imdbID, movie.Year, movie.Type)}
                  </div>
                </div>
              </div>
            `;
          });
          moviesHtml += "</div>";
          resultsContainer.innerHTML = moviesHtml;
          resultsContainer.scrollIntoView({ behavior: "smooth" });
        } else {
          resultsContainer.innerHTML = '<div class="alert alert-danger">هیچ نتیجه‌ای پیدا نشد.</div>';
        }
      } catch (error) {
        console.error("خطا در درخواست:", error);
        document.getElementById("results").innerHTML = '<div class="alert alert-danger">خطا در درخواست: ' + error.message + "</div>";
      }
    }

    document.getElementById("searchForm").addEventListener("submit", function (event) {
      event.preventDefault();
      const title = document.getElementById("title").value.trim();
      fetchWithToken(title);
    });
  })
  .catch((error) => {
    console.error("خطا در بارگذاری فایل توکن‌ها:", error);
    document.getElementById("results").innerHTML = '<div class="alert alert-danger">خطا در بارگذاری فایل توکن‌ها</div>';
  });

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

function generateQualityLinks(imdbID, season) {
  let qualityLinks = "";
  for (let quality = 1; quality <= 4; quality++) {
    const downloadLink = `https://subtitle.saymyname.website/DL/filmgir/?i=tt${imdbID}&f=${season}&q=${quality}`;
    qualityLinks += `<a href="${downloadLink}" class="btn btn-success mb-2">دانلود فصل ${season} با کیفیت ${quality}</a><br>`;
  }
  return qualityLinks;
}