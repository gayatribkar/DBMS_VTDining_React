import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../image.png';
import '../styles/loginsignup.css'; 

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    // Password validation regex
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])(?=.*[a-z]).{6,}$/;

    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 6 characters long and include at least one capital letter, one number, and one special character.');
      return;
    }

    // Uncomment this block when the API is ready
    /*
    try {
      const response = await fetch('http://127.0.0.1:8000/api/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, new_password: newPassword }),
      });

      if (!response.ok) {
        throw new Error('Password reset failed');
      }

      // Password reset successful
      navigate('/'); // Redirect to login page
    } catch (error) {
      setError('Password reset failed. Please try again.');
    }
    */

    // Remove this block when uncommenting the API call
    console.log('Password reset for:', email);
    console.log('New password:', newPassword);
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <img src={logo} alt="VT Logo" className="logo" />
        </div>
        <h2>Reset Password</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleResetPassword}>
          <div className="input-group">
            <label>Email:</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>New Password:</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password (min 6 characters)"
                minLength="6"
                required 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-login">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;