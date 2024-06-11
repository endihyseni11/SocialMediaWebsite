using SocialMediaApplication.Services.UserService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using SocialMediaApplication.Models;
using SocialMediaApplication.DTO;
using System.Text;
using SocialMediaApplication.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace SocialMediaApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly DataContext _context;

        public NotificationsController(DataContext context)
        {
            _context = context;
        }

        // GET: api/Notifications
        [HttpGet("allNotifications")]
        public async Task<IActionResult> GetNotifications()
        {
            var notifications = await _context.Notification.ToListAsync();
            return Ok(notifications);
        }

        [Authorize]
        [HttpGet("myNotifications")]
        public async Task<IActionResult> GetNotificationsOfUser()
        {
            try
            {
                // Get the user's ID from the authentication token
                var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

                // Retrieve notifications related to the logged-in user, ordered by the newest date and time first
                var notifications = await _context.Notification
                    .Where(n => n.UserId == userId)
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                // Handle any exceptions that may occur
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred: " + ex.Message);
            }
        }




        // POST: api/Notifications
        [HttpPost]
        public async Task<IActionResult> CreateNotification(Notification notification)
        {
            try
            {
                notification.CreatedAt = DateTime.Now;
                notification.IsRead = false;

                _context.Notification.Add(notification);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetNotification), new { id = notification.NotificationId }, notification);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Notifications/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotification(int id)
        {
            var notification = await _context.Notification.FindAsync(id);

            if (notification == null)
            {
                return NotFound();
            }

            return Ok(notification);
        }

        // PUT: api/Notifications/5
        [HttpPut("{id}")]
        public async Task<IActionResult> MarkNotificationAsRead(int id)
        {
            var notification = await _context.Notification.FindAsync(id);

            if (notification == null)
            {
                return NotFound();
            }

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}