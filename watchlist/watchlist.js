const tmdbApiKey = "1dc4cbf81f0accf4fa108820d551dafc";

async function loadWatchlist() {
    const moviesContainer = document.getElementById("movies-watchlist");
    const seriesContainer = document.getElementById("series-watchlist");
    const emptyMessage = document.getElementById("empty-watchlist");
    
    moviesContainer.innerHTML = '<div class="skeleton w-full h-64"></div>';
    seriesContainer.innerHTML = '<div class="skeleton w-full h-64"></div>';

    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || { movies: [], series: [] };

    if (watchlist.movies.length === 0 && watchlist.series.length === 0) {
        moviesContainer.innerHTML = "";
        seriesContainer.innerHTML = "";
        emptyMessage.classList.remove("hidden");
        return;
    }

    moviesContainer.innerHTML = "";
    seriesContainer.innerHTML = "";

    try {
        // Load movies
        for (const movieId of watchlist.movies) {
            await fetchAndDisplayItem(movieId, "movie", moviesContainer);
        }

        // Load series
        for (const seriesId of watchlist.series) {
            await fetchAndDisplayItem(seriesId, "tv", seriesContainer);
        }
    } catch (error) {
        console.error("خطا در دریافت اطلاعات واچ لیست:", error);
        moviesContainer.innerHTML = '<div class="text-red-400">خطا در بارگذاری فیلم‌ها</div>';
        seriesContainer.innerHTML = '<div class="text-red-400">خطا در بارگذاری سریال‌ها</div>';
    }
}

async function fetchAndDisplayItem(itemId, type, container) {
    const res = await fetch(`https://api.themoviedb.org/3/${type}/${itemId}?api_key=${tmdbApiKey}&language=fa-IR`);
    const item = await res.json();
    
    const itemCard = `
        <div class="group relative">
            <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item.title || item.name}" class="w-full h-auto rounded-lg shadow-lg">
            <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                <h3 class="text-lg font-bold">${item.title || item.name}</h3>
                <p class="text-sm">${item.overview.slice(0, 100)}...</p>
                <a href="/freemovie/${type}/index.html?id=${item.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">مشاهده</a>
                <button class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onclick="removeFromWatchlist('${item.id}', '${type}')">حذف از واچ لیست</button>
            </div>
        </div>
    `;
    container.innerHTML += itemCard;
}

function removeFromWatchlist(itemId, type) {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || { movies: [], series: [] };
    
    if (type === "movie") {
        watchlist.movies = watchlist.movies.filter(id => id !== itemId);
    } else if (type === "tv") {
        watchlist.series = watchlist.series.filter(id => id !== itemId);
    }

    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    alert("آیتم از واچ لیست حذف شد!");
    loadWatchlist();
}

// Theme & Menu events
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const icon = document.querySelector("#theme-toggle i");
    icon.classList.toggle("fa-sun");
    icon.classList.toggle("fa-moon");
});

document.getElementById("menu-toggle").addEventListener("click", () => {
    document.getElementById("mobile-menu").classList.toggle("hidden");
});

window.onload = loadWatchlist;