
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// // import ConnectionPage from './components/ConnectionPage';
// // import SelectTablePage from './components/SelectTablePage';
// // import CRUDPage from './components/CRUDPage';
// import ConnectionPage from './components/ConnectionPage.js'; // Add .js extension
// import SelectTablePage from './components/SelectTablePage.js'; // Add .js extensiony
// import CRUDPage from './components/CRUDPage.js'; // Add .js extension


// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<ConnectionPage />} />
//         <Route path="/select-table" element={<SelectTablePage />} />
//         <Route path="/crud/:table" element={<CRUDPage />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login.js';
import Signup from './components/Signup.js';
import Dashboard from './components/Dashboard.js'; 
import HomePage from './components/HomePage.js';
import DiningHallDetails from "./components/DiningHallDetails.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/homePage" element={<HomePage />} />
        <Route path="/dining-hall/:hallName" element={<DiningHallDetails />} />
      </Routes>
    </Router>
  );
}

export default App;

