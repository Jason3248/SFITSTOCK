
// import React, { useState, useEffect } from 'react';
// import { Avatar, Button, TextField, Paper, Typography, Container, Box, Radio, FormControlLabel, RadioGroup, FormControl, FormLabel, Select, MenuItem } from '@mui/material';
// import SfitLogo from './assets/sfit_logo.gif'; 
// import { useNavigate } from 'react-router-dom';

// const Login = () => {
//   const [credentials, setCredentials] = useState({ email: '', password: '' });
//   const [isAdminLogin, setIsAdminLogin] = useState(false); 
//   const [loginType, setLoginType] = useState('user'); 
//   const [departments, setDepartments] = useState([]);
//   const [selectedDepartment, setSelectedDepartment] = useState('');
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (loginType === 'hod') {
//       fetchDepartments();
//     }
//   }, [loginType]);

//   const fetchDepartments = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/admin/config'); // Adjust URL for fetching department list
//       const data = await response.json();
//       setDepartments(data.allocatedDept); // Assuming the departments come in a `departments` array
//     } catch (error) {
//       console.error('Error fetching departments:', error);
//     }
//   };

//   const handleChange = (e) => {
//     setCredentials({ ...credentials, [e.target.name]: e.target.value });
//   };

//   const handleDepartmentChange = (e) => {
//     setSelectedDepartment(e.target.value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (isAdminLogin) {
//       await adminLogin(credentials);
//     } else if (loginType === 'hod') {
//       await hodLogin(credentials);
//     } else if (loginType === 'deptInCharge') {
//       await departmentInChargeLogin(credentials);
//     } else {
//       await userLogin(credentials);
//     }
//   };

//   const departmentInChargeLogin = async (credentials) => {
//     try {
//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(credentials),
//       });
  
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || 'Department In-Charge login failed!');
//       }
  
//       const data = await response.json();
//       if (data.token && data.userLevel === 5 && selectedDepartment) {
//         localStorage.setItem('token', data.token);
//         alert('Department In-Charge login successful!');
        
//         // Navigate to Department In-Charge page and pass department info
//         navigate(`/department-in-charge`, { state: { department: selectedDepartment } });
//       } else {
//         throw new Error('Login failed! No token or invalid user level received.');
//       }
//     } catch (error) {
//       console.error('Error during Department In-Charge login:', error.message);
//       alert(error.message || 'An error occurred. Please try again.');
//     }
//   };
  

//   const userLogin = async (credentials) => {
//     try {
//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(credentials),
//       });
  
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || 'User login failed!');
//       }
  
//       const data = await response.json();
//       if (data.token && data.userLevel !== undefined) {
//         localStorage.setItem('userLevel', data.userLevel);
//         localStorage.setItem('token', data.token);
//         alert('User login successful!');
  
//         // Navigate based on userLevel
//         switch (data.userLevel) {
//           case 1:
//             navigate('/');
//             break;
//           case 2:
//             navigate('/hodpage');
//             break;
//           case 3:
//             navigate('/principal');
//             break;
//           case 4:
//             navigate('/director');
//             break;
//           case 5:
//             navigate('/deptincharge');
//           default:
//             throw new Error('Unknown user level');
//         }
//       } else {
//         throw new Error('Login failed! No token or user level received.');
//       }
//     } catch (error) {
//       console.error('Error during user login:', error.message);
//       alert(error.message || 'An error occurred. Please try again.');
//     }
//   };

//   const hodLogin = async (credentials) => {
//     try {
//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(credentials),
//       });
  
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || 'HOD login failed!');
//       }
  
//       const data = await response.json();
//       if (data.token && data.userLevel === 2 && selectedDepartment) {
//         localStorage.setItem('token', data.token);
//         alert('HOD login successful!');
        
//         // Navigate to HOD page and pass selectedDepartment
//         navigate(`/hodpage`, { state: { department: selectedDepartment } });
//       } else {
//         throw new Error('Login failed! No token or invalid user level received.');
//       }
//     } catch (error) {
//       console.error('Error during HOD login:', error.message);
//       alert(error.message || 'An error occurred. Please try again.');
//     }
//   };
  

