// توکن‌ها را از فایل JSON می‌خوانیم
fetch('tokens.json')
    .then(response => response.json())
    .then(data => {
        let tokens = data.tokens;  // توکن‌ها از فایل JSON
        let currentTokenIndex = data.currentTokenIndex;  // ایندکس توکن جاری

        // تابعی برای ارسال درخواست با توکن
        function fetchWithToken(title, year, genre) {
            let apiKey = tokens[currentTokenIndex];  // توکن جاری
            let url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(title)}`;

            if (year) {
                url += `&y=${year}`;
            }

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const resultsContainer = document.getElementById('results');
                    resultsContainer.innerHTML = '';  // پاک کردن نتایج قبلی

                    if (data.Response === 'True') {
                        let moviesHtml = '<div class="row">';
                        data.Search.forEach(movie => {
                            if (genre && movie.Genre && !movie.Genre.toLowerCase().includes(genre.toLowerCase())) {
                                return;
                            }

                            const poster = movie.Poster !== 'N/A' ? movie.Poster : 'default.jpg';
                            const imdbID = movie.imdbID.replace('tt', '');  // حذف 'tt' از ابتدای imdbID

                            moviesHtml += `
                                <div class="col-md-4">
                                    <div class="card mb-4">
                                        <img src="${poster}" class="card-img-top" alt="${movie.Title}">
                                        <div class="card-body">
                                            <h5 class="card-title">${movie.Title}</h5>
                                            <p class="card-text">سال: ${movie.Year}</p>
                                            <p class="card-text">نوع: ${movie.Type}</p>
                                            ${generateDownloadLinks(imdbID, movie.Year, movie.Type)}
                                        </div>
                                    </div>
                                </div>
                            `;
                        });
                        moviesHtml += '</div>';
                        resultsContainer.innerHTML = moviesHtml;
                    } else if (data.Error && data.Error.includes('limit')) {
                        // در صورت رسیدن به محدودیت، توکن را تغییر دهید
                        currentTokenIndex = (currentTokenIndex + 1) % tokens.length;  // تغییر به توکن بعدی
                        console.log('توکن فعلی محدود شد، تلاش با توکن بعدی: ', tokens[currentTokenIndex]);
                        fetchWithToken(title, year, genre);  // تلاش مجدد با توکن جدید
                    } else {
                        resultsContainer.innerHTML = '<div class="alert alert-danger">هیچ نتیجه‌ای پیدا نشد.</div>';
                    }
                })
                .catch(error => console.error('خطا در درخواست:', error));
        }

        // اضافه کردن رویداد برای فرم جستجو
        document.getElementById('searchForm').addEventListener('submit', function(event) {
            event.preventDefault();

            const title = document.getElementById('title').value;
            const year = document.getElementById('year').value;
            const genre = document.getElementById('genre').value;

            fetchWithToken(title, year, genre);  // ارسال درخواست با توکن
        });
    });

// تابع برای نمایش لینک‌های دانلود فیلم یا سریال
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

// تابع برای نمایش لینک‌های فصل‌های سریال
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

// تابع برای نمایش لینک‌های دانلود بر اساس کیفیت
function generateQualityLinks(imdbID, season) {
    let qualityLinks = '';
    for (let quality = 1; quality <= 4; quality++) {
        const downloadLink = `https://subtitle.saymyname.website/DL/filmgir/?i=${imdbID}&f=${season}&q=${quality}`;
        qualityLinks += `<a href="${downloadLink}" class="btn btn-success mb-2">دانلود فصل ${season} با کیفیت ${quality}</a><br>`;
    }
    return qualityLinks;
}
