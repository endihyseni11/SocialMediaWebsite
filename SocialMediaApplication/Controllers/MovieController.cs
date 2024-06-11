using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SocialMediaApplication.Models; // Include your model namespace

namespace SocialMediaApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MoviesController : ControllerBase
    {
        private readonly DataContext _context;

        public MoviesController(DataContext context)
        {
            _context = context;
        }

        // GET: api/Movies
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Movie>>> GetMovies()
        {
            return await _context.Movie.ToListAsync();
        }

        // GET: api/Movies/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Movie>> GetMovie(int id)
        {
            var movie = await _context.Movie.FindAsync(id);

            if (movie == null)
            {
                return NotFound();
            }

            return movie;
        }

        // POST: api/Movies
        [HttpPost]
        public async Task<ActionResult<Movie>> PostMovie(Movie movie)
        {
            _context.Movie.Add(movie);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMovie", new { id = movie.MovieId }, movie);
        }

        // PUT: api/Movies/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMovie(int id, Movie movie)
        {
            if (id != movie.MovieId)
            {
                return BadRequest();
            }

            _context.Entry(movie).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MovieExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Movies/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovie(int id)
        {
            var movie = await _context.Movie.FindAsync(id);
            if (movie == null)
            {
                return NotFound();
            }

            _context.Movie.Remove(movie);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MovieExists(int id)
        {
            return _context.Movie.Any(e => e.MovieId == id);
        }

        // GET: api/Movies/ByReleaseYear/2023 (replace 2023 with the desired ReleaseYear)
        [HttpGet("ByReleaseYear/{releaseYear}")]
        public async Task<ActionResult<IEnumerable<Movie>>> GetMoviesByReleaseYear(int releaseYear)
        {
            var movies = await _context.Movie.Where(m => m.ReleaseYear == releaseYear).ToListAsync();

            if (movies == null || movies.Count == 0)
            {
                return NotFound("No movies found for the specified ReleaseYear.");
            }

            return movies;
        }

        [HttpGet("ByDirectorName/{directorName}")]
        public async Task<ActionResult<IEnumerable<Movie>>> GetMoviesByDirectorName(string directorName)
        {
            // Find the DirectorId associated with the directorName
            var director = await _context.Director.FirstOrDefaultAsync(d => d.Name == directorName);

            if (director == null)
            {
                return NotFound($"Director not found with the specified Name: {directorName}");
            }

            var movies = await _context.Movie
                .Where(m => m.DirectorId == director.DirectorId)
                .ToListAsync();

            if (movies == null || movies.Count == 0)
            {
                return NotFound($"No movies found for the specified Director Name: {directorName}");
            }

            return movies;
        }

    }
}