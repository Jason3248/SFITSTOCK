import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import sfit_logo from "../components/assets/sfit_logo.gif";
import '../styles/navbar.css';

const Navbar = () => {
  const [username, setUsername] = useState(''); // To store the username

  useEffect(() => {
    const auth = getAuth();
   
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {

        const displayName = user.displayName || user.email;
        setUsername(displayName);
      } else {
     
        setUsername('username');
      }
    });

    return () => unsubscribe(); 
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        {/* Add the imported logo image */}
        <img src={sfit_logo} alt="SFIT Logo" className="logo-img" />
        <span>SFIT <strong>STOCK</strong></span>
      </div>
      <div className="navbar-icons">
        <i className="fas fa-home"></i>
        <i className="fas fa-bell"></i>
        <div className="navbar-profile">
          <div className="profile-circle"></div>
          {/* Display the username dynamically */}
          <span>{username}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
