const serverUrl = "https://freemoviez.ir/api/tmdb-series.php"; // Hypothetical API endpoint
const seriesId = new URLSearchParams(window.location.search).get("id");

async function getSeriesDetails() {
    try {
        if (!seriesId) {
            throw new Error("شناسه سریال در URL وجود ندارد!");
        }

        const res = await fetch(`${serverUrl}?id=${seriesId}`);
        const data = await res.json();

        if (!data.success) {
            throw new Error(data.error || "خطا در دریافت اطلاعات سریال");
        }

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
            trailerContainer.innerHTML = `<iframe src="${data.trailer}" title="تریلر سریال ${title}" frameborder="0" allowfullscreen class="w-full h-64 md:h-96 mx-auto"></iframe>`;
        } else {
            trailerContainer.innerHTML = '<p class="text-yellow-500">تریلر در دسترس نیست</p>';
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

        // Generate download links
        const downloadLinksContainer = document.getElementById("download-links");
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

        // Add to watchlist functionality
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

// Theme toggle functionality
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const icon = document.querySelector("#theme-toggle i");
    icon.classList.toggle("fa-sun");
    icon.classList.toggle("fa-moon");
});

// Mobile menu toggle functionality
document.getElementById("menu-toggle").addEventListener("click", () => {
    document.getElementById("mobile-menu").classList.toggle("hidden");
});

// Execute the function to fetch series details
getSeriesDetails();