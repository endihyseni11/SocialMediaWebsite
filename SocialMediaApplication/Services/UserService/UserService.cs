using SocialMediaApplication.DTO;
using System.Security.Claims;

namespace SocialMediaApplication.Services.UserService
{
    public class UserService : IUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly DataContext _context;

        public UserService(IHttpContextAccessor httpContextAccessor, DataContext context)
        {
            _httpContextAccessor = httpContextAccessor;
            _context = context;
        }

        public string GetMyName()
        {
            var result = string.Empty;
            if (_httpContextAccessor.HttpContext != null)
            {
                result = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.Name);
            }
            return result;
        }

        public string GetUserNameAndSurname()
        {
            var result = string.Empty;
            if (_httpContextAccessor.HttpContext != null)
            {
                var username = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.GivenName);
                var name = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.Name);
                var surname = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.Surname);
                var email = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.Email);
                var profilePicture = _httpContextAccessor.HttpContext.User.FindFirstValue("ProfilePicture"); // Retrieve ProfilePicture claim

                result = $"Username: {username}\nName: {name}\nSurname: {surname}\nEmail: {email}\nProfilePicture: {profilePicture}";
            }
            return result;
        }

        public List<UserSearch> GetAllUsers()
        {
            var users = _context.Users
                .Select(u => new UserSearch
                {
                    Id = u.userId,
                    Name = u.name,
                    Surname = u.surname,
                    profilePicture=u.ProfilePicture
                })
                .ToList();

            return users;
        }
    }
}
