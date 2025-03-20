// fetchAndDisplayContent.js
import { loadApiKeys } from 'apiKeySwitcher.js';

const apiKey = '1dc4cbf81f0accf4fa108820d551dafc'; // TMDb API key
const language = 'fa'; // Language set to Persian
const baseImageUrl = 'https://image.tmdb.org/t/p/w500'; // TMDb base image URL
const defaultPoster = 'https://via.placeholder.com/300x450?text=No+Image'; // Default fallback image

// TMDb API endpoints
const apiUrls = {
    now_playing: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=${language}`,
    tv_trending: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=${language}`
};

let apiKeySwitcher;

async function initializeSwitcher() {
    apiKeySwitcher = await loadApiKeys();
}

async function fetchAndDisplayContent() {
    const movieContainer = document.getElementById('new-movies');
    const tvContainer = document.getElementById('trending-tv');

    const skeletonHTML = `
        <div class="skeleton w-full"></div>
        <div class="skeleton w-full"></div>
        <div class="skeleton w-full"></div>
        <div class="skeleton w-full"></div>
    `;
    movieContainer.innerHTML = skeletonHTML;
    tvContainer.innerHTML = skeletonHTML;

    try {
        // Fetch movie data
        const movieRes = await fetch(apiUrls.now_playing);
        if (!movieRes.ok) throw new Error(`خطای سرور (فیلم‌ها): ${movieRes.status}`);
        const movieData = await movieRes.json();
        const movies = movieData.results || [];

        // Fetch TV series data
        const tvRes = await fetch(apiUrls.tv_trending);
        if (!tvRes.ok) throw new Error(`خطای سرور (سریال‌ها): ${tvRes.status}`);
        const tvData = await tvRes.json();
        const tvSeries = tvData.results || [];

        movieContainer.innerHTML = '';
        tvContainer.innerHTML = '';

        if (movies.length > 0 || tvSeries.length > 0) {
            // Process and display movies
            for (const movie of movies) {
                let poster = defaultPoster;
                // Fetch IMDb ID and poster from OMDB
                const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}/external_ids?api_key=${apiKey}`;
                try {
                    const detailsRes = await fetch(movieDetailsUrl);
                    if (!detailsRes.ok) throw new Error(`خطای سرور (جزئیات فیلم): ${detailsRes.status}`);
                    const detailsData = await detailsRes.json();
                    const imdbId = detailsData.imdb_id || '';
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
                //posterUrl = posterUrl.replace(/300(?=\.jpg$)/i, '');

                const title = movie.title || 'نامشخص';
                const overview = movie.overview ? movie.overview.slice(0, 100) + '...' : 'توضیحات موجود نیست';

                movieContainer.innerHTML += `
                    <div class="group relative">
                        <img src="${posterUrl}" alt="${title}" class="w-full h-auto rounded-lg shadow-lg">
                        <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                            <h3 class="text-lg font-bold text-white">${title}</h3>
                            <p class="text-sm text-gray-200">${overview}</p>
                            <a href="/freemovie/movie/index.html?id=${movie.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">مشاهده</a>
                        </div>
                    </div>
                `;
            }

            // Process and display TV series
            for (const tv of tvSeries) {
                let poster = defaultPoster;
                // Fetch IMDb ID and poster from OMDB
                const tvDetailsUrl = `https://api.themoviedb.org/3/tv/${tv.id}/external_ids?api_key=${apiKey}`;
                try {
                    const detailsRes = await fetch(tvDetailsUrl);
                    if (!detailsRes.ok) throw new Error(`خطای سرور (جزئیات سریال): ${detailsRes.status}`);
                    const detailsData = await detailsRes.json();
                    const imdbId = detailsData.imdb_id || '';
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

                const title = tv.name || 'نامشخص';
                const overview = tv.overview ? tv.overview.slice(0, 100) + '...' : 'توضیحات موجود نیست';

                tvContainer.innerHTML += `
                    <div class="group relative">
                        <img src="${posterUrl}" alt="${title}" class="w-full h-auto rounded-lg shadow-lg">
                        <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                            <h3 class="text-lg font-bold text-white">${title}</h3>
                            <p class="text-sm text-gray-200">${overview}</p>
                            <a href="/freemovie/series/index.html?id=${tv.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">مشاهده</a>
                        </div>
                    </div>
                `;
            }

            if (movies.length === 0) {
                movieContainer.innerHTML = '<p class="text-center text-red-500">فیلمی یافت نشد!</p>';
            }
            if (tvSeries.length === 0) {
                tvContainer.innerHTML = '<p class="text-center text-red-500">سریالی یافت نشد!</p>';
            }
        } else {
            movieContainer.innerHTML = '<p class="text-center text-red-500">داده‌ای یافت نشد!</p>';
            tvContainer.innerHTML = '<p class="text-center text-red-500">داده‌ای یافت نشد!</p>';
        }
    } catch (error) {
        console.error('خطا در دریافت داده‌ها:', error);
        movieContainer.innerHTML = '<p class="text-center text-red-500">خطایی رخ داد! لطفاً دوباره تلاش کنید.</p>';
        tvContainer.innerHTML = '<p class="text-center text-red-500">خطایی رخ داد! لطفاً دوباره تلاش کنید.</p>';
    }
}

function manageNotification() {
    const notification = document.getElementById('notification');
    const closeButton = document.getElementById('close-notification');
    const supportButton = document.getElementById('support-button');

    if (!localStorage.getItem('notificationClosed')) {
        notification.classList.remove('hidden');
    }

    closeButton.addEventListener('click', () => {
        notification.classList.add('hidden');
        localStorage.setItem('notificationClosed', 'true');
    });

    supportButton.addEventListener('click', () => {
        window.open('https://twitter.com/intent/tweet?text=من از فیری مووی حمایت می‌کنم! یک سایت عالی برای تماشای فیلم و سریال: https://b2n.ir/freemovie', '_blank');
    });
}

function manageDisclaimerNotice() {
    const notice = document.getElementById('disclaimer-notice');
    const closeButton = document.getElementById('close-disclaimer');

    if (!localStorage.getItem('disclaimerNoticeClosed')) {
        notice.classList.remove('hidden');
    } else {
        notice.classList.add('hidden');
    }

    closeButton.addEventListener('click', () => {
        notice.classList.add('hidden');
        localStorage.setItem('disclaimerNoticeClosed', 'true');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const fab = document.getElementById('fab');
    const fabOptions = document.getElementById('fabOptions');

    fab.addEventListener('click', function(event) {
        event.stopPropagation();
        fabOptions.classList.toggle('hidden');
    });

    document.addEventListener('click', function(event) {
        if (!fab.contains(event.target) && !fabOptions.contains(event.target)) {
            fabOptions.classList.add('hidden');
        }
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    await initializeSwitcher();
    fetchAndDisplayContent();
    manageNotification();
    manageDisclaimerNotice();
});