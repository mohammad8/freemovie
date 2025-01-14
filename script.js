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

async function getMediaDetails(imdbID, apiKey) {
  try {
    const mediaUrl = `https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;
    const response = await fetch(mediaUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("خطا در دریافت اطلاعات از OMDB:", error);
    return null;
  }
}

// تابع برای دریافت تعداد فصل‌های هر سریال از TMDB API
async function getSeriesSeasons(tmdbID, apiKey) {
  try {
    const seriesUrl = `https://api.themoviedb.org/3/tv/${tmdbID}?api_key=${apiKey}`;
    const seriesResponse = await fetch(seriesUrl);
    const seriesData = await seriesResponse.json();
    return seriesData.number_of_seasons;
  } catch (error) {
    console.error("خطا در دریافت اطلاعات از TMDB:", error);
    return 4; // پیش‌فرض 4 فصل در صورت خطا
  }
}

// تابع برای تولید لینک‌های دانلود سریال
async function generateSeriesDownloadLinks(tmdbID, apiKey) {
  const mediaDetails = await getMediaDetails(tmdbID, apiKey, "tv");
  const imdbID = mediaDetails.imdb_id;

  if (!imdbID) {
    return '<div class="alert alert-warning">ID IMDb یافت نشد..</div>';
  }

  // حذف پیشوند `tt` از imdb_id اگر وجود دارد
  const cleanImdbID = imdbID.replace(/^tt/, "");

  const totalSeasons = await getSeriesSeasons(tmdbID, apiKey); // تعداد فصل‌ها را دریافت کنید
  let seasonsHtml = `<div class="accordion" id="seasonsAccordion-${tmdbID}">`;
  for (let i = 1; i <= totalSeasons; i++) {
    seasonsHtml += `
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading-${tmdbID}-${i}">
          <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${tmdbID}-${i}" aria-expanded="true" aria-controls="collapse-${tmdbID}-${i}">
            فصل ${i}
          </button>
        </h2>
        <div id="collapse-${tmdbID}-${i}" class="accordion-collapse collapse" aria-labelledby="heading-${tmdbID}-${i}" data-bs-parent="#seasonsAccordion-${tmdbID}">
          <div class="accordion-body">
            ${generateQualityLinks(cleanImdbID, i)}
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
    const downloadLink = `https://subtitle.saymyname.website/DL/filmgir/?i=${imdbID}&f=${season}&q=${quality}`;
    qualityLinks += `<a href="${downloadLink}" class="btn btn-success mb-2">دانلود فصل ${season} با کیفیت ${quality}</a><br>`;
  }
  return qualityLinks;
}

// تابع برای تولید لینک‌های دانلود
async function generateDownloadLinks(imdbID, year, type, apiKey) {
  const mediaDetails = await getMediaDetails(imdbID, apiKey);

  if (!mediaDetails) {
    return '<div class="alert alert-warning">اطلاعات فیلم یا سریال یافت نشد.</div>';
  }

  if (type === "movie") {
    const originalDownloadLink = `https://berlin.saymyname.website/Movies/${year}/${imdbID}`;
    const backupDownloadLink = `https://tokyo.saymyname.website/Movies/${year}/${imdbID}`;

    return `
      <a href="${originalDownloadLink}" class="btn btn-primary mb-2">دانلود فیلم (لینک اصلی)</a><br>
      <a href="${backupDownloadLink}" class="btn btn-secondary mb-2">دانلود فیلم (لینک جایگزین)</a><br>
    `;
  } else if (type === "series") {
    const totalSeasons = mediaDetails.totalSeasons || 1;
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
  return "";
}

async function fetchSuggestions(query, apiKey) {
  try {
    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.Search && data.Search.length > 0) {
      return data.Search.map(item => item.Title);
    } else {
      return [];
    }
  } catch (error) {
    console.error("خطا در دریافت پیشنهادات:", error);
    return [];
  }
}

// Fetch movie data from TMDB API
fetch("tokens.json")
  .then((response) => response.json())
  .then((data) => {
    const TMDB_API_KEY = data.tmdb.apiKey;

    // فعال کردن Typeahead برای فیلد جستجو
    $(document).ready(function() {
      $('#title').typeahead({
        source: async function(query, process) {
          const suggestions = await fetchSuggestions(query, TMDB_API_KEY);
          process(suggestions);
        },
        minLength: 2, // حداقل تعداد کاراکترها برای شروع پیشنهادات
        delay: 300 // تاخیر قبل از شروع جستجو
      });
    });

async function fetchWithToken(title) {
  try {
    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(title)}&apikey=${TMDB_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    if (data.Search && data.Search.length > 0) {
      let moviesHtml = '<div class="row">';
      for (const item of data.Search) {
        const poster = item.Poster !== "N/A" ? item.Poster : "default.jpg";
        const imdbID = item.imdbID;
        const year = item.Year;
        const type = item.Type === "movie" ? "movie" : "series";

        moviesHtml += `
          <div class="col-6 col-md-4 col-lg-3 mb-4">
            <div class="card">
              <img src="${poster}" class="card-img-top" alt="${item.Title}">
              <div class="card-body">
                <h5 class="card-title">${item.Title}</h5>
                <p class="card-text">سال: ${year}</p>
                ${await generateDownloadLinks(imdbID, year, type, TMDB_API_KEY)}
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