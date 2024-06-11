using Microsoft.AspNetCore.Mvc;
using SocialMediaApplication.Data;
using SocialMediaApplication.Models;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace SocialMediaApplication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SavedController : ControllerBase
    {
        private readonly DataContext _context;

        public SavedController(DataContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize]
        public IActionResult SavePost(int postId)
        {
            try
            {
                // Get the UserId of the currently logged-in user
                var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

                // Check if the SavedPost entry already exists
                var existingSavedPost = _context.SavedPost.FirstOrDefault(sp => sp.UserId == userId && sp.PostId == postId);

                if (existingSavedPost == null)
                {
                    // Create a new SavedPost entry if it doesn't exist
                    var newSavedPost = new SavedPost
                    {
                        UserId = userId,
                        PostId = postId,
                        Status = "Saved"
                    };

                    _context.SavedPost.Add(newSavedPost);
                }
                else
                {
                    // Update the existing SavedPost status to "Saved"
                    existingSavedPost.Status = "Saved";
                }

                _context.SaveChanges();

                // Redirect to the desired page or return a success message
                return Ok("Post saved successfully.");
            }
            catch (Exception ex)
            {
                // Log the exception for debugging
               

                // Return a meaningful error message or view
                return BadRequest("An error occurred while saving the post.");
            }
        }

        [HttpDelete]
        [Authorize]
        public IActionResult DeleteSavedPost(int postId)
        {
            try
            {
                // Get the UserId of the currently logged-in user
                var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

                // Find the SavedPost entry to delete
                var savedPostToDelete = _context.SavedPost
                    .FirstOrDefault(sp => sp.UserId == userId && sp.PostId == postId);

                if (savedPostToDelete != null)
                {
                    // Delete the SavedPost entry
                    _context.SavedPost.Remove(savedPostToDelete);
                    _context.SaveChanges();

                    return Ok("Post deleted from saved posts.");
                }
                else
                {
                    return NotFound("Saved post not found.");
                }
            }
            catch (Exception ex)
            {
                // Log the exception for debugging

                // Return a meaningful error message or view
                return BadRequest("An error occurred while deleting the saved post.");
            }
        }


        [HttpGet]
        [Authorize]
        public IActionResult GetSavedPosts()
        {
            try
            {
                // Get the UserId of the currently logged-in user
                var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

                // Query the database to retrieve saved posts for the user
                var savedPosts = _context.SavedPost
                    .Where(sp => sp.UserId == userId && sp.Status == "Saved")
                    .Select(sp => sp.PostId)
                    .ToList();

                // You can return the savedPosts data as JSON or in any desired format
                return Ok(savedPosts);
            }
            catch (Exception ex)
            {
                // Log the exception for debugging

                // Return a meaningful error message or view
                return BadRequest("An error occurred while retrieving saved posts.");
            }
        }

    }
}
