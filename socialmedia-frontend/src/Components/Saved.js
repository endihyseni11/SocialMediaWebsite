 import React, { useEffect, useState, useRef } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css'; // Import Draft.js CSS
import '../CssDesigns/Post.css';

const Saved = ({ userId, username, token, postId }) => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [usernames, setUsernames] = useState({});
  const [comments, setComments] = useState({});
  const [commentContent, setCommentContent] = useState('');
  const [isCommenting, setIsCommenting] = useState({});
  const [editingComment, setEditingComment] = useState({ commentId: null, content: '' });
  const [showComments, setShowComments] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [isLiked, setIsLiked] = useState({}); // Track liked status for each post
  const [likedStatus, setLikedStatus] = useState({});
  const [isEditing, setIsEditing] = useState(false); // Track editing state
  const [editedPostContent, setEditedPostContent] = useState(''); // Store edited content
  const [editingPostId, setEditingPostId] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null); // Initialize the ref with null
  const [profilePictureUrls, setProfilePictureUrls] = useState({});
  const [imageObjectUrl, setImageObjectUrl] = useState('');
  const [imageUrls, setImageUrls] = useState({});
  const [imageUrlAfter, setImageUrlAfer] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

const [editedImageUrl, setEditedImageUrl] = useState('');
const [imageUrl3, setImageUrl3] = useState('');
const [originalImageUrl, setOriginalImageUrl] = useState('');
const [isEditingPost, setIsEditingPost] = useState({ postId: null, isEditing: false });
const [isImageSelected, setIsImageSelected] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchUsernames();
  }, [userId, postId]);

  useEffect(() => {
    fetchLikeCounts();
    fetchComments();
    fetchLikedStatusForPosts();
    fetchImages(); // Fetch liked status when comments and like counts are fetched
  }, [posts, postId, token]);

  
 const clearImageSelection = () => {
  setSelectedImage(null);
  setIsImageSelected(false);
};

const handleEditPost = async (postId, postContent, postImageUrl) => {
  clearImageSelection();
  setEditingPostId(postId);
  setEditedPostContent(postContent);
  setEditedImageUrl(postImageUrl)
  setIsEditingPost({ postId: postId, isEditing: true });
  console.log("postImageUrl", postImageUrl)
  
  try {
    const imageUrl = await fetchPhotoByUrl(postImageUrl);
    setEditedImageUrl(imageUrl);
    console.log("edit",editedImageUrl)

    setOriginalImageUrl(imageUrl);
    console.log("original", originalImageUrl);
  } catch (error) {
    console.error('Error fetching image URL:', error);
  }

  setOriginalImageUrl(postImageUrl);
  console.log("original",originalImageUrl);
};


useEffect(() => {
  console.log("posti", editingPostId);
  console.log("posti", editedPostContent);
  console.log("posti", editedImageUrl);
}, [editingPostId, editedPostContent, editedImageUrl]);

const [isSaved, setIsSaved] = useState({});

const savePost = async (postId) => {
  try {
    const response = await fetch(`https://localhost:7069/api/Saved?postId=${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
      }),
    });

    if (response.ok) {
      setIsSaved((prevSavedStatus) => ({
        ...prevSavedStatus,
        [postId]: true,
      }));
      console.log('Post saved successfully');
    } else {
      throw new Error('Failed to save post');
    }
  } catch (error) {
    console.log('Error occurred while saving post:', error);
  }
};


const unsavePost = async (postId) => {
    try {
      const response = await fetch(`https://localhost:7069/api/Saved?postId=${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        console.log('Post Unsaved successfully');
  
        // Update the saved status in state immediately
        setIsSaved((prevSavedStatus) => ({
          ...prevSavedStatus,
          [postId]: false,
        }));
        alert("The save post has been unsaved!");
        // Optionally, you can also update the UI state if needed
        // setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      } else {
        throw Error('Failed to unsave post');
      }
    } catch (error) {
      console.log('Error occurred while unsaving post:', error);
    }
  };


const savedPosts = posts.filter((post) => isSaved[post.id]);
const getSavedPosts = async () => {
  try {
    const response = await fetch('https://localhost:7069/api/Saved', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const savedPosts = await response.json();
      const savedPostsObject = {};
      savedPosts.forEach((postId) => {
        savedPostsObject[postId] = true;
      });
      setIsSaved(savedPostsObject);
      console.log('isSaved',isSaved)
    } else {
      throw new Error('Failed to fetch saved posts');
    }
  } catch (error) {
    console.log('Error occurred while fetching saved posts:', error);
  }
};

