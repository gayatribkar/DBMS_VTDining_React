// HomePage.js
import React, { useState, useEffect } from "react";
import { FaHome, FaUtensils, FaChartPie, FaUser, FaStar, FaSearch, FaArrowLeft } from "react-icons/fa";
import "../styles/HomePage.css";
import "../styles/profile.css";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("Home");

  const renderContent = () => {
    switch (activeTab) {
      case "Home":
        return <DiningHallsContent />;
      case "Tracker":
        return <TrackerContent />;
      case "Insights":
        return <InsightsContent />;
      case "Profile":
        return <ProfileContent />;
      default:
        return <DiningHallsContent />;
    }
  };

  return (
    <div className="app">
      <header className="navbar sticky-header">
        <h2>VT Eats & Tracks</h2>
        <nav>
          <button
            className={`nav-button ${activeTab === "Home" ? "active" : ""}`}
            onClick={() => setActiveTab("Home")}
          >
            <FaHome /> Home
          </button>
          <button
            className={`nav-button ${activeTab === "Tracker" ? "active" : ""}`}
            onClick={() => setActiveTab("Tracker")}
          >
            <FaUtensils /> Tracker
          </button>
          <button
            className={`nav-button ${activeTab === "Insights" ? "active" : ""}`}
            onClick={() => setActiveTab("Insights")}
          >
            <FaChartPie /> Insights
          </button>
          <button
            className={`nav-button ${activeTab === "Profile" ? "active" : ""}`}
            onClick={() => setActiveTab("Profile")}
          >
            <FaUser /> Profile
          </button>
        </nav>
      </header>
      <main className="content">{renderContent()}</main>
    </div>
  );
};

const DiningHallsContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);

  const diningHalls = [
    { name: "Owens Food Court", location: "Owens Hall" },
    { name: "Squires Food Court", location: "Squires Student Center" },
    { name: "Turner Place", location: "Lavery Hall" },
    { name: "West End Market", location: "Cochrane Hall" },
    { name: "VIVA Market", location: "Various Locations" },
    { name: "Hokie Grill", location: "Owens Hall" },
    { name: "Dietrick Hall", location: "Dietrick Hall" },
  ];

  useEffect(() => {
    setFilteredHalls(
      diningHalls.filter(
        (hall) =>
          hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hall.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  if (selectedHall) {
    return <DiningHallDetails hall={selectedHall} onBack={() => setSelectedHall(null)} />;
  }

  return (
    <div className="content-section dining-section">
      <h1 className="section-title">Explore VT Dining Halls</h1>
      <p>Check real-time status, menus, and reviews for your favorite dining spots on campus.</p>

      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Search dining halls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="dining-halls-grid">
        {filteredHalls.map((hall, index) => (
          <div key={index} className="dining-hall-card" onClick={() => setSelectedHall(hall)}>
            <h3>{hall.name}</h3>
            <p>{hall.location}</p>
            <p>
              <span className="status-badge status-open">Open</span>
            </p>
            <div className="rating">
              <FaStar /> 4.0
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DiningHallDetails = ({ hall, onBack }) => {
  const restaurantData = {
    "Owens Food Court": [
      { name: "Hokie Grill", menu: [{ item: "Burger", price: "$5" }, { item: "Fries", price: "$2" }, { item: "Milkshake", price: "$3" }] },
      { name: "Dolci", menu: [{ item: "Pasta", price: "$7" }, { item: "Salad", price: "$4" }, { item: "Dessert", price: "$3" }] },
      { name: "The Oasis", menu: [{ item: "Falafel Wrap", price: "$6" }, { item: "Tabbouleh", price: "$3" }, { item: "Hummus", price: "$2" }] },
    ],
    "Squires Food Court": [
      { name: "Sushi Place", menu: [{ item: "Sushi Roll", price: "$10" }, { item: "Miso Soup", price: "$3" }, { item: "Green Tea", price: "$2" }] },
      { name: "Sub Station", menu: [{ item: "Ham Sandwich", price: "$5" }, { item: "Veggie Sub", price: "$4" }, { item: "Soup of the Day", price: "$3" }] },
    ],
    // Additional dummy restaurant data for other dining halls...
  };

  const diningDetails = restaurantData[hall.name] || [];

  return (
    <div className="dining-hall-details-container">
      <button onClick={onBack} className="back-button"><FaArrowLeft /> Back to All Halls</button>
      <h2>{hall.name}</h2>
      <p>{hall.location}</p>
      <p>
        <span className="status-badge status-open">Open</span>
      </p>
      <div className="rating">
        <FaStar /> 4.0
      </div>

      <div className="restaurant-list">
        {diningDetails.map((restaurant, index) => (
          <div key={index} className="restaurant-card">
            <h3>{restaurant.name}</h3>
            <ul className="menu-list">
              {restaurant.menu.map((menuItem, idx) => (
                <li key={idx}>
                  <span>{menuItem.item}</span>
                  <span className="menu-price">{menuItem.price}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const TrackerContent = () => (
  <div className="content-section">
    <h1 className="section-title">Nutrition & Budget Tracker</h1>
    <p>Log your meals, track nutrition info, and keep an eye on your Hokie Passport balance.</p>
  </div>
);

const InsightsContent = () => (
  <div className="content-section">
    <h1 className="section-title">Insights</h1>
    <p>See detailed insights on your eating habits, nutrition balance, and spending trends at VT dining halls.</p>
  </div>
);

const ProfileContent = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Retrieve user details from local storage
    const storedUserDetails = localStorage.getItem("userDetails");
    if (storedUserDetails) {
      setUserDetails(JSON.parse(storedUserDetails));
    }
  }, []);

  const handleChange = (e) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // Save updated user details to local storage
    localStorage.setItem("userDetails", JSON.stringify(userDetails));
    setIsEditing(false); // Exit editing mode
  };

  return (
    <div className="content-section">
      <h1 className="section-title">Hokie Profile</h1>
      <p>Update your personal information, dietary preferences, and set your VT dining goals.</p>

      {userDetails ? (
        <div className="profile-details">
          <h3>User Details</h3>
          {isEditing ? (
            <>
              <div className="form-group">
                <label htmlFor="fullName">Full Name:</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={userDetails.fullName}
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
                  value={userDetails.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={userDetails.phone}
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
                  value={userDetails.address}
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
                  value={userDetails.dob}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="allergens">Allergens:</label>
                <input
                  type="text"
                  id="allergens"
                  name="allergens"
                  value={userDetails.allergens}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="dietaryPreference">Dietary Preference:</label>
                <select
                  id="dietaryPreference"
                  name="dietaryPreference"
                  value={userDetails.dietaryPreference}
                  onChange={handleChange}
                >
                  <option value="">Select preference</option>
                  <option value="veg">Vegetarian</option>
                  <option value="nonveg">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>
              <button onClick={handleSave} className="btn-save">Save</button>
            </>
          ) : (
            <>
              <p><strong>Full Name:</strong> {userDetails.fullName}</p>
              <p><strong>Email:</strong> {userDetails.email}</p>
              <p><strong>Phone:</strong> {userDetails.phone}</p>
              <p><strong>Address:</strong> {userDetails.address}</p>
              <p><strong>Date of Birth:</strong> {new Date(userDetails.dob).toLocaleDateString()}</p>
              <p><strong>Allergens:</strong> {userDetails.allergens || "None"}</p>
              <p><strong>Dietary Preference:</strong> {userDetails.dietaryPreference || "Not specified"}</p>
              <button onClick={() => setIsEditing(true)} className="btn-edit">Edit</button>
            </>
          )}
        </div>
      ) : (
        <p>No user details found. Please sign up.</p>
      )}
    </div>
  );
};

export default HomePage;