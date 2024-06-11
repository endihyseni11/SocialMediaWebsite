using SocialMediaApplication.Models;

namespace SocialMediaApplication.Services.NotificationServices
{
    public interface INotificationService
    {
        Task SendNotification(Notification notification);
    }
}