useEffect(() => {
  getSavedPosts();
}, []);


const fetchUsers = async (commentsMap) => {
  try {
    const userIds = new Set();
    // Extract unique user IDs from comments
    for (const postComments of Object.values(commentsMap)) {
      for (const comment of postComments) {
        userIds.add(comment.userId);
      }
    }

    const usersMap = {};

    // Fetch user data for each unique user ID
    for (const userId of userIds) {
      const response = await fetch(`https://localhost:7069/api/Auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        usersMap[userId] = userData;
        await fetchMyProfilePicture(userData); // Fetch profile picture for each user
      } else {
        throw new Error(`Failed to fetch user data for user ${userId}`);
      }
    }

    // Associate user data with comments
    for (const postComments of Object.values(commentsMap)) {
      for (const comment of postComments) {
        comment.userInfo = usersMap[comment.userId];
      }
    }

    return commentsMap;
  } catch (error) {
    console.log('Error occurred while fetching user data:', error);
    return commentsMap;
  }
};


  
  const fetchImages = async () => {
    try {
      console.log('Fetching images...');
      const imageUrlsMap = {};
      for (const post of posts) {
        if (post.imageUrl) {
          const imageUrl = await fetchPhotoByUrl(post.imageUrl);
          if (imageUrl) {
            imageUrlsMap[post.id] = imageUrl;
          } else {
            console.error(`Failed to fetch image URL for post ${post.id}`);
          }
        }
      }
      setImageUrls(imageUrlsMap);
    
    } catch (error) {
      console.error('Error occurred while fetching images:', error);
    }
  };
  
  
  


  const deleteComment = async (postId, commentId) => {
    try {
      const response = await fetch(`https://localhost:7069/api/comments/post/${postId}/delete-comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        console.log('Comment deleted successfully');
        fetchComments();
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      console.log('Error occurred while deleting comment:', error);
    }
  };
  
  const saveEditedPost = async (postId) => {
    try {
      const response = await fetch(`https://localhost:7069/api/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: editedPostContent,
        imageUrl: originalImageUrl, // Use originalImageUrl if editedImageUrl is empty
      }),
    });
  
      if (response.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, content: editedPostContent, imageUrl: editedImageUrl }
              : post
          )
        );
        setEditingPostId(null);
        setEditedPostContent('');
        setEditedImageUrl('');
        setIsEditingPost({ postId: postId, isEditing: false });
        fetchPosts();
      } else {
        throw new Error('Failed to update post');
      }
    } catch (error) {
      console.log('Error occurred while updating post:', error);
    }
  };
  
const fetchLikedStatusForPosts = async () => {
  try {
    const likedStatusMap = {};
    for (const post of posts) {
      const response = await fetch(
        `https://localhost:7069/api/likes/post/${post.id}/check`, // Updated URL
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const isLiked = await response.json();
        likedStatusMap[post.id] = isLiked;
      } else {
        throw new Error('Failed to check liked status for post');
      }
    }
    setLikedStatus(likedStatusMap);
  } catch (error) {
    console.log('Error occurred while fetching liked status:', error);
  }
};

const likePost = async (postId) => {
  try {
    const response = await fetch(`https://localhost:7069/api/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        postId: postId,
      }),
    });

    if (response.ok) {
      // Update the liked status for the specific post immediately
      setLikedStatus((prevLikedStatus) => ({
        ...prevLikedStatus,
        [postId]: true,
      }));
      // Update the like count for the specific post
      setLikeCounts((prevLikeCounts) => ({
        ...prevLikeCounts,
        [postId]: prevLikeCounts[postId] ? prevLikeCounts[postId] + 1 : 1,
      }));
    } else {
      throw new Error('Failed to like post');
    }
  } catch (error) {
    console.log('Error occurred while liking post:', error);
  }
};

// Unlike a post
const unlikePost = async (postId) => {
  try {
    const response = await fetch(`https://localhost:7069/api/likes/post/${postId}/unlike`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      // Update the liked status for the specific post immediately
      setLikedStatus((prevLikedStatus) => ({
        ...prevLikedStatus,
        [postId]: false,
      }));
      // Update the like count for the specific post
      setLikeCounts((prevLikeCounts) => ({
        ...prevLikeCounts,
        [postId]: prevLikeCounts[postId] ? prevLikeCounts[postId] - 1 : 0,
      }));
    } else {
      throw Error('Failed to unlike post');
    }
  } catch (error) {
    console.log('Error occurred while unliking post:', error);
  }
};
  const fetchUsernames = async () => {
    try {
      const response = await fetch(`https://localhost:7069/api/Auth/usernames`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const usernameMapping = {};
        data.forEach((user) => {
          usernameMapping[user.userId] = user.username;
        });
        setUsernames(usernameMapping);
      } else {
        throw new Error('Failed to fetch usernames');
      }
    } catch (error) {
      console.log('Error occurred while fetching usernames:', error);
    }
  };

 

const deleteEditedImage = () => {
  setSelectedImage(null);
  setIsImageSelected(false);
  setEditedImageUrl('');
  setOriginalImageUrl('');
};


const fetchPosts = async () => {
  try {
    console.log('Fetching posts from the server...');
    const response = await fetch(`https://localhost:7069/api/posts?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setPosts(data);
      console.log('Posts fetched successfully:', data);
    } else {
      throw new Error('Failed to fetch posts');
    }
  } catch (error) {
    console.error('Error occurred while fetching posts:', error);
  }
};

  const fetchLikeCounts = async () => {
    try {
      const likeCountsMap = {};
      const isLikedMap = {};
      for (const post of posts) {
        const response = await fetch(
          `https://localhost:7069/api/likes/post/${post.id}?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          likeCountsMap[post.id] = data;
          isLikedMap[post.id] = data > 0;
        } else {
          throw new Error(`Failed to fetch like count for post ${post.id}`);
        }
      }
      setLikeCounts(likeCountsMap);
      
    } catch (error) {
      console.log('Error occurred while fetching like counts:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const commentsMap = {};
      for (const post of posts) {
        const response = await fetch(
          `https://localhost:7069/api/comments/post/${post.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.ok) {
          const data = await response.json();
          commentsMap[post.id] = data;
        } else if (response.status === 404) {
          commentsMap[post.id] = [];
        } else {
          throw new Error(`Failed to fetch comments for post ${post.id}`);
        }
      }
  
      const commentsWithUsers = await fetchUsers(commentsMap);
  
      setComments(commentsWithUsers);
    } catch (error) {
      console.log('Error occurred while fetching comments:', error);
    }
  };
  


  const deletePost = async (postId) => {
    try {
      const response = await fetch(`https://localhost:7069/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedPosts = posts.filter((post) => post.id !== postId);
        setPosts(updatedPosts);
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.log('Error occurred while deleting post:', error);
    }
  };

  const createComment = async (postId) => {
    try {
      const response = await fetch('https://localhost:7069/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: postId,
          content: commentContent,
        }),
      });

      if (response.ok) {
        setCommentContent('');
        fetchComments();
        setIsCommenting({ ...isCommenting, [postId]: false }); 
        setShowComments({ ...showComments, [postId]: true });
      } else {
        throw new Error('Failed to create comment');
      }
    } catch (error) {
      console.log('Error occurred while creating comment:', error);
    }
  };
  
  
  const toggleCommenting = (postId) => {
    setIsCommenting({ ...isCommenting, [postId]: !isCommenting[postId] });
  };

  const toggleShowComments = (postId) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
    if (!showComments[postId]) {
      fetchComments(postId);
    }
  };
  const handleEditComment = (commentId, commentContent) => {
    setEditingComment({ commentId, content: commentContent });
  };
  
  const saveEditedComment = async (postId, commentId) => {
    try {
      const response = await fetch(`https://localhost:7069/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId,
          content: editingComment.content,
        }),
      });
  
      if (response.ok) {
        console.log('Comment updated successfully');
        setEditingComment({ commentId: null, content: '' });
        fetchComments();
      } else {
        throw new Error('Failed to update comment');
      }
    } catch (error) {
      console.log('Error occurred while updating comment:', error);
    }
  };
  

  const fetchPhotoByUrl = async (imageUrl) => {
    try {
      const response = await fetch(`https://localhost:7069/api/posts/get-photo?imageUrl=${encodeURIComponent(imageUrl)}`);
  
      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        return objectUrl; // Return the object URL
      } else {
        console.error('Failed to fetch image. Response:', response.status, response.statusText);
        return null; // Return null on failure
      }
    } catch (error)  {
      console.error('An error occurred while fetching image:', error.message);
      return null; // Return null on error
    }
  };
  
  

