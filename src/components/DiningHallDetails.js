import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const DiningHallDetails = () => {
  const { hallName } = useParams();
  const [restaurants, setRestaurants] = useState([]);

  // Define the restaurant data here or import it from a data file
  const restaurantData = {
    "Owens Food Court": [
      { name: "Hokie Grill", menu: [{ item: "Burger", price: "$5" }, { item: "Fries", price: "$2" }] },
      { name: "Dolci", menu: [{ item: "Pasta", price: "$7" }, { item: "Salad", price: "$4" }] },
    ],
    // Other dining halls...
  };

  useEffect(() => {
    // Set restaurants based on the selected dining hall
    if (restaurantData[hallName]) {
      setRestaurants(restaurantData[hallName]);
    }
  }, [hallName]);

  return (
    <div>
      <h1>{hallName}</h1>
      {restaurants.length > 0 ? (
        restaurants.map((restaurant, index) => (
          <div key={index}>
            <h2>{restaurant.name}</h2>
            <ul>
              {restaurant.menu.map((item, idx) => (
                <li key={idx}>
                  {item.item} - {item.price}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No data available for this dining hall.</p>
      )}
      <Link to="/">Back to Home</Link>
    </div>
  );
};

export default DiningHallDetails;
