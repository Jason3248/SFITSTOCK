
import React, { useState } from 'react';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(credentials);
  };

  const login = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      // Check if the response is OK
      if (!response.ok) {
        const errorText = await response.text(); // Read response as plain text
        throw new Error(errorText || 'Login failed!');
      }

      // Parse the JSON response
      const data = await response.json();

      if (data.token && data.userLevel !== undefined) {
        localStorage.setItem('userLevel', data.userLevel);
        localStorage.setItem('token', data.token);
        alert('Login successful!');
      } else {
        throw new Error('Login failed! No token received.');
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      alert(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={credentials.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;


