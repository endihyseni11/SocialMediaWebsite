using SocialMediaApplication.DTO;
namespace SocialMediaApplication.Services.UserService
{
    public interface IUserService
    {
        string GetMyName();
        string GetUserNameAndSurname();
        List<UserSearch> GetAllUsers();
    }
}
