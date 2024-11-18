import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login.js';
import Signup from './components/Signup.js';
import Dashboard from './components/Dashboard.js'; 
import HomePage from './components/HomePage.js';
import DiningHallDetails from "./components/DiningHallDetails.js";
import Home from "./adminComponents/home.js"
import ForgotPassword from './components/forgotpass.js'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/homePage" element={<HomePage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dining-hall/:hallName" element={<DiningHallDetails />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;

