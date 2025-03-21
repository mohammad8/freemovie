// script.js
const apiKey = '1dc4cbf81f0accf4fa108820d551dafc'; // کلید API TMDb
const language = 'fa'; // زبان پارسی
const baseImageUrl = 'https://image.tmdb.org/t/p/w500'; // آدرس پایه تصاویر TMDb
const defaultPoster = 'https://m4tinbeigi-official.github.io/freemovie/images/default-freemovie-300.png'; // پوستر پیش‌فرض

// آدرس‌های API TMDb
const apiUrls = {
    now_playing: `https://api.themoviedb.org/3/account/21448643/favorite/movies?api_key=${apiKey}&language=${language}`};

// شیء کش برای ذخیره تصاویر
const imageCache = {};

// تابع برای دریافت یا ذخیره تصویر از/در کش
function getCachedImage(id, fetchFunction) {
    if (imageCache[id]) {
        console.log(`تصویر کش‌شده برای شناسه ${id} بارگذاری شد`);
        return Promise.resolve(imageCache[id]);
    }
    return fetchFunction().then(poster => {
        imageCache[id] = poster;
        return poster;
    });
}

let apiKeySwitcher;

async function initializeSwitcher() {
    apiKeySwitcher = await loadApiKeys();
    console.log('سوئیچر کلید API مقداردهی شد');
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
        // دریافت داده‌های فیلم‌ها
        const movieRes = await fetch(apiUrls.now_playing);
        if (!movieRes.ok) throw new Error(`خطای سرور (فیلم‌ها): ${movieRes.status}`);
        const movieData = await movieRes.json();
        const movies = movieData.results || [];

        // پاکسازی اولیه کانتینرها
        movieContainer.innerHTML = '';
        tvContainer.innerHTML = '';

        // مجموعه‌ای برای جلوگیری از تکرار
        const seenIds = new Set();

        // پردازش و نمایش فیلم‌ها
        if (movies.length > 0) {
            for (const movie of movies) {
                if (seenIds.has(movie.id)) {
                    console.warn(`فیلم تکراری با شناسه ${movie.id} حذف شد`);
                    continue;
                }
                seenIds.add(movie.id);

                let poster = defaultPoster.replace(/300(?=\.jpg$)/i, '');

                const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}/external_ids?api_key=${apiKey}`;
                try {
                    const detailsRes = await fetch(movieDetailsUrl);
                    if (!detailsRes.ok) throw new Error(`خطای سرور (جزئیات فیلم): ${detailsRes.status}`);
                    const detailsData = await detailsRes.json();
                    const imdbId = detailsData.imdb_id || '';
                    if (imdbId) {
                        poster = await getCachedImage(imdbId, async () => {
                            const omdbData = await apiKeySwitcher.fetchWithKeySwitch(
                                (key) => `https://www.omdbapi.com/?i=${imdbId}&apikey=${key}`
                            );
                            return omdbData.Poster && omdbData.Poster !== 'N/A' ? omdbData.Poster : defaultPoster;
                        });
                    }
                } catch (fetchError) {
                    console.warn(`خطا در دریافت پوستر فیلم ${movie.id} از OMDB:`, fetchError.message);
                }

                const posterUrl = poster.replace(/300(?=\.jpg$)/i, '');

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
        } else {
            movieContainer.innerHTML = '<p class="text-center text-red-500">فیلمی یافت نشد!</p>';
        }

        // اگر هیچ داده‌ای موجود نبود
        if (seenIds.size === 0) {
            movieContainer.innerHTML = '<p class="text-center text-red-500">داده‌ای یافت نشد!</p>';
            tvContainer.innerHTML = '<p class="text-center text-red-500">داده‌ای یافت نشد!</p>';
        }
    } catch (error) {
        console.error('خطا در دریافت داده‌ها:', error);
        movieContainer.innerHTML = '<p class="text-center text-red-500">خطایی رخ داد! لطفاً دوباره تلاش کنید.</p>';
        tvContainer.innerHTML = '<p class="text-center text-red-500">خطایی رخ داد! لطفاً دوباره تلاش کنید.</p>';
    }
}


// اجرای توابع پس از بارگذاری صفحه
document.addEventListener('DOMContentLoaded', async () => {
    console.log('صفحه بارگذاری شد');
    try {
        await initializeSwitcher();
        await fetchAndDisplayContent();
        manageNotification();
        manageDisclaimerNotice();
        manageSupportPopup();
        manageFabButton();
        manageThemeToggle();
    } catch (error) {
        console.error('خطا در بارگذاری اولیه:', error);
    }
});
