//utils.auth.js
import axios from 'axios';

export const login = async (credentials) => {
  try {
    const response = await axios.post('/api/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(response);
    

    const data = response.data;
    if (data.token && data.userLevel !== undefined) {
      localStorage.setItem('userLevel', data.userLevel);
      localStorage.setItem('token', data.token);
      alert('Login successful!');
    } else {
      alert(data.message || 'Login failed!');
    }
  } catch (error) {
    // Check if error response has data
    if (error.response && error.response.data) {
      console.error('Error during login:', error.response.data);
      alert(error.response.data.message || 'Login failed!');
    } else {
      console.error('Error during login:', error);
      alert('An error occurred. Please try again.');
    }
  }
};
