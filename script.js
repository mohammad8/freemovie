const apiUrl = "https://freemoviez.ir/api/tmdb.php"; // آدرس واسط شما

// تابع برای دریافت فیلم‌های جدید با حالت لودینگ
async function getNewMovies() {
    const container = document.getElementById("new-movies");

    // نمایش حالت لودینگ با اسکلتون‌ها
    container.innerHTML = `
        <div class="skeleton w-full"></div>
        <div class="skeleton w-full"></div>
        <div class="skeleton w-full"></div>
        <div class="skeleton w-full"></div>
    `;

    try {
        const res = await fetch(`${apiUrl}?type=now_playing`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        const movies = data.results; // تغییر به results به جای now_playing

        // پاک کردن حالت لودینگ و نمایش داده‌ها
        container.innerHTML = "";

        if (movies && movies.length > 0) {
            movies.forEach((movie) => {
                // استفاده از URL تصاویر از سرور واسط
                const posterPath = movie.poster_path 
                    ? `https://freemoviez.ir/api/images/poster_${movie.poster_path.replace('/', '')}` 
                    : "https://via.placeholder.com/500x750?text=No+Image";
                const title = movie.title || "نامشخص";
                const overview = movie.overview ? movie.overview.slice(0, 100) + "..." : "توضیحات موجود نیست";

                container.innerHTML += `
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
        } else {
            container.innerHTML = '<p class="text-center text-red-500 col-span-full">داده‌ای یافت نشد!</p>';
        }
    } catch (error) {
        console.error("خطا در دریافت فیلم‌های جدید:", error);
        container.innerHTML = '<p class="text-center text-red-500 col-span-full">خطایی رخ داد! لطفاً دوباره تلاش کنید.</p>';
    }
}

// تابع برای تغییر تم
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const icon = document.querySelector("#theme-toggle i");
    icon.classList.toggle("fa-sun");
    icon.classList.toggle("fa-moon");
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
        "من برای دانلود فیلم و سریال از #فیری_مووی استفاده میکنم و به شما هم پیشنهاد میکنم که از طریق آدرس B2n.ir/freemovie فیلم هاتون رو دانلود کنید. راستی، اینم بگم که فیری مووی رایگانه و نیاز به خرید اشتراک نداره، تبلیغات هم نداره و فیلتر هم نیست و حتی فیلما سانسور هم نشدن!"
    );
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(twitterUrl, "_blank");
});

// فراخوانی توابع برای بارگذاری داده‌ها هنگام لود صفحه
document.addEventListener("DOMContentLoaded", () => {
    getNewMovies();
    manageNotification();
});