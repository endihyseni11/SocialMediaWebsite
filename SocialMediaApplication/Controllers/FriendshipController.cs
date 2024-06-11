using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SocialMediaApplication.Data;
using SocialMediaApplication.Models;
using SocialMediaApplication.Response;
using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using SocialMediaApplication.Services.NotificationServices;

namespace SocialMediaApplication.Controllers
{
   
    [Route("api/friendships")]
    [ApiController]
    public class FriendshipController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly string _imageFolderPath = "Images";
        private readonly IOptions<AppSettings> _appSettings;

        public FriendshipController(DataContext context, IOptions<AppSettings> appSettings)
        {
            _context = context;
            _appSettings = appSettings;
        }
        [Authorize]
        [HttpGet("{id}")]
        public IActionResult GetFriendshipById(int id)
        {
            // Retrieve the friendship by ID
            var friendship = _context.Friendship.FirstOrDefault(f => f.RequestId == id);

            if (friendship == null)
            {
                return NotFound(); // Friendship not found
            }

            return Ok(friendship);
        }
        [HttpPost("send")]
        [Authorize]
        public async Task<IActionResult> SendFriendshipRequest(int receiverId, [FromServices] INotificationService notificationService)
        {
            try
            {
                // Get the user's ID from the authentication token
                var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);
                var userSurname = User.FindFirst(ClaimTypes.Surname).Value;
                var profilePicture = User.FindFirst("ProfilePicture").Value;
                // Ensure that the user is not trying to send a friendship request to themselves
                if (userId == receiverId)
                    return BadRequest("You cannot send a friendship request to yourself.");

                // Check if a friendship request already exists
                var existingRequest = _context.Friendship
                    .FirstOrDefault(r => r.SenderId == userId && r.ReceiverId == receiverId);

                if (existingRequest != null)
                    return BadRequest("Friendship request already sent.");

                // Create a new Friendship object with the necessary data
                var friendship = new Friendship
                {
                    SenderId = userId,
                    ReceiverId = receiverId,
                    Status = "Pending", // Set status as "Pending" initially
                    CreatedAt = DateTime.UtcNow
                };

                _context.Friendship.Add(friendship);
                await _context.SaveChangesAsync();

                // Create a notification for the friendship request
                var notification = new Notification
                {
                    UserId = receiverId, // UserId of the receiver
                    NotificationType = "Friendship",
                    NotificationContent = $"{profilePicture} {User.Identity.Name} {userSurname} has sent you a friend request.",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };

                // Send the notification using the notification service
                await notificationService.SendNotification(notification);

                // Return a 201 Created response with the newly created resource
                return CreatedAtAction(nameof(GetFriendshipById), new { id = friendship.RequestId }, new FriendshipResponse
                {
                    Success = true,
                    Message = "Friendship request sent successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        // POST: api/friendships/accept
        [HttpPost("accept")]
        public async Task<IActionResult> AcceptFriendshipRequest(int friendshipId, [FromServices] INotificationService notificationService)
        {
            try
            {
                // Get the user's ID from the authentication token
                var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);
                var userSurname = User.FindFirst(ClaimTypes.Surname).Value;
                var profilePicture = User.FindFirst("ProfilePicture").Value;
                // Retrieve the friendship request by its RequestId
                var friendship = _context.Friendship
                    .FirstOrDefault(f => f.RequestId == friendshipId && f.ReceiverId == userId && f.Status == "Pending");

                if (friendship == null)
                    return NotFound("Friendship request not found or already accepted.");

                // Update the status to "Accepted"
                friendship.Status = "Accepted";
                await _context.SaveChangesAsync();

                // Create a notification for the accepted friendship
                var sender = await _context.Users.FindAsync(friendship.SenderId);
                if (sender != null)
                {
                    var notification = new Notification
                    {
                        UserId = friendship.SenderId, // UserId of the post owner
                        NotificationType = "Friendship",
                        NotificationContent = $"{profilePicture} {User.Identity.Name} {userSurname}  accepted your friend request.",
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false
                    };

                    // Send the notification using the notification service
                    await notificationService.SendNotification(notification);
                }

                return Ok("Friendship request accepted successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [Authorize]
        [HttpPost("accept-by-user")]
        public async Task<IActionResult> AcceptFriendshipRequestByUserId2(int userId2, [FromServices] INotificationService notificationService)
        {
            try
            {
                // Get the user's ID from the authentication token
                var userId1 = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);
                var userSurname = User.FindFirst(ClaimTypes.Surname).Value;
                var profilePicture = User.FindFirst("ProfilePicture").Value;
                // Retrieve the friendship request between userId2 and the authenticated user (userId1)
                var friendship = _context.Friendship
                    .FirstOrDefault(f =>
                        ((f.SenderId == userId1 && f.ReceiverId == userId2) ||
                         (f.SenderId == userId2 && f.ReceiverId == userId1)) && f.Status == "Pending");

                if (friendship == null)
                    return NotFound("Friendship request not found or already accepted.");

                // Update the status to "Accepted"
                friendship.Status = "Accepted";
                await _context.SaveChangesAsync();

                // Create a notification for the accepted friendship
                var sender = await _context.Users.FindAsync(userId2); // The user who sent the request
                if (sender != null)
                {
                    var notification = new Notification
                    {
                        UserId = sender.userId, // UserId of the post owner
                        NotificationType = "Friendship",
                        NotificationContent = $"{profilePicture} {User.Identity.Name} {userSurname}  accepted your friend request.",
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false
                    };

                    // Send the notification using the notification service
                    await notificationService.SendNotification(notification);
                }

                return Ok("Friendship request accepted successfully.");
            }
            catch (Exception ex)
            {
                // Handle any exceptions that may occur
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred: " + ex.Message);
            }
        }


        [Authorize]
        // POST: api/friendships/reject
        [HttpPost("reject")]
        public IActionResult RejectFriendshipRequest(int friendshipId)
        {
            // Get the user's ID from the authentication token
            var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

            // Retrieve the friendship request
            var friendship = _context.Friendship
                .FirstOrDefault(f => f.RequestId == friendshipId && f.ReceiverId == userId && f.Status == "Pending");

            if (friendship == null)
                return NotFound("Friendship request not found or already accepted/rejected.");

            // Remove the friendship request (reject)
            _context.Friendship.Remove(friendship);
            _context.SaveChanges();

            return Ok("Friendship request rejected successfully.");
        }

        [Authorize]
        [HttpPost("reject-by-user")]
        public IActionResult RejectFriendshipRequestByUserId2(int userId2)
        {
            try
            {
                // Get the user's ID from the authentication token
                var userId1 = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

                // Retrieve the friendship request between userId2 and the authenticated user (userId1)
                var friendship = _context.Friendship
                    .FirstOrDefault(f =>
                        ((f.SenderId == userId1 && f.ReceiverId == userId2) ||
                         (f.SenderId == userId2 && f.ReceiverId == userId1)) && f.Status == "Pending");

                if (friendship == null)
                    return NotFound("Friendship request not found or already accepted/rejected.");

                // Remove the friendship request (reject)
                _context.Friendship.Remove(friendship);
                _context.SaveChanges();

                return Ok("Friendship request rejected successfully.");
            }
            catch (Exception ex)
            {
                // Handle any exceptions that may occur
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred: " + ex.Message);
            }
        }


        [Authorize]
        [HttpGet("sent-requests")]
        public IActionResult GetSentFriendshipRequests()
        {
            try
            {
                // Get the user's ID from the authentication token
                var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

                // Retrieve the pending friendship requests sent by the user
                var sentRequests = _context.Friendship
                    .Where(f => f.ReceiverId == userId && f.Status == "Pending")
                    .Select(request => new
                    {
                        RequestId = request.RequestId,
                        SenderId = request.SenderId,
                        SenderName = _context.Users
                            .Where(u => u.userId == request.SenderId)
                            .Select(u => u.name)
                            .FirstOrDefault(),
                        SenderSurname = _context.Users
                            .Where(u => u.userId == request.SenderId)
                            .Select(u => u.surname)
                            .FirstOrDefault(),
                        SenderProfilePicture = _context.Users
                            .Where(u => u.userId == request.SenderId)
                            .Select(u => Path.Combine(_appSettings.Value.ImageStoragePath, u.ProfilePicture))
                            .FirstOrDefault()
                    })
                    .ToList();

                return Ok(sentRequests);
            }
            catch (Exception ex)
            {
                // Handle any exceptions that may occur
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred: " + ex.Message);
            }
        }
        // Other CRUD actions for managing friendships

        [Authorize]
        // GET: api/friendships/friends
        [HttpGet("friends")]
        public IActionResult GetFriends()
        {
            try
            {
                // Get the user's ID from the authentication token
                var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

                // Retrieve the accepted friendships for the user
                var friends = _context.Friendship
                    .Where(f => (f.SenderId == userId || f.ReceiverId == userId) && f.Status == "Accepted")
                    .ToList();

                // Get a list of user IDs of your friends
                var friendIds = friends.Select(f => f.SenderId == userId ? f.ReceiverId : f.SenderId).ToList();

                // Retrieve the user objects of your friends
                var friendUsers = _context.Users
                    .Where(u => friendIds.Contains(u.userId))
                    .ToList();

                // Create a new list to store friends with profile picture URLs
                var friendsWithProfilePictures = new List<object>();

                foreach (var friendUser in friendUsers)
                {
                    // Build the full profile picture URL (assuming you store the file path in the user's profilePicture field)
                    var fullProfilePictureUrl = Path.Combine(_appSettings.Value.ImageStoragePath, friendUser.ProfilePicture);

                    // Create a new object that includes friend user details and the full profile picture URL
                    var friendWithProfilePicture = new
                    {
                        friendUser.userId,
                        friendUser.name,
                        friendUser.surname,
                        friendUser.email,
                        profilePicture = fullProfilePictureUrl, // Include the full profile picture URL
                    };

                    friendsWithProfilePictures.Add(friendWithProfilePicture);
                }

                return Ok(friendsWithProfilePictures);
            }
            catch (Exception ex)
            {
                // Handle any exceptions that may occur
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred: " + ex.Message);
            }
        }

        [Authorize]
        // DELETE: api/friendships/delete
        [HttpDelete("delete")]
        public IActionResult DeleteFriendship(int friendId)
        {
            // Get the user's ID from the authentication token
            var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

            // Check if a friendship exists between the user and the friend
            var friendship = _context.Friendship
                .FirstOrDefault(f =>
                    (f.SenderId == userId && f.ReceiverId == friendId && f.Status == "Accepted") ||
                    (f.SenderId == friendId && f.ReceiverId == userId && f.Status == "Accepted")
                );

            if (friendship == null)
                return NotFound("Friendship not found.");

            // Delete the friendship
            _context.Friendship.Remove(friendship);
            _context.SaveChanges();

            return Ok("Friendship deleted successfully.");
        }
        [Authorize]
        [HttpGet("search")]
        public IActionResult SearchUsers(string searchTerm)
        {
            // Get the user's ID from the authentication token
            var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

            // Perform a search for users based on the provided search term
            var users = _context.Users
                .Where(u => u.userId != userId && (u.name.Contains(searchTerm) || u.surname.Contains(searchTerm)))
                .Select(user => new
                {
                    UserId = user.userId,
                    Name = user.name,
                    Surname = user.surname,
                    ProfilePicture = Path.Combine(_appSettings.Value.ImageStoragePath, user.ProfilePicture) // Include the full profile picture URL
                                                                                                            // Add other user attributes as needed
                })
                .ToList();

            return Ok(users);
        }
        [Authorize]
        // DELETE: api/friendships/cancel
        [HttpDelete("cancel")]
        public IActionResult CancelFriendshipRequest(int receiverId)
        {
            // Get the user's ID from the authentication token
            var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

            // Check if a friendship request already exists
            var existingRequest = _context.Friendship
                .FirstOrDefault(r => r.SenderId == userId && r.ReceiverId == receiverId && r.Status == "Pending");

            if (existingRequest == null)
                return NotFound("Friendship request not found.");

            // Remove the friendship request (cancel)
            _context.Friendship.Remove(existingRequest);
            _context.SaveChanges();

            return Ok("Friendship request canceled successfully.");
        }


        [HttpGet("get-photo")]
        public IActionResult GetPhotoByUrl(string profilePicture)
        {
            try
            {
                // Validate the URL to ensure it's within the allowed paths
                if (!profilePicture.StartsWith(_appSettings.Value.ImageStoragePath, StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest("Invalid image URL");
                }

                // Check if the file exists
                if (!System.IO.File.Exists(profilePicture))
                {
                    return NotFound("Image not found");
                }

                // Read the image file
                var imageBytes = System.IO.File.ReadAllBytes(profilePicture);

                // Determine the content type based on the file extension
                var contentType = GetContentType(Path.GetExtension(profilePicture));

                if (contentType == null)
                {
                    return BadRequest("Unsupported image format");
                }

                // Return the image as a file response
                return File(imageBytes, contentType);
            }
            catch (Exception ex)
            {
                // Handle any exceptions that may occur
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred: " + ex.Message);
            }
        }


        // ... (other actions in your PostController)

        // Helper method to determine content type based on file extension
        private string GetContentType(string fileExtension)
        {
            switch (fileExtension.ToLower())
            {
                case ".jpg":
                case ".jpeg":
                    return "image/jpeg";
                case ".png":
                    return "image/png";
                case ".gif":
                    return "image/gif";
                // Add more supported image formats here
                default:
                    return null; // Unsupported format
            }
        }


        [Authorize]
        [HttpGet("check-sent")]
        public IActionResult CheckSentFriendshipRequest(int userId2)
        {
            try
            {
                // Get the user's ID from the authentication token
                var userId1 = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

                // Check if there is an accepted friendship between the two users
                var friendship = _context.Friendship
                    .FirstOrDefault(f =>
                        ((f.SenderId == userId1 && f.ReceiverId == userId2) ||
                         (f.SenderId == userId2 && f.ReceiverId == userId1)) && f.Status == "Accepted");

                if (friendship != null)
                {
                    // Users are friends
                    return Ok(new { status = "Accepted" });
                }
                else
                {
                    // Check if there is a pending friendship request sent by userId1 to userId2
                    var pendingRequest = _context.Friendship
                        .FirstOrDefault(f => f.SenderId == userId1 && f.ReceiverId == userId2 && f.Status == "Pending");

                    if (pendingRequest != null)
                    {
                        // A pending friendship request exists from userId1 to userId2
                        return Ok(new { status = "Sent" });
                    }
                    else
                    {
                        // Check if there is a pending friendship request sent to userId1 from userId2
                        var receivedRequest = _context.Friendship
                            .FirstOrDefault(f => f.SenderId == userId2 && f.ReceiverId == userId1 && f.Status == "Pending");

                        if (receivedRequest != null)
                        {
                            // A pending friendship request exists from userId2 to userId1
                            return Ok(new { status = "AcceptReject" });
                        }
                        else
                        {
                            // No pending friendship request exists from userId1 to userId2
                            return Ok(new { status = "NotSent" });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Handle any exceptions that may occur
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred: " + ex.Message);
            }
        }


        [Authorize]
        [HttpGet("check-sent-friendship")]
        public IActionResult CheckSentFriendshipRequestFriendship(int receiverId)
        {
            try
            {
                // Get the sender's ID from the authentication token
                var senderId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

                // Check if there is an accepted friendship between the sender and receiver
                var friendship = _context.Friendship
                    .FirstOrDefault(f =>
                        ((f.SenderId == senderId && f.ReceiverId == receiverId) ||
                         (f.SenderId == receiverId && f.ReceiverId == senderId)) &&
                        f.Status == "Accepted");

                if (friendship != null)
                {
                    // Friendship between the sender and receiver exists and is accepted
                    return Ok(new { status = "Accepted" });
                }
                else
                {
                    // Check if there is a pending friendship request from the sender to the receiver
                    var pendingRequest = _context.Friendship
                        .FirstOrDefault(f =>
                            (f.SenderId == senderId && f.ReceiverId == receiverId) &&
                            f.Status == "Pending");

                    if (pendingRequest != null)
                    {
                        // A pending friendship request exists from the sender to the receiver
                        return Ok(new { status = "Pending" });
                    }
                    else
                    {
                        // No friendship or pending request between the sender and receiver
                        return Ok(new { status = "NotSent" });
                    }
                }
            }
            catch (Exception ex)
            {
                // Handle any exceptions that may occur
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred: " + ex.Message);
            }
        }




    }
}
