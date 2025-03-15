const tmdbApiKey = "1dc4cbf81f0accf4fa108820d551dafc";

// تابع برای دریافت فیلم‌های محبوب (اسلایدر)
async function getFeaturedMovies() {
    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&language=fa-IR`
        );
        const data = await res.json();
        const movies = data.results.slice(0, 5);
        const slider = document.getElementById("slider");
        slider.innerHTML = "";

        movies.forEach((movie) => {
            slider.innerHTML += `
                <div class="w-full flex-auto h-96 bg-cover bg-center snap-start" style="background-image: url('https://image.tmdb.org/t/p/original${movie.backdrop_path}')">
                    <div class="bg-black bg-opacity-50 h-full flex flex-col justify-center items-center">
                        <h2 class="text-3xl font-bold">${movie.title}</h2>
                        <p class="mt-2">${movie.overview.slice(0, 100)}...</p>
                        <a href="/freemovie/movie/index.html?id=${movie.id}" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("خطا در دریافت فیلم‌های محبوب:", error);
    }
}

// تابع برای دریافت فیلم‌های جدید
async function getNewMovies() {
    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/movie/now_playing?api_key=${tmdbApiKey}&language=fa-IR`
        );
        const data = await res.json();
        const movies = data.results;
        const container = document.getElementById("new-movies");
        container.innerHTML = "";

        movies.forEach((movie) => {
            container.innerHTML += `
                <div class="group relative">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="w-full h-auto rounded-lg shadow-lg">
                    <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                        <h3 class="text-lg font-bold">${movie.title}</h3>
                        <p class="text-sm">${movie.overview.slice(0, 100)}...</p>
                        <a href="/freemovie/movie/index.html?id=${movie.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("خطا در دریافت فیلم‌های جدید:", error);
    }
}

// تابع برای دریافت سریال‌های جدید
async function getNewSeries() {
    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/tv/popular?api_key=${tmdbApiKey}&language=fa-IR`
        );
        const data = await res.json();
        const series = data.results;
        const container = document.getElementById("new-series");
        container.innerHTML = "";

        series.forEach((show) => {
            container.innerHTML += `
                <div class="group relative">
                    <img src="https://image.tmdb.org/t/p/w500${show.poster_path}" alt="${show.name}" class="w-full h-auto rounded-lg shadow-lg">
                    <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                        <h3 class="text-lg font-bold">${show.name}</h3>
                        <p class="text-sm">${show.overview.slice(0, 100)}...</p>
                        <a href="/freemovie/series/index.html?id=${show.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("خطا در دریافت سریال‌های جدید:", error);
    }
}

// تابع برای تغییر تم
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const icon = document.querySelector("#theme-toggle i");
    icon.classList.toggle("fa-sun");
    icon.classList.toggle("fa-moon");
});

// تابع برای نمایش/مخفی کردن منوی موبایل
document.getElementById("menu-toggle").addEventListener("click", () => {
    document.getElementById("mobile-menu").classList.toggle("hidden");
});

// فراخوانی توابع برای بارگذاری داده‌ها
getFeaturedMovies();
getNewMovies();
getNewSeries();