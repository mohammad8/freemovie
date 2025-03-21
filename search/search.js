// searchMovies.js
const apiKey = '1dc4cbf81f0accf4fa108820d551dafc'; // TMDb API key
const language = 'fa-IR'; // Language set to Persian (Iran)
const baseImageUrl = 'https://image.tmdb.org/t/p/w500'; // TMDb base image URL
const defaultPoster = 'https://m4tinbeigi-official.github.io/freemovie/images/default-freemovie.png'; // Default poster fallback
let apiKeySwitcher; // Global variable to hold the switcher instance

// Initialize the API key switcher
async function initializeSwitcher() {
    apiKeySwitcher = await loadApiKeys(); // استفاده از loadApiKeys سراسری
}

async function searchMovies(query) {
    const movieResults = document.getElementById('movie-results');
    const tvResults = document.getElementById('tv-results');
    const movieTitle = document.getElementById('movie-title');
    const tvTitle = document.getElementById('tv-title');

    movieResults.innerHTML = '';
    tvResults.innerHTML = '';
    movieTitle.textContent = `نتایج جستجو فیلم ${query}`;
    tvTitle.textContent = `نتایج جستجو سریال ${query}`;

    try {
        // Define TMDb search endpoints
        const movieSearchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=${language}&query=${encodeURIComponent(query)}`;
        const tvSearchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=${language}&query=${encodeURIComponent(query)}`;

        // Fetch movie data
        const movieRes = await fetch(movieSearchUrl);
        if (!movieRes.ok) throw new Error(`خطای سرور (فیلم‌ها): ${movieRes.status}`);
        const movieData = await movieRes.json();
        const movies = movieData.results || [];

        // Fetch TV show data
        const tvRes = await fetch(tvSearchUrl);
        if (!tvRes.ok) throw new Error(`خطای سرور (سریال‌ها): ${tvRes.status}`);
        const tvShows = await tvRes.json();
        const tvSeries = tvShows.results || [];

        console.log('Movie results:', movieData); // Debugging
        console.log('TV results:', tvShows); // Debugging

        if (tvSeries.length > 0 || movies.length > 0) {
            // Render TV shows first (prioritized as in original PHP)
            if (tvSeries.length > 0) {
                for (const tv of tvSeries) {
                    let poster = defaultPoster;
                    // Fetch IMDb ID and poster from OMDB
                    const tvExternalIdsUrl = `https://api.themoviedb.org/3/tv/${tv.id}/external_ids?api_key=${apiKey}`;
                    try {
                        const externalIdsRes = await fetch(tvExternalIdsUrl);
                        if (!externalIdsRes.ok) throw new Error(`خطای سرور (شناسه‌های خارجی سریال): ${externalIdsRes.status}`);
                        const externalIdsData = await externalIdsRes.json();
                        const imdbId = externalIdsData.imdb_id || '';
                        if (imdbId) {
                            const omdbData = await apiKeySwitcher.fetchWithKeySwitch(
                                (key) => `https://www.omdbapi.com/?i=${imdbId}&apikey=${key}`
                            );
                            poster = omdbData.Poster && omdbData.Poster !== 'N/A' ? omdbData.Poster : defaultPoster;
                        }
                    } catch (fetchError) {
                        console.warn(`خطا در دریافت پوستر سریال ${tv.id} از OMDB:`, fetchError.message);
                    }

                    // Remove "300" before ".jpg"
                    let posterUrl = poster;
                    posterUrl = posterUrl.replace(/300(?=\.jpg$)/i, '');

                    const tvId = tv.id;
                    const title = tv.name || 'نامشخص';
                    const year = tv.first_air_date ? tv.first_air_date.substr(0, 4) : 'نامشخص';

                    tvResults.innerHTML += `
                        <div class="group relative">
                            <img src="${posterUrl}" alt="${title}" class="w-full h-auto rounded-lg shadow-lg">
                            <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                                <h3 class="text-lg font-bold">${title}</h3>
                                <p class="text-sm">${year}</p>
                                <a href="../series/index.html?id=${tvId}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                            </div>
                        </div>
                    `;
                }
            } else {
                tvResults.innerHTML = '<p class="text-center text-red-500">سریالی یافت نشد!</p>';
            }

            // Render movies
            if (movies.length > 0) {
                for (const movie of movies) {
                    let poster = defaultPoster;
                    // Fetch IMDb ID and poster from OMDB
                    const movieExternalIdsUrl = `https://api.themoviedb.org/3/movie/${movie.id}/external_ids?api_key=${apiKey}`;
                    try {
                        const externalIdsRes = await fetch(movieExternalIdsUrl);
                        if (!externalIdsRes.ok) throw new Error(`خطای سرور (شناسه‌های خارجی فیلم): ${externalIdsRes.status}`);
                        const externalIdsData = await externalIdsRes.json();
                        const imdbId = externalIdsData.imdb_id || '';
                        if (imdbId) {
                            const omdbData = await apiKeySwitcher.fetchWithKeySwitch(
                                (key) => `https://www.omdbapi.com/?i=${imdbId}&apikey=${key}`
                            );
                            poster = omdbData.Poster && omdbData.Poster !== 'N/A' ? omdbData.Poster : defaultPoster;
                        }
                    } catch (fetchError) {
                        console.warn(`خطا در دریافت پوستر فیلم ${movie.id} از OMDB:`, fetchError.message);
                    }

                    // Remove "300" before ".jpg"
                    let posterUrl = poster;
                    posterUrl = posterUrl.replace(/300(?=\.jpg$)/i, '');

                    const movieId = movie.id;
                    const title = movie.title || 'نامشخص';
                    const year = movie.release_date ? movie.release_date.substr(0, 4) : 'نامشخص';

                    movieResults.innerHTML += `
                        <div class="group relative">
                            <img src="${posterUrl}" alt="${title}" class="w-full h-auto rounded-lg shadow-lg">
                            <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                                <h3 class="text-lg font-bold">${title}</h3>
                                <p class="text-sm">${year}</p>
                                <a href="../movie/index.html?id=${movieId}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                            </div>
                        </div>
                    `;
                }
            } else {
                movieResults.innerHTML = '<p class="text-center text-red-500">فیلمی یافت نشد!</p>';
            }
        } else {
            movieResults.innerHTML = '<p class="text-center text-red-500">نتیجه‌ای یافت نشد!</p>';
            tvResults.innerHTML = '';
        }
    } catch (error) {
        console.error('خطا در دریافت اطلاعات:', error);
        movieResults.innerHTML = '<p class="text-center text-red-500">خطایی رخ داد! لطفاً دوباره تلاش کنید.</p>';
        tvResults.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeSwitcher();
    document.getElementById('search').addEventListener(
        'input',
        debounce(function () {
            const query = this.value.trim();
            if (query.length > 2) {
                searchMovies(query);
            } else {
                document.getElementById('movie-title').textContent = 'نتایج جستجو فیلم';
                document.getElementById('tv-title').textContent = 'نتایج جستجو سریال';
                document.getElementById('movie-results').innerHTML = `
                    <div class="skeleton"></div>
                    <div class="skeleton"></div>
                `;
                document.getElementById('tv-results').innerHTML = '';
            }
        }, 300)
    );
});

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const icon = document.querySelector('#theme-toggle i');
    icon.classList.toggle('fa-sun');
    icon.classList.toggle('fa-moon');
});

document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('mobile-menu')?.classList.toggle('hidden');
});