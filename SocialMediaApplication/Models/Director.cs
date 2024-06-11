using System.ComponentModel.DataAnnotations;

namespace SocialMediaApplication.Models
{
    public class Director
    {
        [Key]
        public int DirectorId { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        public int BirthYear { get; set; }

        // Navigation property to represent the relationship with movies
        
    }
}
