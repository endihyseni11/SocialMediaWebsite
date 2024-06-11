import React, { useState, useEffect } from 'react';

const Friends = ({ token, userId }) => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    // Fetch friend requests and friends when the component mounts
    fetchFriendRequests();
    fetchFriends();
  }, [token, userId]);

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(`https://localhost:7069/api/friendrequests/received`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data);
      } else {
        throw new Error('Failed to fetch friend requests');
      }
    } catch (error) {
      console.error('Error occurred while fetching friend requests:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch('https://localhost:7069/api/friendships/friends', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      } else {
        throw new Error('Failed to fetch friends');
      }
    } catch (error) {
      console.error('Error occurred while fetching friends:', error);
    }
  };

  const sendFriendRequest = async (receiverId) => {
    try {
      // Send a request to your API to send a friend request
      const response = await fetch('https://localhost:7069/api/friendrequests/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: receiverId }),
      });

      if (response.ok) {
        // Handle success, e.g., update the UI to indicate the request was sent
        console.log('Friend request sent successfully.');
        // You may want to refresh the UI or show a message to indicate success.
      } else {
        // Handle any errors or display an error message
        console.error('Failed to send friend request.');
      }
    } catch (error) {
      console.error('An error occurred while sending the friend request:', error);
    }
  };

  const acceptFriendRequest = async (userId, senderId) => {
    try {
      // Send a request to your API to accept the friend request
      const response = await fetch(`https://localhost:7069/api/connections`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: userId, friendId: senderId }), // Use friendId instead of requesterId
    });
  
      if (response.ok) {
        // Handle success, e.g., update the UI to indicate the request was accepted
        console.log('Friend request accepted successfully.');
        // You may want to refresh your friends list or update the UI in some way.
      } else {
        console.log(userId);
        console.log(senderId);
        
        // Handle any errors or display an error message
        console.error('Failed to accept friend request.');
      }
    } catch (error) {
      console.error('An error occurred while accepting the friend request:', error);
    }
  };
  
  

  return (
    <div className="friends-page">
      <div className="friend-requests">
        <h2>Friend Requests</h2>
        <ul>
        {friendRequests.map((request) => (
  <li key={request.requestId}>
    User {request.senderId} sent you a friend request.
    <button onClick={() => {
      console.log('userId:', userId);
      console.log('senderIdd:', request.senderId);
      acceptFriendRequest(userId, request.senderId);
    }}>Accept</button>
  </li>
))}
        </ul>
      </div>
      <div className="friends-list">
        <h2>Your Friends</h2>
        <ul>
          {friends.map((friend) => (
            <li key={friend.userId}>
              {friend.name} {friend.surname}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Friends;
