const tmdbApiUrl = "https://api.themoviedb.org/3/discover/movie";
const tmdbApiKey = "1dc4cbf81f0accf4fa108820d551dafc"; // کلید API TMDb شما
const omdbApiKey = "abb7cdf7"; // کلید API OMDb شما

// تابع برای دریافت فیلم‌ها از TMDb
async function getMovies() {
  try {
    const response = await fetch(
      `${tmdbApiUrl}?api_key=${tmdbApiKey}&language=fa-IR&page=1`
    );
    const data = await response.json();
    const movies = data.results;
    const moviesList = document.getElementById("movies-list");
    moviesList.innerHTML = ""; // پاک کردن محتویات قبلی

    // دریافت اطلاعات و تصاویر از OMDb
    for (const movie of movies) {
      const omdbPoster = await getOmdbImage(movie.original_title); // ارسال عنوان اصلی فیلم (به انگلیسی)
      const imdbID = await getImdbID(movie.original_title); // دریافت IMDb ID از OMDb با عنوان اصلی

      const movieCard = document.createElement("div");
      movieCard.classList.add("movie-card");

      // تصویر فیلم
      const movieImage = document.createElement("img");
      movieImage.src =
        omdbPoster || "https://via.placeholder.com/500x750?text=No+Image"; // تصویر پیش‌فرض در صورت نبود تصویر در OMDb

      // عنوان فیلم به فارسی
      const movieTitle = document.createElement("div");
      movieTitle.classList.add("title");
      movieTitle.textContent = movie.title;

      // عنوان فیلم به انگلیسی
      const originalTitle = document.createElement("div");
      originalTitle.classList.add("original-title");
      originalTitle.textContent = `نام اصلی: ${movie.original_title}`;

      // خلاصه فیلم
      const movieOverview = document.createElement("div");
      movieOverview.classList.add("overview");
      movieOverview.textContent = movie.overview.slice(0, 150) + "..."; // خلاصه‌ای از توضیحات فیلم

      // لینک دانلود فیلم
      const downloadLinks = generateDownloadLinks(
        imdbID,
        movie.release_date ? movie.release_date.split("-")[0] : "unknown",
        "movie"
      );
      const downloadContainer = document.createElement("div");
      downloadContainer.classList.add("download-container");
      downloadContainer.innerHTML = downloadLinks;

      // اضافه کردن تمام المان‌ها به کارت فیلم
      movieCard.appendChild(movieImage);
      movieCard.appendChild(movieTitle);
      movieCard.appendChild(originalTitle);
      movieCard.appendChild(movieOverview);
      movieCard.appendChild(downloadContainer);

      // اضافه کردن کارت فیلم به لیست
      moviesList.appendChild(movieCard);
    }
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}

// تابع برای دریافت تصویر فیلم از OMDb
async function getOmdbImage(title) {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?t=${encodeURIComponent(
        title
      )}&apikey=${omdbApiKey}`
    );
    const data = await response.json();
    if (data.Response === "True") {
      return data.Poster !== "N/A" ? data.Poster : null; // اگر تصویری وجود نداشته باشد، null بر می‌گرداند
    } else {
      console.error("Error fetching poster from OMDb:", data.Error);
      return null;
    }
  } catch (error) {
    console.error("Error fetching poster from OMDb:", error);
    return null;
  }
}

// تابع برای دریافت اطلاعات IMDb ID از OMDb با استفاده از نام فیلم به زبان انگلیسی
async function getImdbID(title) {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?t=${encodeURIComponent(
        title
      )}&apikey=${omdbApiKey}`
    );
    const data = await response.json();

    // بررسی صحت پاسخ
    if (data.Response === "True" && data.imdbID) {
      return data.imdbID.replace("tt", ""); // حذف "tt" از IMDb ID
    } else {
      console.error("IMDb ID not found for:", title, data.Error);
      return ""; // در صورت پیدا نکردن IMDb ID
    }
  } catch (error) {
    console.error("Error fetching IMDb ID from OMDb:", error);
    return ""; // در صورت بروز خطا
  }
}

// تابع برای تولید لینک‌های دانلود
function generateDownloadLinks(imdbID, year, type) {
  if (type === "movie") {
    const originalDownloadLink = `https://berlin.saymyname.website/Movies/${year}/${imdbID}`;
    const backupDownloadLink = `https://tokyo.saymyname.website/Movies/${year}/${imdbID}`;

    return `
            <div class="download-buttons">
                <a href="${originalDownloadLink}" class="btn btn-primary mb-2">دانلود فیلم (لینک اصلی)</a>
                <a href="${backupDownloadLink}" class="btn btn-secondary mb-2">دانلود فیلم (لینک جایگزین)</a>
            </div>
        `;
  } else if (type === "series") {
    return generateSeriesDownloadLinks(imdbID);
  }
  return "";
}

// تابع برای تولید لینک‌های دانلود سریال (در صورت نیاز)
function generateSeriesDownloadLinks(imdbID) {
  return `
        <a href="https://example.com/series/${imdbID}" class="btn btn-primary mb-2">دانلود سریال</a><br>
    `;
}

// اجرای تابع برای دریافت فیلم‌ها
getMovies();