//   const adminLogin = async (credentials) => {
//     try {
//       const response = await fetch('http://localhost:5000/api/admin/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(credentials),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || 'Admin login failed!');
//       }

//       const data = await response.json();
//       if (data.token) {
//         localStorage.setItem('adminToken', data.token);
//         alert('Admin login successful!');
//         navigate('/admindashboard')// Navigate to admin dashboard (if routing is set up)
//       } else {
//         throw new Error('Admin login failed! No token received.');
//       }
//     } catch (error) {
//       console.error('Error during admin login:', error.message);
//       alert(error.message || 'An error occurred. Please try again.');
//     }
//   };

//   return (
//     <Container component="main" maxWidth="xs">
//       <Paper
//         sx={{
//           mt: 8,
//           p: 4,
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           borderRadius: 2,
//         }}
//         elevation={6}
//       >
//         <Avatar sx={{ m: 1, bgcolor: 'white', width: 60, height: 60 }} src={SfitLogo} />
//         <Typography component="h1" variant="h5">
//           {isAdminLogin ? 'Admin Login' : 'User Login'}
//         </Typography>

//         <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
//           <FormControl component="fieldset">
//             <FormLabel component="legend">Login Type</FormLabel>
//             <RadioGroup
//                 aria-label="login-type"
//                 name="login-type"
//                 value={loginType}
//                 onChange={(e) => setLoginType(e.target.value)}
//               >
//                 <FormControlLabel value="user" control={<Radio />} label="User (PI, Principal, Director)" />
//                 <FormControlLabel value="hod" control={<Radio />} label="HOD" />
//                 <FormControlLabel value="deptInCharge" control={<Radio />} label="Department In-Charge" />
//             </RadioGroup>

//           </FormControl>

//           <TextField
//             margin="normal"
//             required
//             fullWidth
//             id="email"
//             label="Email ID"
//             name="email"
//             value={credentials.email}
//             onChange={handleChange}
//           />
//           <TextField
//             margin="normal"
//             required
//             fullWidth
//             name="password"
//             label="Password"
//             type="password"
//             id="password"
//             value={credentials.password}
//             onChange={handleChange}
//           />

//           {loginType === 'hod' && (
//             <FormControl fullWidth sx={{ mt: 2 }}>
//               <FormLabel>Select Department</FormLabel>
//               <Select
//                 value={selectedDepartment}
//                 onChange={handleDepartmentChange}
//               >
//                 {departments.map((dept) => (
//                   <MenuItem key={dept} value={dept}>
//                     {dept}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           )}

//           {error && <Typography color="error">{error}</Typography>}

//           <Button
//             type="submit"
//             fullWidth
//             variant="contained"
//             color="primary"
//             sx={{ mt: 3, mb: 2, p: 1.5 }}
//           >
//             {isAdminLogin ? 'Login as Admin' : 'Login as User/HOD'}
//           </Button>
//         </Box>

