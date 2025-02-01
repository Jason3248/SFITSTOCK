import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Alert, CircularProgress } from '@mui/material';

// const Profile = () => {
//   const [email, setEmail] = useState('');
//   const [pid, setPid] = useState('');
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);
//   const token = localStorage.getItem('token');

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await axios.put(
//         'http://localhost:5000/api/auth/update-credentials',
//         { email, pid, currentPassword, newPassword },
//         { headers: { Authorization: token } }
//       );
//       setMessage({ text: res.data.message, success: true });
//     } catch (error) {
//       setMessage({ text: error.response?.data.message || 'An error occurred', success: false });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
//       <Typography variant="h4" align="center" gutterBottom>
//         Update Profile
//       </Typography>

//       <form onSubmit={handleUpdate}>
//         <TextField
//           fullWidth
//           label="Email"
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           margin="normal"
//         />
//         <TextField
//           fullWidth
//           label="PID"
//           value={pid}
//           onChange={(e) => setPid(e.target.value)}
//           margin="normal"
//         />
//         <TextField
//           fullWidth
//           label="Current Password"
//           type="password"
//           value={currentPassword}
//           onChange={(e) => setCurrentPassword(e.target.value)}
//           margin="normal"
//         />
//         <TextField
//           fullWidth
//           label="New Password"
//           type="password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           margin="normal"
//         />
//         <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
//           <Button
//             variant="contained"
//             color="primary"
//             type="submit"
//             disabled={loading}
//             sx={{ width: '50%' }}
//           >
//             {loading ? <CircularProgress size={24} color="inherit" /> : 'Update'}
//           </Button>
//         </Box>
//       </form>

//       {message && (
//         <Box sx={{ marginTop: 2 }}>
//           <Alert severity={message.success ? 'success' : 'error'}>
//             {message.text}
//           </Alert>
//         </Box>
//       )}
//     </Box>
//   );
// };
const Profile = () => {
  const [email, setEmail] = useState('');
 
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        'http://localhost:5000/api/auth/update-credentials',
        { email, currentPassword, newPassword },
        { headers: { Authorization: token } }
      );
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response.data.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Update Profile
      </Typography>

      <form onSubmit={handleUpdate}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          margin="normal"
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            sx={{ width: '50%' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Update'}
          </Button>
        </Box>
      </form>

      {message && (
        <Box sx={{ marginTop: 2 }}>
          <Alert severity={message.success ? 'success' : 'error'}>
            {message.text}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default Profile;
