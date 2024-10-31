import React from 'react';
import { FaHome, FaUtensils, FaUserAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock function for navigation (you'll replace this with react-router)
  const handleNavigation = (path) => {
    console.log(`Navigating to ${path}`);
    navigate(path);  // Uncomment this line when using react-router
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-item" onClick={() => handleNavigation('/')}>
          <FaHome size={30} />
          <p>Home</p>
        </div>
        <div className="navbar-item" onClick={() => handleNavigation('/menu')}>
          <FaUtensils size={30} />
          <p>Menu</p>
        </div>
        <div className="navbar-item" onClick={() => handleNavigation('/profile')}>
          <FaUserAlt size={30} />
          <p>Profile</p>
        </div>
      </nav>

      <div className="content">
        <h1>Welcome to VT Dining Food</h1>
      </div>
    </div>
  );
};

export default Dashboard;
