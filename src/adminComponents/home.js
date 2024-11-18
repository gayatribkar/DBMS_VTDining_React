import React, { useState, useEffect , useRef} from 'react';
import { FaHome, FaUtensils, FaChartPie, FaUser, FaPlus, FaEdit, FaTrash, FaSearch, FaBell, FaChartLine ,FaChevronDown, FaChevronRight, FaSignOutAlt, FaFileAlt} from 'react-icons/fa';
import '../adminstyles/home.css'; // Make sure to update this CSS file
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement);

const Home = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [notifications, setNotifications] = useState(3); // Dummy notification count
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/logout/', {
          method: 'POST',
          credentials: 'include', // This is important for sending cookies
        });

        if (response.ok) {
          // Clear local storage or any user-related data
          localStorage.removeItem("userDetails");
          // Redirect to login page
          navigate("/");
        } else {
          console.error("Logout failed");
        }
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <DashboardContent />;
      case 'Dining Halls':
        return <DiningHallsContent />;
      case 'Menus':
        return <MenusContent />;
      case 'Reports':
        return <ReportsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="admin-app">
      <header className="admin-navbar sticky-header">
        <h2>VT Dining Admin</h2>
        {/* <div className="admin-search">
          <FaSearch />
          <input type="text" placeholder="Search..." />
        </div> */}
        {/* <div className="admin-notifications">
          <FaBell />
          <span className="notification-badge">{notifications}</span>
        </div> */}
        <nav>
          <button className={`nav-button ${activeTab === 'Home' ? 'active' : ''}`} onClick={() => setActiveTab('Home')}>
            <FaHome /> Dashboard
          </button>
          <button className={`nav-button ${activeTab === 'Dining Halls' ? 'active' : ''}`} onClick={() => setActiveTab('Dining Halls')}>
            <FaUtensils /> Dining Halls
          </button>
          <button className={`nav-button ${activeTab === 'Menus' ? 'active' : ''}`} onClick={() => setActiveTab('Menus')}>
            <FaChartPie /> Menus
          </button>
          <button className={`nav-button ${activeTab === 'Reports' ? 'active' : ''}`} onClick={() => setActiveTab('Reports')}>
            <FaUser /> Reports
          </button>
          <button className="nav-button logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
        </nav>
      </header>
      <main className="admin-content">{renderContent()}</main>
    </div>
  );
};

const DashboardContent = () => (
  <div className="dashboard-section">
    <h1>Admin Dashboard</h1>
    <div className="quick-stats">
      <div className="stat-card">
        <h3>Total Dining Halls</h3>
        <p>7</p>
      </div>
      <div className="stat-card">
        <h3>Active Menu Items</h3>
        <p>150</p>
      </div>
      <div className="stat-card">
        <h3>Today's Orders</h3>
        <p>1,234</p>
      </div>
      <div className="stat-card">
        <h3>Total Revenue</h3>
        <p>$15,678</p>
      </div>
    </div>
    <div className="chart-container">
      <h2>Weekly Sales Overview</h2>
      <FaChartLine className="placeholder-chart" />
    </div>
  </div>
);

