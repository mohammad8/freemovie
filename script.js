const omdbApiKey = "c409b61f";
const tokens = ["c409b61f"];
let currentTokenIndex = 0;

// تابع برای دریافت فیلم‌های محبوب (اسلایدر)
async function getFeaturedMovies() {
    try {
        const apiKey = tokens[currentTokenIndex];
        // جستجوی عمومی برای شبیه‌سازی فیلم‌های محبوب (مثلاً فیلم‌های با امتیاز بالا یا جدید)
        const res = await fetch(
            `https://www.omdbapi.com/?s=movie&type=movie&y=2023&apikey=${apiKey}`
        );
        const data = await res.json();
        const slider = document.getElementById("slider");
        slider.innerHTML = "";

        if (data.Response === "True") {
            const movies = data.Search.slice(0, 5); // ۵ فیلم اول
            for (const movie of movies) {
                // دریافت جزئیات بیشتر با imdb_id
                const detailRes = await fetch(
                    `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`
                );
                const detailData = await detailRes.json();
                const posterUrl = detailData.Poster && detailData.Poster !== "N/A"
                    ? detailData.Poster
                    : "https://via.placeholder.com/500x750?text=تصویر+موجود+نیست";
                console.log(`تصویر پس‌زمینه اسلایدر برای "${detailData.Title}" از OMDb: ${posterUrl}`);

                slider.innerHTML += `
                    <div class="w-full flex-auto h-96 bg-cover bg-center snap-start" style="background-image: url('${posterUrl}')">
                        <div class="bg-black bg-opacity-50 h-full flex flex-col justify-center items-center">
                            <h2 class="text-3xl font-bold">${detailData.Title}</h2>
                            <p class="mt-2">${detailData.Plot ? detailData.Plot.slice(0, 100) + "..." : "توضیحات موجود نیست"}</p>
                            <a href="/freemovie/movie/index.html?id=${movie.imdbID}" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                        </div>
                    </div>
                `;
            }
        } else {
            console.warn("جستجو برای فیلم‌های محبوب در OMDb ناموفق بود:", data.Error);
        }
    } catch (error) {
        console.error("خطا در دریافت فیلم‌های محبوب برای اسلایدر:", error);
    }
}

// تابع برای دریافت فیلم‌های جدید
async function getNewMovies() {
    try {
        const apiKey = tokens[currentTokenIndex];
        // جستجوی عمومی برای شبیه‌سازی فیلم‌های جدید (مثلاً فیلم‌های 2024)
        const res = await fetch(
            `https://www.omdbapi.com/?s=movie&type=movie&y=2024&apikey=${apiKey}`
        );
        const data = await res.json();
        const container = document.getElementById("new-movies");
        container.innerHTML = "";

        if (data.Response === "True") {
            const movies = data.Search;
            for (const movie of movies) {
                // دریافت جزئیات بیشتر با imdb_id
                const detailRes = await fetch(
                    `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`
                );
                const detailData = await detailRes.json();
                const posterUrl = detailData.Poster && detailData.Poster !== "N/A"
                    ? detailData.Poster
                    : "https://via.placeholder.com/500x750?text=تصویر+موجود+نیست";
                console.log(`تصویر فیلم جدید برای "${detailData.Title}" از OMDb: ${posterUrl}`);

                container.innerHTML += `
                    <div class="group relative">
                        <img src="${posterUrl}" alt="${detailData.Title}" class="w-full h-auto rounded-lg shadow-lg">
                        <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                            <h3 class="text-lg font-bold">${detailData.Title}</h3>
                            <p class="text-sm">${detailData.Plot ? detailData.Plot.slice(0, 100) + "..." : "توضیحات موجود نیست"}</p>
                            <a href="/freemovie/movie/index.html?id=${movie.imdbID}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                        </div>
                    </div>
                `;
            }
        } else {
            console.warn("جستجو برای فیلم‌های جدید در OMDb ناموفق بود:", data.Error);
        }
    } catch (error) {
        console.error("خطا در دریافت فیلم‌های جدید:", error);
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

// تابع برای بررسی و نمایش اطلاعیه
function manageNotification() {
    const notification = document.getElementById("notification");
    const lastShown = localStorage.getItem("notificationLastShown");
    const isDismissed = localStorage.getItem("notificationDismissed");
    const now = Date.now();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

    if (isDismissed === "true") {
        return;
    }

    if (!lastShown || now - parseInt(lastShown) >= oneWeekInMs) {
        notification.classList.remove("hidden");
        localStorage.setItem("notificationLastShown", now.toString());
    }
}

// تابع برای بستن اطلاعیه
document.getElementById("close-notification").addEventListener("click", () => {
    const notification = document.getElementById("notification");
    notification.classList.add("hidden");
    localStorage.setItem("notificationDismissed", "true");
});

// تابع برای انتشار توییت حمایتی
document.getElementById("support-button").addEventListener("click", () => {
    const tweetText = encodeURIComponent(
        "من برای دانلود فیلم و سریال از #فیری_مووی استفاده میکنم و به شما هم پیشنهاد میکنم که از طریق آدرس FreeMovieZ.IR فیلم هاتون رو دانلود کنید. راستی، اینم بگم که فیری مووی رایگانه و نیاز به خرید اشتراک نداره، تبلیغات هم نداره و فیلتر هم نیست و حتی فیلما سانسور هم نشدن!"
    );
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(twitterUrl, "_blank");
});

// فراخوانی توابع
document.addEventListener("DOMContentLoaded", manageNotification);
getFeaturedMovies();
getNewMovies();