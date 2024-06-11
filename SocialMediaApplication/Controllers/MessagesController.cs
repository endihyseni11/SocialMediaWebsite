using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using SocialMediaApplication.Data;
using SocialMediaApplication.Models;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authorization;

namespace SocialMediaApplication.Controllers
{
    [Route("api/messages")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IOptions<AppSettings> _appSettings;

        public MessagesController(DataContext context, IOptions<AppSettings> appSettings)
        {
            _context = context;
            _appSettings = appSettings;
        }

        [Authorize]
        [HttpGet("{id}")]
        public IActionResult GetMessageById(int id)
        {
            // Retrieve the message by ID
            var message = _context.Messages.FirstOrDefault(m => m.MessageId == id);

            if (message == null)
            {
                return NotFound(); // Message not found
            }

            return Ok(message);
        }

        [Authorize]
        [HttpGet]
        public IActionResult GetMessages()
        {
            // Get the user's ID from the authentication token
            var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

            // Retrieve messages for the user (you need to implement this logic)
            var messages = _context.Messages.Where(m => m.ReceiverId == userId || m.SenderId == userId);

            return Ok(messages);
        }

        [Authorize]
        [HttpPost]
        public IActionResult SendMessage(Messages message)
        {
            try
            {
                // Get the user's ID from the authentication token
                var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

                // Set the sender ID to the logged-in user
                message.SenderId = userId;

                // Set the sent timestamp
                message.SentAt = DateTime.UtcNow;

                // Perform data validation if needed

                // Save the message to the database (you need to implement this logic)
                _context.Messages.Add(message);
                _context.SaveChanges();

                return CreatedAtAction(nameof(GetMessageById), new { id = message.MessageId }, message);
            }
            catch (Exception ex)
            {
                // Log the exception for debugging
                Console.WriteLine("Error sending message: " + ex.Message);
                return BadRequest("Error sending message: " + ex.Message);
            }
        }


        [Authorize]
        [HttpDelete("{id}")]
        public IActionResult DeleteMessage(int id)
        {
            // Get the user's ID from the authentication token
            var userId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

            // Retrieve the message by ID
            var message = _context.Messages.FirstOrDefault(m => m.MessageId == id);

            if (message == null)
            {
                return NotFound("Message not found");
            }

            // Check if the logged-in user is the sender of the message
            if (message.SenderId != userId)
            {
                return Forbid("You are not authorized to delete this message");
            }

            // Remove the message from the database
            _context.Messages.Remove(message);
            _context.SaveChanges();

            return Ok("Message deleted successfully");
        }

        // Add additional actions for updating and deleting messages if needed.

        [Authorize]
        [HttpGet("sender/{receiverId}")]
        public IActionResult GetMessagesBySenderAndReceiver(int receiverId)
        {
            try
            {
                // Get the user's ID from the authentication token
                var senderId = int.Parse(User.FindFirst(ClaimTypes.SerialNumber).Value);

                // Retrieve messages for the specified sender and receiver
                var messages = _context.Messages
                    .Where(m => (m.SenderId == senderId && m.ReceiverId == receiverId) || (m.SenderId == receiverId && m.ReceiverId == senderId));

                return Ok(messages);
            }
            catch (Exception ex)
            {
                // Log the exception for debugging
                Console.WriteLine("Error retrieving messages: " + ex.Message);
                return BadRequest("Error retrieving messages: " + ex.Message);
            }
        }

    }
}
