const serverUrl = "https://freemoviez.ir/api/search-movies.php"; // Adjust if hosted elsewhere

async function searchMovies(query) {
    try {
        const url = `${serverUrl}?query=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        const movieResults = document.getElementById("movie-results");
        const tvResults = document.getElementById("tv-results");
        movieResults.innerHTML = "";
        tvResults.innerHTML = "";

        console.log("Server response:", data); // Debugging

        if (data.success && Array.isArray(data.results) && data.results.length > 0) {
            // Separate movies and TV shows
            const movies = data.results.filter(item => item.type === "movie");
            const tvShows = data.results.filter(item => item.type === "tv");

            // Render movies
            if (movies.length > 0) {
                movies.forEach((movie) => {
                    const poster = movie.poster || "https://via.placeholder.com/500x750?text=No+Image";
                    const movieId = movie.imdbID;
                    const title = movie.title || "نامشخص";
                    const year = movie.year || "نامشخص";

                    movieResults.innerHTML += `
                        <div class="group relative">
                            <img src="${poster}" alt="${title}" class="w-full h-auto rounded-lg shadow-lg">
                            <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                                <h3 class="text-lg font-bold">${title}</h3>
                                <p class="text-sm">${year}</p>
                                <a href="../movie/index.html?id=${movieId}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                            </div>
                        </div>
                    `;
                });
            } else {
                movieResults.innerHTML = '<p class="text-center text-red-500">فیلمی یافت نشد!</p>';
            }

            // Render TV shows
            if (tvShows.length > 0) {
                tvShows.forEach((tv) => {
                    const poster = tv.poster || "https://via.placeholder.com/500x750?text=No+Image";
                    const tvId = tv.imdbID;
                    const title = tv.title || "نامشخص";
                    const year = tv.year || "نامشخص";

                    tvResults.innerHTML += `
                        <div class="group relative">
                            <img src="${poster}" alt="${title}" class="w-full h-auto rounded-lg shadow-lg">
                            <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                                <h3 class="text-lg font-bold">${title}</h3>
                                <p class="text-sm">${year}</p>
                                <a href="../series/index.html?id=${tvId}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                            </div>
                        </div>
                    `;
                });
            } else {
                tvResults.innerHTML = '<p class="text-center text-red-500">سریالی یافت نشد!</p>';
            }
        } else {
            movieResults.innerHTML = '<p class="text-center text-red-500">نتیجه‌ای یافت نشد!</p>';
            tvResults.innerHTML = "";
        }
    } catch (error) {
        console.error("خطا در دریافت اطلاعات:", error);
        document.getElementById("movie-results").innerHTML = '<p class="text-center text-red-500">خطایی رخ داد! لطفاً دوباره تلاش کنید.</p>';
        document.getElementById("tv-results").innerHTML = "";
    }
}

document.getElementById("search").addEventListener(
    "input",
    debounce(function () {
        const query = this.value.trim();
        if (query.length > 2) {
            searchMovies(query);
        } else {
            document.getElementById("movie-results").innerHTML = `
                <div class="skeleton"></div>
                <div class="skeleton"></div>
                <div class="skeleton"></div>
                <div class="skeleton"></div>
            `;
            document.getElementById("tv-results").innerHTML = "";
        }
    }, 300)
);

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const icon = document.querySelector("#theme-toggle i");
    icon.classList.toggle("fa-sun");
    icon.classList.toggle("fa-moon");
});

document.getElementById("menu-toggle").addEventListener("click", () => {
    document.getElementById("mobile-menu").classList.toggle("hidden");
});