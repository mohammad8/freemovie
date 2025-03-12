const tmdbApiUrl = "https://api.themoviedb.org/3/discover/movie";
const tmdbApiKey = "1dc4cbf81f0accf4fa108820d551dafc";
const tokens = ["abb7cdf7"];
let currentTokenIndex = 0;

// دریافت فیلم‌های جدید برای اسلایدر
async function getNewMoviesForSlider() {
    try {
        const response = await fetch(`${tmdbApiUrl}?api_key=${tmdbApiKey}&language=fa-IR&sort_by=release_date.desc&page=1`);
        const data = await response.json();
        const movies = data.results.slice(0, 5);
        const carouselInner = document.getElementById("carousel-inner");

        movies.forEach((movie, index) => {
            const carouselItem = document.createElement("div");
            carouselItem.classList.add("carousel-item");
            if (index === 0) carouselItem.classList.add("active");

            carouselItem.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w1280${movie.backdrop_path}" alt="${movie.title}">
                <div class="carousel-caption">
                    <h5>${movie.title}</h5>
                    <p>${movie.overview.slice(0, 100)}...</p>
                </div>
            `;
            carouselInner.appendChild(carouselItem);
        });
    } catch (error) {
        console.error("Error fetching slider movies:", error);
    }
}

// دریافت لیست فیلم‌ها
async function getMovies() {
    try {
        const response = await fetch(`${tmdbApiUrl}?api_key=${tmdbApiKey}&language=fa-IR&page=1`);
        const data = await response.json();
        const movies = data.results;
        const moviesList = document.getElementById("movies-list");
        moviesList.innerHTML = "";

        for (const movie of movies) {
            const omdbPoster = await getOmdbImage(movie.original_title);
            const imdbID = await getImdbID(movie.original_title);
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");

            movieCard.innerHTML = `
                <img src="${omdbPoster || 'https://via.placeholder.com/500x750?text=No+Image'}" alt="${movie.title}">
                <div class="title">${movie.title}</div>
                <div class="original-title">نام اصلی: ${movie.original_title}</div>
                <div class="overview">${movie.overview.slice(0, 150)}...</div>
                <div class="download-buttons">
                    ${generateDownloadLinks(imdbID, movie.release_date?.split("-")[0] || "unknown", "movie")}
                </div>
            `;
            moviesList.appendChild(movieCard);
        }
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

// دریافت تصویر از OMDb
async function getOmdbImage(title) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${tokens[currentTokenIndex]}`);
        const data = await response.json();
        return data.Response === "True" && data.Poster !== "N/A" ? data.Poster : null;
    } catch (error) {
        console.error("Error fetching poster:", error);
        return null;
    }
}

// دریافت IMDb ID
async function getImdbID(title) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${tokens[currentTokenIndex]}`);
        const data = await response.json();
        return data.Response === "True" && data.imdbID ? data.imdbID.replace("tt", "") : "";
    } catch (error) {
        console.error("Error fetching IMDb ID:", error);
        return "";
    }
}

// جستجو با توکن
async function fetchWithToken(title) {
    try {
        const apiKey = tokens[currentTokenIndex];
        const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(title)}`;
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
        document.getElementById('results').innerHTML = '<div class="alert alert-danger">خطا: ' + error.message + '</div>';
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// تولید لینک‌های دانلود
function generateDownloadLinks(imdbID, year, type) {
    if (type === 'movie') {
        const originalDownloadLink = `https://berlin.saymyname.website/Movies/${year}/${imdbID}`;
        const backupDownloadLink = `https://tokyo.saymyname.website/Movies/${year}/${imdbID}`;
        return `
            <a href="${originalDownloadLink}" class="btn btn-primary mb-2">لینک اصلی</a><br>
            <a href="${backupDownloadLink}" class="btn btn-secondary mb-2">لینک جایگزین</a><br>
        `;
    } else if (type === 'series') {
        return generateSeriesDownloadLinks(imdbID);
    }
    return '';
}

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

function generateQualityLinks(imdbID, season) {
    let qualityLinks = '';
    for (let quality = 1; quality <= 4; quality++) {
        const downloadLink = `https://subtitle.saymyname.website/DL/filmgir/?i=tt${imdbID}&f=${season}&q=${quality}`;
        qualityLinks += `<a href="${downloadLink}" class="btn btn-success mb-2">کیفیت ${quality}</a><br>`;
    }
    return qualityLinks;
}

// نمایش جزئیات
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

// Debounce برای جستجوی زنده
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// اجرای اولیه
getNewMoviesForSlider();
getMovies();
document.getElementById('title').addEventListener('input', debounce(function () {
    const title = this.value;
    if (title.length > 2) {
        fetchWithToken(title);
    } else {
        document.getElementById('results').innerHTML = '';
    }
}, 300));