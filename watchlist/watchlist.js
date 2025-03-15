const tmdbApiKey = "1dc4cbf81f0accf4fa108820d551dafc";

async function loadWatchlist() {
    const watchlistContainer = document.getElementById("watchlist");
    const emptyMessage = document.getElementById("empty-watchlist");
    watchlistContainer.innerHTML = '<div class="skeleton w-full h-64"></div>'; // نمایش اسکلتون هنگام بارگذاری

    // دریافت واچ لیست از لوکال استوریج
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    if (watchlist.length === 0) {
        watchlistContainer.innerHTML = "";
        emptyMessage.classList.remove("hidden");
        return;
    }

    watchlistContainer.innerHTML = ""; // حذف اسکلتون‌ها

    try {
        for (const movieId of watchlist) {
            const res = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}&language=fa-IR`
            );
            const movie = await res.json();

            const externalIdsRes = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}/external_ids?api_key=${tmdbApiKey}`
            );
            const externalIds = await externalIdsRes.json();
            const imdbID = externalIds.imdb_id.replace("tt", "");
            const year = movie.release_date.split("-")[0];

            const movieCard = `
                <div class="group relative">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="w-full h-auto rounded-lg shadow-lg">
                    <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                        <h3 class="text-lg font-bold">${movie.title}</h3>
                        <p class="text-sm">${movie.overview.slice(0, 100)}...</p>
                        <a href="/freemovie/movie/index.html?id=${movie.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">مشاهده</a>
                        <button class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onclick="removeFromWatchlist('${movie.id}')">حذف از واچ لیست</button>
                    </div>
                </div>
            `;
            watchlistContainer.innerHTML += movieCard;
        }
    } catch (error) {
        console.error("خطا در دریافت اطلاعات واچ لیست:", error);
        watchlistContainer.innerHTML = '<div class="text-red-400">خطا در بارگذاری واچ لیست</div>';
    }
}

// تابع حذف از واچ لیست
function removeFromWatchlist(movieId) {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    watchlist = watchlist.filter(id => id !== movieId);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    alert("فیلم از واچ لیست حذف شد!");
    loadWatchlist(); // بارگذاری مجدد واچ لیست
}

// رویدادهای ناوبری و تم
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const icon = document.querySelector("#theme-toggle i");
    icon.classList.toggle("fa-sun");
    icon.classList.toggle("fa-moon");
});

document.getElementById("menu-toggle").addEventListener("click", () => {
    document.getElementById("mobile-menu").classList.toggle("hidden");
});

// بارگذاری واچ لیست هنگام باز شدن صفحه
window.onload = loadWatchlist;