//         <Button onClick={() => setIsAdminLogin(!isAdminLogin)} sx={{ mt: 2 }}>
//           {isAdminLogin ? 'Login as User' : 'Login as Admin'}
//         </Button>
//       </Paper>
//     </Container>
//   );
// };
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Avatar,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem
} from '@mui/material';
import SfitLogo from './assets/sfit_logo.gif'; // Adjust import path if necessary

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isAdminLogin, setIsAdminLogin] = useState(false); 
  const [loginType, setLoginType] = useState('user'); 
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loginType === 'hod' || loginType === 'deptInCharge') {
      fetchDepartments();
    }
  }, [loginType]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/config'); // Adjust URL for fetching department list
      const data = await response.json();
      setDepartments(data.allocatedDept);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAdminLogin) {
      await adminLogin(credentials);
    } else if (loginType === 'hod') {
      await hodLogin(credentials);
    } else if (loginType === 'deptInCharge') {
      await departmentInChargeLogin(credentials);
    } else {
      await userLogin(credentials);
    }
  };
  const userLogin = async (credentials) => {
        try {
          const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });
      
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'User login failed!');
          }
      
          const data = await response.json();
          if (data.token && data.userLevel !== undefined) {
            localStorage.setItem('userLevel', data.userLevel);
            localStorage.setItem('token', data.token);
            alert('User login successful!');
      
            // Navigate based on userLevel
            switch (data.userLevel) {
              case 1:
                navigate('/');
                break;
              case 2:
                navigate('/hodpage');
                break;
              case 3:
                navigate('/principal');
                break;
              case 4:
                navigate('/director');
                break;
              case 5:
                navigate('/department-in-charge');
              default:
                throw new Error('Unknown user level');
            }
          } else {
            throw new Error('Login failed! No token or user level received.');
          }
        } catch (error) {
          console.error('Error during user login:', error.message);
          alert(error.message || 'An error occurred. Please try again.');
        }
      };

      const departmentInChargeLogin = async (credentials) => {
        try {
          const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });
      
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Department In-Charge login failed!');
          }
      
          const data = await response.json();
          if (data.token && data.userLevel === 5 && selectedDepartment) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userLevel', data.userLevel);
            alert('Department In-Charge login successful!');
            navigate('/department-in-charge', { state: selectedDepartment });
          } else {
            throw new Error('Login failed! Missing token, user level, or department.');
          }
        } catch (error) {
          console.error('Error during Department In-Charge login:', error.message);
          alert(error.message || 'An error occurred. Please try again.');
        }
      };
      

  const hodLogin = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'HOD login failed!');
      }
  
      const data = await response.json();
      if (data.token && data.userLevel === 2 && selectedDepartment) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userLevel', data.userLevel)
        alert('HOD login successful!');
        navigate(`/hodpage`, { state: { department: selectedDepartment } });
      } else {
        throw new Error('Login failed! No token or invalid user level received.');
      }
    } catch (error) {
      console.error('Error during HOD login:', error.message);
      alert(error.message || 'An error occurred. Please try again.');
    }
  };

  const adminLogin = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Admin login failed!');
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        alert('Admin login successful!');
        navigate('/admindashboard');
      } else {
        throw new Error('Admin login failed! No token received.');
      }
    } catch (error) {
      console.error('Error during admin login:', error.message);
      alert(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="sm"> {/* Increased width */}
      <Paper
        sx={{
          mt: 6,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
          maxHeight: '90vh', // Prevents overflowing
          overflowY: 'auto', // Adds scroll if content overflows
        }}
        elevation={6}
      >
        <Avatar sx={{ m: 1, bgcolor: 'white', width: 60, height: 60 }} src={SfitLogo} />
        <Typography component="h1" variant="h5">
          {isAdminLogin ? 'Admin Login' : 'User Login'}
        </Typography>

        <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
          <FormControl component="fieldset" sx={{ width: '100%', mb: 2 }}>
            <FormLabel component="legend" sx={{ mb: 1 }}>Login Type</FormLabel>
            <RadioGroup
              aria-label="login-type"
              name="login-type"
              value={loginType}
              onChange={(e) => setLoginType(e.target.value)}
              sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <FormControlLabel value="user" control={<Radio />} label="User (PI, Principal, Director)" />
              <FormControlLabel value="hod" control={<Radio />} label="HOD" />
              <FormControlLabel value="deptInCharge" control={<Radio />} label="Department In-Charge" />
            </RadioGroup>
          </FormControl>

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email ID"
            name="email"
            value={credentials.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={credentials.password}
            onChange={handleChange}
          />

          {(loginType === 'hod' || loginType === 'deptInCharge') && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <FormLabel>Select Department</FormLabel>
              <Select value={selectedDepartment} onChange={handleDepartmentChange}>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {error && <Typography color="error">{error}</Typography>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 1, p: 1.5 }}
          >
            {isAdminLogin ? 'Login as Admin' : 'Login as User/HOD'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            sx={{ mt: 1, p: 1 }}
            onClick={() => setIsAdminLogin(!isAdminLogin)}
          >
            {isAdminLogin ? 'Switch to User Login' : 'Switch to Admin Login'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;


// export default Login;
