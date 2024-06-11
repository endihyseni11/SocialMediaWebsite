import React, { useState, useEffect } from 'react';

const Movie = () => {
  const [movies, setMovies] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [editingMovie, setEditingMovie] = useState(null);
  const [newMovie, setNewMovie] = useState({
    title: '',
    releaseYear: '',
    directorId: '',
  });
  const [releaseYearFilter, setReleaseYearFilter] = useState(''); // New state for the ReleaseYear filter

  const fetchMovies = async () => {
    try {
      const response = await fetch('https://localhost:7069/api/Movies');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchDirectors = async () => {
    try {
      const response = await fetch('https://localhost:7069/api/Directors');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setDirectors(data);
    } catch (error) {
      console.error('Error fetching directors:', error);
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchDirectors();
  }, []);

  const handleEdit = (movie) => {
    setEditingMovie({ ...movie });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://localhost:7069/api/Movies/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      fetchMovies();
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
  };

  const handleFormSubmit = async () => {
    try {
      const response = await fetch(`https://localhost:7069/api/Movies/${editingMovie.movieId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingMovie),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      setEditingMovie(null);
      fetchMovies();
    } catch (error) {
      console.error('Error saving movie:', error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditingMovie({
      ...editingMovie,
      [name]: value,
    });
  };

  const handleCreateMovie = async () => {
    try {
      const response = await fetch('https://localhost:7069/api/Movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMovie),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Clear the input fields
      setNewMovie({
        title: '',
        releaseYear: '',
        directorId: '',
      });
      fetchMovies();
    } catch (error) {
      console.error('Error creating movie:', error);
    }
  };

  // New handler for fetching movies by ReleaseYear
  const handleFetchByReleaseYear = async () => {
    try {
      if (releaseYearFilter === '') {
        // If the input is empty, fetch all movies
        fetchMovies();
      } else {
        const response = await fetch(`https://localhost:7069/api/Movies/ByReleaseYear/${releaseYearFilter}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setMovies(data);
      }
    } catch (error) {
      console.error('Error fetching movies by ReleaseYear:', error);
    }
  };

  const getDirectorName = (directorId) => {
    const director = directors.find((d) => d.directorId === directorId);
    return director ? director.name : 'Unknown';
  }

  const [directorNameFilter, setDirectorNameFilter] = useState(''); // New state for DirectorName filter

  // New handler for fetching movies by DirectorName
  const handleFetchByDirectorName = async () => {
    try {
      if (directorNameFilter === '') {
        // If the input is empty, fetch all movies
        fetchMovies();
      } else {
        const response = await fetch(`https://localhost:7069/api/Movies/ByDirectorName/${directorNameFilter}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setMovies(data);
      }
    } catch (error) {
      console.error('Error fetching movies by DirectorName:', error);
    }
  };
  return (
    <div>
      <h1>Movie List</h1>
      <div>
        {/* Input field for ReleaseYear filter */}
        <input
          type="number"
          placeholder="Enter ReleaseYear"
          value={releaseYearFilter}
          onChange={(e) => setReleaseYearFilter(e.target.value)}
        />
        {/* Button to trigger fetching movies by ReleaseYear */}
        <button onClick={handleFetchByReleaseYear}>Fetch by ReleaseYear</button>
      </div>
      <div>
        {/* Input field for DirectorName filter */}
        <input
          type="text"
          placeholder="Enter Director Name"
          value={directorNameFilter}
          onChange={(e) => setDirectorNameFilter(e.target.value)}
        />
        {/* Button to trigger fetching movies by DirectorName */}
        <button onClick={handleFetchByDirectorName}>Fetch by Director Name</button>
      </div>
      <ul>
        {movies.map((movie) => (
          <li key={movie.movieId}>
            {editingMovie && editingMovie.movieId === movie.movieId ? (
              <div>
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={editingMovie.title}
                  onChange={handleInputChange}
                />
                <input
                  type="number"
                  name="releaseYear"
                  placeholder="Release Year"
                  value={editingMovie.releaseYear}
                  onChange={handleInputChange}
                />
                <select
                  name="directorId"
                  value={editingMovie.directorId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Director</option>
                  {directors.map((director) => (
                    <option key={director.directorId} value={director.directorId}>
                      {director.name}
                    </option>
                  ))}
                </select>
                <button onClick={handleFormSubmit}>Save</button>
              </div>
            ) : (
              <>
                {movie.title} ({movie.releaseYear}) - Director: {movie.directorId} {getDirectorName(movie.directorId)}
                <button onClick={() => handleEdit(movie)}>Edit</button>
                <button onClick={() => handleDelete(movie.movieId)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <h2>Create Movie</h2>
      <div>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newMovie.title}
          onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
        />
        <input
          type="number"
          name="releaseYear"
          placeholder="Release Year"
          value={newMovie.releaseYear}
          onChange={(e) => setNewMovie({ ...newMovie, releaseYear: e.target.value })}
        />
        <select
          name="directorId"
          value={newMovie.directorId}
          onChange={(e) => setNewMovie({ ...newMovie, directorId: e.target.value })}
        >
          <option value="">Select Director</option>
          {directors.map((director) => (
            <option key={director.directorId} value={director.directorId}>
              {director.name}
            </option>
          ))}
        </select>
        <button onClick={handleCreateMovie}>Create</button>
      </div>
    </div>
  );
};

export default Movie;
