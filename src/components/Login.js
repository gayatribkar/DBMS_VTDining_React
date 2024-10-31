import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../image.png';
import '../styles/loginsignup.css'; 


const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Handle login API (currently commented)
    // axios.post('/api/auth/login', { email, password }).then(response => {
    //   // On successful login, navigate to the main page
    //   navigate('/dashboard');
    // }).catch(error => {
    //   console.error('Login error:', error);
    // });
    navigate('/HomePage');  // Redirect to the dashboard for now
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
        <img src={logo} alt="VT Logo" className="logo" /> {/* VT Logo */}
        </div>
        <h2>Welcome to VT Dining Food</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email:</label>
            <input type="email" placeholder="Enter your email" required />
          </div>
          <div className="input-group">
            <label>Password:</label>
            <input type="password" placeholder="Enter your password" required />
          </div>
          <button type="submit" className="btn-login">Login</button>
        </form>
        <p>
          Don't have an account? <Link to="/signup">Signup</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
