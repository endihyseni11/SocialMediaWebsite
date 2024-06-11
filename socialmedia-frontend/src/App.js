import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import './App.css';
import Login from './Components/Login';
import Post from './Components/Post';
import Friends from './Components/Friends';
import Header from './Components/Header';
import RightSidebar from './Components/RightSidebar';
import LeftSidebar from './Components/LeftSidebar';
import Friendship from './Components/Friendship';
import Saved from './Components/Saved';
import MyProfile from './Components/MyProfile';
import UserProfile from './Components/UserProfile';
import Notification from './Components/Notifications';
import Dashboard from './Components/Dashboard';
import NotificationsDashboard from './Components/NotificationsDashboard';
import PostsDashboard from './Components/PostsDashboard';
import Director from './Components/Director';
import Movie from './Components/Movie';
const PrivateRoute = ({ component: Component, isLoggedIn, userId, token, ...rest }) => (
  
<Route
    {...rest}
    render={props => isLoggedIn ? <Component userId={userId} token={token} {...props} /> : <Redirect to="/" />}
  />
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [isNotificationVisible, setNotificationVisible] = useState(false); // Add this state variable

  const handleLogin = (role, token, userId) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setToken(token);
    setUserId(userId);
    setUsername('');
    const userData = { isLoggedIn: true, userRole: role, token, userId };
    sessionStorage.setItem('userData', JSON.stringify(userData));
    console.log(token);
    console.log(role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    setUserId('');
    sessionStorage.removeItem('userData');
  };
  const handleCloseNotification = () => {
    setNotificationVisible(false);
  };
  useEffect(() => {
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
      const { isLoggedIn, userRole, token, userId } = JSON.parse(storedUserData);
      setIsLoggedIn(isLoggedIn);
      setUserRole(userRole);
      setToken(token);
      setUserId(userId);
    }
  }, []);

  return (
    <div className="App">
      <Router>
        {isLoggedIn && <Header token={token} userId={userId} handleLogout={handleLogout} userRole={userRole} />}
        <div className="app-content">
        {isLoggedIn && <LeftSidebar token={token} userId={userId} />}
        {isLoggedIn && <RightSidebar token={token} userId={userId} /> }{/* Include the RightSidebar component */}
          <div className="main-content">
            <Switch>
              <Route exact path="/">
                {isLoggedIn ? <Redirect to="/posts" /> : <Login handleLogin={handleLogin} />}
              </Route>
              <PrivateRoute
                path="/posts"
                component={Post}
                isLoggedIn={isLoggedIn}
                userId={userId}
                token={token}
              />
               <PrivateRoute
                path="/friends"
                component={Friends} // Use the Friends component
                isLoggedIn={isLoggedIn}
                userId={userId}
                token={token}
              />
              <PrivateRoute
  path="/friendship"
  component={() => <Friendship token={token} userId={userId} />} // Pass friends data
  isLoggedIn={isLoggedIn}
  userId={userId}
  token={token}
/>
              <PrivateRoute
                path="/saved"
                component={Saved}
                isLoggedIn={isLoggedIn}
                userId={userId}
                token={token}
              />
              <PrivateRoute
                path="/myprofile"
                component={MyProfile}
                isLoggedIn={isLoggedIn}
                userId={userId}
                token={token}
              />
              <PrivateRoute
                path="/user"
                component={UserProfile}
                isLoggedIn={isLoggedIn}
                userId={userId}
                token={token}
              />
              <PrivateRoute
                path="/notification"
                component={Notification}
                isLoggedIn={isLoggedIn}
                userId={userId}
                token={token}
              />
              <PrivateRoute
                path="/dashboard"
                component={Dashboard}
                isLoggedIn={isLoggedIn}
                userId={userId}
                token={token}
                userRole={userRole}
              />
               <PrivateRoute
                path="/notifications-dashboard"
                component={NotificationsDashboard}
                isLoggedIn={isLoggedIn}
                userId={userId}
                token={token}
                userRole={userRole}
              />
              <PrivateRoute
                path="/posts-dashboard"
                component={PostsDashboard}
                isLoggedIn={isLoggedIn}
                token={token}
                userRole={userRole}
                userId={userId}
              />

                <PrivateRoute
                path="/director"
                component={Director}
                isLoggedIn={isLoggedIn}
                token={token}
                userRole={userRole}
                userId={userId}
              />
              <PrivateRoute
                path="/movie"
                component={Movie}
                isLoggedIn={isLoggedIn}
                token={token}
                userRole={userRole}
                userId={userId}
              />
              {/* Add more routes as needed */}
            </Switch>
          </div>
        </div>
      </Router>
    </div>
  );
  
};

export default App;
