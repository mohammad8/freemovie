// script.js
const apiKey = '1dc4cbf81f0accf4fa108820d551dafc'; // کلید API TMDb
const language = 'fa'; // زبان پارسی
const baseImageUrl = 'https://image.tmdb.org/t/p/w500'; // آدرس پایه تصاویر TMDb
const defaultPoster = 'https://m4tinbeigi-official.github.io/freemovie/images/default-freemovie-300.png'; // پوستر پیش‌فرض

// آدرس‌های API TMDb
const apiUrls = {
    now_playing: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=${language}`,
    tv_trending: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=${language}`
};

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
        const movieRes = await fetch(apiUrls.now_playing);
        if (!movieRes.ok) throw new Error(`خطای سرور (فیلم‌ها): ${movieRes.status}`);
        const movieData = await movieRes.json();
        const movies = movieData.results || [];

        const tvRes = await fetch(apiUrls.tv_trending);
        if (!tvRes.ok) throw new Error(`خطای سرور (سریال‌ها): ${tvRes.status}`);
        const tvData = await tvRes.json();
        const tvSeries = tvData.results || [];

        movieContainer.innerHTML = '';
        tvContainer.innerHTML = '';

        if (movies.length > 0 || tvSeries.length > 0) {
            for (const movie of movies) {
                let poster = defaultPoster;
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

                let posterUrl = poster;
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

            for (const tv of tvSeries) {
                let poster = defaultPoster;
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

                let posterUrl = poster;
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

    if (!notification) {
        console.warn('عنصر notification یافت نشد');
        return;
    }

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

    if (!notice) {
        console.warn('عنصر disclaimer-notice یافت نشد');
        return;
    }

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

function manageSupportPopup() {
    const popup = document.getElementById('support-popup');
    const closeButton = document.getElementById('close-popup');
    const tweetButton = document.getElementById('tweet-support');
    const downloadTwitterButton = document.getElementById('download-twitter');
    const downloadInstagramButton = document.getElementById('download-instagram');

    if (!popup) {
        console.error('عنصر support-popup یافت نشد');
        return;
    }

    let popupCount = parseInt(localStorage.getItem('popupCount') || '0', 10);
    console.log('تعداد نمایش پاپ‌آپ تاکنون:', popupCount);

    if (popupCount < 2) {
        popup.classList.remove('hidden');
        popupCount += 1;
        localStorage.setItem('popupCount', popupCount.toString());
        console.log('پاپ‌آپ نمایش داده شد. تعداد جدید:', popupCount);
    } else {
        console.log('پاپ‌آپ بیش از 2 بار نمایش داده شده است');
    }

    closeButton.addEventListener('click', () => {
        popup.classList.add('hidden');
        console.log('پاپ‌آپ بسته شد');
    });

    tweetButton.addEventListener('click', () => {
        const tweetText = encodeURIComponent('من از فیری مووی حمایت می‌کنم! یک سایت عالی برای تماشای فیلم و سریال: https://b2n.ir/freemovie');
        window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
        console.log('دکمه توییت کلیک شد');
    });

    downloadTwitterButton.addEventListener('click', () => {
        const twitterImageUrl = 'https://via.placeholder.com/150'; // آدرس واقعی تصویر توییتر را جایگزین کنید
        const link = document.createElement('a');
        link.href = twitterImageUrl;
        link.download = 'freemovie-twitter-support.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('تصویر توییتر دانلود شد');
    });

    downloadInstagramButton.addEventListener('click', () => {
        const instagramImageUrl = 'https://via.placeholder.com/150'; // آدرس واقعی تصویر اینستاگرام را جایگزین کنید
        const link = document.createElement('a');
        link.href = instagramImageUrl;
        link.download = 'freemovie-instagram-support.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('تصویر اینستاگرام دانلود شد');
    });

    popup.addEventListener('click', (event) => {
        if (event.target === popup) {
            popup.classList.add('hidden');
            console.log('پاپ‌آپ با کلیک خارج بسته شد');
        }
    });
}

function manageFabButton() {
    const fab = document.getElementById('fab');
    const fabOptions = document.getElementById('fabOptions');

    if (!fab || !fabOptions) {
        console.warn('عناصر fab یا fabOptions یافت نشدند');
        return;
    }

    fab.addEventListener('click', function(event) {
        event.stopPropagation();
        fabOptions.classList.toggle('hidden');
        console.log('دکمه FAB کلیک شد');
    });

    document.addEventListener('click', function(event) {
        if (!fab.contains(event.target) && !fabOptions.contains(event.target)) {
            fabOptions.classList.add('hidden');
        }
    });
}

function manageThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    if (!themeToggle) {
        console.warn('عنصر theme-toggle یافت نشد');
        return;
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark');
        const isDark = body.classList.contains('dark');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        console.log('تم تغییر کرد به:', isDark ? 'تاریک' : 'روشن');
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.remove('dark');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// شنونده واحد برای بارگذاری صفحه
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