using System.ComponentModel.DataAnnotations;

namespace SocialMediaApplication.Models
{
    public class FriendRequest
    {
        [Key]
        public int RequestId { get; set; } // Primary Key
        public int SenderId { get; set; } // Foreign Key to Users Table
        public int ReceiverId { get; set; } // Foreign Key to Users Table
        public string Status { get; set; } // e.g., Pending, Accepted, Rejected
        public DateTime CreatedAt { get; set; } // Timestamp
    }
}
