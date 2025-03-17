const serverUrl = "https://freemoviez.ir/api/tmdb-movie.php"; // آدرس سرور شما
const movieId = new URLSearchParams(window.location.search).get("id");

async function getMovieDetails() {
  try {
    if (!movieId) {
      throw new Error("شناسه فیلم در URL وجود ندارد!");
    }

    // ارسال درخواست به سرور برای دریافت اطلاعات فیلم
    const res = await fetch(`${serverUrl}?id=${movieId}`);
    const data = await res.json();

    // نمایش اطلاعات فیلم
    document.getElementById("title").textContent = data.title || "نامشخص";
    document.getElementById("overview").textContent =
      data.overview || "خلاصه‌ای در دسترس نیست.";
    document.getElementById("genre").innerHTML = `<strong>ژانر:</strong> ${
      data.genre || "نامشخص"
    }`;
    document.getElementById(
      "year"
    ).innerHTML = `<strong>سال تولید:</strong> ${data.year}`;
    document.getElementById(
      "rating"
    ).innerHTML = `<strong>امتیاز:</strong> ${data.rating}/10`;
    document.getElementById("poster").src = 'https://freemoviez.ir/api/images/poster'.${data.backdrop('/', '')};
    document.getElementById("movie-bg").style.backgroundImage = `url('https://freemoviez.ir/api/images/poster${data.backdrop('/', '')}')`;

    // نمایش تریلر
    const trailerContainer = document.getElementById("trailer");
    if (data.trailer) {
      trailerContainer.src = data.trailer;
    } else {
      trailerContainer.innerHTML = '<p class="text-yellow-500">تریلر در دسترس نیست</p>';
    }

    // نمایش لینک‌های دانلود
    const downloadLinks = `
      <a href="${data.download_links.primary}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">دانلود فیلم (لینک اصلی)</a>
      <a href="${data.download_links.secondary}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">دانلود فیلم (لینک کمکی)</a>
      <button id="add-to-watchlist" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">افزودن به واچ لیست</button>
    `;
    document.getElementById("download-links").innerHTML = downloadLinks;

    // افزودن فیلم به واچ لیست
    document
      .getElementById("add-to-watchlist")
      .addEventListener("click", () => {
        let watchlist = JSON.parse(localStorage.getItem("watchlist")) || { movies: [], series: [] };
        if (!watchlist.movies.includes(movieId)) {
          watchlist.movies.push(movieId);
          localStorage.setItem("watchlist", JSON.stringify(watchlist));
          alert("فیلم به واچ لیست اضافه شد!");
        } else {
          alert("فیلم قبلاً در واچ لیست است!");
        }
      });
  } catch (error) {
    console.error("خطا در دریافت اطلاعات:", error);
    document.getElementById("download-links").innerHTML = `<p class="text-red-500">خطا در دریافت اطلاعات: ${error.message}</p>`;
  }
}

getMovieDetails();

// تغییر تم
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  const icon = document.querySelector("#theme-toggle i");
  icon.classList.toggle("fa-sun");
  icon.classList.toggle("fa-moon");
});

// نمایش/مخفی کردن منوی موبایل
document.getElementById("menu-toggle").addEventListener("click", () => {
  document.getElementById("mobile-menu").classList.toggle("hidden");
});