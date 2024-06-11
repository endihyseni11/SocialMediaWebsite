using System.ComponentModel.DataAnnotations;

namespace SocialMediaApplication.Models
{
    public class Connection
    {
        [Key]
        public int ConnectionId { get; set; } // Primary Key
        public int UserId { get; set; } // Foreign Key to Users Table
        public int FriendId { get; set; } // Foreign Key to Users Table
        public string Status { get; set; } // e.g., Connected, Disconnected
        public DateTime CreatedAt { get; set; } // Timestamp

    }
}
