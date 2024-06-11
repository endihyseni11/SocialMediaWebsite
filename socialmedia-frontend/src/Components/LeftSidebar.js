import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../CssDesigns/LeftSidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserFriends, faBookmark, faShoppingBag } from '@fortawesome/free-solid-svg-icons';


const LeftSidebar = ({ token, userId }) => {
  const [userInfo, setUserInfo] = useState({
    userId: '',
    name: '',
    surname: '',
    profilePicture: '',
  });
  const [profilePictureUrls, setProfilePictureUrls] = useState({});

  useEffect(() => {
    // Fetch user info using the token and userId
    fetchUserInfo();
  }, [token, userId]);

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
  

  return (
    <div className="left-sidebar">
      <div className="sidebar-content">
      <Link to="/myprofile" className="profile-info-link" 
      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '95.5%', alignItems: 'center', }}>
      <div className="profile-info">
        {profilePictureUrls[userInfo.userId] ? (
          <img
          src={profilePictureUrls[userInfo.userId]}
            alt={`Profile`}
            className="profile-picture-header"
          />
        ) : (
          <span>No profile picture available</span>
        )}
        <a>{userInfo.name} {userInfo.surname}</a>
      </div>
      </Link>
        <div className="sidebar-links">
          <Link to="/friendship">
            <FontAwesomeIcon icon={faUserFriends} />
            Friendship
          </Link>
          <Link to="/saved">
            <FontAwesomeIcon icon={faBookmark} />
            Saved
          </Link>
          <Link to="/market">
            <FontAwesomeIcon icon={faShoppingBag} />
            Market
          </Link>
          
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
