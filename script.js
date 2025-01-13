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
  } else {
    themeToggle.textContent = "حالت تاریک";
  }
});

// کلید API خود را از TMDB دریافت کنید
const TMDB_API_KEY = "1dc4cbf81f0accf4fa108820d551dafc"; // کلید API TMDb شما

// تابع برای دریافت تعداد فصل‌های هر سریال از TMDB API
async function getSeriesSeasons(imdbID) {
  try {
    // ابتدا IMDB ID را به TMDB ID تبدیل کنید
    const findUrl = `https://api.themoviedb.org/3/find/tt${imdbID}?api_key=${TMDB_API_KEY}&external_source=imdb_id`;
    const findResponse = await fetch(findUrl);
    const findData = await findResponse.json();

    // اگر سریال پیدا شد، TMDB ID را دریافت کنید
    if (findData.tv_results.length > 0) {
      const tmdbID = findData.tv_results[0].id;

      // اطلاعات سریال را از TMDB دریافت کنید
      const seriesUrl = `https://api.themoviedb.org/3/tv/${tmdbID}?api_key=${TMDB_API_KEY}`;
      const seriesResponse = await fetch(seriesUrl);
      const seriesData = await seriesResponse.json();

      // تعداد فصل‌ها را برگردانید
      return seriesData.number_of_seasons;
    } else {
      console.error("سریال پیدا نشد.");
      return 4; // پیش‌فرض 4 فصل اگر سریال پیدا نشد
    }
  } catch (error) {
    console.error("خطا در دریافت اطلاعات از TMDB:", error);
    return 4; // پیش‌فرض 4 فصل در صورت خطا
  }
}

// تابع برای تولید لینک‌های دانلود سریال
async function generateSeriesDownloadLinks(imdbID) {
  const totalSeasons = await getSeriesSeasons(imdbID); // تعداد فصل‌ها را دریافت کنید
  let seasonsHtml = `<div class="accordion" id="seasonsAccordion-${imdbID}">`;
  for (let i = 1; i <= totalSeasons; i++) {
    seasonsHtml += `
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading-${imdbID}-${i}">
          <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${imdbID}-${i}" aria-expanded="true" aria-controls="collapse-${imdbID}-${i}">
            فصل ${i}
          </button>
        </h2>
        <div id="collapse-${imdbID}-${i}" class="accordion-collapse collapse" aria-labelledby="heading-${imdbID}-${i}" data-bs-parent="#seasonsAccordion-${imdbID}">
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

// تابع برای تولید لینک‌های دانلود با کیفیت‌های مختلف
function generateQualityLinks(imdbID, season) {
  let qualityLinks = "";
  for (let quality = 1; quality <= 4; quality++) {
    const downloadLink = `https://subtitle.saymyname.website/DL/filmgir/?i=tt${imdbID}&f=${season}&q=${quality}`;
    qualityLinks += `<a href="${downloadLink}" class="btn btn-success mb-2">دانلود فصل ${season} با کیفیت ${quality}</a><br>`;
  }
  return qualityLinks;
}

// تابع برای تولید لینک‌های دانلود
async function generateDownloadLinks(imdbID, year, type) {
  if (type === "movie") {
    const originalDownloadLink = `https://berlin.saymyname.website/Movies/${year}/${imdbID}`;
    const backupDownloadLink = `https://tokyo.saymyname.website/Movies/${year}/${imdbID}`;

    return `
      <a href="${originalDownloadLink}" class="btn btn-primary mb-2">دانلود فیلم (لینک اصلی)</a><br>
      <a href="${backupDownloadLink}" class="btn btn-secondary mb-2">دانلود فیلم (لینک جایگزین)</a><br>
    `;
  } else if (type === "series") {
    return await generateSeriesDownloadLinks(imdbID); // منتظر تولید لینک‌های سریال باشید
  }
  return "";
}

// تابع برای دریافت پیشنهادات از OMDB API
async function fetchSuggestions(query) {
  try {
    const apiKey = tokens[currentTokenIndex];
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "True") {
      return data.Search.map(movie => movie.Title);
    } else {
      return [];
    }
  } catch (error) {
    console.error("خطا در دریافت پیشنهادات:", error);
    return [];
  }
}

// فعال کردن Typeahead برای فیلد جستجو
$(document).ready(function() {
  $('#title').typeahead({
    source: async function(query, process) {
      const suggestions = await fetchSuggestions(query);
      process(suggestions);
    },
    minLength: 2, // حداقل تعداد کاراکترها برای شروع پیشنهادات
    delay: 300 // تاخیر قبل از شروع جستجو
  });
});

// Fetch movie data from OMDB API
fetch("tokens.json")
  .then((response) => response.json())
  .then((data) => {
    const tokens = data.omdb.tokens;
    let currentTokenIndex = data.omdb.currentTokenIndex;

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
          for (const movie of data.Search) {
            const poster = movie.Poster !== "N/A" ? movie.Poster : "default.jpg";
            const imdbID = movie.imdbID.replace("tt", "");

            moviesHtml += `
              <div class="col-6 col-md-4 col-lg-3 mb-4">
                <div class="card">
                  <img src="${poster}" class="card-img-top" alt="${movie.Title}">
                  <div class="card-body">
                    <h5 class="card-title">${movie.Title}</h5>
                    <p class="card-text">سال: ${movie.Year}</p>
                    ${await generateDownloadLinks(imdbID, movie.Year, movie.Type)}
                  </div>
                </div>
              </div>
            `;
          }
          moviesHtml += "</div>";
          resultsContainer.innerHTML = moviesHtml;
          resultsContainer.scrollIntoView({ behavior: "smooth" });
        } else {
          resultsContainer.innerHTML = '<div class="alert alert-danger">هیچ نتیجه‌ای پیدا نشد.</div>';
        }
      } catch (error) {
        console.error("خطا در درخواست:", error);
        currentTokenIndex = (currentTokenIndex + 1) % tokens.length; // چرخش به توکن بعدی
        if (currentTokenIndex === 0) {
          document.getElementById("results").innerHTML = '<div class="alert alert-danger">خطا در درخواست: ' + error.message + "</div>";
        } else {
          fetchWithToken(title); // تلاش مجدد با توکن بعدی
        }
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