const DiningHallsContent = () => {
  const [diningHalls, setDiningHalls] = useState([
    { id: 1, name: "Owens Food Court", location: "Owens Hall", capacity: 500, openingHours: "7:00 AM - 10:00 PM" },
    { id: 2, name: "Squires Food Court", location: "Squires Student Center", capacity: 300, openingHours: "8:00 AM - 9:00 PM" },
    { id: 3, name: "Turner Place", location: "Lavery Hall", capacity: 400, openingHours: "7:30 AM - 10:30 PM" },
    { id: 4, name: "West End Market", location: "Cochrane Hall", capacity: 350, openingHours: "7:00 AM - 11:00 PM" },
    { id: 5, name: "D2", location: "Dietrick Hall", capacity: 1000, openingHours: "7:00 AM - 10:00 PM" },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDiningHall, setEditingDiningHall] = useState(null);

  const [newDiningHall, setNewDiningHall] = useState({
    name: '',
    location: '',
    capacity: '',
    openingHours: ''
  });

  const handleAddDiningHall = () => {
    setShowAddModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditModal) {
      setEditingDiningHall({ ...editingDiningHall, [name]: value });
    } else {
      setNewDiningHall({ ...newDiningHall, [name]: value });
    }
  };

  const handleSubmitNewHall = (e) => {
    e.preventDefault();
    const newId = Math.max(...diningHalls.map(hall => hall.id)) + 1;
    setDiningHalls([...diningHalls, { ...newDiningHall, id: newId, capacity: parseInt(newDiningHall.capacity) }]);
    setShowAddModal(false);
    setNewDiningHall({
      name: '',
      location: '',
      capacity: '',
      openingHours: ''
    });
  };

  const handleEditDiningHall = (id) => {
    const hallToEdit = diningHalls.find(hall => hall.id === id);
    setEditingDiningHall(hallToEdit);
    setShowEditModal(true);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    setDiningHalls(diningHalls.map(hall => 
      hall.id === editingDiningHall.id ? editingDiningHall : hall
    ));
    setShowEditModal(false);
    setEditingDiningHall(null);
  };

  const handleDeleteDiningHall = (id) => {
    if (window.confirm("Are you sure you want to delete this dining hall?")) {
      setDiningHalls(diningHalls.filter(hall => hall.id !== id));
    }
  };

  return (
    <div className="dining-halls-section">
      <h1>Manage Dining Halls</h1>
      <button className="add-button" onClick={handleAddDiningHall}><FaPlus /> Add New Dining Hall</button>
      <table className="dining-halls-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Capacity</th>
            <th>Opening Hours</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {diningHalls.map(hall => (
            <tr key={hall.id}>
              <td>{hall.name}</td>
              <td>{hall.location}</td>
              <td>{hall.capacity}</td>
              <td>{hall.openingHours}</td>
              <td>
                <button className="action-button edit" onClick={() => handleEditDiningHall(hall.id)}><FaEdit /></button>
                <button className="action-button delete" onClick={() => handleDeleteDiningHall(hall.id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Dining Hall</h2>
            <form onSubmit={handleSubmitNewHall}>
              <input
                type="text"
                name="name"
                value={newDiningHall.name}
                onChange={handleInputChange}
                placeholder="Name"
                required
              />
              <input
                type="text"
                name="location"
                value={newDiningHall.location}
                onChange={handleInputChange}
                placeholder="Location"
                required
              />
              <input
                type="number"
                name="capacity"
                value={newDiningHall.capacity}
                onChange={handleInputChange}
                placeholder="Capacity"
                required
              />
              <input
                type="text"
                name="openingHours"
                value={newDiningHall.openingHours}
                onChange={handleInputChange}
                placeholder="Opening Hours"
                required
              />
              <div className="form-buttons">
                <button type="submit">Add Dining Hall</button>
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Dining Hall</h2>
            <form onSubmit={handleSubmitEdit}>
              <input
                type="text"
                name="name"
                value={editingDiningHall.name}
                onChange={handleInputChange}
                placeholder="Name"
                required
              />
              <input
                type="text"
                name="location"
                value={editingDiningHall.location}
                onChange={handleInputChange}
                placeholder="Location"
                required
              />
              <input
                type="number"
                name="capacity"
                value={editingDiningHall.capacity}
                onChange={handleInputChange}
                placeholder="Capacity"
                required
              />
              <input
                type="text"
                name="openingHours"
                value={editingDiningHall.openingHours}
                onChange={handleInputChange}
                placeholder="Opening Hours"
                required
              />
              <div className="form-buttons">
                <button type="submit">Save Changes</button>
                <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


const MenusContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedHall, setExpandedHall] = useState(null);
  const [expandedRestaurant, setExpandedRestaurant] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    price: '',
    ingredients: '',
    allergens: '',
    calories: '',
    dietaryType: ''
  });
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [currentDiningHall, setCurrentDiningHall] = useState('');
  const [currentRestaurant, setCurrentRestaurant] = useState('');
  const [menuData, setMenuData] = useState({
    "Owens Food Court": {
      "Hokie Grill": [
        { id: 1, name: "Burger", price: "$5.99", ingredients: "Beef patty, lettuce, tomato, cheese, bun", allergens: "Dairy, Gluten", calories: 550, dietaryType: "Non-Vegetarian" },
        { id: 2, name: "Grilled Chicken Sandwich", price: "$6.99", ingredients: "Chicken breast, lettuce, tomato, mayo", allergens: "Gluten", calories: 420, dietaryType: "Non-Vegetarian" },
      ],
      "Dolci": [
        { id: 3, name: "Caesar Salad", price: "$4.99", ingredients: "Romaine lettuce, croutons, parmesan cheese", allergens: "Dairy, Gluten", calories: 320, dietaryType: "Vegetarian" },
      ],
    },
    "Turner Place": {
      "Pizza Palace": [
        { id: 4, name: "Vegetarian Pizza", price: "$7.99", ingredients: "Tomato sauce, mozzarella, bell peppers, onions", allergens: "Dairy, Gluten", calories: 780, dietaryType: "Vegetarian" },
      ],
    },
    "West End Market": {
      "Health Nut": [
        { id: 5, name: "Fruit Smoothie", price: "$3.99", ingredients: "Mixed berries, banana, yogurt", allergens: "Dairy", calories: 250, dietaryType: "Vegetarian" },
      ],
    },
  });

  const filteredMenuData = Object.entries(menuData).filter(([diningHall, restaurants]) =>
    diningHall.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Object.keys(restaurants).some(restaurant => restaurant.toLowerCase().includes(searchTerm.toLowerCase())) ||
    Object.values(restaurants).flat().some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddMenuItem = (diningHall, restaurant) => {
    setCurrentDiningHall(diningHall);
    setCurrentRestaurant(restaurant);
    setShowAddModal(true);
  };

  const handleEditMenuItem = (id, diningHall, restaurant) => {
    const itemToEdit = menuData[diningHall][restaurant].find(item => item.id === id);
    setEditingMenuItem(itemToEdit);
    setCurrentDiningHall(diningHall);
    setCurrentRestaurant(restaurant);
    setShowEditModal(true);
  };

  const handleDeleteMenuItem = (id, diningHall, restaurant) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      const updatedMenuData = { ...menuData };
      updatedMenuData[diningHall][restaurant] = updatedMenuData[diningHall][restaurant].filter(item => item.id !== id);
      setMenuData(updatedMenuData);
    }
  };

  const toggleRestaurant = (diningHall, restaurant) => {
    setExpandedRestaurant(prev => ({
      ...prev,
      [diningHall]: {
        ...prev[diningHall],
        [restaurant]: !prev[diningHall]?.[restaurant]
      }
    }));
  };

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingMenuItem(prev => ({ ...prev, [name]: value }));
    } else {
      setNewMenuItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitNewItem = (e) => {
    e.preventDefault();
    const updatedMenuData = { ...menuData };
    const newId = Math.max(...updatedMenuData[currentDiningHall][currentRestaurant].map(item => item.id)) + 1;
    updatedMenuData[currentDiningHall][currentRestaurant].push({ ...newMenuItem, id: newId });
    setMenuData(updatedMenuData);
    setShowAddModal(false);
    setNewMenuItem({ name: '', price: '', ingredients: '', allergens: '', calories: '', dietaryType: '' });
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    const updatedMenuData = { ...menuData };
    const itemIndex = updatedMenuData[currentDiningHall][currentRestaurant].findIndex(item => item.id === editingMenuItem.id);
    updatedMenuData[currentDiningHall][currentRestaurant][itemIndex] = editingMenuItem;
    setMenuData(updatedMenuData);
    setShowEditModal(false);
    setEditingMenuItem(null);
  };

  return (
    <div className="menus-section">
      <h1>Manage Menu Items</h1>
      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Search menu items, restaurants, or dining halls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="dining-halls-list">
        {filteredMenuData.map(([diningHall, restaurants]) => (
          <div key={diningHall} className="dining-hall-row">
            <div className="dining-hall-header" onClick={() => setExpandedHall(expandedHall === diningHall ? null : diningHall)}>
              <h3>{diningHall}</h3>
              {expandedHall === diningHall ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {expandedHall === diningHall && (
              <div className="restaurants">
                {Object.entries(restaurants).map(([restaurant, items]) => (
                  <div key={restaurant} className="restaurant-menu">
                    <div className="restaurant-header" onClick={() => toggleRestaurant(diningHall, restaurant)}>
                      <h3>{restaurant}</h3>
                      {expandedRestaurant[diningHall]?.[restaurant] ? <FaChevronDown /> : <FaChevronRight />}
                    </div>
                    {expandedRestaurant[diningHall]?.[restaurant] && (
                      <>
                        <button className="add-button" onClick={() => handleAddMenuItem(diningHall, restaurant)}>
                          <FaPlus /> Add New Menu Item
                        </button>
                        <table className="menu-items-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Price</th>
                              <th>Ingredients</th>
                              <th>Allergens</th>
                              <th>Calories</th>
                              <th>Dietary Type</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map(item => (
                              <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.price}</td>
                                <td>{item.ingredients}</td>
                                <td>{item.allergens}</td>
                                <td>{item.calories}</td>
                                <td>{item.dietaryType}</td>
                                <td>
                                  <button className="action-button edit" onClick={() => handleEditMenuItem(item.id, diningHall, restaurant)}>
                                    <FaEdit />
                                  </button>
                                  <button className="action-button delete" onClick={() => handleDeleteMenuItem(item.id, diningHall, restaurant)}>
                                    <FaTrash />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Menu Item</h2>
            <form onSubmit={handleSubmitNewItem}>
              <input type="text" name="name" value={newMenuItem.name} onChange={handleInputChange} placeholder="Name" required />
              <input type="text" name="price" value={newMenuItem.price} onChange={handleInputChange} placeholder="Price" required />
              <textarea name="ingredients" value={newMenuItem.ingredients} onChange={handleInputChange} placeholder="Ingredients" required />
              <input type="text" name="allergens" value={newMenuItem.allergens} onChange={handleInputChange} placeholder="Allergens" />
              <input type="number" name="calories" value={newMenuItem.calories} onChange={handleInputChange} placeholder="Calories" required />
              <input type="text" name="dietaryType" value={newMenuItem.dietaryType} onChange={handleInputChange} placeholder="Dietary Type" required />
              <div className="form-buttons">
                <button type="submit">Add Item</button>
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Menu Item</h2>
            <form onSubmit={handleSubmitEdit}>
              <input type="text" name="name" value={editingMenuItem.name} onChange={(e) => handleInputChange(e, true)} placeholder="Name" required />
              <input type="text" name="price" value={editingMenuItem.price} onChange={(e) => handleInputChange(e, true)} placeholder="Price" required />
              <textarea name="ingredients" value={editingMenuItem.ingredients} onChange={(e) => handleInputChange(e, true)} placeholder="Ingredients" required />
              <input type="text" name="allergens" value={editingMenuItem.allergens} onChange={(e) => handleInputChange(e, true)} placeholder="Allergens" />
              <input type="number" name="calories" value={editingMenuItem.calories} onChange={(e) => handleInputChange(e, true)} placeholder="Calories" required />
              <input type="text" name="dietaryType" value={editingMenuItem.dietaryType} onChange={(e) => handleInputChange(e, true)} placeholder="Dietary Type" required />
              <div className="form-buttons">
                <button type="submit">Save Changes</button>
                <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// const ReportsContent = () => (
//   <div className="reports-section">
//     <h1>Reports and Analytics</h1>
//     <div className="report-options">
//       <button className="report-button">Generate Sales Report</button>
//       <button className="report-button">View Popular Items</button>
//       <button className="report-button">Analyze Nutritional Data</button>
//       <button className="report-button">Customer Feedback Summary</button>
//     </div>
//     <div className="chart-container">
//       <h2>Monthly Revenue Overview</h2>
//       <FaChartLine className="placeholder-chart" />
//     </div>
//   </div>
// );



const ReportsContent = () => {
  const [selectedReport, setSelectedReport] = useState('popularity');
  const [reportData, setReportData] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    generateReport(selectedReport);
  }, [selectedReport]);

  const generateDummyData = (reportType) => {
    switch (reportType) {
      case 'popularity':
        return {
          labels: ['Burger', 'Pizza', 'Salad', 'Smoothie', 'Sandwich'],
          datasets: [
            {
              label: 'Item Popularity',
              data: [500, 450, 300, 200, 350],
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
          ],
        };
      case 'earnings':
        return {
          labels: ['Owens', 'Turner', 'West End', 'Squires', 'D2'],
          datasets: [
            {
              label: 'Daily Earnings ($)',
              data: [5000, 4500, 3800, 3200, 4200],
              backgroundColor: 'rgba(153, 102, 255, 0.6)',
            },
          ],
        };
      case 'sales':
        return {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Weekly Sales',
              data: [3000, 3500, 4000, 3800, 5000, 4500, 3200],
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        };
      default:
        return null;
    }
  };

  const generateReport = (reportType) => {
    const data = generateDummyData(reportType);
    setReportData(data);
  };

  const renderChart = () => {
    if (!reportData) return null;

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: getChartTitle(),
        },
      },
    };

    const ChartComponent = selectedReport === 'sales' ? Line : Bar;

    return (
      <div style={{ height: '300px', width: '100%' }}>
        <ChartComponent
          data={reportData}
          options={options}
        />
      </div>
    );
  };

  const getChartTitle = () => {
    switch (selectedReport) {
      case 'popularity':
        return 'Most Popular Items Across All Dining Halls';
      case 'earnings':
        return 'Daily Earnings by Dining Hall';
      case 'sales':
        return 'Weekly Sales Trend';
      default:
        return '';
    }
  };

  return (
    <div className="reports-section">
      <h1>Reports and Analytics</h1>
      <div className="report-options">
        <button className={`report-button ${selectedReport === 'popularity' ? 'active' : ''}`} onClick={() => setSelectedReport('popularity')}>
          <FaFileAlt /> Item Popularity
        </button>
        <button className={`report-button ${selectedReport === 'earnings' ? 'active' : ''}`} onClick={() => setSelectedReport('earnings')}>
          <FaFileAlt /> Dining Hall Earnings
        </button>
        <button className={`report-button ${selectedReport === 'sales' ? 'active' : ''}`} onClick={() => setSelectedReport('sales')}>
          <FaFileAlt /> Sales Trends
        </button>
      </div>
      <div className="report-summary">
        <h2>{getChartTitle()}</h2>
        {renderChart()}
      </div>
      <div className="additional-stats">
        <h3>Quick Stats</h3>
        <p>Total Daily Earnings: $20,700</p>
        <p>Most Popular Item: Burger (Owens Food Court)</p>
        <p>Highest Earning Dining Hall: Owens Food Court ($5,000)</p>
      </div>
    </div>
  );
};


export default Home;