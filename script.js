// تعریف توکن‌ها به صورت آرایه
const tokens = ["abb7cdf7", "another_token_here"]; // توکن‌های اضافی را اینجا اضافه کنید
let currentTokenIndex = 0;

// تابع اصلی برای جستجو با توکن
async function fetchWithToken(title) {
    try {
        const apiKey = tokens[currentTokenIndex];
        const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(title)}`;
        
        // نمایش انیمیشن لودینگ
        document.getElementById('loading').style.display = 'block';
        
        const response = await fetch(url);
        const data = await response.json();
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = '';

        if (data.Response === 'True') {
            let moviesHtml = '<div class="row">';
            data.Search.forEach(movie => {
                const poster = movie.Poster !== 'N/A' ? movie.Poster : 'default.jpg';
                const imdbID = movie.imdbID.replace('tt', '');

                moviesHtml += `
                    <div class="col-6 col-md-4 col-lg-2 mb-4">
                        <div class="card">
                            <img src="${poster}" class="card-img-top" alt="${movie.Title}">
                            <div class="card-body">
                                <h5 class="card-title">${movie.Title}</h5>
                                <p class="card-text">سال: ${movie.Year}</p>
                                ${generateDownloadLinks(imdbID, movie.Year, movie.Type)}
                                <button class="btn btn-info" onclick="showDetails('${movie.imdbID}')">جزئیات</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            moviesHtml += '</div>';
            resultsContainer.innerHTML = moviesHtml;
            resultsContainer.scrollIntoView({ behavior: "smooth" });
        } else {
            resultsContainer.innerHTML = '<div class="alert alert-danger">هیچ نتیجه‌ای پیدا نشد.</div>';
        }
    } catch (error) {
        console.error('خطا در درخواست:', error);
        document.getElementById('results').innerHTML = '<div class="alert alert-danger">خطا در درخواست: ' + error.message + '</div>';
    } finally {
        // مخفی کردن انیمیشن لودینگ
        document.getElementById('loading').style.display = 'none';
    }
}

// تابع برای تولید لینک‌های دانلود
function generateDownloadLinks(imdbID, year, type) {
    if (type === 'movie') {
        const originalDownloadLink = `https://berlin.saymyname.website/Movies/${year}/${imdbID}`;
        const backupDownloadLink = `https://tokyo.saymyname.website/Movies/${year}/${imdbID}`;

        return `
            <a href="${originalDownloadLink}" class="btn btn-primary mb-2">دانلود فیلم (لینک اصلی)</a><br>
            <a href="${backupDownloadLink}" class="btn btn-secondary mb-2">دانلود فیلم (لینک جایگزین)</a><br>
        `;
    } else if (type === 'series') {
        return generateSeriesDownloadLinks(imdbID);
    }
    return '';
}

// تابع برای لینک‌های دانلود سریال
function generateSeriesDownloadLinks(imdbID) {
    let seasonsHtml = '<div class="accordion" id="seasonsAccordion">';
    for (let i = 1; i <= 4; i++) {
        seasonsHtml += `
            <div class="accordion-item">
                <h2 class="accordion-header" id="heading${i}">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="true" aria-controls="collapse${i}">
                        فصل ${i}
                    </button>
                </h2>
                <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}" data-bs-parent="#seasonsAccordion">
                    <div class="accordion-body">
                        ${generateQualityLinks(imdbID, i)}
                    </div>
                </div>
            </div>
        `;
    }
    seasonsHtml += '</div>';
    return seasonsHtml;
}

// تابع برای لینک‌های کیفیت
function generateQualityLinks(imdbID, season) {
    let qualityLinks = '';
    for (let quality = 1; quality <= 4; quality++) {
        const downloadLink = `https://subtitle.saymyname.website/DL/filmgir/?i=tt${imdbID}&f=${season}&q=${quality}`;
        qualityLinks += `<a href="${downloadLink}" class="btn btn-success mb-2">دانلود فصل ${season} با کیفیت ${quality}</a><br>`;
    }
    return qualityLinks;
}

// تابع برای نمایش جزئیات فیلم
async function showDetails(imdbID) {
    const apiKey = tokens[currentTokenIndex];
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`;
    const response = await fetch(url);
    const movie = await response.json();
    const modalBody = document.getElementById('movieDetails');
    modalBody.innerHTML = `
        <p><strong>عنوان:</strong> ${movie.Title}</p>
        <p><strong>سال:</strong> ${movie.Year}</p>
        <p><strong>ژانر:</strong> ${movie.Genre}</p>
        <p><strong>کارگردان:</strong> ${movie.Director}</p>
        <p><strong>بازیگران:</strong> ${movie.Actors}</p>
        <p><strong>خلاصه:</strong> ${movie.Plot}</p>
    `;
    const modal = new bootstrap.Modal(document.getElementById('movieModal'));
    modal.show();
}

// تابع debounce برای جلوگیری از درخواست‌های مکرر
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// رویداد برای جستجوی زنده
document.getElementById('title').addEventListener('input', debounce(function () {
    const title = this.value;
    if (title.length > 2) {
        fetchWithToken(title);
    } else {
        document.getElementById('results').innerHTML = '';
    }
}, 300));