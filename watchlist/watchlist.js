const apiKey = '1dc4cbf81f0accf4fa108820d551dafc'; // Your TMDb API key
const language = 'fa-IR'; // Language set to Persian (Iran)
const baseImageUrl = 'https://image.tmdb.org/t/p/w500'; // TMDb base image URL for posters
const defaultPoster = 'https://via.placeholder.com/300x450?text=No+Image'; // Default poster fallback

async function loadWatchlist() {
    const moviesContainer = document.getElementById('movies-watchlist');
    const seriesContainer = document.getElementById('series-watchlist');
    const moviesHeading = document.getElementById('movies-heading');
    const seriesHeading = document.getElementById('series-heading');
    const emptyMessage = document.getElementById('empty-watchlist');

    if (!moviesContainer || !seriesContainer || !moviesHeading || !seriesHeading || !emptyMessage) {
        console.error('عناصر واچ‌لیست در HTML یافت نشدند.');
        return;
    }

    // Display skeleton placeholders while loading
    moviesContainer.innerHTML = '<div class="skeleton w-full h-64"></div>';
    seriesContainer.innerHTML = '<div class="skeleton w-full h-64"></div>';

    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || { movies: [], series: [] };
    const normalizedWatchlist = {
        movies: Array.isArray(watchlist.movies) ? watchlist.movies : [],
        series: Array.isArray(watchlist.series) ? watchlist.series : [],
    };

    if (normalizedWatchlist.movies.length === 0 && normalizedWatchlist.series.length === 0) {
        moviesContainer.innerHTML = '';
        seriesContainer.innerHTML = '';
        moviesHeading.classList.add('hidden');
        seriesHeading.classList.add('hidden');
        emptyMessage.classList.remove('hidden');
        return;
    }

    emptyMessage.classList.add('hidden');
    moviesContainer.innerHTML = '';
    seriesContainer.innerHTML = '';

    let moviesCount = 0;
    let seriesCount = 0;

    const moviePromises = normalizedWatchlist.movies.map(movieId =>
        fetchAndDisplayItem(movieId, 'movie', moviesContainer)
            .then(() => moviesCount++)
            .catch(() => {})
    );
    const seriesPromises = normalizedWatchlist.series.map(seriesId =>
        fetchAndDisplayItem(seriesId, 'series', seriesContainer)
            .then(() => seriesCount++)
            .catch(() => {})
    );

    await Promise.all([...moviePromises, ...seriesPromises]).catch(error => {
        console.error('خطا در بارگذاری واچ‌لیست:', error);
    });

    moviesHeading.classList.toggle('hidden', moviesCount === 0);
    seriesHeading.classList.toggle('hidden', seriesCount === 0);

    if (moviesCount === 0 && seriesCount === 0) {
        emptyMessage.classList.remove('hidden');
    }
}

async function fetchAndDisplayItem(itemId, type, container) {
    try {
        const apiUrl = type === 'movie'
            ? `https://api.themoviedb.org/3/movie/${itemId}?api_key=${apiKey}&language=${language}`
            : `https://api.themoviedb.org/3/tv/${itemId}?api_key=${apiKey}&language=${language}`;

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`خطای سرور: ${response.status}`);

        const data = await response.json();
        console.log(`Response for ${type} ID ${itemId}:`, data); // Debugging

        const item = {
            id: itemId,
            title: type === 'movie' ? (data.title || 'نامشخص') : (data.name || 'نامشخص'),
            overview: data.overview || 'خلاصه‌ای در دسترس نیست.',
            poster: data.poster_path ? `${baseImageUrl}${data.poster_path}` : defaultPoster,
        };

        const itemCard = `
            <div class="group relative">
                <img src="${item.poster}" alt="پوستر ${type === 'movie' ? 'فیلم' : 'سریال'} ${item.title}" class="w-full h-auto rounded-lg shadow-lg">
                <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                    <h3 class="text-lg font-bold text-white">${item.title}</h3>
                    <p class="text-sm text-gray-200">${item.overview.slice(0, 100)}${item.overview.length > 100 ? '...' : ''}</p>
                    <a href="/freemovie/${type}/index.html?id=${item.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">مشاهده</a>
                    <button class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onclick="removeFromWatchlist('${item.id}', '${type}')">حذف از واچ‌لیست</button>
                </div>
            </div>
        `;
        container.innerHTML += itemCard;
    } catch (error) {
        console.error(`خطا در دریافت اطلاعات ${type === 'movie' ? 'فیلم' : 'سریال'} با شناسه ${itemId}:`, error.message);
        throw error;
    }
}

function removeFromWatchlist(itemId, type) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || { movies: [], series: [] };
    const normalizedItemId = String(itemId);

    if (type === 'movie') {
        watchlist.movies = watchlist.movies.filter(id => String(id) !== normalizedItemId);
    } else if (type === 'series') {
        watchlist.series = watchlist.series.filter(id => String(id) !== normalizedItemId);
    }

    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    alert('آیتم از واچ‌لیست حذف شد!');
    loadWatchlist();
}

document.addEventListener('DOMContentLoaded', loadWatchlist);