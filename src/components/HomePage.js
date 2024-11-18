import React, { useState, useEffect } from "react";
import { FaHome, FaUtensils, FaChartPie, FaUser, FaStar, FaSearch, FaArrowLeft, FaSignOutAlt , FaAppleAlt, FaClock, FaDollarSign, FaChartLine, FaBuilding,FaPlus, FaMinus, FaInfoCircle, FaTrashAlt} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/profile.css";
import { Link } from 'react-router-dom';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale } from 'chart.js';


ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale);


const HomePage = () => {
  const [activeTab, setActiveTab] = useState("Home");
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      try {
        // Retrieve user details and token from localStorage
        const userDetails = JSON.parse(localStorage.getItem("userDetails"));
        const token = localStorage.getItem("token");
        console.log(token)
  
        if (!userDetails?.email || !token) {
          console.error("User email or token not found");
          return;
        }
  
        const response = await fetch('http://127.0.0.1:8000/api/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          credentials: 'include', 
          body: JSON.stringify({ email: userDetails.email }), 
        });
  
        if (response.ok) {
          // Clear local storage
          localStorage.removeItem("userDetails");
          localStorage.removeItem("token");

          navigate("/");
        } else {
          const errorData = await response.json();
          console.error("Logout failed:", errorData);
        }
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
  };

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
        <button className={`nav-button ${activeTab === "Home" ? "active" : ""}`} onClick={() => setActiveTab("Home")}>
          <FaHome /> Home
        </button>
        <button className={`nav-button ${activeTab === "Tracker" ? "active" : ""}`} onClick={() => setActiveTab("Tracker")}>
          <FaUtensils /> Tracker
        </button>
        <button className={`nav-button ${activeTab === "Insights" ? "active" : ""}`} onClick={() => setActiveTab("Insights")}>
          <FaChartPie /> Insights
        </button>
        <button className={`nav-button ${activeTab === "Profile" ? "active" : ""}`} onClick={() => setActiveTab("Profile")}>
          <FaUser /> Profile
        </button>
        <button className="nav-button logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </nav>
    </header>
    <main className="content">{renderContent()}</main>
  </div>
);
};


const DiningHallsContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [diningHalls, setDiningHalls] = useState([]);
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);

  useEffect(() => {
    const fetchDiningHalls = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/dining-halls/');
        if (!response.ok) {
          throw new Error('Failed to fetch dining halls');
        }
        const data = await response.json();
        setDiningHalls(data);
        setFilteredHalls(data);
      } catch (error) {
        console.error('Error fetching dining halls:', error);
      }
    };

    fetchDiningHalls();
  }, []);

  useEffect(() => {
    setFilteredHalls(
      diningHalls.filter(
        (hall) =>
          hall.dining_hall_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (hall.dining_hall_location && hall.dining_hall_location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [searchTerm, diningHalls]);

  const handleHallClick = (hall) => {
    setSelectedHall(hall);
  };

  const handleBack = () => {
    setSelectedHall(null);
  };

  if (selectedHall) {
    return <DiningHallDetails hall={selectedHall} onBack={handleBack} />;
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
        {filteredHalls.map((hall) => (
          <div key={hall.dining_id} className="dining-hall-card" onClick={() => handleHallClick(hall)}>
            <h3>{hall.dining_hall_name}</h3>
            <p>{hall.dining_hall_location !== 'N/A' ? hall.dining_hall_location : 'Location not specified'}</p>
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
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRestaurant, setExpandedRestaurant] = useState(null);
  const [itemQuantities, setItemQuantities] = useState({});

  useEffect(() => {
    fetchRestaurants();
  }, [hall.dining_id]);

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/restaurants/?dining_hall=${hall.dining_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const fetchMenuItems = async (restaurantId) => {
    if (menuItems[restaurantId]) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/food_items/?restaurant=${restaurantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      setMenuItems(prevItems => ({ ...prevItems, [restaurantId]: data }));
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleAddItem = (item) => {
    const quantity = itemQuantities[item.food_id] || 0;
    if (quantity === 0) return;
  
    const trackedItems = JSON.parse(localStorage.getItem('trackedItems') || '[]');
    const newItem = {
      ...item,
      quantity,
      diningHall: hall.dining_hall_name,
      date: new Date().toISOString(),
      price: parseFloat(item.price) * quantity,
      calories: parseInt(item.calories) * quantity,
      protein: parseFloat(item.protein) * quantity,
      total_fat: parseFloat(item.total_fat) * quantity,
      saturated_fat: parseFloat(item.saturated_fat) * quantity,
      trans_fat: parseFloat(item.trans_fat) * quantity,
      cholesterol: parseFloat(item.cholesterol) * quantity,
      sodium: parseFloat(item.sodium) * quantity,
      total_carbohydrates: parseFloat(item.total_carbohydrates) * quantity,
      dietary_fiber: parseFloat(item.dietary_fiber) * quantity,
      sugars: parseFloat(item.sugars) * quantity,
      vitamin_d: parseFloat(item.vitamin_d) * quantity,
      calcium: parseFloat(item.calcium) * quantity,
      iron: parseFloat(item.iron) * quantity,
      potassium: parseFloat(item.potassium) * quantity
    };
    trackedItems.push(newItem);
    localStorage.setItem('trackedItems', JSON.stringify(trackedItems));
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 3000);
    setItemQuantities(prev => ({ ...prev, [item.food_id]: 0 }));
  };


  // const handleAddItem = (item) => {
  //   const quantity = itemQuantities[item.food_id] || 0;
  //   if (quantity === 0) return;

  //   const trackedItems = JSON.parse(localStorage.getItem('trackedItems') || '[]');
  //   const newItem = {
  //     ...item,
  //     quantity,
  //     diningHall: hall.dining_hall_name,
  //     date: new Date().toISOString(),
  //     price: parseFloat(item.price),
  //     calories: parseInt(item.calories),
  //     protein: parseFloat(item.protein)
  //     // ...item,
  //     // quantity,
  //     // diningHall: hall.dining_hall_name,
  //     // date: new Date().toISOString(),
  //   };
  //   trackedItems.push(newItem);
  //   localStorage.setItem('trackedItems', JSON.stringify(trackedItems));
  //   setShowAddedMessage(true);
  //   setTimeout(() => setShowAddedMessage(false), 3000);
  //   setItemQuantities(prev => ({ ...prev, [item.food_id]: 0 }));
  // };

  const toggleRestaurantMenu = (restaurantId) => {
    setExpandedRestaurant(prev => prev === restaurantId ? null : restaurantId);
    fetchMenuItems(restaurantId);
  };

  const handleQuantityChange = (itemId, change) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }));
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMenuItems = (restaurantId) => {
    if (!menuItems[restaurantId]) return [];
    return menuItems[restaurantId].filter(item =>
      item.food_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.allergens_info.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.price.toString().includes(searchTerm)
    );
  };

  return (
    <div className="dining-hall-details">
      {showAddedMessage && (
        <div className="added-message">
          <p>Item added to your tracker!</p>
        </div>
      )}
      <button onClick={onBack} className="back-button"><FaArrowLeft /> Back to All Halls</button>
      <h2>{hall.dining_hall_name}</h2>
      <p>{hall.dining_hall_location}</p>

      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="  Search restaurants or menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="restaurant-list">
        {filteredRestaurants.map((restaurant) => (
          <div key={restaurant.restaurant_id} className="restaurant-card">
            <div className="restaurant-header" onClick={() => toggleRestaurantMenu(restaurant.restaurant_id)}>
              <h3>{restaurant.restaurant_name}</h3>
              <span>{expandedRestaurant === restaurant.restaurant_id ? '▲' : '▼'}</span>
            </div>
            {expandedRestaurant === restaurant.restaurant_id && (
              <div className="menu-items">
                {filteredMenuItems(restaurant.restaurant_id).length > 0 ? (
                  filteredMenuItems(restaurant.restaurant_id).map((item) => (
                    <div key={item.food_id} className="menu-item">
                      <div className="item-info">
                        <h4>{item.food_name}</h4>
                        
                      </div>
                    
                      <div className="item-actions">
                      {/* <div className="price">
                          <p>${parseFloat(item.price).toFixed(2)}</p>
                        </div> */}
                        <div className="quantity-control">
                          <button onClick={() => handleQuantityChange(item.food_id, -1)}><FaMinus /></button>
                          <span>{itemQuantities[item.food_id] || 0}</span>
                          <button onClick={() => handleQuantityChange(item.food_id, 1)}><FaPlus /></button>
                        </div>
                        <button 
                          className="add-button" 
                          onClick={() => handleAddItem(item)}
                          disabled={!itemQuantities[item.food_id]}
                        >
                          Add
                        </button>
                        <button className="details-button" onClick={() => setSelectedItem(item)}>Details</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-results">No menu items match your search criteria.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="item-detail-modal">
          <div className="modal-content">
            <h3>{selectedItem.food_name}</h3>
            <p><strong>Price:</strong> ${parseFloat(selectedItem.price).toFixed(2)}</p>
            <p><strong>Calories:</strong> {selectedItem.calories}</p>
            <p><strong>Allergens:</strong> {selectedItem.allergens_info}</p>
            <p><strong>Serving Size:</strong> {selectedItem.serving_size}</p>
            <h4>Nutrition Information:</h4>
            <div className="nutrition-info">
              <p>Total Fat: {selectedItem.total_fat}</p>
              <p>Saturated Fat: {selectedItem.saturated_fat}</p>
              <p>Trans Fat: {selectedItem.trans_fat}</p>
              <p>Cholesterol: {selectedItem.cholesterol}</p>
              <p>Sodium: {selectedItem.sodium}</p>
              <p>Total Carbohydrates: {selectedItem.total_carbohydrates}</p>
              <p>Dietary Fiber: {selectedItem.dietary_fiber}</p>
              <p>Sugars: {selectedItem.sugars}</p>
              <p>Protein: {selectedItem.protein}</p>
              <p>Vitamin D: {selectedItem.vitamin_d}</p>
              <p>Calcium: {selectedItem.calcium}</p>
              <p>Iron: {selectedItem.iron}</p>
              <p>Potassium: {selectedItem.potassium}</p>
            </div>
            <button onClick={() => setSelectedItem(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};



// const TrackerContent = () => {
//   const [trackedItems, setTrackedItems] = useState([]);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [itemToDelete, setItemToDelete] = useState(null);

//   useEffect(() => {
//     loadTrackedItems();
//   }, []);

//   const loadTrackedItems = () => {
//     const storedItems = JSON.parse(localStorage.getItem('trackedItems') || '[]');
//     setTrackedItems(storedItems);
//   };

//   const groupItemsByDay = () => {
//     const grouped = {};
//     trackedItems.forEach(item => {
//       const date = new Date(item.date).toLocaleDateString();
//       if (!grouped[date]) {
//         grouped[date] = [];
//       }
//       grouped[date].push(item);
//     });
//     return grouped;
//   };

//   const calculateDailyTotals = (items) => {
//     return items.reduce((totals, item) => {
//       totals.money += parseFloat(item.price) || 0;
//       totals.calories += parseInt(item.calories) || 0;
//       totals.protein += parseFloat(item.protein) || 0;
//       return totals;
//     }, { money: 0, calories: 0, protein: 0 });
//   };

//   const groupedItems = groupItemsByDay();
//   const sortedDates = Object.keys(groupedItems).sort((a, b) => new Date(b) - new Date(a));
//   const today = new Date().toLocaleDateString();

//   const todayItems = groupedItems[today] || [];
//   const todayTotals = calculateDailyTotals(todayItems);

//   const showMicronutrients = (item) => {
//     setSelectedItem(item);
//   };

//   const confirmDelete = (item) => {
//     setItemToDelete(item);
//   };

//   const deleteItem = () => {
//     if (itemToDelete) {
//       const updatedItems = trackedItems.filter(item => item !== itemToDelete);
//       localStorage.setItem('trackedItems', JSON.stringify(updatedItems));
//       setTrackedItems(updatedItems);
//       setItemToDelete(null);
//     }
//   };

//   return (
//     <div className="content-section">
//       <h1 className="section-title">Nutrition & Budget Tracker</h1>
//       <p>Log your meals, track nutrition info, and keep an eye on your Hokie Passport balance.</p>

//       <div className="daily-summary">
//         <h3>Today's Totals</h3>
//         <div className="totals-grid">
//           <div className="total-item">
//             <span className="total-label">Total Spent:</span>
//             <span className="total-value">${typeof todayTotals.money === 'number' ? todayTotals.money.toFixed(2) : '0.00'}</span>
//           </div>
//           <div className="total-item">
//             <span className="total-label">Total Calories:</span>
//             <span className="total-value">{typeof todayTotals.calories === 'number' ? todayTotals.calories.toFixed(0) : '0'}</span>
//           </div>
//           <div className="total-item">
//             <span className="total-label">Total Protein:</span>
//             <span className="total-value">{typeof todayTotals.protein === 'number' ? todayTotals.protein.toFixed(1) : '0.0'}g</span>
//           </div>
//         </div>
//       </div>

//       {sortedDates.map(date => {
//         const dailyItems = groupedItems[date];

//         return (
//           <div key={date} className="daily-log">
//             <h2>{date}</h2>
//             <table className="tracked-items-table">
//               <thead>
//                 <tr>
//                   <th>Time</th>
//                   <th>Dining Hall</th>
//                   <th>Item</th>
//                   <th>Quantity</th>
//                   <th>Price</th>
//                   <th>Calories</th>
//                   <th>Protein</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {dailyItems.map((item, index) => (
//                   <tr key={index}>
//                     <td>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
//                     <td>{item.diningHall}</td>
//                     <td>{item.food_name}</td>
//                     <td>{item.quantity}</td>
//                     <td>${parseFloat(item.price).toFixed(2)}</td>
//                     <td>{item.calories}</td>
//                     <td>{parseFloat(item.protein).toFixed(1)}g</td>
//                     <td>
//                       <button onClick={() => showMicronutrients(item)} className="micronutrients-button">
//                         <FaInfoCircle /> Details
//                       </button>
//                       <button onClick={() => confirmDelete(item)} className="delete-button">
//                         <FaTrashAlt />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         );
//       })}

//       {selectedItem && (
//         <div className="micronutrients-modal">
//           <div className="modal-content">
//             <h3>{selectedItem.food_name} - Micronutrients</h3>
//             <p>Quantity: {selectedItem.quantity}</p>
//             <p>Total Fat: {parseFloat(selectedItem.total_fat).toFixed(1)}g</p>
//             <p>Saturated Fat: {parseFloat(selectedItem.saturated_fat).toFixed(1)}g</p>
//             <p>Trans Fat: {parseFloat(selectedItem.trans_fat).toFixed(1)}g</p>
//             <p>Cholesterol: {parseFloat(selectedItem.cholesterol).toFixed(1)}mg</p>
//             <p>Sodium: {parseFloat(selectedItem.sodium).toFixed(1)}mg</p>
//             <p>Total Carbohydrates: {parseFloat(selectedItem.total_carbohydrates).toFixed(1)}g</p>
//             <p>Dietary Fiber: {parseFloat(selectedItem.dietary_fiber).toFixed(1)}g</p>
//             <p>Sugars: {parseFloat(selectedItem.sugars).toFixed(1)}g</p>
//             <p>Vitamin D: {parseFloat(selectedItem.vitamin_d).toFixed(1)}mcg</p>
//             <p>Calcium: {parseFloat(selectedItem.calcium).toFixed(1)}mg</p>
//             <p>Iron: {parseFloat(selectedItem.iron).toFixed(1)}mg</p>
//             <p>Potassium: {parseFloat(selectedItem.potassium).toFixed(1)}mg</p>
//             <button onClick={() => setSelectedItem(null)}>Close</button>
//           </div>
//         </div>
//       )}

//       {itemToDelete && (
//         <div className="delete-confirmation-modal">
//           <div className="modal-content">
//             <h3>Confirm Deletion</h3>
//             <p>Are you sure you want to delete {itemToDelete.food_name}?</p>
//             <button onClick={deleteItem} className="confirm-delete">Yes, Delete</button>
//             <button onClick={() => setItemToDelete(null)} className="cancel-delete">Cancel</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


const TrackerContent = () => {
  const [trackedItems, setTrackedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [weeklySpendingLimit, setWeeklySpendingLimit] = useState(0);
  const [remainingWeeklyBudget, setRemainingWeeklyBudget] = useState(0);
  const [weeklyTotals, setWeeklyTotals] = useState({ money: 0, calories: 0, protein: 0 });

  useEffect(() => {
    loadTrackedItems();
    loadWeeklySpendingLimit();
  }, []);

  useEffect(() => {
    calculateWeeklyTotals();
    calculateRemainingWeeklyBudget();
  }, [trackedItems, weeklySpendingLimit]);

  const loadTrackedItems = () => {
    const storedItems = JSON.parse(localStorage.getItem('trackedItems') || '[]');
    setTrackedItems(storedItems);
  };

  const loadWeeklySpendingLimit = () => {
    const limit = parseFloat(localStorage.getItem('weeklySpendingLimit') || '0');
    setWeeklySpendingLimit(limit);
  };

  const calculateWeeklyTotals = () => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
    startOfWeek.setHours(0, 0, 0, 0);

    const totals = trackedItems.reduce((acc, item) => {
      const itemDate = new Date(item.date);
      if (itemDate >= startOfWeek) {
        acc.money += parseFloat(item.price) || 0;
        acc.calories += parseInt(item.calories) || 0;
        acc.protein += parseFloat(item.protein) || 0;
      }
      return acc;
    }, { money: 0, calories: 0, protein: 0 });

    setWeeklyTotals(totals);
  };

  const calculateRemainingWeeklyBudget = () => {
    setRemainingWeeklyBudget(weeklySpendingLimit - weeklyTotals.money);
  };

  const groupItemsByDay = () => {
    const grouped = {};
    trackedItems.forEach(item => {
      const date = new Date(item.date).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };

  const calculateDailyTotals = (items) => {
    return items.reduce((totals, item) => {
      totals.money += parseFloat(item.price) || 0;
      totals.calories += parseInt(item.calories) || 0;
      totals.protein += parseFloat(item.protein) || 0;
      return totals;
    }, { money: 0, calories: 0, protein: 0 });
  };

  const groupedItems = groupItemsByDay();
  const sortedDates = Object.keys(groupedItems).sort((a, b) => new Date(b) - new Date(a));

  const showMicronutrients = (item) => {
    setSelectedItem(item);
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
  };

  const deleteItem = () => {
    if (itemToDelete) {
      const updatedItems = trackedItems.filter(item => item !== itemToDelete);
      localStorage.setItem('trackedItems', JSON.stringify(updatedItems));
      setTrackedItems(updatedItems);
      setItemToDelete(null);
    }
  };

  return (
    <div className="content-section">
      <h1 className="section-title">Nutrition & Budget Tracker</h1>
      <p>Log your meals, track nutrition info, and keep an eye on your Hokie Spending Limit.</p>

      <div className="weekly-summary">
        <h3>Weekly Totals & Budget</h3>
        <div className="totals-grid">
          <div className="total-item">
            <span className="total-label">Weekly Spent:</span>
            <span className="total-value">${weeklyTotals.money.toFixed(2)}</span>
          </div>
          <div className="total-item">
            <span className="total-label">Weekly Calories:</span>
            <span className="total-value">{weeklyTotals.calories.toFixed(0)}</span>
          </div>
          <div className="total-item">
            <span className="total-label">Weekly Protein:</span>
            <span className="total-value">{weeklyTotals.protein.toFixed(1)}g</span>
          </div>
          <div className="total-item">
            <span className="total-label">Remaining Weekly Budget:</span>
            <span className={`total-value ${remainingWeeklyBudget < 0 ? 'negative-budget' : ''}`}>
              ${remainingWeeklyBudget.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {sortedDates.map(date => {
        const dailyItems = groupedItems[date];
        const dailyTotals = calculateDailyTotals(dailyItems);

        return (
          <div key={date} className="daily-log">
            <h2>{date}</h2>
            <div className="daily-totals">
              <span>Spent: ${dailyTotals.money.toFixed(2)}</span>
              <span>Calories: {dailyTotals.calories.toFixed(0)}</span>
              <span>Protein: {dailyTotals.protein.toFixed(1)}g</span>
            </div>
            <table className="tracked-items-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Dining Hall</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Calories</th>
                  <th>Protein</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dailyItems.map((item, index) => (
                  <tr key={index}>
                    <td>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{item.diningHall}</td>
                    <td>{item.food_name}</td>
                    <td>{item.quantity}</td>
                    <td>${parseFloat(item.price).toFixed(2)}</td>
                    <td>{item.calories}</td>
                    <td>{parseFloat(item.protein).toFixed(1)}g</td>
                    <td>
                      <button onClick={() => showMicronutrients(item)} className="micronutrients-button">
                        <FaInfoCircle /> Details
                      </button>
                      <button onClick={() => confirmDelete(item)} className="delete-button">
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {selectedItem && (
        <div className="micronutrients-modal">
          <div className="modal-content">
            <h3>{selectedItem.food_name} Micronutrients - According to Quantity {selectedItem.quantity} </h3>

      <p><strong>Total Fat:</strong> {parseFloat(selectedItem.total_fat).toFixed(1)}g</p>
      <p><strong>Saturated Fat:</strong> {parseFloat(selectedItem.saturated_fat).toFixed(1)}g</p>
      <p><strong>Trans Fat:</strong> {parseFloat(selectedItem.trans_fat).toFixed(1)}g</p>
      <p><strong>Cholesterol:</strong> {parseFloat(selectedItem.cholesterol).toFixed(1)}mg</p>
      <p><strong>Sodium:</strong> {parseFloat(selectedItem.sodium).toFixed(1)}mg</p>
      <p><strong>Total Carbohydrates:</strong> {parseFloat(selectedItem.total_carbohydrates).toFixed(1)}g</p>
      <p><strong>Dietary Fiber:</strong> {parseFloat(selectedItem.dietary_fiber).toFixed(1)}g</p>
      <p><strong>Sugars:</strong> {parseFloat(selectedItem.sugars).toFixed(1)}g</p>
      <p><strong>Vitamin D:</strong> {parseFloat(selectedItem.vitamin_d).toFixed(1)}mcg</p>
      <p><strong>Calcium:</strong> {parseFloat(selectedItem.calcium).toFixed(1)}mg</p>
      <p><strong>Iron:</strong> {parseFloat(selectedItem.iron).toFixed(1)}mg</p>
      <p><strong>Potassium:</strong> {parseFloat(selectedItem.potassium).toFixed(1)}mg</p>
            <button onClick={() => setSelectedItem(null)}>Close</button>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="delete-confirmation-modal">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete {itemToDelete.food_name}?</p>
            <button onClick={deleteItem} className="confirm-delete">Yes, Delete</button>
            <button onClick={() => setItemToDelete(null)} className="cancel-delete">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};


const InsightsContent = () => {
  const [timeFrame, setTimeFrame] = useState('weekly');
  const [calorieData, setCalorieData] = useState(null);
  const [spendingData, setSpendingData] = useState(null);
  const [nutritionalBalanceData, setNutritionalBalanceData] = useState(null);
  const [micronutrientData, setMicronutrientData] = useState(null);
  const [mealFrequencyData, setMealFrequencyData] = useState(null);
  const [diningHallVisitsData, setDiningHallVisitsData] = useState(null);

  useEffect(() => {
    fetchInsightsData(timeFrame);
  }, [timeFrame]);

  const fetchInsightsData = (period) => {
    setCalorieData(generateDummyCalorieData(period));
    setSpendingData(generateDummySpendingData(period));
    setNutritionalBalanceData(generateDummyNutritionalBalanceData());
    setMicronutrientData(generateDummyMicronutrientData());
    setMealFrequencyData(generateDummyMealFrequencyData(period));
    setDiningHallVisitsData(generateDummyDiningHallVisitsData(period));
  };

  const generateDummyCalorieData = (period) => {
    return {
      labels: period === 'weekly' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Calories Consumed',
          data: period === 'weekly' ? [2200, 1800, 2000, 2100, 2300, 1900, 2500] : [15000, 16000, 14000, 17000],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
  };

  const generateDummySpendingData = (period) => {
    return {
      labels: period === 'weekly' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Money Spent ($)',
          data: period === 'weekly' ? [50, 40, 60, 55, 70, 45, 80] : [300, 320, 280, 350],
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
        },
      ],
    };
  };

  const generateDummyNutritionalBalanceData = () => {
    return {
      labels: ['Carbs', 'Proteins', 'Fats'],
      datasets: [
        {
          label: 'Nutritional Balance',
          data: [55, 30, 15], // Percentage of daily intake
          backgroundColor: ['rgba(255 ,99 ,132)', 'rgba(54 ,162 ,235)', 'rgba(255 ,206 ,86)'],
        },
      ],
    };
};

const generateDummyMicronutrientData = () => {
    return {
      labels: ['Vitamin A', 'Vitamin C', 'Calcium', 'Iron'],
      datasets: [
        {
          label: 'Micronutrients Intake',
          data: [9000 / (1000), 
                 (90 / (100)), 
                 (1000 / (100)), 
                 (18 / (100))], 
          backgroundColor: ['rgba(75 ,192 ,192)', 
                            'rgba(153 ,102 ,255)', 
                            'rgba(255 ,99 ,132)', 
                            'rgba(255 ,206 ,86)'],
        },
      ],
    };
};

const generateDummyMealFrequencyData = (period) => {
    return {
      labels: period === "weekly" ? ["Breakfast", "Lunch", "Dinner"] : ["Week1", "Week2", "Week3", "Week4"],
      datasets: [
        {
          label: "Meals Count",
          data: period === "weekly" ? [7 * Math.random(), 
            Math.floor(Math.random() * (10 -7 +1) +7), 
            Math.floor(Math.random() * (10 -7 +1) +7)] : 
            [Math.floor(Math.random() * (30 -20 +1) +20), 
              Math.floor(Math.random() * (30 -20 +1) +20), 
              Math.floor(Math.random() * (30 -20 +1) +20)],
          backgroundColor: "rgba(75 ,192 ,192 ,0.6)",
        },
      ],
    };
};

const generateDummyDiningHallVisitsData = (period) => {
    return {
      labels: ["Owens", "Turner", "West End", "Squires", "D2"],
      datasets: [
        {
          label: "Visit Frequency",
          data: [Math.floor(Math.random() * (50 -30 +1) +30), 
            Math.floor(Math.random() * (50 -30 +1) +30), 
            Math.floor(Math.random() * (50 -30 +1) +30), 
            Math.floor(Math.random() * (50 -30 +1) +30), 
            Math.floor(Math.random() * (50 -30 +1) +30)],
          backgroundColor: "rgba(153 ,102 ,255 ,0.6)",
        },
      ],
    };
};

  
return (
    <div className="insights-section">
      <h1 className="section-title">Insights</h1>
      <p>See detailed insights on your eating habits and spending trends at VT dining halls.</p>
      
      <div className="time-frame-selector">
        <button onClick={() => setTimeFrame('weekly')}>Weekly</button>
        <button onClick={() => setTimeFrame('monthly')}>Monthly</button>
      </div>

      <div className="insight-card">
        <h2><FaAppleAlt /> Calorie Intake Over Time</h2>
        {calorieData && <Line data={calorieData} />}
      </div>

      <div className="insight-card">
        <h2><FaDollarSign /> Money Spent on Dining</h2>
        {spendingData && <Bar data={spendingData} />}
      </div>

      <div className="insight-card">
        <h2><FaUtensils /> Nutritional Balance</h2>
        {nutritionalBalanceData && <Pie data={nutritionalBalanceData} />}
      </div>

      <div className="insight-card">
        <h2><FaAppleAlt /> Micronutrient Intake</h2>
        {micronutrientData && <Radar data={micronutrientData} />}
      </div>

      <div className="insight-card">
        <h2><FaClock /> Meal Frequency</h2>
        {mealFrequencyData && <Bar data={mealFrequencyData} />}
      </div>

      <div className="insight-card">
        <h2><FaBuilding /> Dining Hall Visit Frequency</h2>
        {diningHallVisitsData && <Bar data={diningHallVisitsData} />}
      </div>
    </div>
);
};


const ProfileContent = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
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
    localStorage.setItem("userDetails", JSON.stringify(userDetails));
    setIsEditing(false);
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
                <label htmlFor="hookieId">Hookie ID:</label>
                <input
                  type="text"
                  id="hookieId"
                  name="hookieId"
                  value={userDetails.hookieId}
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
              <p><strong>Hookie ID:</strong> {userDetails.hookieId}</p>
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