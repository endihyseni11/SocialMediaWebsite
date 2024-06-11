using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization; // Add this namespace
using SocialMediaApplication.Data;
using SocialMediaApplication.Models;
using System;
using System.Linq;
using System.Security.Claims; // Add this namespace

namespace SocialMediaApplication.Controllers
{
    [Authorize]
    [Route("api/friendrequests")]
    [ApiController]
    public class FriendRequestsController : ControllerBase
    {
        private readonly DataContext _context;

        public FriendRequestsController(DataContext context)
        {
            _context = context;
        }

        // POST: api/friendrequests/send
        [HttpPost("send")]
        public IActionResult SendFriendRequest(FriendRequest friendRequest)
        {
            // Get the user's ID from the authentication token
            var senderId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

            // Ensure that the sender and receiver are not the same user
            if (senderId == friendRequest.ReceiverId)
                return BadRequest("You cannot send a friend request to yourself.");

            // Check if a friend request already exists
            var existingRequest = _context.FriendRequest
                .FirstOrDefault(r => r.SenderId == senderId && r.ReceiverId == friendRequest.ReceiverId);

            if (existingRequest != null)
                return BadRequest("Friend request already sent.");

            friendRequest.SenderId = senderId;
            friendRequest.Status = "Pending"; // Or you can use an enum for status
            friendRequest.CreatedAt = DateTime.UtcNow;

            _context.FriendRequest.Add(friendRequest);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetFriendRequestById), new { id = friendRequest.RequestId }, friendRequest);
        }

        [HttpGet("{id}")]
        public IActionResult GetFriendRequestById(int id)
        {
            // Retrieve the friend request by ID
            var friendRequest = _context.FriendRequest.FirstOrDefault(r => r.RequestId == id);

            if (friendRequest == null)
            {
                return NotFound(); // Friend request not found
            }

            return Ok(friendRequest);
        }

        // GET: api/friendrequests/received
        [HttpGet("received")]
        public IActionResult GetReceivedFriendRequests()
        {
            // Get the user's ID from the authentication token
            var receiverId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

            var friendRequests = _context.FriendRequest
                .Where(r => r.ReceiverId == receiverId)
                .ToList();

            return Ok(friendRequests);
        }

        // Other CRUD actions for managing friend requests
    }

}
