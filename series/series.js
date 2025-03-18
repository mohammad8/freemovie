// تعریف URL سرور و استخراج شناسه سریال از URL
const serverUrl = "https://freemoviez.ir/api/tmdb-series.php"; // آدرس فرضی API
const seriesId = new URLSearchParams(window.location.search).get("id");

// تابع اصلی برای دریافت و نمایش جزئیات سریال
async function getSeriesDetails() {
    try {
        // بررسی وجود شناسه سریال در URL
        if (!seriesId) {
            throw new Error("شناسه سریال در URL وجود ندارد!");
        }

        // ارسال درخواست به سرور
        const res = await fetch(`${serverUrl}?id=${seriesId}`);
        if (!res.ok) {
            throw new Error(`خطای سرور: ${res.status}`);
        }

        // تبدیل پاسخ به JSON
        const data = await res.json();

        // بررسی موفقیت‌آمیز بودن پاسخ
        if (!data.success) {
            throw new Error(data.error || "خطا در دریافت اطلاعات سریال");
        }

        // به‌روزرسانی محتوای صفحه
        const title = data.title || "نامشخص";
        const titleElement = document.getElementById("title");
        if (titleElement) titleElement.textContent = title;

        const overviewElement = document.getElementById("overview");
        if (overviewElement) overviewElement.textContent = data.overview || "خلاصه‌ای در دسترس نیست.";

        const genreElement = document.getElementById("genre");
        if (genreElement) genreElement.innerHTML = `<strong>ژانر:</strong> ${data.genre || "نامشخص"}`;

        const yearElement = document.getElementById("year");
        if (yearElement) yearElement.innerHTML = `<strong>سال تولید:</strong> ${data.year || "نامشخص"}`;

        const ratingElement = document.getElementById("rating");
        if (ratingElement) ratingElement.innerHTML = `<strong>امتیاز:</strong> ${data.rating || "نامشخص"}/10`;

        // به‌روزرسانی تصاویر
        const poster = data.poster || "https://via.placeholder.com/500";
        const posterElement = document.getElementById("poster");
        if (posterElement) {
            posterElement.src = poster;
            posterElement.alt = `پوستر سریال ${title}`;
        }

        const seriesBgElement = document.getElementById("series-bg");
        if (seriesBgElement) {
            seriesBgElement.style.backgroundImage = data.backdrop
                ? `url('${data.backdrop}')`
                : "url('https://via.placeholder.com/1920x1080')";
        }

        // به‌روزرسانی تریلر
        const trailerContainer = document.getElementById("trailer");
        if (trailerContainer) {
            if (data.trailer) {
                trailerContainer.innerHTML = `<iframe src="${data.trailer}" title="تریلر سریال ${title}" frameborder="0" allowfullscreen class="w-full h-64 md:h-96 mx-auto"></iframe>`;
            } else {
                trailerContainer.innerHTML = '<p class="text-yellow-500">تریلر در دسترس نیست</p>';
            }
        }

        // به‌روزرسانی متا تگ‌ها و عنوان صفحه
        const metaTitleElement = document.getElementById("meta-title");
        if (metaTitleElement) metaTitleElement.textContent = `${title} - فیری مووی`;

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) metaDescription.setAttribute("content", `${data.overview || "جزئیات و دانلود سریال " + title + " در فیری مووی."}`);

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute("content", `${title} - فیری مووی`);

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) ogDescription.setAttribute("content", data.overview || "جزئیات و دانلود سریال در فیری مووی.");

        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.setAttribute("content", poster);

        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle) twitterTitle.setAttribute("content", `${title} - فیری مووی`);

        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        if (twitterDescription) twitterDescription.setAttribute("content", data.overview || "جزئیات و دانلود سریال در فیری مووی.");

        const twitterImage = document.querySelector('meta[name="twitter:image"]');
        if (twitterImage) twitterImage.setAttribute("content", poster);

        // به‌روزرسانی داده‌های ساختاریافته (Schema)
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
        const schemaElement = document.getElementById("series-schema");
        if (schemaElement) schemaElement.textContent = JSON.stringify(schema);

        // تولید لینک‌های دانلود
        const downloadLinksContainer = document.getElementById("download-links");
        if (downloadLinksContainer) {
            let downloadHtml = '';
            if (data.download_links && Object.keys(data.download_links).length > 0) {
                for (const season in data.download_links) {
                    downloadHtml += `<h3 class="text-xl font-bold mt-4">فصل ${season}</h3>`;
                    for (const quality in data.download_links[season]) {
                        const qualityNum = quality.split('_')[1];
                        downloadHtml += `
                            <a href="${data.download_links[season][quality]}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mx-2 my-1 inline-block" rel="nofollow">
                                دانلود کیفیت ${qualityNum}
                            </a>`;
                    }
                }
            } else {
                downloadHtml = '<p class="text-yellow-500">لینک‌های دانلود در دسترس نیست</p>';
            }
            downloadLinksContainer.innerHTML = downloadHtml;
        }

        // افزودن قابلیت اضافه کردن به واچ‌لیست
        const watchlistButton = document.getElementById("add-to-watchlist");
        if (watchlistButton) {
            watchlistButton.addEventListener("click", () => {
                let watchlist = JSON.parse(localStorage.getItem("watchlist")) || { movies: [], series: [] };
                const normalizedSeriesId = String(seriesId);
                if (!watchlist.series.includes(normalizedSeriesId)) {
                    watchlist.series.push(normalizedSeriesId);
                    localStorage.setItem("watchlist", JSON.stringify(watchlist));
                    alert("سریال به واچ‌لیست اضافه شد!");
                } else {
                    alert("سریال قبلاً در واچ‌لیست است!");
                }
            });
        }

    } catch (error) {
        // نمایش خطا در کنسول و صفحه
        console.error("خطا در دریافت اطلاعات:", error);
        const downloadLinksContainer = document.getElementById("download-links");
        if (downloadLinksContainer) {
            downloadLinksContainer.innerHTML = `<p class="text-red-500">خطا در دریافت اطلاعات: ${error.message}</p>`;
        }
    }
}

// اجرای تابع برای دریافت جزئیات سریال
getSeriesDetails();