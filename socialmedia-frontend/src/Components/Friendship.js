import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../CssDesigns/Friendship.css';

const Friendship = ({ token, userId }) => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [senderInfo, setSenderInfo] = useState('');
  const [profilePictureUrls, setProfilePictureUrls] = useState({});
  const [senderProfilePictureUrls, setSenderProfilePictureUrls] = useState({});
  const [searchProfilePictureUrls, setSearchProfilePictureUrls] = useState({});
  
  const generateUniqueFriendshipId = () => {
    // You can use a timestamp-based approach to generate unique IDs
    return Date.now().toString();
  };
  useEffect(() => {
    // Fetch friend requests and friends when the component mounts
    fetchFriendRequests();
    fetchFriends();
    fetchSendRequestsImages();
    fetchSearchUsersImages();
    fetchFriendsImages();
  }, [token, userId]);

  useEffect(() => {
    // Update search results when searchQuery changes
    if (searchQuery.trim() !== '') {
      searchUsers(); // Call searchUsers when searchQuery changes
    } else {
      setSearchResults([]); // Clear search results when searchQuery is empty
    }
  }, [searchQuery]);

  const apiUrl = 'https://localhost:7069/api/friendships'; // Updated API URL

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(`${apiUrl}/sent-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data);
        console.log("friendReuets", friendRequests)
        fetchSendRequestsImages(data);
      } else {
        throw new Error('Failed to fetch friend requests');
      }
    } catch (error) {
      console.error('Error occurred while fetching friend requests:', error);
    }
  };

  

  const fetchFriends = async () => {
    try {
      const response = await fetch(`${apiUrl}/friends`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
  
        // Fetch images only when friends data is initially set
        fetchFriendsImages(data);
      } else {
        throw new Error('Failed to fetch friends');
      }
    } catch (error) {
      console.error('Error occurred while fetching friends:', error);
    }
  };

  
  const sendFriendRequest = async (receiverId) => {
  try {
    // Assuming you have the sender's ID (userId) and token defined
    console.log('SenderID:', userId);
    console.log('ReceiverID:', receiverId);

    const response = await fetch(`https://localhost:7069/api/friendships/send?receiverId=${receiverId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ senderId: userId, receiverId }),
    });

    if (response.ok) {
      console.log('Friend request sent successfully.');

      // Update the friendship status to "Pending" for the user you sent the request to
      setSearchResults((prevResults) => {
        return prevResults.map((user) => {
          if (user.userId === receiverId) {
            return { ...user, friendshipStatus: 'Pending' };
          }
          return user;
        });
      });
      console.log(searchResults);
    } else {
      // Handle errors or display an error message to the user.
    }
  } catch (error) {
    console.error('An error occurred while sending the friend request:', error);
  }
};

  

  const acceptFriendRequest = async (friendshipId) => {
    try {
      // Send a request to your API to accept the friend request
      const response = await fetch(`${apiUrl}/accept?friendshipId=${friendshipId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Handle success, update the UI to indicate the request was accepted
        console.log('Friend request accepted successfully.');

        // Update the UI by removing the accepted friend request
        setFriendRequests((prevRequests) => prevRequests.filter((request) => request.requestId !== friendshipId));

        // Fetch the updated list of friends, including the newly accepted friend
        fetchFriends(); // This fetches the updated friends list
      } else {
        // Handle any errors or display an error message
        console.error('Failed to accept friend request.');
      }
    } catch (error) {
      console.error('An error occurred while accepting the friend request:', error);
    }
  };

  const rejectFriendRequest = async (friendshipId) => {
    try {
      // Send a request to your API to reject the friend request
      const response = await fetch(`${apiUrl}/reject?friendshipId=${friendshipId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Handle success, e.g., remove the rejected friend request from the UI
        console.log('Friend request rejected successfully.');

        // Update the UI by removing the rejected friend request
        setFriendRequests((prevRequests) => prevRequests.filter((request) => request.requestId !== friendshipId));
      } else {
        // Handle any errors or display an error message
        console.error('Failed to reject friend request.');
      }
    } catch (error) {
      console.error('An error occurred while rejecting the friend request:', error);
    }
  };

  const deleteFriend = async (friendId) => {
    try {
      // Send a request to your API to delete the friendship
      const response = await fetch(`${apiUrl}/delete?friendId=${friendId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Handle success, remove the friend from the state
        console.log('Friendship deleted successfully.');
        setFriends((prevFriends) => prevFriends.filter((friend) => friend.userId !== friendId));
      } else {
        // Handle any errors or display an error message
        console.error('Failed to delete friendship.');
      }
    } catch (error) {
      console.error('An error occurred while deleting the friendship:', error);
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

 
  
const cancelFriendRequest = async (receiverId) => {
  try {
    // Assuming you have the sender's ID (userId) and token defined
    console.log('SenderID:', userId);
    console.log('ReceiverID:', receiverId);

    const response = await fetch(`https://localhost:7069/api/friendships/cancel?receiverId=${receiverId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log('Friendship request canceled successfully.');

      // Update the friendship status to "NotSent" for the user you canceled the request to
      setSearchResults((prevResults) => {
        return prevResults.map((user) => {
          if (user.userId === receiverId) {
            return { ...user, friendshipStatus: 'NotSent' };
          }
          return user;
        });
      });
      console.log(searchResults);
    } else {
      // Handle errors or display an error message to the user.
    }
  } catch (error) {
    console.error('An error occurred while canceling the friend request:', error);
  }
};





useEffect(() => {
 // console.log("arber", senderProfilePictureUrls);
}, [senderProfilePictureUrls]);

const fetchSendRequestsImages = async (requestsData) => {
  try {
    const profilePictureMap = {};
    for (const request of requestsData) {
      if (request.senderProfilePicture) {
        const profilePictureUrl = await fetchPhotoByUrl(request.senderProfilePicture);
        if (profilePictureUrl) {
          // Attempt to match SenderProfilePicture with userId
          profilePictureMap[request.SenderId] = profilePictureUrl;
          
        } else {
          console.error(`Failed to fetch image URL for sender with ID ${request.SenderId}`);
        }
      }
      
    }
    //console.log('requestsData:', requestsData);

    setSenderProfilePictureUrls(profilePictureMap);
    //console.log('Friend requests images fetched successfully:', profilePictureMap);
  } catch (error) {
    console.error('Error occurred while fetching friend requests images:', error);
  }
};


const fetchFriendsImages = async (friendsData) => {
  try {
    //console.log('Fetching images...');
    const profilePictureMap = {};
    for (const user of friendsData) {
      if (user.profilePicture) {
        const profilePictureUrl = await fetchPhotoByUrl(user.profilePicture);
        if (profilePictureUrl) {
          profilePictureMap[user.userId] = profilePictureUrl;
        } else {
          console.error(`Failed to fetch image URL for user ${user.id}`);
        }
      }
    }
    setProfilePictureUrls(profilePictureMap);
    //console.log("xaxa", profilePictureMap )
    //console.log(friendsData)
    //console.log('Images fetched successfully:', profilePictureMap);
  } catch (error) {
    console.error('Error occurred while fetching images:', error);
  }
};

const fetchPhotoByUrl = async (profilePicture) => {
  try {
    const response = await fetch(`https://localhost:7069/api/friendships/get-photo?profilePicture=${encodeURIComponent(profilePicture)}`);

    if (response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      //console.log('Image fetched successfully:', objectUrl);
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

const fetchSearchUsersImages = async (usersData) => {
  try {
    const profilePictureMap = {};
    for (const user of usersData) {
      if (user.profilePicture) {
        const profilePictureUrl = await fetchPhotoByUrl(user.profilePicture);
        if (profilePictureUrl) {
          profilePictureMap[user.userId] = profilePictureUrl;
        } else {
          console.error(`Failed to fetch image URL for user with ID ${user.userId}`);
        }
      } else {
        // Handle the case where the user doesn't have a profile picture.
        // You can set a default image or handle it as needed.
      }
    }
    setSearchProfilePictureUrls(profilePictureMap);
    console.log('Search users images fetched successfully:', profilePictureMap);
  } catch (error) {
    console.error('Error occurred while fetching search users images:', error);
  }
};
const searchUsers = async () => {
  try {
    if (searchQuery.trim() === '') {
      setSearchResults([]); // Clear search results when the search query is empty
      return;
    }

    // Fetch users based on the search query
    const response = await fetch(
      `https://localhost:7069/api/friendships/search?searchTerm=${searchQuery}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      updateFriendshipStatus();
      // Initialize friendshipStatus dynamically based on the API response
      const usersWithStatus = await Promise.all(
        data.map(async (user) => {
          const status = await updateFriendshipStatus(user.userId); // Pass userId here
          return {
            ...user,
            friendshipStatus: status,
          };
        })
      );

      setSearchResults(usersWithStatus);
      console.log("useri", searchResults);
      fetchSearchUsersImages(data); // Set search results first
    } else {
      throw new Error('Failed to fetch search results');
    }
  } catch (error) {
    console.error('Error occurred while searching for users:', error);
  }
};



const updateFriendshipStatus = async (userId) => {
  try {
    // Check if there is a user in searchResults with the given userId
    const user = searchResults.find((user) => user.userId === userId);

    if (!user) {
      // Handle the case where the user is not found in searchResults
      console.warn('Receiver ID not found for user ID:', userId);
    }

    console.log("Updating friendship status for receiverId:", userId);

    const response = await fetch(
      `https://localhost:7069/api/friendships/check-sent-friendship?receiverId=${userId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("Friendship Status Data:", data);
      
      return data.status; // Possible values: "Accepted", "Pending", or "NotSent"
    } else {
      throw new Error('Failed to check friendship status');
    }
  } catch (error) {
    console.error('An error occurred while checking friendship status:', error);
    return 'Error';
  }
};







return (
    <div className="friendship-page">
       <div className="friendship-new-div">
         <h2 className="friendship-heading">Search Users</h2>
         <input
           type="text"
           className="friendship-input"
           placeholder="Search users..."
           value={searchQuery}
           onChange={handleSearchInputChange}
         />
         <ul className='friendship-results'>
         {searchResults.map((user) => (
  <li className='requestsLi2' key={user.userId} style={{width:'37.4vw'}}>
    <div className="user-profile" style={{width:'65%', display:'flex', flexDirection:'row', alignItems:'center'}}>
      <Link
        to={{
          pathname: `/user/${user.userId}`,
          state: {
            userId2: user.userId,
            name: user.name,
            surname: user.surname,
            profilePicture: searchProfilePictureUrls[user.userId],
          },
        }}
        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '80.5%', alignItems: 'center' }}
      >
        <img src={searchProfilePictureUrls[user.userId]} alt={`Profile of ${user.name}`} className='profile-picture-friendship' />
        <div className="user-name">{user.name} {user.surname}</div>
      </Link>
    </div>

    {user.friendshipStatus === 'Accepted' && (
      <button style={{ marginTop: '2.7%', backgroundColor:'#d52c2c' }}
        onClick={() => deleteFriend(user.userId)}
        className="friendship-cancel-button" 
      >
        Delete 
      </button>
    )}
    {user.friendshipStatus === 'NotSent' && (
      <button style={{ marginTop: '2.7%' }}
        onClick={() => sendFriendRequest(user.userId)}
        className="friendship-add-button"
      >
        ADD FRIEND
      </button>
    )}
    {user.friendshipStatus === 'Pending' && (
      <button style={{ marginTop: '2.7%',backgroundColor:'#d52c2c' }}
        onClick={() => cancelFriendRequest(user.userId)}
        className="friendship-cancel-button" 
        
      >
        CANCEL
      </button>
    )}
  </li>
))}
</ul>
         <div className="friendship-friend-requests">
         <h2 className="friendship-heading">Friend Requests</h2>
         <ul className='requestsUl' style={{textDecoration:'none'}}>
         {friendRequests.map((request) => (
  <li className='requestsLi' key={request.requestId}>
    <div className="user-profile" style={{width:'65%', display:'flex', flexDirection:'row', alignItems:'center'}}>
      
    <Link
  to={{
    pathname: `/user/${request.senderId}`,
    state: {
      userId2: request.senderId,
      name: request.senderName,
      surname: request.senderSurname,
      profilePicture: senderProfilePictureUrls[request.SenderId],
    },
  }}
  style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '80.5%', alignItems: 'center' }}
>
  {senderProfilePictureUrls[request.SenderId] ? (
    <img
      src={senderProfilePictureUrls[request.SenderId]}
      alt={`Profile of ${request.senderName}`}
      className='profile-picture-friendship'
    />
  ) : (
    <span>No profile picture available</span>
  )}
  <div className="user-details">
    <div className="user-name">
      {request.senderName} {request.senderSurname}  sent you a friend request.
    </div>
  </div>
</Link>
    </div>
    <button
      onClick={() => acceptFriendRequest(request.requestId)}
      className="friendship-accept-button" style={{height:'5%', marginTop:'1.5%'}}
    >
      Accept
    </button>
    <button
      onClick={() => rejectFriendRequest(request.requestId)}
      className="friendship-reject-button" style={{height:'5%', marginTop:'1.5%',backgroundColor:'#d52c2c'}}
    >
      Reject
    </button>
  </li>
))}
         </ul>
       </div>
       <div className="friendship-friends-list">
       <h2 className="friendship-heading" >Your Friends</h2>
<ul className='shoket' style={{ listStyle: 'none'}} >
  {friends.map((friend) => (
    <li key={friend.friendshipId} style={{display:'flex', alignItems:'center'}}>
      <div className="user-profile" style={{width:'44.5%', display:'flex', flexDirection:'row', alignItems:'center'}}>
      <Link to={{
  pathname: `/user/${friend.userId}`,
  state: {
    userId2: friend.userId,
    name: friend.name,
    surname: friend.surname,
    profilePicture: profilePictureUrls[friend.userId],
  }
}} style={{ textDecoration: 'none', color: 'inherit', display:'flex',width:'80.5%', alignItems:'center' }}>
      {profilePictureUrls[friend.userId] ? (
        <img
          src={profilePictureUrls[friend.userId]}
          alt={`Profile of ${friend.name} ${friend.surname || ''}`} className='profile-picture-friendship'
        />
      ) : (
        <span>No profile picture available</span>
      )}{' '}
      <div style={{marginLeft:'1%'}}>{friend.name} {friend.surname}{' '} is your friend.</div>
      </Link>
      </div>
      
      <button
        onClick={() => deleteFriend(friend.userId)}
        className="friendship-delete-button" style={{backgroundColor:'#d52c2c'}}
      >
        Delete
      </button>
    </li>
  ))}
</ul>

       </div>
       </div>
     </div>
   );
 
};

export default Friendship;