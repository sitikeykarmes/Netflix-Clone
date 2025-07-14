import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Components from './components';

const { 
  Navbar, 
  Hero, 
  MovieRow, 
  MovieModal, 
  VideoPlayer,
  LoadingSpinner 
} = Components;

// TMDB API configuration
const TMDB_API_KEY = 'c8dea14dc917687ac631a52620e4f7ad';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

const App = () => {
  const [movies, setMovies] = useState({
    trending: [],
    popular: [],
    topRated: [],
    upcoming: [],
    tvShows: [],
    action: [],
    comedy: [],
    horror: [],
    romance: [],
    documentary: []
  });
  const [heroMovie, setHeroMovie] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Fetch movies from TMDB
  const fetchMovies = async (endpoint, apiKey = TMDB_API_KEY) => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${apiKey}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
    }
  };

  // Fetch movie videos (trailers)
  const fetchMovieVideos = async (movieId, type = 'movie') => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/${type}/${movieId}/videos?api_key=${TMDB_API_KEY}`);
      const data = await response.json();
      const trailer = data.results?.find(video => 
        video.type === 'Trailer' && video.site === 'YouTube'
      );
      return trailer?.key || null;
    } catch (error) {
      console.error('Error fetching movie videos:', error);
      return null;
    }
  };

  // Search movies
  const searchMovies = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    
    try {
      const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.results || []);
      setShowSearch(true);
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
    }
  };

  // Load all movie data
  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      
      try {
        const [
          trending,
          popular,
          topRated,
          upcoming,
          tvShows,
          action,
          comedy,
          horror,
          romance,
          documentary
        ] = await Promise.all([
          fetchMovies('/trending/all/day'),
          fetchMovies('/movie/popular'),
          fetchMovies('/movie/top_rated'),
          fetchMovies('/movie/upcoming'),
          fetchMovies('/tv/popular'),
          fetchMovies('/discover/movie?with_genres=28'), // Action
          fetchMovies('/discover/movie?with_genres=35'), // Comedy
          fetchMovies('/discover/movie?with_genres=27'), // Horror
          fetchMovies('/discover/movie?with_genres=10749'), // Romance
          fetchMovies('/discover/movie?with_genres=99') // Documentary
        ]);

        setMovies({
          trending,
          popular,
          topRated,
          upcoming,
          tvShows,
          action,
          comedy,
          horror,
          romance,
          documentary
        });

        // Set hero movie from trending
        if (trending.length > 0) {
          const randomHero = trending[Math.floor(Math.random() * Math.min(5, trending.length))];
          setHeroMovie(randomHero);
        }
      } catch (error) {
        console.error('Error loading movies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  // Handle movie click
  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  // Handle play button click
  const handlePlayClick = async (movie) => {
    const type = movie.first_air_date ? 'tv' : 'movie';
    const trailerKey = await fetchMovieVideos(movie.id, type);
    
    if (trailerKey) {
      setCurrentTrailer(trailerKey);
      setShowVideoPlayer(true);
    } else {
      // Fallback to modal if no trailer
      handleMovieClick(movie);
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    searchMovies(query);
  };

  // Close search
  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-black text-white overflow-x-hidden">
        <Navbar 
          onSearch={handleSearch}
          searchQuery={searchQuery}
          onCloseSearch={closeSearch}
        />
        
        <Routes>
          <Route path="/" element={
            <main className="relative">
              {/* Hero Section */}
              {heroMovie && (
                <Hero 
                  movie={heroMovie}
                  onPlay={() => handlePlayClick(heroMovie)}
                  onInfo={() => handleMovieClick(heroMovie)}
                />
              )}

              {/* Search Results */}
              {showSearch && searchResults.length > 0 && (
                <div className="px-4 md:px-12 py-8">
                  <h2 className="text-2xl font-bold mb-6">Search Results</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {searchResults.slice(0, 18).map((item) => (
                      <div
                        key={item.id}
                        className="cursor-pointer transform hover:scale-105 transition-transform duration-300"
                        onClick={() => handleMovieClick(item)}
                      >
                        <img
                          src={item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : '/api/placeholder/300/450'}
                          alt={item.title || item.name}
                          className="w-full h-auto rounded-lg shadow-lg"
                        />
                        <p className="text-sm mt-2 text-center truncate">
                          {item.title || item.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Movie Rows */}
              {!showSearch && (
                <div className="space-y-8 pb-20">
                  <MovieRow 
                    title="Trending Now" 
                    movies={movies.trending}
                    onMovieClick={handleMovieClick}
                    onPlayClick={handlePlayClick}
                  />
                  
                  <MovieRow 
                    title="Popular Movies" 
                    movies={movies.popular}
                    onMovieClick={handleMovieClick}
                    onPlayClick={handlePlayClick}
                  />
                  
                  <MovieRow 
                    title="Top Rated" 
                    movies={movies.topRated}
                    onMovieClick={handleMovieClick}
                    onPlayClick={handlePlayClick}
                  />
                  
                  <MovieRow 
                    title="TV Shows" 
                    movies={movies.tvShows}
                    onMovieClick={handleMovieClick}
                    onPlayClick={handlePlayClick}
                  />
                  
                  <MovieRow 
                    title="Action Movies" 
                    movies={movies.action}
                    onMovieClick={handleMovieClick}
                    onPlayClick={handlePlayClick}
                  />
                  
                  <MovieRow 
                    title="Comedy Movies" 
                    movies={movies.comedy}
                    onMovieClick={handleMovieClick}
                    onPlayClick={handlePlayClick}
                  />
                  
                  <MovieRow 
                    title="Horror Movies" 
                    movies={movies.horror}
                    onMovieClick={handleMovieClick}
                    onPlayClick={handlePlayClick}
                  />
                  
                  <MovieRow 
                    title="Romance Movies" 
                    movies={movies.romance}
                    onMovieClick={handleMovieClick}
                    onPlayClick={handlePlayClick}
                  />
                  
                  <MovieRow 
                    title="Documentaries" 
                    movies={movies.documentary}
                    onMovieClick={handleMovieClick}
                    onPlayClick={handlePlayClick}
                  />
                  
                  <MovieRow 
                    title="Upcoming Movies" 
                    movies={movies.upcoming}
                    onMovieClick={handleMovieClick}
                    onPlayClick={handlePlayClick}
                  />
                </div>
              )}
            </main>
          } />
        </Routes>

        {/* Movie Modal */}
        {showModal && selectedMovie && (
          <MovieModal
            movie={selectedMovie}
            onClose={() => setShowModal(false)}
            onPlay={() => handlePlayClick(selectedMovie)}
          />
        )}

        {/* Video Player */}
        {showVideoPlayer && currentTrailer && (
          <VideoPlayer
            trailerKey={currentTrailer}
            onClose={() => setShowVideoPlayer(false)}
          />
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;