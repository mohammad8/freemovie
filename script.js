const apiUrl = "https://freemoviez.ir/api/tmdb.php"; // آدرس واسط شما

// تابع برای دریافت فیلم‌های محبوب (اسلایدر)
async function getFeaturedMovies() {
    try {
        const res = await fetch(`${apiUrl}?type=popular`);
        const data = await res.json();
        const movies = data.popular.slice(0, 5);
        const slider = document.getElementById("slider");
        slider.innerHTML = "";

        movies.forEach((movie) => {
            // استفاده از URL تصاویر از سرور واسط
            const backdropPath = `https://freemoviez.ir/api/backdrop_${movie.backdrop_path.replace('/', '')}`;
            
            slider.innerHTML += `
                <div class="w-full flex-auto h-96 bg-cover bg-center snap-start" style="background-image: url('${backdropPath}')">
                    <div class="bg-black bg-opacity-50 h-full flex flex-col justify-center items-center">
                        <h2 class="text-3xl font-bold">${movie.title}</h2>
                        <p class="mt-2">${movie.overview.slice(0, 100)}...</p>
                        <a href="/freemovie/movie/index.html?id=${movie.id}" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("خطا در دریافت فیلم‌های محبوب:", error);
    }
}

// تابع برای دریافت فیلم‌های جدید
async function getNewMovies() {
    try {
        const res = await fetch(`${apiUrl}?type=now_playing`);
        const data = await res.json();
        const movies = data.now_playing;
        const container = document.getElementById("new-movies");
        container.innerHTML = "";

        movies.forEach((movie) => {
            // استفاده از URL تصاویر از سرور واسط
            const posterPath = `https://freemoviez.ir/api/poster_${movie.poster_path.replace('/', '')}`;
            
            container.innerHTML += `
                <div class="group relative">
                    <img src="${posterPath}" alt="${movie.title}" class="w-full h-auto rounded-lg shadow-lg">
                    <div class="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                        <h3 class="text-lg font-bold">${movie.title}</h3>
                        <p class="text-sm">${movie.overview.slice(0, 100)}...</p>
                        <a href="/freemovie/movie/index.html?id=${movie.id}" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">مشاهده</a>
                    </div>
                </div>
            `;
        });
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

// فراخوانی توابع برای بارگذاری داده‌ها
getFeaturedMovies();
getNewMovies();
