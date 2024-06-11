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
    [Route("api/comments")]
    public class CommentController : ControllerBase
    {
        private readonly DataContext _context;

        public CommentController(DataContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateComment(Comment comment, [FromServices] INotificationService notificationService)
        {
            try
            {
                // Get the current user's ID from the claims
                var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);
                var userSurname = User.FindFirst(ClaimTypes.Surname).Value;
                var profilePicture = User.FindFirst("ProfilePicture").Value;
                comment.UserId = userId;

                comment.CreatedAt = DateTime.UtcNow;

                _context.Comment.Add(comment);
                await _context.SaveChangesAsync();

                // Create a notification for the comment
                var post = await _context.Post.FindAsync(comment.PostId);
                if (post != null)
                {
                    var notification = new Notification
                    {
                        UserId = post.UserId, // UserId of the post owner
                        NotificationType = "Comment",
                        NotificationContent = $"{profilePicture} {User.Identity.Name} {userSurname}  commented on your post.",
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false
                    };

                    // Send the notification using the notification service
                    await notificationService.SendNotification(notification);
                }

                return CreatedAtAction(nameof(GetCommentById), new { id = comment.Id }, comment);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public IActionResult UpdateComment(int id, Comment updatedComment)
        {
            var comment = _context.Comment.FirstOrDefault(c => c.Id == id);

            if (comment == null)
                return NotFound();

            // Ensure that only the authorized user can update their own comment
            var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);
            if (comment.UserId != userId)
                return Forbid();

            comment.Content = updatedComment.Content;

            _context.SaveChanges();

            return Ok(comment);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public IActionResult DeleteComment(int id)
        {
            var comment = _context.Comment.FirstOrDefault(c => c.Id == id);

            if (comment == null)
                return NotFound();

            // Ensure that only the authorized user can delete their own comment
            var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);
            if (comment.UserId != userId)
                return Forbid();

            _context.Comment.Remove(comment);
            _context.SaveChanges();

            return NoContent();
        }

        [HttpGet("{id}")]
        public IActionResult GetCommentById(int id)
        {
            var comment = _context.Comment.FirstOrDefault(c => c.Id == id);

            if (comment == null)
                return NotFound();

            return Ok(comment);
        }

        [HttpGet("post/{postId}")]
        public IActionResult GetCommentsByPostId(int postId)
        {
            var comments = _context.Comment.Where(c => c.PostId == postId).ToList();

            if (comments.Count == 0)
                return NotFound();

            return Ok(comments);
        }

        [HttpGet("post/{postId}/check")]
        [Authorize]
        public IActionResult CheckIfCommented(int postId)
        {
            // Get the current user's ID from the claims
            var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

            var comment = _context.Comment.FirstOrDefault(l => l.PostId == postId && l.UserId == userId);

            return Ok(comment != null);
        }
        [HttpGet("post/{postId}/count")]
        public IActionResult GetCommentCountByPostId(int postId)
        {
            var commentCount = _context.Comment.Count(c => c.PostId == postId);

            return Ok(commentCount);
        }

        [HttpDelete("post/{postId}/delete-comment/{commentId}")]
        [Authorize]
        public IActionResult DeleteCommentOnPost(int postId, int commentId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

            // Get the comment to delete
            var commentToDelete = _context.Comment.FirstOrDefault(c => c.Id == commentId);

            if (commentToDelete == null)
                return NotFound("Comment not found.");

            // Check if the user owns the comment or the post
            if (commentToDelete.UserId != userId)
            {
                // If the user doesn't own the comment, check if they own the post
                var post = _context.Post.FirstOrDefault(p => p.Id == postId && p.UserId == userId);
                if (post == null)
                    return NotFound("You can only delete your own comments on this post.");
            }

            // Delete the comment
            _context.Comment.Remove(commentToDelete);
            _context.SaveChanges();

            return NoContent();
        }


    }


}
