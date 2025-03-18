const serverUrl = "https://freemoviez.ir/api/tmdb-movie.php";
const movieId = new URLSearchParams(window.location.search).get("id");

// تابع کمکی برای بررسی وضعیت لینک
async function checkLinkStatus(url) {
  try {
    const res = await fetch(url, { method: "HEAD" }); // استفاده از HEAD برای کاهش مصرف داده
    return res.ok; // true اگر وضعیت 200-299 باشد
  } catch (error) {
    console.error(`خطا در بررسی لینک ${url}:`, error);
    return false; // در صورت خطا، لینک نامعتبر فرض می‌شود
  }
}

async function getMovieDetails() {
  try {
    if (!movieId) {
      throw new Error("شناسه فیلم در URL وجود ندارد!");
    }

    const res = await fetch(`${serverUrl}?id=${movieId}`);
    const data = await res.json();

    // به‌روزرسانی محتوای صفحه
    const title = data.title || "نامشخص";
    document.getElementById("title").textContent = title;
    document.getElementById("overview").textContent = data.overview || "خلاصه‌ای در دسترس نیست.";
    document.getElementById("genre").innerHTML = `<strong>ژانر:</strong> ${data.genre || "نامشخص"}`;
    document.getElementById("year").innerHTML = `<strong>سال تولید:</strong> ${data.year || "نامشخص"}`;
    document.getElementById("rating").innerHTML = `<strong>امتیاز:</strong> ${data.rating || "نامشخص"}/10`;

    // به‌روزرسانی تصاویر
    const poster = data.poster || "https://via.placeholder.com/500";
    document.getElementById("poster").src = poster;
    document.getElementById("poster").alt = `پوستر فیلم ${title}`;
    document.getElementById("movie-bg").style.backgroundImage = data.backdrop
      ? `url('${data.backdrop}')`
      : "url('https://via.placeholder.com/1920x1080')";

    // به‌روزرسانی تریلر
    const trailerContainer = document.getElementById("trailer");
    if (data.trailer) {
      trailerContainer.src = data.trailer;
      trailerContainer.title = `تریلر فیلم ${title}`;
    } else {
      trailerContainer.outerHTML = '<p class="text-yellow-500">تریلر در دسترس نیست</p>';
    }

    // به‌روزرسانی متا تگ‌ها و عنوان صفحه
    document.getElementById("meta-title").textContent = `${title} - فیری مووی`;
    document.querySelector('meta[name="description"]').setAttribute("content", `${data.overview || "جزئیات و دانلود فیلم " + title + " در فیری مووی."}`);
    document.querySelector('meta[property="og:title"]').setAttribute("content", `${title} - فیری مووی`);
    document.querySelector('meta[property="og:description"]').setAttribute("content", data.overview || "جزئیات و دانلود فیلم در فیری مووی.");
    document.querySelector('meta[property="og:image"]').setAttribute("content", poster);
    document.querySelector('meta[name="twitter:title"]').setAttribute("content", `${title} - فیری مووی`);
    document.querySelector('meta[name="twitter:description"]').setAttribute("content", data.overview || "جزئیات و دانلود فیلم در فیری مووی.");
    document.querySelector('meta[name="twitter:image"]').setAttribute("content", poster);

    // به‌روزرسانی داده‌های ساختاریافته (Schema)
    const schema = {
      "@context": "https://schema.org",
      "@type": "Movie",
      "name": title,
      "description": data.overview || "خلاصه‌ای در دسترس نیست.",
      "genre": data.genre || "نامشخص",
      "datePublished": data.year || "",
      "image": poster,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": data.rating || "0",
        "bestRating": "10",
        "ratingCount": "1"
      },
      "trailer": {
        "@type": "VideoObject",
        "embedUrl": data.trailer || ""
      }
    };
    document.getElementById("movie-schema").textContent = JSON.stringify(schema);

    // بررسی و فیلتر کردن لینک‌های دانلود
    const downloadLinksData = [
      { url: data.download_links.primary, text: "دانلود فیلم (لینک اصلی)" },
      { url: data.download_links.secondary, text: "دانلود فیلم (لینک کمکی)" },
      { url: data.download_links.tertiary, text: "دانلود فیلم (لینک کمکی)" }
    ];

    const validLinks = [];
    for (const link of downloadLinksData) {
      const isValid = await checkLinkStatus(link.url);
      if (isValid) {
        validLinks.push(`<a href="${link.url}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" rel="nofollow">${link.text}</a>`);
      }
    }

    // افزودن دکمه واچ لیست به لینک‌های معتبر
    const watchlistButton = `<button id="add-to-watchlist" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">افزودن به واچ لیست</button>`;
    const downloadLinksHtml = validLinks.length > 0 
      ? validLinks.join(" ") + " " + watchlistButton 
      : '<p class="text-yellow-500">هیچ لینک دانلودی در دسترس نیست</p>';
    document.getElementById("download-links").innerHTML = downloadLinksHtml;

    // افزودن به واچ لیست
    if (validLinks.length > 0) {
      document.getElementById("add-to-watchlist").addEventListener("click", () => {
        let watchlist = JSON.parse(localStorage.getItem("watchlist")) || { movies: [], series: [] };
        if (!watchlist.movies.includes(movieId)) {
          watchlist.movies.push(movieId);
          localStorage.setItem("watchlist", JSON.stringify(watchlist));
          alert("فیلم به واچ لیست اضافه شد!");
        } else {
          alert("فیلم قبلاً در واچ لیست است!");
        }
      });
    }

  } catch (error) {
    console.error("خطا در دریافت اطلاعات:", error);
    document.getElementById("download-links").innerHTML = `<p class="text-red-500">خطا در دریافت اطلاعات: ${error.message}</p>`;
  }
}

getMovieDetails();