using System.ComponentModel.DataAnnotations;

namespace SocialMediaApplication.Models
{
    public class Messages
    {
        [Key]
        public int MessageId { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        [Required]
        public string MessageContent { get; set; }
        public DateTime SentAt { get; set; }

        // You can add any additional properties or methods as needed.
    }
}
