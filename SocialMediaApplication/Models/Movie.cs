using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SocialMediaApplication.Models
{
    public class Movie
    {
        [Key]
        public int MovieId { get; set; }

        [Required]
        [StringLength(50)]
        public string Title { get; set; }

        public int ReleaseYear { get; set; }

        // Foreign key for the Director relationship
        [ForeignKey("Director")]
        public int DirectorId { get; set; }

        // Navigation property to represent the relationship with the director
    }
}
