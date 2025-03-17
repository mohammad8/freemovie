const apiUrl = "https://freemoviez.ir/api/tmdb.php";

// Function to fetch and display movies and TV series separately
async function fetchAndDisplayContent() {
    const movieContainer = document.getElementById("new-movies");
    const tvContainer = document.getElementById("trending-tv");

    // Show loading skeletons
    const skeletonHTML = `
        <div class="skeleton w-full"></div>
        <div class="skeleton w-full"></div>
        <div class="skeleton w-full"></div>
        <div class="skeleton w-full"></div>
    `;
    movieContainer.innerHTML = skeletonHTML;
    tvContainer.innerHTML = skeletonHTML;

    try {
        const res = await fetch(`${apiUrl}?type=now_playing`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        const items = data.results;

        // Clear loading skeletons
        movieContainer.innerHTML = "";
        tvContainer.innerHTML = "";

        if (items && items.length > 0) {
            // Separate movies and TV series
            const movies = items.filter(item => item.type === 'movie');
            const tvSeries = items.filter(item => item.type === 'tv');

            // Display movies
            movies.forEach(movie => {
                const posterPath = movie.poster_path || "https://via.placeholder.com/500x750?text=No+Image";
                const title = movie.title || "نامشخص";
                const overview = movie.overview ? movie.overview.slice(0, 100) + "..." : "توضیحات موجود نیست";

                movieContainer.innerHTML += `
                    <div class="group relative">
                        <img src="${posterPath}" alt="${title}" class="w-full h-auto rounded-lg shadow-lg">
                        <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                            <h3 class="text-lg font-bold">${title}</h3>
                            <p class="text-sm">${overview}</p>
                            <a href="/freemovie/movie/index.html?id=${movie.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                        </div>
                    </div>
                `;
            });

            // Display TV series
            tvSeries.forEach(tv => {
                const posterPath = tv.poster_path || "https://via.placeholder.com/500x750?text=No+Image";
                const title = tv.title || "نامشخص";
                const overview = tv.overview ? tv.overview.slice(0, 100) + "..." : "توضیحات موجود نیست";

                tvContainer.innerHTML += `
                    <div class="group relative">
                        <img src="${posterPath}" alt="${title}" class="w-full h-auto rounded-lg shadow-lg">
                        <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                            <h3 class="text-lg font-bold">${title}</h3>
                            <p class="text-sm">${overview}</p>
                            <a href="/freemovie/series/index.html?id=${tv.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                        </div>
                    </div>
                `;
            });

            // Handle empty sections
            if (movies.length === 0) {
                movieContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">فیلمی یافت نشد!</p>';
            }
            if (tvSeries.length === 0) {
                tvContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">سریالی یافت نشد!</p>';
            }
        } else {
            movieContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">داده‌ای یافت نشد!</p>';
            tvContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">داده‌ای یافت نشد!</p>';
        }
    } catch (error) {
        console.error("خطا در دریافت داده‌ها:", error);
        movieContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">خطایی رخ داد! لطفاً دوباره تلاش کنید.</p>';
        tvContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">خطایی رخ داد! لطفاً دوباره تلاش کنید.</p>';
    }
}

// Call the function on page load
document.addEventListener("DOMContentLoaded", () => {
    fetchAndDisplayContent();
    manageNotification();
});