import React, { useState, useEffect , useRef} from 'react';
import { FaHome, FaUtensils, FaChartPie, FaUser, FaPlus, FaEdit, FaTrash, FaSearch, FaBell, FaChartLine ,FaChevronDown, FaChevronRight, FaSignOutAlt, FaFileAlt} from 'react-icons/fa';
import '../adminstyles/home.css'; 
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement);

const Home = () => {
  const [activeTab, setActiveTab] = useState('Home');
  // const [notifications, setNotifications] = useState(3);
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
      case 'Home':
        return <DashboardContent />;
      case 'Dining Halls':
        return <DiningHallsContent />;
      case 'Restaurants':
        return <RestaurantContent />;
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
        <nav>
          <button className={`nav-button ${activeTab === 'Home' ? 'active' : ''}`} onClick={() => setActiveTab('Home')}>
            <FaHome /> Dashboard
          </button>
          <button className={`nav-button ${activeTab === 'Dining Halls' ? 'active' : ''}`} onClick={() => setActiveTab('Dining Halls')}>
            <FaUtensils /> Dining Halls
          </button>
          <button className={`nav-button ${activeTab === 'Restaurants' ? 'active' : ''}`} onClick={() => setActiveTab('Restaurants')}>
            <FaUtensils /> Restaurants
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

const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState({
    total_dining_halls: 0,
    active_menu_items: 0,
    active_restaurant_items: 0,
    todays_orders: 0,
    total_revenue: 0,
    weekly_sales: [],
    all_sales: []
  });

  const [chartView, setChartView] = useState('weekly');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:8000/api/dashboard/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();

        // Transform sales data
        const transformSales = (sales) => sales.map(([date, revenue]) => ({ date, revenue }));

        setDashboardData({
          ...data,
          weekly_sales: transformSales(data.weekly_sales),
          all_sales: transformSales(data.all_sales)
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const getChartData = () => {
    const salesData = chartView === 'weekly' ? dashboardData.weekly_sales : dashboardData.all_sales;
    return {
      labels: salesData.map(day => day.date),
      datasets: [{
        label: 'Daily Revenue',
        data: salesData.map(day => day.revenue),
        backgroundColor: '#4caf50',
        borderRadius: 5,
        borderColor: 'rgba(0,0,0,0.1)',
        hoverBackgroundColor: '#45a049',
        barThickness: 30
      }]
    };
  };

  return (
    <div className="dashboard-section">
      <h1>Admin Dashboard</h1>
      <div className="quick-stats">
        <div className="stat-card">
          <h3>Total Dining Halls</h3>
          <p>{dashboardData.total_dining_halls}</p>
        </div>
        <div className="stat-card">
          <h3>Active Menu Items</h3>
          <p>{dashboardData.active_menu_items}</p>
        </div>
        <div className="stat-card">
          <h3>Active Restaurants</h3>
          <p>{dashboardData.active_restaurant_items}</p>
        </div>
        <div className="stat-card">
          <h3>Today's Orders</h3>
          <p>{dashboardData.todays_orders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>${dashboardData.total_revenue.toFixed(2)}</p>
        </div>
      </div>
      <div className="chart-container">
        <h2>Sales Overview</h2>
        <div className="chart-controls">
          <button 
            onClick={() => setChartView('weekly')}
            className={chartView === 'weekly' ? 'active' : ''}
          >
            Weekly
          </button>
          <button 
            onClick={() => setChartView('monthly')}
            className={chartView === 'monthly' ? 'active' : ''}
          >
            Monthly
          </button>
        </div>
        <div className="chart">
          <Bar data={getChartData()} options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `${chartView.charAt(0).toUpperCase() + chartView.slice(1)} Sales Revenue`
              },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    return `$${tooltipItem.raw.toFixed(2)}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return `$${value.toFixed(2)}`;
                  }
                }
              }
            }
          }} />
        </div>
      </div>
    </div>
  );
};


const DiningHallsContent = () => {
  const [diningHalls, setDiningHalls] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDiningHall, setEditingDiningHall] = useState(null);

  const [newDiningHall, setNewDiningHall] = useState({
    dining_hall_name: '',
    dining_hall_location: '',
    dining_hall_url: '', 
    dining_hall_hours: '', // Default value
  });

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token not found");
  }

  useEffect(() => {
    fetchDiningHalls();
  }, []);

  const fetchDiningHalls = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/dining-halls/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      const data = await response.json();
      setDiningHalls(data);
    } catch (error) {
      console.error('Error fetching dining halls:', error);
    }
  };

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

  const handleSubmitNewHall = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/dining-halls/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          dining_hall_name: newDiningHall.dining_hall_name,
          dining_hall_location: newDiningHall.dining_hall_location,
          dining_hall_url: newDiningHall.dining_hall_url || undefined,
          dining_hall_hours: newDiningHall.dining_hall_hours
        }),
      });
      if (response.ok) {
        fetchDiningHalls();
        setShowAddModal(false);
        setNewDiningHall({
          dining_hall_name: '',
          dining_hall_location: '',
          dining_hall_url: '',
          dining_hall_hours: '',
        });
      } else {
        console.error('Error adding dining hall:', await response.text());
      }
    } catch (error) {
      console.error('Error adding dining hall:', error);
    }
  };

  const handleEditDiningHall = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/dining-halls/${editingDiningHall.dining_id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(editingDiningHall),
        }
      );
      if (response.ok) {
        fetchDiningHalls();
        setShowEditModal(false);
        setEditingDiningHall(null);
      } else {
        console.error('Error editing dining hall:', await response.text());
      }
    } catch (error) {
      console.error('Error editing dining hall:', error);
    }
  };

  const handleDeleteDiningHall = async (id) => {
    if (window.confirm('Are you sure you want to delete this dining hall?')) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/dining-halls/${id}/`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        if (response.ok) {
          fetchDiningHalls();
        } else {
          console.error('Error deleting dining hall:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting dining hall:', error);
      }
    }
  };

  return (
    <div className="dining-halls-section">
      <h1>Manage Dining Halls</h1>
      <button className="add-button" onClick={handleAddDiningHall}>
        <FaPlus /> Add New Dining Hall
      </button>
      <table className="dining-halls-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            {/* <th>URL</th> */}
            <th>Opening Hours</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {diningHalls.map((hall) => (
            <tr key={hall.dining_id}>
              <td>{hall.dining_hall_name}</td>
              <td>{hall.dining_hall_location}</td>
              {/* <td>{hall.dining_hall_url || 'N/A'}</td> */}
              <td>{hall.dining_hall_hours || '7AM - 12PM'}</td>
              <td>
                <button
                  className="action-button edit"
                  onClick={() => {
                    setEditingDiningHall(hall);
                    setShowEditModal(true);
                  }}
                >
                  <FaEdit />
                </button>
                <button
                  className="action-button delete"
                  onClick={() => handleDeleteDiningHall(hall.dining_id)}
                >
                  <FaTrash />
                </button>
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
                name="dining_hall_name"
                value={newDiningHall.dining_hall_name}
                onChange={handleInputChange}
                placeholder="Name"
                required
              />
              <input
                type="text"
                name="dining_hall_location"
                value={newDiningHall.dining_hall_location}
                onChange={handleInputChange}
                placeholder="Location"
                required
              />
              {/* <input
                type="text"
                name="dining_hall_url"
                value={newDiningHall.dining_hall_url}
                onChange={handleInputChange}
                placeholder="Dining Hall URL (Optional)"
              /> */}
              <input
                type="text"
                name="dining_hall_hours"
                value={newDiningHall.dining_hall_hours}
                onChange={handleInputChange}
                placeholder="Opening Hours"
              />
              <div className="form-buttons">
                <button type="submit">Add Dining Hall</button>
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Dining Hall</h2>
            <form onSubmit={handleEditDiningHall}>
              <input
                type="text"
                name="dining_hall_name"
                value={editingDiningHall.dining_hall_name}
                onChange={handleInputChange}
                placeholder="Name"
                required
              />
              <input
                type="text"
                name="dining_hall_location"
                value={editingDiningHall.dining_hall_location}
                onChange={handleInputChange}
                placeholder="Location"
                required
              />
              {/* <input
                type="text"
                name="dining_hall_url"
                value={editingDiningHall.dining_hall_url || ''}
                onChange={handleInputChange}
                placeholder="Dining Hall URL (Optional)"
              /> */}
              <input
                type="text"
                name="dining_hall_hours"
                value={editingDiningHall.dining_hall_hours}
                onChange={handleInputChange}
                placeholder="Opening Hours"
              />
              <div className="form-buttons">
                <button type="submit">Update Dining Hall</button>
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const RestaurantContent = () => {
  const [diningHalls, setDiningHalls] = useState([]);
  const [expandedHall, setExpandedHall] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    restaurant_name: '',
    restaurant_location: '',
    dining_hall: ''
  });
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDiningHalls();
  }, []);

  const fetchDiningHalls = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/dining-halls/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      const data = await response.json();
      setDiningHalls(data);
    } catch (error) {
      console.error('Error fetching dining halls:', error);
    }
  };

  const fetchRestaurants = async (diningHallId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/restaurants/?dining_hall=${diningHallId}&search=${searchTerm}`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const data = await response.json();
      setDiningHalls(prevHalls => prevHalls.map(hall => 
        hall.dining_id === diningHallId ? { ...hall, restaurants: data } : hall
      ));
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  useEffect(() => {
    if (expandedHall) {
      fetchRestaurants(expandedHall);
    }
  }, [searchTerm]);

  // const fetchRestaurants = async (diningHallId) => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     const response = await fetch(`http://localhost:8000/api/restaurants/?dining_hall=${diningHallId}`, {
  //       headers: { 'Authorization': `Token ${token}` }
  //     });
  //     const data = await response.json();
  //     setDiningHalls(prevHalls => 
  //       prevHalls.map(hall => 
  //         hall.dining_id === diningHallId ? { ...hall, restaurants: data } : hall
  //       )
  //     );
  //   } catch (error) {
  //     console.error('Error fetching restaurants:', error);
  //   }
  // };

  const handleAddRestaurant = (diningHallId) => {
    setNewRestaurant({ ...newRestaurant, dining_hall: diningHallId });
    setShowAddModal(true);
  };

  const handleEditRestaurant = (restaurant) => {
    setEditingRestaurant(restaurant);
    setShowEditModal(true);
  };

  const handleDeleteRestaurant = (restaurant) => {
    setDeletingRestaurant(restaurant);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditModal) {
      setEditingRestaurant({ ...editingRestaurant, [name]: value });
    } else {
      setNewRestaurant({ ...newRestaurant, [name]: value });
    }
  };

  const handleSubmitNewRestaurant = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/restaurants/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(newRestaurant)
      });
      if (response.ok) {
        fetchDiningHalls();
        setShowAddModal(false);
        setNewRestaurant({ restaurant_name: '', restaurant_location: '', dining_hall: '' });
      } else {
        console.error('Error adding restaurant:', await response.text());
      }
    } catch (error) {
      console.error('Error adding restaurant:', error);
    }
  };

  const handleSubmitEditRestaurant = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/restaurants/${editingRestaurant.restaurant_id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(editingRestaurant)
      });
      if (response.ok) {
        fetchDiningHalls();
        setShowEditModal(false);
        setEditingRestaurant(null);
      } else {
        console.error('Error editing restaurant:', await response.text());
      }
    } catch (error) {
      console.error('Error editing restaurant:', error);
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/restaurants/${deletingRestaurant.restaurant_id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        fetchDiningHalls();
        setShowDeleteModal(false);
        setDeletingRestaurant(null);
      } else {
        console.error('Error deleting restaurant:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error);
    }
  };

  return (
    <div className="restaurant-content">
      <h1 className="restaurant-content__title">Manage Restaurants</h1>
      <div className="restaurant-content__search">
        <FaSearch className="restaurant-content__search-icon" />
        <input
  type="text"
  placeholder="Search restaurants..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="restaurant-content__search-input"
/>
      </div>
      <div className="restaurant-content__dining-halls">
        {diningHalls.map((diningHall) => (
          <div key={diningHall.dining_id} className="restaurant-content__dining-hall">
            <div className="restaurant-content__dining-hall-header" onClick={() => {
              setExpandedHall(expandedHall === diningHall.dining_id ? null : diningHall.dining_id);
              if (!diningHall.restaurants) {
                fetchRestaurants(diningHall.dining_id);
              }
            }}>
              <h3>{diningHall.dining_hall_name}</h3>
              {expandedHall === diningHall.dining_id ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {expandedHall === diningHall.dining_id && (
              <div className="restaurant-content__restaurants">
                <button className="restaurant-content__add-button" onClick={() => handleAddRestaurant(diningHall.dining_id)}>
                  <FaPlus /> Add New Restaurant
                </button>
                <table className="restaurant-content__table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      {/* <th>Location</th> */}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diningHall.restaurants && diningHall.restaurants.map((restaurant) => (
                      <tr key={restaurant.restaurant_id}>
                        <td>{restaurant.restaurant_name}</td>
                        {/* <td>{restaurant.restaurant_location}</td> */}
                        <td>
                          <button className="restaurant-content__action-button restaurant-content__action-button--edit" onClick={() => handleEditRestaurant(restaurant)}>
                            <FaEdit />
                          </button>
                          <button className="restaurant-content__action-button restaurant-content__action-button--delete" onClick={() => handleDeleteRestaurant(restaurant)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Restaurant</h2>
            <form onSubmit={handleSubmitNewRestaurant}>
              <input
                type="text"
                name="restaurant_name"
                value={newRestaurant.restaurant_name}
                onChange={handleInputChange}
                placeholder="Restaurant Name"
                required
              />
              <input
                type="text"
                name="restaurant_location"
                value={newRestaurant.restaurant_location}
                onChange={handleInputChange}
                placeholder="Restaurant Location"
                required
              />
              <div className="restaurant-content__form-buttons">
                <button type="submit">Add Restaurant</button>
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Restaurant</h2>
            <form onSubmit={handleSubmitEditRestaurant}>
              <input
                type="text"
                name="restaurant_name"
                value={editingRestaurant.restaurant_name}
                onChange={handleInputChange}
                placeholder="Restaurant Name"
                required
              />
              <input
                type="text"
                name="restaurant_location"
                value={editingRestaurant.restaurant_location}
                onChange={handleInputChange}
                placeholder="Restaurant Location"
                required
              />
              <div className="restaurant-content__form-buttons">
                <button type="submit">Update Restaurant</button>
                <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="restaurant-content__modal">
          <div className="restaurant-content__modal-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete {deletingRestaurant.restaurant_name}?</p>
            <div className="restaurant-content__form-buttons">
              <button onClick={confirmDelete} className="restaurant-content__delete-button">Delete</button>
              <button onClick={() => setShowDeleteModal(false)} className="restaurant-content__cancel-button">Cancel</button>
            </div>
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
    food_name: '',
    price: '',
    allergens_info: '',
    calories: '',
    serving_size: '',
    total_fat: '',
    saturated_fat: '',
    trans_fat: '',
    cholesterol: '',
    sodium: '',
    total_carbohydrates: '',
    dietary_fiber: '',
    sugars: '',
    protein: '',
    vitamin_d: '',
    calcium: '',
    iron: '',
    potassium: ''
  });
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [currentDiningHallId, setCurrentDiningHallId] = useState('');
  const [currentRestaurantId, setCurrentRestaurantId] = useState('');
  const [diningHalls, setDiningHalls] = useState([]);
  const [restaurants, setRestaurants] = useState({});
  const [menuItems, setMenuItems] = useState({});

  useEffect(() => {
    fetchDiningHalls();
  }, []);

  const fetchDiningHalls = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/dining-halls/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      const data = await response.json();
      setDiningHalls(data);
    } catch (error) {
      console.error('Error fetching dining halls:', error);
    }
  };

  const fetchRestaurants = async (diningHallId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/restaurants/?dining_hall=${diningHallId}`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const data = await response.json();
      setRestaurants(prev => ({ ...prev, [diningHallId]: data }));
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const fetchMenuItems = async (restaurantId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/food_items/?restaurant=${restaurantId}`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const data = await response.json();
      setMenuItems(prev => ({ ...prev, [restaurantId]: data }));
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleAddMenuItem = (diningHallId, restaurantId) => {
    setCurrentDiningHallId(diningHallId);
    setCurrentRestaurantId(restaurantId);
    setShowAddModal(true);
  };

  const handleEditMenuItem = (item, diningHallId, restaurantId) => {
    setEditingMenuItem(item);
    setCurrentDiningHallId(diningHallId);
    setCurrentRestaurantId(restaurantId);
    setShowEditModal(true);
  };

  const handleDeleteMenuItem = async (itemId, restaurantId) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:8000/api/food_items/${itemId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        if (response.ok) {
          const updatedMenuItems = menuItems[restaurantId].filter(item => item.food_id !== itemId);
          setMenuItems(prev => ({ ...prev, [restaurantId]: updatedMenuItems }));
        } else {
          throw new Error('Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  const toggleRestaurant = (diningHallId, restaurant) => {
    setExpandedRestaurant(prev => ({
      ...prev,
      [diningHallId]: { ...prev[diningHallId], [restaurant.restaurant_id]: !prev[diningHallId]?.[restaurant.restaurant_id] }
    }));
    
    if (!menuItems[restaurant.restaurant_id]) {
      fetchMenuItems(restaurant.restaurant_id);
    }
  };

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingMenuItem(prev => ({ ...prev, [name]: value }));
    } else {
      setNewMenuItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitNewItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/food_items/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          ...newMenuItem,
          restaurant: currentRestaurantId,
          dining_hall: currentDiningHallId
        })
      });
      if (response.ok) {
        const newItem = await response.json();
        setMenuItems(prev => ({
          ...prev,
          [currentRestaurantId]: [...(prev[currentRestaurantId] || []), newItem]
        }));
        setShowAddModal(false);
        setNewMenuItem({
          food_name: '', price: '', allergens_info: '', calories: '',
          serving_size: '', total_fat: '', saturated_fat: '', trans_fat: '',
          cholesterol: '', sodium: '', total_carbohydrates: '', dietary_fiber: '',
          sugars: '', protein: '', vitamin_d: '', calcium: '', iron: '', potassium: ''
        });
      } else {
        throw new Error('Failed to add item');
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/food_items/${editingMenuItem.food_id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(editingMenuItem)
      });
      if (response.ok) {
        const updatedItem = await response.json();
        setMenuItems(prev => ({
          ...prev,
          [currentRestaurantId]: prev[currentRestaurantId].map(item =>
            item.food_id === updatedItem.food_id ? updatedItem : item
          )
        }));
        setShowEditModal(false);
        setEditingMenuItem(null);
      } else {
        throw new Error('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  return (
    <div className="menus-section">
      <h1>Manage Menu Items</h1>
      {/* <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div> */}
      <div className="dining-halls-list">
        {diningHalls.map((diningHall) => (
          <div key={diningHall.dining_id} className="dining-hall-row">
            <div className="dining-hall-header" onClick={() => {
              setExpandedHall(expandedHall === diningHall.dining_id ? null : diningHall.dining_id);
              if (!restaurants[diningHall.dining_id]) {
                fetchRestaurants(diningHall.dining_id);
              }
            }}>
              <h3>{diningHall.dining_hall_name}</h3>
              {expandedHall === diningHall.dining_id ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {expandedHall === diningHall.dining_id && restaurants[diningHall.dining_id] && (
              <div className="restaurants">
                {restaurants[diningHall.dining_id].map((restaurant) => (
                  <div key={restaurant.restaurant_id} className="restaurant-menu">
                    <div className="restaurant-header" onClick={() => toggleRestaurant(diningHall.dining_id, restaurant)}>
                      <h3>{restaurant.restaurant_name}</h3>
                      {expandedRestaurant[diningHall.dining_id]?.[restaurant.restaurant_id] ? <FaChevronDown /> : <FaChevronRight />}
                    </div>
                    {expandedRestaurant[diningHall.dining_id]?.[restaurant.restaurant_id] && (
                      <>
                        <button className="add-button" onClick={() => handleAddMenuItem(diningHall.dining_id, restaurant.restaurant_id)}>
                          <FaPlus /> Add New Menu Item
                        </button>
                        <table className="menu-items-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Price</th>
                              <th>Allergens</th>
                              <th>Calories</th>
                              <th>Micronutrients</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {menuItems[restaurant.restaurant_id]?.map(item => (
                              <tr key={item.food_id}>
                                <td>{item.food_name}</td>
                                <td>${parseFloat(item.price).toFixed(2)}</td>
                                <td>{item.allergens_info}</td>
                                <td>{item.calories}</td>
                                <td>
                                  total_fat:{item.total_fat}, saturated_fat: {item.saturated_fat}, trans_fat: {item.trans_fat},
                                  cholesterol: {item.cholesterol}, sodium: {item.sodium}, total_carbohydrates: {item.total_carbohydrates}, dietary_fiber: {item.dietary_fiber},
                                  sugars: {item.sugars}, protein: {item.protein}, vitamin_d: {item.vitamin_d}, calcium: {item.calcium}, iron: {item.iron}, potassium: {item.potassium}
                                </td>
                                <td>
                                  <button className="action-button edit" onClick={() => handleEditMenuItem(item, diningHall.dining_id, restaurant.restaurant_id)}>
                                    <FaEdit />
                                  </button>
                                  <button className="action-button delete" onClick={() => handleDeleteMenuItem(item.food_id, restaurant.restaurant_id)}>
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
            <input type="text" name="food_name" value={newMenuItem.food_name} onChange={handleInputChange} placeholder="Food Name" required />
            <input type="text" name="price" value={newMenuItem.price} onChange={handleInputChange} placeholder="Price" required />
            <input type="text" name="allergens_info" value={newMenuItem.allergens_info} onChange={handleInputChange} placeholder="Allergens Info" />
            <input type="number" name="calories" value={newMenuItem.calories} onChange={handleInputChange} placeholder="Calories" required />
            <input type="text" name="serving_size" value={newMenuItem.serving_size} onChange={handleInputChange} placeholder="Serving Size" required />
    
            <div className="micronutrients-row">
              <input type="text" name="total_fat" value={newMenuItem.total_fat} onChange={handleInputChange} placeholder="Total Fat (g)" required />
              <input type="text" name="saturated_fat" value={newMenuItem.saturated_fat} onChange={handleInputChange} placeholder="Saturated Fat (g)" required />
            </div>
            <div className="micronutrients-row">
              <input type="text" name="trans_fat" value={newMenuItem.trans_fat} onChange={handleInputChange} placeholder="Trans Fat (g)" required />
              <input type="text" name="cholesterol" value={newMenuItem.cholesterol} onChange={handleInputChange} placeholder="Cholesterol (mg)" required />
            </div>
            <div className="micronutrients-row">
              <input type="text" name="sodium" value={newMenuItem.sodium} onChange={handleInputChange} placeholder="Sodium (mg)" required />
              <input type="text" name="total_carbohydrates" value={newMenuItem.total_carbohydrates} onChange={handleInputChange} placeholder="Total Carbohydrates (g)" required />
            </div>
            <div className="micronutrients-row">
              <input type="text" name="dietary_fiber" value={newMenuItem.dietary_fiber} onChange={handleInputChange} placeholder="Dietary Fiber (g)" required />
              <input type="text" name="sugars" value={newMenuItem.sugars} onChange={handleInputChange} placeholder="Sugars (g)" required />
            </div>
            <div className="micronutrients-row">
              <input type="text" name="protein" value={newMenuItem.protein} onChange={handleInputChange} placeholder="Protein (g)" required />
              <input type="text" name="vitamin_d" value={newMenuItem.vitamin_d} onChange={handleInputChange} placeholder="Vitamin D (mcg)" required />
            </div>
            <div className="micronutrients-row">
              <input type="text" name="calcium" value={newMenuItem.calcium} onChange={handleInputChange} placeholder="Calcium (mg)" required />
              <input type="text" name="iron" value={newMenuItem.iron} onChange={handleInputChange} placeholder="Iron (mg)" required />
              <input type="text" name="potassium" value={newMenuItem.potassium} onChange={handleInputChange} placeholder="Potassium (mg)" required />
            </div>
    
            <div className='form-buttons'>
              <button type='submit'>Add Item</button>
              <button type='button' onClick={() => setShowAddModal(false)}>Cancel</button>
            </div> 
          </form>
        </div>
      </div>
   )}

   {}
   {showEditModal && (
  <div className='modal'>
    <div className='modal-content'>
      <h2>Edit Menu Item</h2>
      <form onSubmit={handleSubmitEdit}>

        <input type='text' name='food_name' value={editingMenuItem.food_name || ''} 
               onChange={(e) => handleInputChange(e, true)} placeholder='Food Name' required />
        <input type='text' name='price' value={editingMenuItem.price || ''} 
               onChange={(e) => handleInputChange(e, true)} placeholder='Price' required />
        <input type='text' name='allergens_info' value={editingMenuItem.allergens_info || ''} 
               onChange={(e) => handleInputChange(e, true)} placeholder='Allergens Info' />

        <input type='number' name='calories' value={editingMenuItem.calories || ''} 
               onChange={(e) => handleInputChange(e, true)} placeholder='Calories' required />

        <input type='text' name='serving_size' value={editingMenuItem.serving_size || ''} 
               onChange={(e) => handleInputChange(e, true)} placeholder='Serving Size' required />

        <div className="micronutrients-row">
          <input type="text" name="total_fat" value={editingMenuItem.total_fat || ''} 
                 onChange={(e) => handleInputChange(e, true)} placeholder="Total Fat (g)" required />
          <input type="text" name="saturated_fat" value={editingMenuItem.saturated_fat || ''} 
                 onChange={(e) => handleInputChange(e, true)} placeholder="Saturated Fat (g)" required />
        </div>
        
        <div className="micronutrients-row">
          <input type="text" name="trans_fat" value={editingMenuItem.trans_fat || ''} 
                 onChange={(e) => handleInputChange(e, true)} placeholder="Trans Fat (g)" required />
          <input type="text" name="cholesterol" value={editingMenuItem.cholesterol || ''} 
                 onChange={(e) => handleInputChange(e, true)} placeholder="Cholesterol (mg)" required />
        </div>

        <div className="micronutrients-row">
          <input type="text" name="sodium" value={editingMenuItem.sodium || ''} 
                 onChange={(e) => handleInputChange(e, true)} placeholder="Sodium (mg)" required />
          <input type="text" name="total_carbohydrates" value={editingMenuItem.total_carbohydrates || ''} 
                 onChange={(e) => handleInputChange(e, true)} placeholder="Total Carbohydrates (g)" required />
        </div>

        <div className="micronutrients-row">
          <input type="text" name="dietary_fiber" value={editingMenuItem.dietary_fiber || ''} 
                 onChange={(e) => handleInputChange(e, true)} placeholder="Dietary Fiber (g)" required />
          <input type="text" name="sugars" value={editingMenuItem.sugars || ''} 
                 onChange={(e) => handleInputChange(e, true)} placeholder="Sugars (g)" required />
        </div>

        <div className="micronutrients-row">
          <input type="text" name="protein" value={editingMenuItem.protein || ''} 
                 onChange={(e) => handleInputChange(e, true)} placeholder="Protein (g)" required />
          <input type="text" name="vitamin_d" value={editingMenuItem.vitamin_d || ''} 
                 onChange={(e) => handleInputChange(e, true)} placeholder="Vitamin D (mcg)" required />
        </div>

        <div className="micronutrients-row">
          <input type="text" name="calcium" value={editingMenuItem.calcium || ''} 
                 onChange={(e) => handleInputChange(e, true)} placeholder="Calcium (mg)" required />
          <input type="text" name="iron" value={editingMenuItem.iron || ''} 
                 onChange={(e) => handleInputChange(e, true)} placeholder="Iron (mg)" required />
          <input type="text" name="potassium" value={editingMenuItem.potassium || ''} 
                 onChange={(e) => handleInputChange(e, true)} placeholder="Potassium (mg)" required />
        </div>

         <div className='form-buttons'>
           <button type='submit'>Save Changes</button>
           <button type='button' onClick={() => setShowEditModal(false)}>Cancel</button>
         </div> 
       </form> 
     </div> 
   </div> 
)}
</div> 
 );
};

const ReportsContent = () => {
  const [selectedReport, setSelectedReport] = useState('popularity');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:8000/api/reports/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch report data');
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };

    fetchReportData();
  }, []);

  const generateReport = (reportType) => {
    if (!reportData) return null;

    switch (reportType) {
      case 'popularity':
        return {
          labels: reportData.top_food_items.map(item => item.food_name),
          datasets: [{
            label: 'Item Popularity',
            data: reportData.top_food_items.map(item => item.total_orders),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          }]
        };
      case 'earnings':
        return {
          labels: reportData.top_dining_halls.map(hall => hall.dining_hall_name),
          datasets: [{
            label: 'Total Orders',
            data: reportData.top_dining_halls.map(hall => hall.total_orders),
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
          }]
        };
      case 'sales':
        return {
          labels: reportData.top_restaurants.map(restaurant => restaurant.restaurant_name),
          datasets: [{
            label: 'Total Orders',
            data: reportData.top_restaurants.map(restaurant => restaurant.total_orders),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          }]
        };
      default:
        return null;
    }
  };

  const renderChart = () => {
    const data = generateReport(selectedReport);
    if (!data) return null;

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
          data={data}
          options={options}
        />
      </div>
    );
  };

  const getChartTitle = () => {
    switch (selectedReport) {
      case 'popularity':
        return 'Most Popular Food Items';
      case 'earnings':
        return 'Top Dining Halls by Orders';
      case 'sales':
        return 'Top Restaurants by Orders';
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
          <FaFileAlt /> Dining Hall Orders
        </button>
        <button className={`report-button ${selectedReport === 'sales' ? 'active' : ''}`} onClick={() => setSelectedReport('sales')}>
          <FaFileAlt /> Restaurant Orders
        </button>
      </div>
      <div className="report-summary">
        <h2>{getChartTitle()}</h2>
        {renderChart()}
      </div>
      <div className="additional-stats">
        <h3>Quick Stats</h3>
        {reportData && (
          <>
            <p>Total Revenue: ${reportData.transaction_metrics.total_revenue.toFixed(2)}</p>
            <p>Average Transaction: ${reportData.transaction_metrics.avg_transaction.toFixed(2)}</p>
            <p>Minimum Transaction: ${reportData.transaction_metrics.min_transaction.toFixed(2)}</p>
            <p>Maximum Transaction: ${reportData.transaction_metrics.max_transaction.toFixed(2)}</p>
            <p>Total Transactions: {reportData.transaction_metrics.total_transactions}</p>
            <p>Average Calories per Item: {reportData.food_item_metrics.avg_calories.toFixed(2)}</p>
          </>
        )}
      </div>
    </div>
  );
};



export default Home;