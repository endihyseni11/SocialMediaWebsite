using Microsoft.AspNetCore.Http;

namespace SocialMediaApplication.Models
{
    public class ImageUploadModel
    {
        public int UserId { get; set; }
        public int PostId { get; set; }
        public IFormFile ImageFile { get; set; }
    }
}