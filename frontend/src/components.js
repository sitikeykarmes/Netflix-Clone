import React, { useState, useEffect } from 'react';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
  </div>
);

// Navbar Component
const Navbar = ({ onSearch, searchQuery, onCloseSearch }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      onCloseSearch();
    }
  };

  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/90 backdrop-blur-sm' : 'bg-gradient-to-b from-black/70 to-transparent'
    }`}>
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <h1 className="text-red-600 text-2xl md:text-3xl font-bold">NETFLIX</h1>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Home</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">TV Shows</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Movies</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">New & Popular</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">My List</a>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search movies, TV shows..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="bg-black/70 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-white w-64"
                  autoFocus
                />
                <button
                  onClick={handleSearchToggle}
                  className="ml-2 text-white hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={handleSearchToggle}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
          </div>

          {/* User Profile */}
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white font-semibold">U</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Hero Component
const Hero = ({ movie, onPlay, onInfo }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const backgroundImage = movie.backdrop_path 
    ? `${TMDB_BACKDROP_BASE_URL}${movie.backdrop_path}`
    : '/api/placeholder/1920/1080';

  return (
    <div className="relative h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt={movie.title || movie.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center h-full px-4 md:px-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            {movie.title || movie.name}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 mb-6 leading-relaxed">
            {movie.overview}
          </p>

          <div className="flex space-x-4">
            <button
              onClick={onPlay}
              className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Play</span>
            </button>
            
            <button
              onClick={onInfo}
              className="flex items-center space-x-2 bg-gray-500/70 text-white px-6 py-3 rounded hover:bg-gray-500/90 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>More Info</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Movie Row Component
const MovieRow = ({ title, movies, onMovieClick, onPlayClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredMovie, setHoveredMovie] = useState(null);

  const moveLeft = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const moveRight = () => {
    const maxIndex = Math.max(0, movies.length - 6);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="px-4 md:px-12 py-8">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      
      <div className="relative group">
        {/* Left Arrow */}
        {currentIndex > 0 && (
          <button
            onClick={moveLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Movies Grid */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / 6)}%)` }}
          >
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="flex-shrink-0 w-1/2 md:w-1/3 lg:w-1/6 px-2"
                onMouseEnter={() => setHoveredMovie(movie.id)}
                onMouseLeave={() => setHoveredMovie(null)}
              >
                <div className="relative group cursor-pointer">
                  <img
                    src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '/api/placeholder/300/450'}
                    alt={movie.title || movie.name}
                    className="w-full h-auto rounded-lg shadow-lg transform transition-transform duration-300 group-hover:scale-105"
                    onClick={() => onMovieClick(movie)}
                  />
                  
                  {/* Hover Overlay */}
                  {hoveredMovie === movie.id && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayClick(movie);
                          }}
                          className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMovieClick(movie);
                          }}
                          className="bg-gray-500/70 text-white p-2 rounded-full hover:bg-gray-500/90 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <h3 className="text-sm mt-2 text-white truncate">
                  {movie.title || movie.name}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        {currentIndex < movies.length - 6 && (
          <button
            onClick={moveRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Movie Modal Component
const MovieModal = ({ movie, onClose, onPlay }) => {
  const [movieDetails, setMovieDetails] = useState(null);

  useEffect(() => {
    // Simulate fetching additional movie details
    setMovieDetails({
      rating: movie.vote_average?.toFixed(1) || 'N/A',
      year: movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || 'N/A',
      duration: movie.runtime || '120 min',
      genre: 'Action, Drama, Thriller'
    });
  }, [movie]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header Image */}
        <div className="relative h-64 md:h-80">
          <img
            src={movie.backdrop_path ? `${TMDB_BACKDROP_BASE_URL}${movie.backdrop_path}` : '/api/placeholder/1920/1080'}
            alt={movie.title || movie.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Play Button */}
          <button
            onClick={onPlay}
            className="absolute bottom-4 left-4 flex items-center space-x-2 bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition-colors font-semibold"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Play</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            {movie.title || movie.name}
          </h2>
          
          {/* Movie Info */}
          <div className="flex items-center space-x-4 text-gray-400 mb-4">
            <span className="text-green-500 font-semibold">
              {movieDetails?.rating && `${movieDetails.rating}/10`}
            </span>
            <span>{movieDetails?.year}</span>
            <span>{movieDetails?.duration}</span>
            <span className="bg-gray-700 px-2 py-1 rounded text-xs">HD</span>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-lg mb-6 leading-relaxed">
            {movie.overview}
          </p>

          {/* Additional Info */}
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Genre: </span>
              <span className="text-white">{movieDetails?.genre}</span>
            </p>
            <p>
              <span className="text-gray-500">Rating: </span>
              <span className="text-white">{movie.adult ? 'R' : 'PG-13'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Video Player Component
const VideoPlayer = ({ trailerKey, onClose }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-6xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* YouTube Embed */}
        <div className="relative w-full h-0 pb-[56.25%]">
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
            title="Movie Trailer"
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

// Export all components
const Components = {
  Navbar,
  Hero,
  MovieRow,
  MovieModal,
  VideoPlayer,
  LoadingSpinner
};

export default Components;