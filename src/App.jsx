import Search from './compenents/Search.jsx';
import MovieCard from './compenents/MovieCard.jsx';
import LoadingSpinner from './compenents/Spinner.jsx';
import {useEffect, useState} from 'react';
import {useDebounce} from 'react-use';
import {updateSearchCount} from './appwrite.js';


const API_BASE_URL ='https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY; 

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}
const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term to prevent making too many API calls
  // by waiting for the user to stop typing for 500ms
  useDebounce(
    () => {setDebouncedSearchTerm(searchTerm);}, 500, [searchTerm]
   );

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query ?
        `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :
      
      `${API_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);
      
      //console.log("Movies are:",data);
      // Only track search counts for actual searches, not popular movies
      if(query && query.trim() && data.results.length > 0) {
        console.log('Updating search count for:', query);
        try {
          await updateSearchCount(query.trim(), data.results[0]);
        } catch (appwriteError) {
          console.error('Failed to update search count:', appwriteError);
          // Don't break the UI if Appwrite fails
        }
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      fetchMovies(debouncedSearchTerm.trim());
    } else if (debouncedSearchTerm === '') {
      fetchMovies(); // Load popular movies when search is cleared
    }
  }, [debouncedSearchTerm]); 

  return (
    <main>
      <div className="pattern"/> 

      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
        
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>  
        
        <section className="all-movies"> 
          <h2 className="mt-[40px]">All Movies</h2>

          {isLoading ? (
              <LoadingSpinner/>
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App 