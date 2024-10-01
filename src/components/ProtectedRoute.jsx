// components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Element, requiredLevel, ...rest }) => {
  const userLevel = parseInt(localStorage.getItem('userLevel'), 10); // Ensure userLevel is a number

  // Check access level and render either the component or redirect
  return userLevel && userLevel >= requiredLevel ? (
    <Element {...rest} />
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoute;

