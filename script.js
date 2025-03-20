const apiKey = '1dc4cbf81f0accf4fa108820d551dafc'; // Your TMDb API key
const language = 'fa'; // Language set to Persian
const baseImageUrl = 'https://image.tmdb.org/t/p/w500'; // TMDb base image URL
const defaultPoster = 'https://via.placeholder.com/300x450?text=No+Image'; // Default fallback image

// TMDb API endpoints
const apiUrls = {
    now_playing: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=${language}`,
    tv_trending: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=${language}`
};

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
        if (!movieRes.ok) throw new Error(`Server error: ${movieRes.status}`);
        const movieData = await movieRes.json();
        const movies = movieData.results || [];

        // Fetch TV series data
        const tvRes = await fetch(apiUrls.tv_trending);
        if (!tvRes.ok) throw new Error(`Server error: ${tvRes.status}`);
        const tvData = await tvRes.json();
        const tvSeries = tvData.results || [];

        movieContainer.innerHTML = '';
        tvContainer.innerHTML = '';

        if (movies.length > 0 || tvSeries.length > 0) {
            // Process and display movies
            movies.forEach(movie => {
                const posterPath = movie.poster_path ? `${baseImageUrl}${movie.poster_path}` : defaultPoster;
                const title = movie.title || 'نامشخص';
                const overview = movie.overview ? movie.overview.slice(0, 100) + '...' : 'توضیحات موجود نیست';

                movieContainer.innerHTML += `
                    <div class="group relative">
                        <img src="${posterPath}" alt="${title}" class="w-full h-auto rounded-lg shadow-lg">
                        <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                            <h3 class="text-lg font-bold text-white">${title}</h3>
                            <p class="text-sm text-gray-200">${overview}</p>
                            <a href="/freemovie/movie/index.html?id=${movie.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">مشاهده</a>
                        </div>
                    </div>
                `;
            });

            // Process and display TV series
            tvSeries.forEach(tv => {
                const posterPath = tv.poster_path ? `${baseImageUrl}${tv.poster_path}` : defaultPoster;
                const title = tv.name || 'نامشخص'; // Use 'name' for TV series
                const overview = tv.overview ? tv.overview.slice(0, 100) + '...' : 'توضیحات موجود نیست';

                tvContainer.innerHTML += `
                    <div class="group relative">
                        <img src="${posterPath}" alt="${title}" class="w-full h-auto rounded-lg shadow-lg">
                        <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                            <h3 class="text-lg font-bold text-white">${title}</h3>
                            <p class="text-sm text-gray-200">${overview}</p>
                            <a href="/freemovie/series/index.html?id=${tv.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">مشاهده</a>
                        </div>
                    </div>
                `;
            });

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

// The rest of your code (manageNotification, manageDisclaimerNotice, etc.) remains unchanged
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

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayContent();
    manageNotification();
    manageDisclaimerNotice();
});