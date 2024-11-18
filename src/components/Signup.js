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

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!passwordRegex.test(form.password)) {
      alert(
        "Password must be at least 6 characters long and include at least one letter, one number, and one special character."
      );
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
      console.log('Request body:', formData);
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log(response)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      localStorage.setItem("userDetails", JSON.stringify({ ...form, userType }));
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Sign Up</h2>
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
              <label htmlFor="dob">Date of Birth (YYYY-MM-DD):</label>
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

        <div className="form-group password-container">
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