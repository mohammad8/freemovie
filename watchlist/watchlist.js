const tmdbApiKey = "abb7cdf7";
const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

async function getWatchlistMovies() {
    const container = document.getElementById('watchlist');
    container.innerHTML = '';

    for (const id of watchlist) {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbApiKey}&language=fa-IR`);
        const movie = await res.json();
        container.innerHTML += `
            <div class="group relative">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="w-full h-auto rounded-lg shadow-lg">
                <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                    <h3 class="text-lg font-bold">${movie.title}</h3>
                    <p class="text-sm">${movie.overview.slice(0, 100)}...</p>
                    <a href="movie.html?id=${movie.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                </div>
            </div>
        `;
    }
}

getWatchlistMovies();

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const icon = document.querySelector('#theme-toggle i');
    icon.classList.toggle('fa-sun');
    icon.classList.toggle('fa-moon');
});

document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});