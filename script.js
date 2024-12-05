const apiKey = '91f613aae0f36f84637ebdc9488b7d8a';
const movieGrid = document.getElementById('movie-grid');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const pageNumbersContainer = document.getElementById('page-numbers');
let currentPage = 1;
let totalPages = 1; // Set dynamically based on API response
let currentQuery = '';
let currentGenre = '';
let currentRating = '';
let currentYear = '';

// Fetch movies from the TMDB API
async function fetchMovies(page = 1, query = '', genre = '', rating = '', year = '') {
    let apiUrl = query
        ? `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${query}&page=${page}`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${page}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.results.length === 0) {
            movieGrid.innerHTML = `<p>No results found.</p>`;
            return;
        }

        totalPages = data.total_pages; // Set the total pages
        currentPage = page; // Update current page

        // Apply filters
        let filteredMovies = data.results.filter(movie => {
            const hasValidPoster = movie.poster_path !== null;
            const matchesGenre = genre ? movie.genre_ids.includes(parseInt(genre)) : true;
            const matchesRating = rating ? movie.vote_average >= parseFloat(rating) : true;
            const matchesYear = year ? movie.release_date?.startsWith(year) : true;

            return hasValidPoster && matchesGenre && matchesRating && matchesYear;
        });

        if (filteredMovies.length === 0) {
            movieGrid.innerHTML = `<p>No movies match the selected filters.</p>`;
            return;
        }

        displayMovies(filteredMovies);
        updatePagination(page, totalPages);
    } catch (error) {
        console.error('Error fetching movies:', error);
        movieGrid.innerHTML = `<p>Failed to load movies. Try again later.</p>`;
    }
}

// Display movies in the grid
function displayMovies(movies) {
    movieGrid.innerHTML = movies
        .map(
            movie => `
        <div class="movie-card">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>⭐ ${movie.vote_average}</p>
            <p>${movie.release_date?.split('-')[0] || 'N/A'}</p>
        </div>
    `
        )
        .join('');
}

// Update pagination buttons dynamically
function updatePagination(current, total) {
    pageNumbersContainer.innerHTML = ''; // Clear previous page numbers

    const maxVisiblePages = 5; // Number of pages to display at a time
    const halfRange = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, current - halfRange);
    let endPage = Math.min(total, startPage + maxVisiblePages - 1);

    // Adjust startPage if at the end of the range
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Create page buttons dynamically
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        if (i === current) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            currentPage = i;
            fetchMovies(currentPage, currentQuery, currentGenre, currentRating, currentYear);
        });
        pageNumbersContainer.appendChild(pageButton);
    }

    // Enable or disable Prev and Next buttons
    prevButton.disabled = current === 1;
    nextButton.disabled = current === total;

    // Add event listeners for Prev and Next buttons
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            fetchMovies(currentPage, currentQuery, currentGenre, currentRating, currentYear);
        }
    };

    nextButton.onclick = () => {
        if (currentPage < total) {
            currentPage++;
            fetchMovies(currentPage, currentQuery, currentGenre, currentRating, currentYear);
        }
    };
}

// Add filter event listeners for dropdowns
document.getElementById('genreFilter').addEventListener('change', (event) => {
    currentGenre = event.target.value;
    currentPage = 1; // Reset to first page
    fetchMovies(currentPage, currentQuery, currentGenre, currentRating, currentYear);
});

document.getElementById('ratingFilter').addEventListener('change', (event) => {
    currentRating = event.target.value;
    currentPage = 1; // Reset to first page
    fetchMovies(currentPage, currentQuery, currentGenre, currentRating, currentYear);
});

document.getElementById('yearFilter').addEventListener('change', (event) => {
    currentYear = event.target.value;
    currentPage = 1; // Reset to first page
    fetchMovies(currentPage, currentQuery, currentGenre, currentRating, currentYear);
});

// Search Button Event Listener
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        currentQuery = query;
        currentPage = 1; // Reset to first page
        fetchMovies(currentPage, currentQuery, currentGenre, currentRating, currentYear);
    } else {
        movieGrid.innerHTML = '<p>Please enter a search term.</p>';
    }
});

// Initial Fetch
fetchMovies(currentPage);
