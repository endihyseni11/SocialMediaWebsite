using SocialMediaApplication.Models;

namespace SocialMediaApplication.Services.NotificationServices
{
    public class NotificationService : INotificationService
    {
        private readonly DataContext _context;

        public NotificationService(DataContext context)
        {
            _context = context;
        }

        public async Task SendNotification(Notification notification)
        {
            _context.Notification.Add(notification);
            await _context.SaveChangesAsync();
        }
    }
}
