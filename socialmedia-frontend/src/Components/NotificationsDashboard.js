import React, { useState, useEffect } from 'react';
import "../CssDesigns/NotificationsDashboard.css";
const NotificationsDashboard = ({ token, userId , closeNotifications }) => {
    const [notifications, setNotifications] = useState([]);
    const [isNotificationVisible, setNotificationVisible] = useState(true);
    const [imageMap, setImageMap] = useState({});
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

    useEffect(() => {
        fetchNotifications();
      }, [token, userId]);
    
      // Fetch notifications with imageUrl property
      const fetchNotifications = async () => {
        try {
          const response = await fetch(`https://localhost:7069/api/Notifications/allNotifications`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
      
          if (response.ok) {
            const data = await response.json();
      
            // Check if there are unread notifications
            const hasUnread = data.some(notification => !notification.isRead);
            setHasUnreadNotifications(hasUnread);
      
            // Extract imageUrl from the first word of notificationContent
            const notificationsWithImageUrl = data.map(notification => {
              const words = notification.notificationContent.split(' ');
              const imageUrl = words.length > 0 ? words[0] : ''; // Assuming the first word is the image URL
              return {
                ...notification,
                imageUrl,
              };
            });
      
            setNotifications(notificationsWithImageUrl);
            console.log("njoftimet", notifications);
            // Fetch images for notifications
            const fetchedImageMap = await fetchImages(notificationsWithImageUrl);
            setImageMap(fetchedImageMap); // Update the imageMap state;
          } else {
            console.error('Failed to fetch notifications. Status:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('An error occurred while fetching notifications:', error);
        }
      };
      
  
      
    // Function to handle closing the notification box
    const handleCloseNotification = () => {
        // Update the state variable to hide the notification box
        setNotificationVisible(false);
    
        // Call the callback function to close the notifications modal in the Header component
        closeNotifications();
      };

    const fetchImages = async (dataWithImageUrl) => {
        try {
          const imageMap = {};
      console.log("fetching", dataWithImageUrl)
          for (const item of dataWithImageUrl) {
            if (item.imageUrl) {
              
              const profilePictureUrl = await fetchPhotoByUrl(item.imageUrl);
      
              if (profilePictureUrl) {
                imageMap[item.notificationId] = profilePictureUrl; // Use a unique identifier as the key, e.g., notificationId
              } else {
                console.error(`Failed to fetch image URL for item with ID ${item.notificationId}`);
              }
            }
          }
      
         
          return imageMap;
        } catch (error) {
          console.error('Error occurred while fetching images:', error);
          return null; // Handle the error or return null as needed
        }
      };
      const fetchPhotoByUrl = async (profilePicture) => {
        try {
          const  url="C:/Users/Admin/Desktop/Social-media/SocialMediaApplication/Images";
          const response = await fetch(`https://localhost:7069/api/Auth/get-photo?profilePicture=${url}/${encodeURIComponent(profilePicture)}`);
      
          if (response.ok) {
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            return objectUrl; // Return the object URL
          } else {
            console.error('Failed to fetch image. Response:', response.status, response.statusText);
            return null; // Return null on failure
          }
        } catch (error) {
          console.error('An error occurred while fetching image:', error);
          return null; // Return null on error
        }
      };
      
      const markNotificationAsRead = async (notificationId) => {
        try {
          // Send an API request to mark the notification as read
          const response = await fetch(`https://localhost:7069/api/Notifications/${notificationId}`, {
            method: 'PUT', // Assuming you use a PUT request to update the notification
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
      
          if (response.ok) {
            // Update the state immutably
            setNotifications(prevNotifications => prevNotifications.map(notification => {
              if (notification.notificationId === notificationId) {
                return {
                  ...notification,
                  isRead: true,
                };
              }
              return notification;
            }));
          } else {
            console.error('Failed to mark notification as read. Status:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('An error occurred while marking notification as read:', error);
        }
      };
      
      
      return (
        isNotificationVisible && (
          <div className="notification-box2">
            {hasUnreadNotifications && <div className="unread-indicator"></div>}
            <div className="notification-header">
              <h3 style={{ marginLeft: '27%' }}>Notifications</h3>
              {hasUnreadNotifications && <div className="unread-indicator"></div>}
            </div>
            <div className="notification-content2">
              {notifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`notification-item ${!notification.isRead ? 'unread-notification' : ''}`}
                >
                  <div className='dataKrijimit'>
                    <p>{notification.createdAt}</p>
                  </div>
                  <div className='kontenti' >
                    {notification.imageUrl && (
                      <img src={imageMap[notification.notificationId]} alt="User" className="user-image" />
                    )}
                    <a className={`paragrafiKontentit ${notification.isRead ? 'read' : ''}`}>
                      {notification.notificationContent.replace(/^[^\s]+\s/, '')}
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="notification-footer">
              <button onClick={handleCloseNotification}>Close Notification</button>
            </div>
          </div>
        )
      );
    };
export default NotificationsDashboard;
