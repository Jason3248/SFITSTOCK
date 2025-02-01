import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/admin/login', {
        email, password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      localStorage.setItem('adminToken', response.data.token);
      navigate('/admindashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/admin/register', {
        email, password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      alert('Admin created successfully! You can now log in.');
      setIsRegistering(false); // Switch back to login form
    } catch (err) {
      setError('Failed to create admin');
    }
  };

  return (
    <div>
      <h2>{isRegistering ? 'Create Admin' : 'Admin Login'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        <input 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">{isRegistering ? 'Create Admin' : 'Login'}</button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Already have an account? Login' : 'Create a new admin'}
      </button>
    </div>
  );
};

export default AdminLogin;
