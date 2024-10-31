import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Hook to handle navigation
import '../styles/loginsignup.css'; 

const SignUp = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    allergens: "",
    dietaryPreference: "",
    password: ""
  });

  const navigate = useNavigate(); // Hook to navigate between pages

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Store the form data in local storage
    localStorage.setItem("userDetails", JSON.stringify(form));
    // Simulate an API call by storing the form data locally (later use API call)
    // Sign-up API call would be here (currently commented)

    // Redirect to the Dashboard after "sign up"
    navigate("/homePage");
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Sign Up</h2>

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

        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={form.address}
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
          <label htmlFor="dietaryPreference">Dietary Preference (Optional):</label>
          <select
            id="dietaryPreference"
            name="dietaryPreference"
            value={form.dietaryPreference}
            onChange={handleChange}
          >
            <option value="">Select preference</option>
            <option value="veg">Vegetarian</option>
            <option value="nonveg">Non-Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-submit">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
