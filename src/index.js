// App.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PurchaseInCharge from './components/PurchaseInCharge';
import PrincipalApproval from './components/PrincipalApproval';
import Login from './components/Login';
import DirectorApproval from './components/DirectorApproval';
import AdminManagement from './components/AdminManagement';
import AdminLogin from './components/AdminLogin';
import StockQuery from './components/StockQuery';
import Navbar from './components/Navbar'; // Import your Navbar component
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import HODPage from './components/HodPage';
import PI from './components/PI';
import DepartmentInCharge from './components/DepartmentInCharge';


// const App = () => {
//   return (
//     <Router>
//       <Routes>
//       <Route path="/profile" element={<ProtectedRoute element={Profile} />} />
//       <Route path="/login" element={<Login />} />
//       <Route path='/search' element={<StockQuery />} />
//       <Route path='/adminlogin' element={<AdminLogin />}/>
//       <Route path='/admindashboard' element={<AdminManagement />} />
//       <Route path='/hodpage' element={<HODPage />}/>
//         <Route path="/" element={<ProtectedRoute element={<PI />} requiredLevel={1} />} />
//         <Route path='/hodpage' element={<ProtectedRoute element={<HODPage />} requiredLevel={2}/>} />
//         <Route path="/principal" element={<ProtectedRoute element={PrincipalApproval} requiredLevel={3} />} />
//         <Route path="/director" element={<ProtectedRoute element={DirectorApproval} requiredLevel={4} />} />
//         <Route path="/department-in-charge" element={<ProtectedRoute element={<DepartmentInCharge />} requiredLevel={5} />} />

//       </Routes>
//     </Router>
//   );
// };


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<StockQuery />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/admindashboard" element={<AdminManagement />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredLevel={1}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute requiredLevel={1}>
              <PI />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hodpage"
          element={
            <ProtectedRoute requiredLevel={2}>
              <HODPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/principal"
          element={
            <ProtectedRoute requiredLevel={3}>
              <PrincipalApproval />
            </ProtectedRoute>
          }
        />

        <Route
          path="/director"
          element={
            <ProtectedRoute requiredLevel={4}>
              <DirectorApproval />
            </ProtectedRoute>
          }
        />

        <Route
          path="/department-in-charge"
          element={
            <ProtectedRoute requiredLevel={5}>
              <DepartmentInCharge />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
