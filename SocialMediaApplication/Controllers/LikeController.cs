using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialMediaApplication.Data;
using SocialMediaApplication.Models;
using SocialMediaApplication.Services.NotificationServices;
using System;
using System.Linq;
using System.Security.Claims;

namespace SocialMediaApplication.Controllers
{
    [ApiController]
    [Route("api/likes")]
    public class LikeController : ControllerBase
    {
        private readonly DataContext _context;

        public LikeController(DataContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateLike(Like like, [FromServices] INotificationService notificationService)
        {
            try
            {
                // Get the current user's ID from the claims
                var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);
                var userSurname = User.FindFirst(ClaimTypes.Surname).Value;
                var profilePicture = User.FindFirst("ProfilePicture").Value;
                like.UserId = userId;

                var existingLike = _context.Like.FirstOrDefault(l => l.UserId == userId && l.PostId == like.PostId);

                if (existingLike != null)
                    return BadRequest("You have already liked this post.");

                like.UserId = userId;
                like.CreatedAt = DateTime.UtcNow;

                _context.Like.Add(like);
                await _context.SaveChangesAsync();

                // Create a notification for the post like
                var post = await _context.Post.FindAsync(like.PostId);
                if (post != null)
                {
                    var notification = new Notification
                    {
                        UserId = post.UserId, // UserId of the post owner
                        NotificationType = "Like",
                        NotificationContent = $"{profilePicture} {User.Identity.Name} {userSurname}  liked your post.",
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false
                    };

                    // Send the notification using the notification service
                    await notificationService.SendNotification(notification);
                }

                return CreatedAtAction(nameof(GetLikeById), new { id = like.Id }, like);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



        [HttpDelete("post/{postId}/unlike")]
        [Authorize]
        public IActionResult UnlikePost(int postId)
        {
            // Get the current user's ID from the claims
            var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

            var like = _context.Like.FirstOrDefault(l => l.PostId == postId && l.UserId == userId);

            if (like == null)
                return NotFound();

            // Ensure that only the authorized user can delete their own like
            if (like.UserId != userId)
                return Forbid();

            _context.Like.Remove(like);
            _context.SaveChanges();

            return NoContent();
        }
        [HttpGet("{id}")]
        public IActionResult GetLikeById(int id)
        {
            var like = _context.Like.FirstOrDefault(l => l.Id == id);

            if (like == null)
                return NotFound();

            return Ok(like);
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetLikesByUserId(int userId)
        {
            var likes = _context.Like.Where(l => l.UserId == userId).ToList();

            if (likes.Count == 0)
                return NotFound();

            return Ok(likes);
        }

        [HttpGet("post/{postId}")]
        public IActionResult GetLikesByPostId(int postId)
        {
            var likeCount = _context.Like.Count(l => l.PostId == postId);

            return Ok(likeCount);
        }

        [HttpGet("post/{postId}/check")]
        [Authorize]
        public IActionResult CheckIfLiked(int postId)
        {
            // Get the current user's ID from the claims
            var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

            var like = _context.Like.FirstOrDefault(l => l.PostId == postId && l.UserId == userId);

            return Ok(like != null);
        }
    }
}
