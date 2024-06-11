import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RightSidebar from './RightSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Notification from './Notifications';
import { faBell, faHome, faChartBar , faCog, faLock, faQuestionCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import '../CssDesigns/Header.css';

const Header = ({ token, userId, handleLogout, userRole }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);

  const [userInfo, setUserInfo] = useState({
    userId: '',
    name: '',
    surname: '',
    profilePicture: '',
  });
  const [profilePictureUrls, setProfilePictureUrls] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [imageMap, setImageMap] = useState({});
      
  useEffect(() => {
    // Fetch user info using the token and userId
    fetchUserInfo();
    console.log(userRole)
  }, [token, userId, userRole]);
  
  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent the click event from propagating
    setMenuVisible(!menuVisible);
  };

  const closeMenu = () => {
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowMessages(false); // Close Messages if open
    setNotificationsMenuOpen(false);
  };

  const toggleMessages = () => {
    setShowMessages(!showMessages);
    setShowNotifications(false); // Close Notifications if open
  };
    
  
  const fetchUserInfo = async () => {
    try {
      // Clear userInfo state to prevent showing previous user's data
      setUserInfo({
        userId: '',
        name: '',
        surname: '',
        profilePicture: '',
      });

      const response = await fetch(`https://localhost:7069/api/Profile/user-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        // Fetch profile picture URL after user info is fetched
        fetchMyProfilePicture(data);

      } else {
        const errorMessage = `Failed to fetch userinfo. Status: ${response.status} ${response.statusText}`;
        console.error(errorMessage);
        // Handle the error, e.g., show a message to the user
      }
    } catch (error) {
      console.error('Error occurred while fetching user info:', error);
      // Handle the error, e.g., show a message to the user
    }
  };

  const fetchPhotoByUrl = async (profilePicture) => {
    try {
      const response = await fetch(`https://localhost:7069/api/Auth/get-photo?profilePicture=${encodeURIComponent(profilePicture)}`);

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

  const fetchMyProfilePicture = async (userData) => {
    try {
      if (userData.profilePicture) {
        const profilePictureUrl = await fetchPhotoByUrl(userData.profilePicture);
        if (profilePictureUrl) {
          setProfilePictureUrls({ [userData.userId]: profilePictureUrl });
        } else {
          console.error("Failed to fetch image URL for the current user");
        }
      }
    } catch (error) {
      console.error("Error occurred while fetching the profile picture:", error);
    }
  };
  const closeNotifications = () => {
    setShowNotifications(false);
    setNotificationsMenuOpen(false);
  };

  return (
    <div className="header-container">
      <div className="header sticky-header">
        <div className="header-left">  
          <a style={{marginRight:'72vw'}} >Postify</a>
          <Link to="/posts">
            <div className="header-icon homeIcon">
              <FontAwesomeIcon icon={faHome} />
            </div>
          </Link>
          {/* Notifications */}
          <div
    className={`header-icon ${notificationsMenuOpen ? 'active' : ''}`}
    onClick={toggleNotifications}
    style={{ marginRight: '6%' }}
  >
    <FontAwesomeIcon icon={faBell} />
    {hasUnreadNotifications && <div className="unread-indicator"></div>}
  </div>

        
        </div>
        <div className="header-right">
          {/* User Profile Image */}
          <div className="user-profile-header" onClick={toggleMenu}>
            {profilePictureUrls[userInfo.userId] ? (
              <img
                src={profilePictureUrls[userInfo.userId]}
                alt="Profile"
                className="profile-picture-header"
              />
            ) : (
              <span>No profile</span>
            )}
            <a style={{ fontSize:'20px'}}>{userInfo.name} {userInfo.surname}</a>
            {menuVisible && (
              <div className="user-menu">
                <div className="user-menu-item">
                  <FontAwesomeIcon className='piktura' icon={faCog} /> <Link to="/settings">Settings</Link>
                </div>
                <div className="user-menu-item">
                  <FontAwesomeIcon icon={faLock} className='piktura' /> <Link to="/privacy">Privacy</Link>
                </div>
                <div className="user-menu-item">
                  <FontAwesomeIcon icon={faQuestionCircle} className='piktura' /> <Link to="/help-support">Help & Support</Link>
                </div>
                <div className="user-menu-item">
                  <FontAwesomeIcon icon={faSignOutAlt} className='piktura' /> <button onClick={handleLogout}>Logout</button>
                </div>
                {userRole === 'Admin' && (
                  <div className="user-menu-item">
                    <FontAwesomeIcon icon={faChartBar} className='piktura' /><Link to="/dashboard">Dashboard</Link>
                  </div>
                )}
              </div>
              
            )}
          </div>
        </div>
      </div>
      {showNotifications && (
        <div className="notifications-modal" >
          <Notification token={token} userId={userId} closeNotifications={closeNotifications} />
        </div>
      )}
    </div>
  );
};

export default Header;