const handleAttachmentClick = () => {
  // Trigger a click event on the hidden file input
  if (fileInputRef.current) {
    fileInputRef.current.click();
  }
};

const handleAttachment2 = (e) => {
  const selectedFile = e.target.files[0];
  if (selectedFile) {
    setFile(selectedFile);
    setIsImageSelected(true);
    // Create a Data URL for the selected image
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;

      // Set the image URL for display
      setSelectedImage(dataUrl);
      const fileName = selectedFile.name;
      const fileFormat = fileName.split('.').pop(); // Get the file format (extension)
      setOriginalImageUrl(fileName); // Store the filename

      // Optionally, fetch the image object URL
      fetchPhotoByUrl(fileName)
        .then((imageObjectUrl) => {
          // Display the image immediately
          if (imageObjectUrl) {
            setImageObjectUrl(imageObjectUrl);
          }
        })
        .catch((error) => {
          console.error('Error fetching image:', error);
        });

    };
    setEditedImageUrl(null);
      setSelectedImage(null);
    reader.readAsDataURL(selectedFile); // Read the file as Data URL
  }
};

  
  
const handleAttachment = async (e) => {
  const selectedFile = e.target.files[0];
  if (selectedFile) {
    setFile(selectedFile);
    setIsImageSelected(true);
    // Create a Data URL for the selected image
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;

      // Extract the filename from the Data URL
      const fileName = selectedFile.name;
      const imageUrl = `C:/Users/Admin/Desktop/Social-media/SocialMediaApplication/Images/${encodeURIComponent(fileName)}`;

      console.log("emri",fileName)
      // Set the image URL to the extracted filename
      setImageUrl(imageUrl);
      console.log("zdralic",imageUrl)
      // Optionally, fetch the image object URL
      fetchPhotoByUrl(imageUrl)
        .then((imageObjectUrl) => {
          // Display the image immediately
          if (imageObjectUrl) {
            setImageUrl3(imageObjectUrl);
            console.log("arber",imageUrl)
            console.log("arber",imageObjectUrl)
          }
        })
        .catch((error) => {
          console.error('Error fetching image:', error);
        });
    };
    reader.readAsDataURL(selectedFile); // Read the file as Data URL
  }
};



