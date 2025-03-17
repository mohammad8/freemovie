const serverUrl = "https://freemoviez.ir/api/tmdb-series.php"; // Hypothetical API endpoint
const seriesId = new URLSearchParams(window.location.search).get("id");

async function getSeriesDetails() {
  try {
    if (!seriesId) {
      throw new Error("شناسه سریال در URL وجود ندارد!");
    }

    const res = await fetch(`${serverUrl}?id=${seriesId}`);
    const data = await res.json();

    // Update page content
    const title = data.title || "نامشخص";
    document.getElementById("title").textContent = title;
    document.getElementById("overview").textContent = data.overview || "خلاصه‌ای در دسترس نیست.";
    document.getElementById("genre").innerHTML = `<strong>ژانر:</strong> ${data.genre || "نامشخص"}`;
    document.getElementById("year").innerHTML = `<strong>سال تولید:</strong> ${data.year || "نامشخص"}`;
    document.getElementById("rating").innerHTML = `<strong>امتیاز:</strong> ${data.rating || "نامشخص"}/10`;

    // Update images
    const poster = data.poster || "https://via.placeholder.com/500";
    document.getElementById("poster").src = poster;
    document.getElementById("poster").alt = `پوستر سریال ${title}`;
    document.getElementById("series-bg").style.backgroundImage = data.backdrop
      ? `url('${data.backdrop}')`
      : "url('https://via.placeholder.com/1920x1080')";

    // Update trailer
    const trailerContainer = document.getElementById("trailer");
    if (data.trailer) {
      trailerContainer.src = data.trailer;
      trailerContainer.title = `تریلر سریال ${title}`;
    } else {
      trailerContainer.outerHTML = '<p class="text-yellow-500">تریلر در دسترس نیست</p>';
    }

    // Update meta tags and page title
    document.getElementById("meta-title").textContent = `${title} - فیری مووی`;
    document.querySelector('meta[name="description"]').setAttribute("content", `${data.overview || "جزئیات و دانلود سریال " + title + " در فیری مووی."}`);
    document.querySelector('meta[property="og:title"]').setAttribute("content", `${title} - فیری مووی`);
    document.querySelector('meta[property="og:description"]').setAttribute("content", data.overview || "جزئیات و دانلود سریال در فیری مووی.");
    document.querySelector('meta[property="og:image"]').setAttribute("content", poster);
    document.querySelector('meta[name="twitter:title"]').setAttribute("content", `${title} - فیری مووی`);
    document.querySelector('meta[name="twitter:description"]').setAttribute("content", data.overview || "جزئیات و دانلود سریال در فیری مووی.");
    document.querySelector('meta[name="twitter:image"]').setAttribute("content", poster);

    // Update structured data (Schema)
    const schema = {
      "@context": "https://schema.org",
      "@type": "TVSeries",
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
      },
      "numberOfSeasons": data.numberOfSeasons || "0"
    };
    document.getElementById("series-schema").textContent = JSON.stringify(schema);

    // Download links
    const downloadLinks = `
      <a href="${data.download_links?.primary || '#'}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" rel="nofollow">دانلود سریال (لینک اصلی)</a>
      <a href="${data.download_links?.secondary || '#'}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" rel="nofollow">دانلود سریال (لینک کمکی)</a>
      <a href="${data.download_links?.tertiary || '#'}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" rel="nofollow">دانلود سریال (لینک کمکی)</a>
      <button id="add-to-watchlist" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">افزودن به واچ لیست</button>
    `;
    document.getElementById("download-links").innerHTML = downloadLinks;

    // Add to watchlist
    document.getElementById("add-to-watchlist").addEventListener("click", () => {
      let watchlist = JSON.parse(localStorage.getItem("watchlist")) || { movies: [], series: [] };
      const normalizedSeriesId = String(seriesId);
      if (!watchlist.series.includes(normalizedSeriesId)) {
        watchlist.series.push(normalizedSeriesId);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        alert("سریال به واچ لیست اضافه شد!");
      } else {
        alert("سریال قبلاً در واچ لیست است!");
      }
    });
  } catch (error) {
    console.error("خطا در دریافت اطلاعات:", error);
    document.getElementById("download-links").innerHTML = `<p class="text-red-500">خطا در دریافت اطلاعات: ${error.message}</p>`;
  }
}

// Theme toggle
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  const icon = document.querySelector("#theme-toggle i");
  icon.classList.toggle("fa-sun");
  icon.classList.toggle("fa-moon");
});

// Mobile menu toggle
document.getElementById("menu-toggle").addEventListener("click", () => {
  document.getElementById("mobile-menu").classList.toggle("hidden");
});

getSeriesDetails();