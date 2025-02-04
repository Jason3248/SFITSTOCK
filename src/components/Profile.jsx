// import React, { useState } from 'react';
// import axios from 'axios';
// import { TextField, Button, Box, Typography, Alert, CircularProgress } from '@mui/material';

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
// const Profile = () => {
//   const [email, setEmail] = useState('');
 
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const token = localStorage.getItem('token');
//   const [loading, setLoading] = useState(false);

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.put(
//         'http://localhost:5000/api/auth/update-credentials',
//         { email, currentPassword, newPassword },
//         { headers: { Authorization: token } }
//       );
//       setMessage(res.data.message);
//     } catch (error) {
//       setMessage(error.response.data.message);
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
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Snackbar,
} from '@mui/material';
import axios from 'axios';

const Profile = () => {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const token = localStorage.getItem('token');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.put(
        'http://localhost:5000/api/auth/update-credentials',
        { email, currentPassword, newPassword },
        { headers: { Authorization: token } }
      );

      setMessage({ type: 'success', text: res.data.message });
      setOpenSnackbar(true);
      setEmail('');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Something went wrong!';
      setMessage({ type: 'error', text: errorMsg });
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f4f6f8',
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%', boxShadow: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Update Profile
          </Typography>

          <form onSubmit={handleUpdate} noValidate autoComplete="off">
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              aria-label="Email Address"
              helperText={!email && 'Enter a valid email'}
              error={!email && email !== ''}
            />

            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              margin="normal"
              required
              aria-label="Current Password"
              helperText={
                currentPassword.length < 6 && currentPassword !== ''
                  ? 'Password must be at least 6 characters'
                  : ''
              }
              error={currentPassword.length < 6 && currentPassword !== ''}
            />

            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
              aria-label="New Password"
              helperText={
                newPassword.length < 6 && newPassword !== ''
                  ? 'Password must be at least 6 characters'
                  : ''
              }
              error={newPassword.length < 6 && newPassword !== ''}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading || !email || !currentPassword || !newPassword}
                sx={{ width: '60%', py: 1.2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Credentials'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={message.type}
          sx={{ width: '100%' }}
          onClose={handleCloseSnackbar}
        >
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;


// export default Profile;
