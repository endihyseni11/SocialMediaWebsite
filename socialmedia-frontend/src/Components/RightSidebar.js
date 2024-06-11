import React, { useState, useEffect } from 'react';
import '../CssDesigns/RightSidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { useRef } from 'react';

const RightSidebar = ({ token, userId }) => {
  const [friends, setFriends] = useState([]);
  const [profilePictureUrls, setProfilePictureUrls] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    localStorage.getItem('isSidebarOpen') === 'true' || false // Change 'true' to 'false' if you want it closed by default
  );
  const [chatOpen, setChatOpen] = useState(false); // State to track chat box visibility
  const [selectedFriend, setSelectedFriend] = useState(null); // State to store the friend for the open chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverId, setReceiverId] = useState(null);
  const [senderId, setSenderId] = useState(null);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const [openMessageOptions, setOpenMessageOptions] = useState(null);
  const chatContainerRef = useRef(null);
  useEffect(() => {
    console.log('RightSidebar component is rendering.');
    fetchFriends();
  }, [userId]);

  const apiUrl = 'https://localhost:7069/api/friendships';
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
        fetchImages(data);
      } else {
        throw new Error('Failed to fetch friends');
      }
    } catch (error) {
      console.error('Error occurred while fetching friends:', error);
    }
  };

  const fetchImages = async (friendsData) => {
    try {
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

  const toggleChat = (friend) => {
    if (friend) {
      setReceiverId(friend.userId);
      setChatOpen(true);
      setSelectedFriend(friend);
    } else {
      setChatOpen(false);
      setSelectedFriend(null);
      setReceiverId(null);
    }
  };

  useEffect(() => {
    if (receiverId !== null) {
      fetchMessages(receiverId);
    }
  }, [receiverId]);

  const toggleSidebar = () => {
    const updatedIsSidebarOpen = !isSidebarOpen;
    setIsSidebarOpen(updatedIsSidebarOpen);
    localStorage.setItem('isSidebarOpen', updatedIsSidebarOpen.toString());
    console.log('Toggled sidebar state:', updatedIsSidebarOpen);
  };

  const fetchMessages = async (friendUserId) => {
    try {
      const response = await fetch(`https://localhost:7069/api/messages/sender/${friendUserId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);

        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      } else {
        if (response.status === 401) {
          console.error('Unauthorized - check your token.');
        } else {
          console.error('Error retrieving messages:', response.status, response.statusText);
        }
      }
    } catch (error) {
      console.error('Error retrieving messages:', error);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };
  const sendMessage = async () => {
    try {
      const messageData = {
        senderId: userId,
        receiverId: receiverId,
        messageContent: newMessage,
        sentAt: new Date().toISOString(),
      };
  
      const response = await fetch('https://localhost:7069/api/messages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
  
      if (response.ok) {
        setNewMessage('');
        fetchMessages(receiverId);
        setTimeout(scrollToBottom, 100); // Scroll to the bottom after sending the message
      } else {
        if (response.status === 400) {
          console.error('Bad request - invalid data format.');
        } else if (response.status === 401) {
          console.error('Unauthorized - check your token.');
        } else {
          console.error('Failed to send message - unknown error.');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  useEffect(() => {
    fetchMessages();
  }, []);

  const deleteMessage = async (messageId) => {
    try {
      const response = await fetch(`https://localhost:7069/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        // Message deleted successfully
        // You may want to update the UI by removing the deleted message from the messages state
        // You can use the `setMessages` function to update the state.
        fetchMessages(receiverId);
        console.log("Message sucesfully deleted");
      } else {
        if (response.status === 401) {
          console.error('Unauthorized - check your token.');
        } else {
          console.error('Error deleting message:', response.status, response.statusText);
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };


  function isDifferentDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() !== d2.getFullYear() ||
      d1.getMonth() !== d2.getMonth() ||
      d1.getDate() !== d2.getDate()
    );
  }
  
  // Helper function to format a date as you prefer (you can customize this)
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  function formatTime(dateTimeString) {
    const messageTime = new Date(dateTimeString);
    const currentTime = new Date();
    const timeDifference = (currentTime - messageTime) / (1000 * 60); // Calculate time difference in minutes
  
    if (timeDifference < 5) {
      return 'Now';
    } else {
      const options = { hour: '2-digit', minute: '2-digit' };
      return new Date(dateTimeString).toLocaleTimeString(undefined, options);
    }
  }
  
  return (
    <div className="right-sidebar-container">
      <div className="right-sidebar-content">
        <div className="connected-friends" >
          <h3 style={{marginTop:'15%', marginLeft:'18%'}}>Connected Friends</h3>
          <ul className="connected-friends-list" style={{ marginLeft:'10%'}} >
            {friends.map((friend) => (
                <li key={friend.friendshipId} className='liFriends'>
                
                  {profilePictureUrls[friend.userId] ? (
                <img
                  src={profilePictureUrls[friend.userId]}
                  alt={`Profile of ${friend.name} ${friend.surname || ''}`}
                  style={{ width: '2.4vw', height: '5vh', borderRadius: '80%', marginRight: '2%' }}
                />
              ) : (
                <span>No profile picture available</span>
              )}
              {friend.name} {friend.surname}
              <button
                onClick={() => {
                  toggleChat(friend);
                  fetchMessages(friend.userId); // Fetch messages for the selected friend
                }}
                className="send-message-button"
              >
                <FontAwesomeIcon icon={faComment} style={{ marginLeft:'70%', }} />
              </button>
                </li>
              ))}
          </ul>
        </div>
        <div className="chat-box-container">
          {chatOpen && selectedFriend && (
            <div className="chat-box">
              <div className="chat-header">
                  {profilePictureUrls[selectedFriend.userId] && (
                <img
                  src={profilePictureUrls[selectedFriend.userId]}
                  alt={`Profile of`}
                  style={{ width: '2.4vw', height: '5vh', borderRadius: '80%', marginRight: '2%' }}
                />
              )} {selectedFriend.name} {selectedFriend.surname}  
                <button onClick={() => toggleChat(null)} className="close-chat-button">
                  X
                </button>
              </div>
              <div className="chat-messages" ref={chatContainerRef}>
              

              {messages.map((message, index) => (
    <React.Fragment key={message.messageId}>
      {/* Display date and time if it differs from the previous message */}
      {index === 0 || isDifferentDay(messages[index - 1].sentAt, message.sentAt) ? (
        <div className="message-date">
          <div style={{ display: 'flex' , justifyContent:'space-around' }}>
            {formatDate(message.sentAt)}
          </div>
        </div>
      ) : null}

      <div
        className={`chat-message ${message.senderId === userId ? 'sent' : 'received'}`}
      >
  
    {/* Display sender's name for received messages */}
    {message.senderId !== userId && (
      <div className="sender-name">
        {profilePictureUrls[selectedFriend.userId] && (
          <img
            src={profilePictureUrls[selectedFriend.userId]}
            alt={`Profile of`}
            style={{ width: '2.4vw', height: '5vh', borderRadius: '80%', marginLeft: '-20%', marginTop:'19px'}}
          />
        )}
      </div>
    )}

{/* Show three dots for sent messages */}
{message.senderId === userId ? (
  <div className={`message-options ${openMessageOptions === message.messageId ? 'active' : ''}`}>
    <FontAwesomeIcon
      icon={faEllipsisH}
      onClick={() => setOpenMessageOptions(openMessageOptions === message.messageId ? null : message.messageId)}
    />
    {openMessageOptions === message.messageId && (
      <div className="message-options-box">
        <button
          onClick={() => deleteMessage(message.messageId)}
          className="delete-message-button"
        >
          Delete
        </button>
      </div>
    )}
  </div>
) : null}
    <div>
    <div className="message-time" style={{ display: 'flex', flexDirection: `${message.senderId === userId ? 'row-reverse' : 'row'}` }}>
  {formatTime(message.sentAt)}
</div>


    <div className="message-content">
      {message.messageContent}
    </div>
    </div>


  </div>
  </React.Fragment>
))}

</div>
              <div className="chat-input">
                <div className="chat-input-container">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      setReceiverId(selectedFriend.userId);
                      sendMessage();
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
            
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
