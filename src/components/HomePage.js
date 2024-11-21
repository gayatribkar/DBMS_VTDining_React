import React, { useState, useEffect } from "react";
import { FaHome, FaUtensils, FaChartPie, FaUser, FaStar, FaSearch, FaArrowLeft, FaSignOutAlt , FaAppleAlt, FaClock, FaDollarSign, FaChartLine, FaBuilding,FaPlus, FaMinus, FaInfoCircle, FaTrashAlt, FaEdit} from "react-icons/fa";
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

        const token = localStorage.getItem("token");

        if (!token) {
          console.error("token not found");
          return;
        }
  
        const response = await fetch('http://127.0.0.1:8000/api/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}` 
          },
        });
  
        if (response.ok) {
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
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [itemToAdd, setItemToAdd] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, [hall.dining_id]);

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/restaurants/?dining_hall=${hall.dining_id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
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
    if (quantity === 0) {
      alert("Please increase the counter to add this item.");
      return;
    }
    setItemToAdd(item);
    setShowNoteModal(true);
  };

  const addItemToTracker = async (withNote) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/food-diary-entries/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          food_item_id: itemToAdd.food_id,
          quantity: itemQuantities[itemToAdd.food_id],
          notes: withNote ? noteText : ''
        })
      });

      if (!response.ok) throw new Error('Failed to add item to tracker');

      setShowAddedMessage(true);
      setTimeout(() => setShowAddedMessage(false), 3000);
      setItemQuantities(prev => ({ ...prev, [itemToAdd.food_id]: 0 }));
      setShowNoteModal(false);
      setNoteText('');
      setItemToAdd(null);
    } catch (error) {
      console.error('Error adding item to tracker:', error);
    }
  };

  const toggleRestaurantMenu = (restaurantId) => {
    setExpandedRestaurant(prev => prev === restaurantId ? null : restaurantId);
    fetchMenuItems(restaurantId);
  };

  const handleQuantityChange = (itemId, change) => {
    setItemQuantities(prev => ({ ...prev, [itemId]: Math.max(0, (prev[itemId] || 0) + change) }));
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
          placeholder="Search restaurants or menu items..."
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
      {showNoteModal && (
        <div className="note-modal">
          <div className="modal-content">
            <h3>Add a note?</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your note here (optional)"
            />
            <div className="modal-buttons">
              <button onClick={() => addItemToTracker(true)}>Add with Note</button>
              <button onClick={() => addItemToTracker(false)}>Add without Note</button>
              <button onClick={() => setShowNoteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TrackerContent = () => {
  const [trackedItems, setTrackedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [weeklySpendingLimit, setWeeklySpendingLimit] = useState(0);
  // const [weeklySpendingLimit] = useState(50); // Assuming $50 as initial spending limit
  const [remainingWeeklyBudget, setRemainingWeeklyBudget] = useState(0);
  const [weeklyTotals, setWeeklyTotals] = useState({ money: 0, calories: 0, protein: 0 });
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);

  useEffect(() => {
    fetchStudentProfile();
    fetchTrackedItems();
  }, []);

  useEffect(() => {
    calculateWeeklyTotals();
    calculateRemainingWeeklyBudget();
  }, [trackedItems, weeklySpendingLimit]);



  const fetchStudentProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/student/profile/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch student profile');
      const data = await response.json();
      setWeeklySpendingLimit(parseFloat(data.spending_limit_weekly));
    } catch (error) {
      console.error('Error fetching student profile:', error);
    }
  };


  const fetchTrackedItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/food-diary-entries/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch tracked items');
      const data = await response.json();
      const itemsWithDiningHallNames = await Promise.all(data.map(async (item) => {
        const diningHallName = await fetchDiningHallName(item.food_item_details.dining_hall);
        return { ...item, diningHallName };
      }));
      setTrackedItems(itemsWithDiningHallNames);
    } catch (error) {
      console.error('Error fetching tracked items:', error);
    }
  };

  const fetchDiningHallName = async (diningHallId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/dining-halls/${diningHallId}/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch dining hall');
      const data = await response.json();
      return data.dining_hall_name;
    } catch (error) {
      console.error('Error fetching dining hall name:', error);
      return 'Unknown Dining Hall';
    }
  };

  const calculateWeeklyTotals = () => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
    startOfWeek.setHours(0, 0, 0, 0);

    const totals = trackedItems.reduce((acc, item) => {
      const itemDate = new Date(item.logged_at);
      if (itemDate >= startOfWeek) {
        acc.money += parseFloat(item.food_item_details.price) * item.quantity || 0;
        acc.calories += parseInt(item.food_item_details.calories) * item.quantity || 0;
        acc.protein += parseFloat(item.food_item_details.protein) * item.quantity || 0;
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
      const date = new Date(item.logged_at).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };

  const calculateDailyTotals = (items) => {
    return items.reduce((totals, item) => {
      totals.money += parseFloat(item.food_item_details.price) * item.quantity || 0;
      totals.calories += parseInt(item.food_item_details.calories) * item.quantity || 0;
      totals.protein += parseFloat(item.food_item_details.protein) * item.quantity || 0;
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
  };const deleteItem = async () => {
    if (itemToDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/food-diary-entries/${itemToDelete.id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to delete item');
        await fetchTrackedItems(); 
        setItemToDelete(null);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };
  
  const showNotes = (item) => {
    setCurrentNote(item.notes || '');
    setEditingItemId(item.id);
    setShowNoteModal(true);
  };
  
  const updateNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/food-diary-entries/${editingItemId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ notes: currentNote })
      });
      if (!response.ok) throw new Error('Failed to update notes');
      await fetchTrackedItems(); 
      setShowNoteModal(false);
      setEditingItemId(null);
    } catch (error) {
      console.error('Error updating notes:', error);
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
                {dailyItems.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{item.diningHallName}</td>
                    <td>{item.food_item_details.food_name}</td>
                    <td>{item.quantity}</td>
                    <td>${(parseFloat(item.food_item_details.price) * item.quantity).toFixed(2)}</td>
                    <td>{parseInt(item.food_item_details.calories) * item.quantity}</td>
                    <td>{(parseFloat(item.food_item_details.protein) * item.quantity).toFixed(1)}g</td>
                    <td>
                      <button onClick={() => showMicronutrients(item)} className="micronutrients-button">
                        <FaInfoCircle /> Details
                      </button>
                      <button onClick={() => showNotes(item)} className="notes-button">
                        <FaEdit /> Notes
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
            <h3>{selectedItem.food_item_details.food_name} Micronutrients - According to Quantity {selectedItem.quantity}</h3>
            <p><strong>Total Fat:</strong> {(parseFloat(selectedItem.food_item_details.total_fat) * selectedItem.quantity).toFixed(1)}g</p>
            <p><strong>Saturated Fat:</strong> {(parseFloat(selectedItem.food_item_details.saturated_fat) * selectedItem.quantity).toFixed(1)}g</p>
            <p><strong>Trans Fat:</strong> {(parseFloat(selectedItem.food_item_details.trans_fat) * selectedItem.quantity).toFixed(1)}g</p>
            <p><strong>Cholesterol:</strong> {(parseFloat(selectedItem.food_item_details.cholesterol) * selectedItem.quantity).toFixed(1)}mg</p>
            <p><strong>Sodium:</strong> {(parseFloat(selectedItem.food_item_details.sodium) * selectedItem.quantity).toFixed(1)}mg</p>
            <p><strong>Total Carbohydrates:</strong> {(parseFloat(selectedItem.food_item_details.total_carbohydrates) * selectedItem.quantity).toFixed(1)}g</p>
            <p><strong>Dietary Fiber:</strong> {(parseFloat(selectedItem.food_item_details.dietary_fiber) * selectedItem.quantity).toFixed(1)}g</p>
            <p><strong>Sugars:</strong> {(parseFloat(selectedItem.food_item_details.sugars) * selectedItem.quantity).toFixed(1)}g</p>
            <p><strong>Vitamin D:</strong> {(parseFloat(selectedItem.food_item_details.vitamin_d) * selectedItem.quantity).toFixed(1)}mcg</p>
            <p><strong>Calcium:</strong> {(parseFloat(selectedItem.food_item_details.calcium) * selectedItem.quantity).toFixed(1)}mg</p>
            <p><strong>Iron:</strong> {(parseFloat(selectedItem.food_item_details.iron) * selectedItem.quantity).toFixed(1)}mg</p>
            <p><strong>Potassium:</strong> {(parseFloat(selectedItem.food_item_details.potassium) * selectedItem.quantity).toFixed(1)}mg</p>
            <button onClick={() => setSelectedItem(null)}>Close</button>
          </div>
        </div>
      )}
      {itemToDelete && (
        <div className="delete-confirmation-modal">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete {itemToDelete.food_item_details.food_name}?</p>
            <button onClick={deleteItem} className="confirm-delete">Yes, Delete</button>
            <button onClick={() => setItemToDelete(null)} className="cancel-delete">Cancel</button>
          </div>
        </div>
      )}
      {showNoteModal && (
        <div className="note-modal">
          <div className="modal-content">
            <h3>Notes</h3>
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Enter your notes here"
            />
            <div className="modal-buttons">
              <button onClick={updateNotes}>Save Notes</button>
              <button onClick={() => setShowNoteModal(false)}>Cancel</button>
            </div>
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
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/student/profile/', {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleChange = (e) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/student/profile/', {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to update user details');
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user details:', error);
    }
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
                <label htmlFor="name">Full Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userDetails.name}
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
                <label htmlFor="phone_no">Phone:</label>
                <input
                  type="tel"
                  id="phone_no"
                  name="phone_no"
                  value={userDetails.phone_no}
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
                <label htmlFor="spending_limit_weekly">Weekly Spending Limit:</label>
                <input
                  type="number"
                  id="spending_limit_weekly"
                  name="spending_limit_weekly"
                  value={userDetails.spending_limit_weekly}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="allergens_info">Allergens:</label>
                <input
                  type="text"
                  id="allergens_info"
                  name="allergens_info"
                  value={userDetails.allergens_info}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="dietary_preference">Dietary Preference:</label>
                <select
                  id="dietary_preference"
                  name="dietary_preference"
                  value={userDetails.dietary_preference}
                  onChange={handleChange}
                >
                  <option value="">Select preference</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>
              <button onClick={handleSave} className="btn-save">Save</button>
            </>
          ) : (
            <>
              <p><strong>Full Name:</strong> {userDetails.name}</p>
              <p><strong>Email:</strong> {userDetails.email}</p>
              <p><strong>Phone:</strong> {userDetails.phone_no}</p>
              <p><strong>Date of Birth:</strong> {new Date(userDetails.dob).toLocaleDateString()}</p>
              <p><strong>Weekly Spending Limit:</strong> ${userDetails.spending_limit_weekly}</p>
              <p><strong>Allergens:</strong> {userDetails.allergens_info || "None"}</p>
              <p><strong>Dietary Preference:</strong> {userDetails.dietary_preference || "Not specified"}</p>
              <button onClick={() => setIsEditing(true)} className="btn-edit">Edit</button>
            </>
          )}
        </div>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
};


export default HomePage;