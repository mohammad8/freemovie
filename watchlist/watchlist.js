const tmdbMovieUrl = "https://freemoviez.ir/api/tmdb-movie.php";
const tmdbSeriesUrl = "https://freemoviez.ir/api/tmdb-series.php";

async function loadWatchlist() {
    const moviesContainer = document.getElementById("movies-watchlist");
    const seriesContainer = document.getElementById("series-watchlist");
    const emptyMessage = document.getElementById("empty-watchlist");

    if (!moviesContainer || !seriesContainer || !emptyMessage) {
        console.error("عناصر واچ‌لیست در HTML یافت نشدند.");
        return;
    }

    moviesContainer.innerHTML = '<div class="skeleton w-full h-64"></div>';
    seriesContainer.innerHTML = '<div class="skeleton w-full h-64"></div>';

    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || { movies: [], series: [] };
    if (!watchlist.movies || !watchlist.series) {
        watchlist = { movies: [], series: [] };
    }

    if (watchlist.movies.length === 0 && watchlist.series.length === 0) {
        moviesContainer.innerHTML = "";
        seriesContainer.innerHTML = "";
        emptyMessage.classList.remove("hidden");
        return;
    }

    emptyMessage.classList.add("hidden");
    moviesContainer.innerHTML = "";
    seriesContainer.innerHTML = "";

    try {
        for (const movieId of watchlist.movies) {
            await fetchAndDisplayItem(movieId, "movie", moviesContainer, tmdbMovieUrl);
        }
        for (const seriesId of watchlist.series) {
            await fetchAndDisplayItem(seriesId, "series", seriesContainer, tmdbSeriesUrl);
        }
    } catch (error) {
        console.error("خطا در دریافت اطلاعات واچ‌لیست:", error);
        // Remove the lines that overwrite containers with error messages
    }
}
async function fetchAndDisplayItem(itemId, type, container, apiUrl) {
    try {
        const res = await fetch(`${apiUrl}?id=${itemId}`);
        if (!res.ok) throw new Error(`خطای سرور: ${res.status}`);

        const data = await res.json();
        console.log(`Response for ${type} ID ${itemId}:`, data); // Log the response
        if (!data.success) throw new Error(data.error || "خطا در دریافت اطلاعات");

        const item = {
            id: itemId,
            title: data.title || "نامشخص",
            overview: data.overview || "خلاصه‌ای در دسترس نیست.",
            poster: data.poster || "https://via.placeholder.com/300x450?text=No+Image"
        };

        const itemCard = `...`; // Rest of the code remains unchanged
        container.innerHTML += itemCard;
    } catch (error) {
        console.error(`خطا در دریافت اطلاعات ${type === "movie" ? "فیلم" : "سریال"} با شناسه ${itemId}:`, error);
        container.innerHTML += '<div class="text-red-500">خطا در بارگذاری آیتم</div>';
    }
}

function removeFromWatchlist(itemId, type) {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || { movies: [], series: [] };
    
    const normalizedItemId = String(itemId); // Normalize ID to string for consistent comparison
    if (type === "movie") {
        watchlist.movies = watchlist.movies.filter(id => String(id) !== normalizedItemId);
    } else if (type === "series") {
        watchlist.series = watchlist.series.filter(id => String(id) !== normalizedItemId);
    }

    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    alert("آیتم از واچ‌لیست حذف شد!");
    loadWatchlist(); // Refresh the watchlist display
}

// Load the watchlist when the page loads
document.addEventListener("DOMContentLoaded", loadWatchlist);