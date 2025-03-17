const omdbApiKey = "c409b61f";
const tokens = ["c409b61f"];
let currentTokenIndex = 0;
const seriesId = new URLSearchParams(window.location.search).get("id");

document.getElementById("loading").style.display = "block";

async function getSeriesDetails() {
  try {
    if (!seriesId) {
      throw new Error("شناسه سریال در URL وجود ندارد!");
    }

    let imdbId = seriesId;
    if (!imdbId.startsWith("tt")) {
      imdbId = "tt" + imdbId; // اضافه کردن "tt" به شناسه اگر نیاز باشد
    }

    const apiKey = tokens[currentTokenIndex];
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbId}&plot=full`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`خطای HTTP در OMDb! وضعیت: ${res.status}`);
    }
    const series = await res.json();
    if (series.Response === "False") {
      throw new Error(series.Error);
    }

    // به‌روزرسانی محتوای صفحه
    const title = series.Title || "نامشخص";
    document.getElementById("title").textContent = title;
    document.getElementById("overview").textContent = series.Plot || "بدون توضیحات";
    document.getElementById("genre").innerHTML = `<strong>ژانر:</strong> ${series.Genre || "نامشخص"}`;
    document.getElementById("year").innerHTML = `<strong>سال تولید:</strong> ${series.Year || "نامشخص"}`;
    document.getElementById("rating").innerHTML = `<strong>امتیاز:</strong> ${series.imdbRating || "بدون امتیاز"}/10`;

    // به‌روزرسانی تصاویر
    const poster = series.Poster && series.Poster !== "N/A" ? series.Poster : "https://via.placeholder.com/500";
    document.getElementById("poster").src = poster;
    document.getElementById("poster").alt = `پوستر سریال ${title}`;
    document.getElementById("series-bg").style.backgroundImage = series.Poster && series.Poster !== "N/A"
      ? `url('${series.Poster}')`
      : "url('https://via.placeholder.com/1920x1080')";

    // به‌روزرسانی متا تگ‌ها و عنوان صفحه
    document.getElementById("meta-title").textContent = `${title} - فیری مووی`;
    document.querySelector('meta[name="description"]').setAttribute("content", `${series.Plot || "جزئیات و دانلود سریال " + title + " در فیری مووی."}`);
    document.querySelector('meta[property="og:title"]').setAttribute("content", `${title} - فیری مووی`);
    document.querySelector('meta[property="og:description"]').setAttribute("content", series.Plot || "جزئیات و دانلود سریال در فیری مووی.");
    document.querySelector('meta[property="og:image"]').setAttribute("content", poster);
    document.querySelector('meta[name="twitter:title"]').setAttribute("content", `${title} - فیری مووی`);
    document.querySelector('meta[name="twitter:description"]').setAttribute("content", series.Plot || "جزئیات و دانلود سریال در فیری مووی.");
    document.querySelector('meta[name="twitter:image"]').setAttribute("content", poster);

    // به‌روزرسانی داده‌های ساختاریافته (Schema)
    const schema = {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      "name": title,
      "description": series.Plot || "بدون توضیحات",
      "genre": series.Genre || "نامشخص",
      "startDate": series.Year || "",
      "image": poster,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": series.imdbRating || "0",
        "bestRating": "10",
        "ratingCount": "1"
      },
      "numberOfSeasons": series.totalSeasons || "0"
    };
    document.getElementById("series-schema").textContent = JSON.stringify(schema);

    // به‌روزرسانی تریلر
    const trailerContainer = document.getElementById("trailer");
    if (series.Title) {
      const searchQuery = encodeURIComponent(`${series.Title} trailer`);
      const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
      trailerContainer.innerHTML = `
        <p>تریلر سریال در دسترس نیست، اما می‌توانید آن را در یوتیوب جستجو کنید:</p>
        <a href="${youtubeSearchUrl}" target="_blank" class="text-blue-400 hover:underline" rel="nofollow">جستجوی تریلر ${series.Title} در یوتیوب</a>
      `;
    } else {
      trailerContainer.innerHTML = '<p class="text-yellow-500">عنوان سریال یافت نشد، تریلر قابل نمایش نیست</p>';
    }

    // لینک‌های دانلود
    const downloadLinksContainer = document.getElementById("download-links");
    downloadLinksContainer.innerHTML = "";
    let totalSeasons = parseInt(series.totalSeasons);
    if (totalSeasons > 0 && series.imdbID) {
      let imdbIDForDownload = series.imdbID.replace("tt", "");
      downloadLinksContainer.innerHTML = generateSeriesDownloadLinks(imdbIDForDownload, totalSeasons);
    } else {
      downloadLinksContainer.innerHTML = '<p class="text-yellow-500">لینک‌های دانلود در دسترس نیست</p>';
    }

    // افزودن به واچ‌لیست
    document.getElementById("add-to-watchlist").addEventListener("click", () => {
      let watchlist = JSON.parse(localStorage.getItem("watchlist")) || { movies: [], series: [] };
      const normalizedSeriesId = String(seriesId);
      if (!watchlist.series.includes(normalizedSeriesId)) {
        watchlist.series.push(normalizedSeriesId);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        alert("سریال با موفقیت به واچ‌لیست اضافه شد!");
      } else {
        alert("این سریال قبلاً در واچ‌لیست شما وجود دارد!");
      }
    });
  } catch (error) {
    console.error("خطا در دریافت اطلاعات:", error);
    document.getElementById("download-links").innerHTML = `<p class="text-red-500">خطا در دریافت اطلاعات: ${error.message}</p>`;
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

function generateSeriesDownloadLinks(imdbID, totalSeasons) {
  let seasonsHtml = "";
  for (let season = 1; season <= totalSeasons; season++) {
    seasonsHtml += `
      <details class="mt-2">
        <summary class="cursor-pointer text-lg accordion-button">فصل ${season}</summary>
        <div class="accordion-content">
          ${generateQualityLinks(imdbID, season)}
        </div>
      </details>
    `;
  }
  return seasonsHtml;
}

function generateQualityLinks(imdbID, season) {
  let qualityLinks = "";
  const qualities = [1, 2, 3, 4];
  qualities.forEach((quality) => {
    const downloadLink = `https://subtitle.saymyname.website/DL/filmgir/?i=tt${imdbID}&f=${season}&q=${quality}`;
    qualityLinks += `
      <a href="${downloadLink}" class="block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2" rel="nofollow">
        دانلود فصل ${season} با کیفیت ${quality}
      </a>
    `;
  });
  return qualityLinks;
}

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

getSeriesDetails();