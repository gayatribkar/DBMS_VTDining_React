import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/loginsignup.css";

const SignUp = () => {
  const [userType, setUserType] = useState('student');
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    studentId: "",
    adminId: "",
    officeLocation: "",
    dob: "",
    allergens: "",
    dietaryPreference: "",
    weeklySpendingLimit: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errors = [];

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(form.password)) {
      errors.push("Password must be at least 6 characters long and include at least one letter, one number, and one special character.");
    }

    if (userType === 'student') {
      const birthDate = new Date(form.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 12) {
        errors.push("Students must be at least 12 years old.");
      }

      if (!/^\d{10}$/.test(form.phone)) {
        errors.push("Phone number must be exactly 10 digits.");
      }

      if (!/^\d{9}$/.test(form.studentId)) {
        errors.push("Student ID must be exactly 9 digits.");
      }

      if (!form.email.endsWith("@vt.edu")) {
        errors.push("Email must end with @vt.edu");
      }
    } else {
      // Admin-specific validations can be added here if needed
    }

    if (errors.length > 0) {
      setError(errors.join("\n"));
      return;
    }

    try {
      const apiEndpoint = userType === 'student' 
        ? 'http://127.0.0.1:8000/api/register/student/'
        : 'http://127.0.0.1:8000/api/register/admin/';

      let formData;

      if (userType === 'student') {
        formData = {
          name: form.fullName,
          email: form.email,
          phone_no: form.phone,
          password: form.password,
          student_id: form.studentId,
          dob: form.dob,
          spending_limit_weekly: parseFloat(form.weeklySpendingLimit) || 0,
          allergens_info: form.allergens,
          dietary_preference: form.dietaryPreference,
        };
      } else {
        formData = {
          name: form.fullName,
          email: form.email,
          phone_no: form.phone,
          password: form.password,
          admin_id: form.adminId,
          office_location: form.officeLocation,
        };
      }

      console.log('Request body:', JSON.stringify(formData, null, 2));

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Registration failed');
      }

      console.log('Registration successful:', responseData);
      navigate("/");
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || "An error occurred during registration.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Sign Up</h2>
      {error && (
        <div className="error-message">
          {error.split('\n').map((err, index) => (
            <p key={index}>{err}</p>
          ))}
        </div>
      )}
      
      <div className="user-type-selection">
        <button 
          onClick={() => setUserType('student')}
          className={userType === 'student' ? 'active' : ''}
        >
          Student
        </button>
        <button 
          onClick={() => setUserType('admin')}
          className={userType === 'admin' ? 'active' : ''}
        >
          Admin
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name:</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        {userType === 'student' ? (
          <>
            <div className="form-group">
              <label htmlFor="studentId">Student ID:</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth:</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="allergens">Allergen Info (Optional):</label>
              <input
                type="text"
                id="allergens"
                name="allergens"
                value={form.allergens}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dietaryPreference">
                Dietary Preference (Optional):
              </label>
              <input
                type="text"
                id="dietaryPreference"
                name="dietaryPreference"
                value={form.dietaryPreference}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="weeklySpendingLimit">
                Weekly Spending Limit:
              </label>
              <input
                type="number"
                id="weeklySpendingLimit"
                name="weeklySpendingLimit"
                value={form.weeklySpendingLimit}
                onChange={handleChange}
                placeholder="Enter amount in USD"
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="adminId">Admin ID:</label>
              <input
                type="text"
                id="adminId"
                name="adminId"
                value={form.adminId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="officeLocation">Office Location:</label>
              <input
                type="text"
                id="officeLocation"
                name="officeLocation"
                value={form.officeLocation}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

<div className="form-group">
  <label htmlFor="password">Password:</label>
  <div className="password-input-wrapper">
    <input
      type={showPassword ? "text" : "password"}
      id="password"
      name="password"
      value={form.password}
      onChange={handleChange}
      required
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
        
        <button type="submit" className="btn-submit">
          Sign Up as {userType === 'student' ? 'Student' : 'Admin'}
        </button>
      </form>
      
      <p>
        Already have an account? <Link to="/"> Go to Login</Link>
      </p>
    </div>
  );
};

export default SignUp;