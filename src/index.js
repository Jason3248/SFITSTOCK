// App.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PurchaseInCharge from './components/PurchaseInCharge';
import PrincipalApproval from './components/PrincipalApproval';
import Login from './components/Login';
import HodCMPN from './components/hod/HodCMPN';
import HodAIML from './components/hod/HodAIML';
import HodINFT from './components/hod/HodINFT';
import HodECS from './components/hod/HodECS';
import HodEXTC from './components/hod/HodEXTC';
import HodMECH from './components/hod/HodMECH';
import HodELEC from './components/hod/HodELEC';
import DirectorApproval from './components/DirectorApproval';
import AdminManagement from './components/AdminManagement';
import AdminLogin from './components/AdminLogin';
import StockQuery from './components/StockQuery';
import Navbar from './components/Navbar'; // Import your Navbar component
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/profile" element={<ProtectedRoute element={Profile} requiredLevel={1} />} />
      <Route path="/login" element={<Login />} />
      <Route path='/search' element={<StockQuery />} />
      <Route path='/adminlogin' element={<AdminLogin />}/>
      <Route path='/admindashboard' element={<AdminManagement />} />
        <Route path="/" element={<ProtectedRoute element={PurchaseInCharge} requiredLevel={1} />} />
        <Route path="/hodcmpn" element={<ProtectedRoute element={HodCMPN} requiredLevel={2} />} />
        <Route path="/hodinft" element={<ProtectedRoute element={HodINFT} requiredLevel={3} />} />
        <Route path="/hodextc" element={<ProtectedRoute element={HodEXTC} requiredLevel={4} />} />
        <Route path="/hodmech" element={<ProtectedRoute element={HodMECH} requiredLevel={5} />} />
        <Route path="/hodelec" element={<ProtectedRoute element={HodELEC} requiredLevel={6} />} />
        <Route path="/hodaiml" element={<ProtectedRoute element={HodAIML} requiredLevel={7} />} />
        <Route path="/hodecs" element={<ProtectedRoute element={HodECS} requiredLevel={8} />} />
        <Route path="/principal" element={<ProtectedRoute element={PrincipalApproval} requiredLevel={9} />} />
        <Route path="/director" element={<ProtectedRoute element={DirectorApproval} requiredLevel={10} />} />
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
