import React from 'react';
import { Link } from 'react-router-dom';
const Dashboard = () => {
  return (
    <div>
      <h2 style={{marginTop:'7%'}}>Admin Dashboard</h2>
      <p>Welcome to the admin dashboard. You have access to administrative features here.</p>
      <div>
        <h3>Admin Features:</h3>
        <ul>
          <li>Manage Users</li>
          <li>Review Reports</li>
          <li>View Statistics</li>
          <li>
            <Link to="/notifications-dashboard">Notifications Dashboard</Link>
          </li>
          <li>
            <Link to="/posts-dashboard">Posts Dashboard</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;