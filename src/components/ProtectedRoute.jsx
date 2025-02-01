
// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ element: Element, requiredLevel, ...rest }) => {
//   const userLevel = parseInt(localStorage.getItem('userLevel'), 10); // Ensure userLevel is a number
//   console.log("User Level:", userLevel);
//   console.log("Required Level:", requiredLevel);


//   // Check access level and render either the component or redirect
//   return userLevel && userLevel >= requiredLevel ? (
//     <Element {...rest} />
//   ) : (
//     <Navigate to="/login" />
//   );
// };

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredLevel }) => {
  const userLevel = parseInt(localStorage.getItem('userLevel'), 10); // Ensure userLevel is a number

  return userLevel && userLevel >= requiredLevel ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;

// export default ProtectedRoute;

