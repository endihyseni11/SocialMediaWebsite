using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialMediaApplication.Data;
using SocialMediaApplication.Models;
using System;
using System.Linq;
using System.Security.Claims;

namespace SocialMediaApplication.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/connections")]
    
    public class ConnectionController : ControllerBase
    {
        private readonly DataContext _context;

        public ConnectionController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("{id}", Name = "GetConnection")]
        public IActionResult GetConnection(int id)
        {
            var connection = _context.Connection.Find(id);

            if (connection == null)
            {
                return NotFound();
            }

            return Ok(connection);
        }

        // POST: api/connections
        [HttpPost]
        public IActionResult CreateConnection(Connection connection)
        {
            // Get the user's ID from the authentication token
            var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

            // Check if the user is trying to create a connection with themselves
            if (userId == connection.FriendId)
                return BadRequest("You cannot connect with yourself.");

            // Check if the connection already exists
            var existingConnection = _context.Connection
                .FirstOrDefault(c => c.UserId == userId && c.FriendId == connection.FriendId);

            if (existingConnection != null)
                return BadRequest("Connection already exists.");

            connection.UserId = userId; // Set the user ID to the currently authenticated user
            connection.Status = "Connected"; // Or you can use an enum for status
            connection.CreatedAt = DateTime.UtcNow;

            _context.Connection.Add(connection);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetConnection), new { id = connection.ConnectionId }, connection);

        }

        // Other CRUD actions for managing connections
    }
}