const fetchImageObjectUrl = async (imageUrl) => {
  try {
    const imageObjectUrl = await fetchPhotoByUrl(imageUrl);
    return imageObjectUrl;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};


const deleteImage = () => {
  // Reset the image-related states
  setImageUrl('');
  setImageUrl3('');
  setIsImageSelected(false);
  if (fileInputRef.current) {
    fileInputRef.current.value = ''; // Reset the file input value
  }
};

const fetchPhotoByUrl2 = async (profilePicture) => {
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
    //console.log("useri", userData);
    if (userData.profilePicture) {
      const profilePictureUrl = await fetchPhotoByUrl2(userData.profilePicture);
      if (profilePictureUrl) {
        // Store the profile picture URL in profilePictureUrls
        setProfilePictureUrls((prevUrls) => ({
          ...prevUrls,
          [userData.userId]: profilePictureUrl,
        }));
      } else {
        console.error("Failed to fetch image URL for the current user");
      }
    }
  } catch (error) {
    console.error("Error occurred while fetching the profile picture:", error);
  }
};

  return (
    <div>
        <h2 style={{marginTop:'5%', marginLeft:'23.7%'}}>Saved Posts</h2>
      <div className="post-list" style={{width:'auto', marginLeft:'0%'}}>
        {savedPosts.map((post) => (
          <div key={post.id} className="post">
            {post.userId === userId && (
              <div className="post-actions">
               {!isEditingPost[post.id] || !isEditingPost[post.id].isEditing ? (
  <button onClick={() => handleEditPost(post.id, post.content, post.imageUrl)}>Edit</button>
) : null}

                <button onClick={() => deletePost(post.id)}>Delete</button>
              </div>
            )}
            <div className="post-info">
              <p >{profilePictureUrls[post.userId] && (
              <img
                src={profilePictureUrls[post.userId]}
                alt={`Photo`}
                className="profile-picture-comment"
              />
            )}</p>
              <p style={{marginLeft:'-45%'}}>Posted by {usernames[post.userId] || `User ${post.userId}`}</p>
              <p>Posted on {new Date(post.createdAt).toLocaleString()}</p>
            </div>
{editingPostId === post.id ? (
  <div>
    <textarea
      value={editedPostContent}
      onChange={(e) => setEditedPostContent(e.target.value)}
      placeholder="Edit Post Content"
    />
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleAttachment2}
      accept="image/*"
      style={{ display: 'none' }}
    />

    {isImageSelected && selectedImage && (
      <div>
        <p>Selected Image:</p>
        <img
          src={selectedImage}
          alt="Selected"
          style={{ width: '20vw', height: '20vh' }}
        />
        <button onClick={deleteImage}>Delete Image</button>
      </div>
    )}

{editedImageUrl && (
      <div>
        <p>Existing Image:</p>
        <img
          src={editedImageUrl}
          alt="Existing"
          style={{ width: '20vw', height: '20vh' }}
        />
        <button onClick={deleteEditedImage}>Delete Image</button>
      </div>
    )}
    
    <button onClick={handleAttachmentClick}>Change Image</button>
    <button onClick={() => saveEditedPost(post.id)}>Save</button>
  </div>
) : (
  <div>
    <p style={{marginLeft:'2%', marginBottom:'0%'}}>{post.content}</p>
    {imageUrls[post.id] && (
      <img src={imageUrls[post.id]} alt="Post" style={{ width: "37.3vw", height: "50vh", marginLeft:'4%', marginTop:'2%'}} />
    )}
  </div>
)}

            
            <span className="spanLikesComments">
              {likeCounts[post.id]} Likes {comments[post.id] ? comments[post.id].length : 0} Comments
            </span>

            <div className="likeComment" style={{ display: 'flex', alignItems: 'center' }}>
              {likedStatus[post.id] ? (
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => unlikePost(post.id)}
                >
                  Unlike
                </button>
              ) : (
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => likePost(post.id)}
                >
                  Like
                </button>
              )}

              
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '1rem' }}
                onClick={() => toggleCommenting(post.id)}
              >
                Comment
              </button>

              {isSaved[post.id] ? (
      <button onClick={() => unsavePost(post.id)}>Unsave</button>
    ) : (
      <button onClick={() => savePost(post.id)}>Save</button>
    )}
            </div>

            <button onClick={() => toggleShowComments(post.id)} className="show-comments-button">
              {showComments[post.id] ? 'Hide Comments' : 'Show Comments'}
            </button>

            {isCommenting[post.id] && (
              <div>
                <input
                  type="text"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Your comment here"
                />
                <button onClick={() => createComment(post.id) }>Comment</button>
              </div>
            )}
            <div className='comment-container'>
{showComments[post.id] &&
  comments[post.id] &&
  comments[post.id].map((comment) => (
    <div key={comment.id} className="comment">
      <fieldset className="fieldSet">
        <legend>
          <div className="commenter-info">         
            <div className="user-info">
            {profilePictureUrls[comment.userInfo.userId] && (
              <img
                src={profilePictureUrls[comment.userInfo.userId]}
                alt={`${comment.userInfo.name} ${comment.userInfo.surname}`}
                
                className="profile-picture-comment"
              />
            )}
              <p>{comment.userInfo.name}</p>
              <p style={{marginLeft:'5%'}}>{comment.userInfo.surname}</p>
            </div>
            <div className="comment-actions">
            <div className="edit-delete">
              {comment.userId === userId && (
                <button onClick={() => handleEditComment(comment.id, comment.content)} className="edit-button">Edit</button>
              )}
              {(comment.userId === userId || post.userId === userId) && (
                <button onClick={() => deleteComment(post.id, comment.id)} className="delete-button">Delete</button>
              )}
            </div>
          </div>
          </div>
        </legend>
        <div className="comment-content">
          {editingComment.commentId === comment.id ? (
            <div>
              <input
                type="text"
                value={editingComment.content}
                onChange={(e) =>
                  setEditingComment({
                    ...editingComment,
                    content: e.target.value,
                  })
                }
              />
              <button onClick={() => saveEditedComment(post.id, comment.id)}>Save</button>
            </div>
          ) : (
            <p>{comment.content}</p>
          )}
        </div>
      </fieldset>
    </div>
  ))
}
</div>

          </div>
        ))}
        
      </div>
    </div>
  );

  
};

export default Saved;