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


const App = () => {
  return (
    <Router>
      <Navbar/>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path='/search' element={<StockQuery />} />
      <Route path='/adminlogin' element={<AdminLogin />}/>
      <Route path='/admindashboard' element={<AdminManagement />} />
        <Route path="/" element={<PurchaseInCharge />} />
        <Route path="/hodcmpn" element={<HodCMPN />} />
        <Route path="/hodinft" element={<HodINFT />} />
        <Route path="/hodextc" element={<HodEXTC />} />
        <Route path="/hodmech" element={<HodMECH />} />
        <Route path="/hodelec" element={<HodELEC />} />
        <Route path="/hodaiml" element={<HodAIML />} />
        <Route path="/hodecs" element={<HodECS />} />
        <Route path="/principal" element={<PrincipalApproval />} />
        <Route path="/director" element={<DirectorApproval />} />
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
