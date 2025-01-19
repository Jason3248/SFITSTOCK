import React, { useState } from 'react';
import axios from 'axios';


const Profile = () => {
  const [email, setEmail] = useState('');
  const [pid, setPid] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        'http://localhost:5000/api/auth/update-credentials',
        { email, pid, currentPassword, newPassword },
        { headers: { Authorization: token } }
      );
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response.data.message);
    }
  };

  return (
    <div>
      <h2>Update Profile</h2>
      <form onSubmit={handleUpdate}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Current Password:</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <button type="submit">Update</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Profile;
