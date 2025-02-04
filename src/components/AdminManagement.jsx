

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Button, TextField, Container, Grid, Typography, Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
// import "../styles/adminmanagement.css"; // Import your updated CSS

// // const AdminManagement = () => {
// //   const [assetHeads, setAssetHeads] = useState([]);
// //   const [allocatedDepartments, setAllocatedDepartments] = useState([]);
// //   const [newAssetHead, setNewAssetHead] = useState("");
// //   const [newAllocatedDept, setNewAllocatedDept] = useState("");

// //   const [hodName, setHodName] = useState("");
// //   const [hodEmail, setHodEmail] = useState("");
// //   const [hodPassword, setHodPassword] = useState("");
// //   const [hodDepartment, setHodDepartment] = useState("");

// //   const fetchValues = async () => {
// //     try {
// //       const response = await axios.get("http://localhost:5000/api/admin/config");
// //       setAssetHeads(response.data.assetHeads || []);
// //       setAllocatedDepartments(response.data.allocatedDept || []);
// //     } catch (error) {
// //       console.error("Error fetching values:", error);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchValues();
// //   }, []);

// //   const handleAddAssetHead = async () => {
// //     if (newAssetHead.trim()) {
// //       const updatedAssetHeads = [...assetHeads, newAssetHead];
// //       setAssetHeads(updatedAssetHeads);
// //       setNewAssetHead("");
// //       await updateConfig(updatedAssetHeads, allocatedDepartments);
// //     }
// //   };

// //   const handleAddAllocatedDept = async () => {
// //     if (newAllocatedDept.trim()) {
// //       const updatedAllocatedDepts = [...allocatedDepartments, newAllocatedDept];
// //       setAllocatedDepartments(updatedAllocatedDepts);
// //       setNewAllocatedDept("");
// //       await updateConfig(assetHeads, updatedAllocatedDepts);
// //     }
// //   };

// //   const handleDeleteAssetHead = async (head) => {
// //     const updatedAssetHeads = assetHeads.filter((h) => h !== head);
// //     setAssetHeads(updatedAssetHeads);
// //     await updateConfig(updatedAssetHeads, allocatedDepartments);
// //   };

// //   const handleDeleteAllocatedDept = async (dept) => {
// //     const updatedAllocatedDepts = allocatedDepartments.filter((d) => d !== dept);
// //     setAllocatedDepartments(updatedAllocatedDepts);
// //     await updateConfig(assetHeads, updatedAllocatedDepts);
// //   };

// //   const updateConfig = async (updatedAssetHeads, updatedAllocatedDepts) => {
// //     try {
// //       await axios.put("http://localhost:5000/api/admin/update-config", {
// //         assetHeads: updatedAssetHeads,
// //         allocatedDept: updatedAllocatedDepts,
// //       });
// //     } catch (error) {
// //       console.error("Error updating config:", error);
// //     }
// //   };

// //   const handleCreateHod = async () => {
// //     if (hodName && hodEmail && hodPassword && hodDepartment) {
// //       try {
// //         const response = await axios.post("http://localhost:5000/api/admin/createuser", {
// //           name: hodName,
// //           email: hodEmail,
// //           password: hodPassword,
// //           userLevel: 2, 
// //           userType: "HOD",
// //           allocatedDept: hodDepartment,
// //         });
// //         setHodName("");
// //         setHodEmail("");
// //         setHodPassword("");
// //         setHodDepartment("");
// //       } catch (error) {
// //         console.error("Error creating HOD:", error);
// //       }
// //     } else {
// //       console.error("Please fill all fields");
// //     }
// //   };

// //   return (
// //     <Container maxWidth="lg">
// //       <Box sx={{ mt: 4, mb: 6 }}>
// //         <Typography variant="h4" align="center" color="primary">
// //           Admin Dashboard
// //         </Typography>
// //       </Box>

// //       <Grid container spacing={4}>
// //         {/* Manage Asset Heads */}
// //         <Grid item xs={12} sm={6}>
// //           <Box sx={{ p: 3, borderRadius: 2, boxShadow: 3, backgroundColor: '#f5f5f5' }}>
// //             <Typography variant="h6" gutterBottom>
// //               Manage Asset Heads
// //             </Typography>
// //             <TextField
// //               fullWidth
// //               label="Add new Asset Head"
// //               value={newAssetHead}
// //               onChange={(e) => setNewAssetHead(e.target.value)}
// //               sx={{ mb: 2 }}
// //             />
// //             <Button variant="contained" color="primary" onClick={handleAddAssetHead}>
// //               Add
// //             </Button>
// //             <Box sx={{ mt: 2 }}>
// //               {assetHeads.map((head) => (
// //                 <Box key={head} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
// //                   <Typography>{head}</Typography>
// //                   <Button variant="outlined" color="secondary" onClick={() => handleDeleteAssetHead(head)}>
// //                     Delete
// //                   </Button>
// //                 </Box>
// //               ))}
// //             </Box>
// //           </Box>
// //         </Grid>

// //         {/* Manage Allocated Departments */}
// //         <Grid item xs={12} sm={6}>
// //           <Box sx={{ p: 3, borderRadius: 2, boxShadow: 3, backgroundColor: '#f5f5f5' }}>
// //             <Typography variant="h6" gutterBottom>
// //               Manage Allocated Departments
// //             </Typography>
// //             <TextField
// //               fullWidth
// //               label="Add new Allocated Department"
// //               value={newAllocatedDept}
// //               onChange={(e) => setNewAllocatedDept(e.target.value)}
// //               sx={{ mb: 2 }}
// //             />
// //             <Button variant="contained" color="primary" onClick={handleAddAllocatedDept}>
// //               Add
// //             </Button>
// //             <Box sx={{ mt: 2 }}>
// //               {allocatedDepartments.map((dept) => (
// //                 <Box key={dept} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
// //                   <Typography>{dept}</Typography>
// //                   <Button variant="outlined" color="secondary" onClick={() => handleDeleteAllocatedDept(dept)}>
// //                     Delete
// //                   </Button>
// //                 </Box>
// //               ))}
// //             </Box>
// //           </Box>
// //         </Grid>

// //         {/* Create New HOD */}
// //         <Grid item xs={12}>
// //           <Box sx={{ p: 3, borderRadius: 2, boxShadow: 3, backgroundColor: '#f5f5f5' }}>
// //             <Typography variant="h6" gutterBottom>
// //               Create New HOD
// //             </Typography>
// //             <TextField
// //               fullWidth
// //               label="HOD Name"
// //               value={hodName}
// //               onChange={(e) => setHodName(e.target.value)}
// //               sx={{ mb: 2 }}
// //             />
// //             <TextField
// //               fullWidth
// //               type="email"
// //               label="HOD Email"
// //               value={hodEmail}
// //               onChange={(e) => setHodEmail(e.target.value)}
// //               sx={{ mb: 2 }}
// //             />
// //             <TextField
// //               fullWidth
// //               type="password"
// //               label="HOD Password"
// //               value={hodPassword}
// //               onChange={(e) => setHodPassword(e.target.value)}
// //               sx={{ mb: 2 }}
// //             />
// //             <FormControl fullWidth sx={{ mb: 2 }}>
// //               <InputLabel>Department</InputLabel>
// //               <Select
// //                 value={hodDepartment}
// //                 onChange={(e) => setHodDepartment(e.target.value)}
// //                 label="Department"
// //               >
// //                 <MenuItem value="">
// //                   <em>Select Department</em>
// //                 </MenuItem>
// //                 {allocatedDepartments.map((dept) => (
// //                   <MenuItem key={dept} value={dept}>
// //                     {dept}
// //                   </MenuItem>
// //                 ))}
// //               </Select>
// //             </FormControl>
// //             <Button variant="contained" color="primary" onClick={handleCreateHod}>
// //               Create HOD
// //             </Button>
// //           </Box>
// //         </Grid>
// //       </Grid>
// //     </Container>
// //   );
// // };

// // export default AdminManagement;


// export default AdminManagement;

import { useState, useEffect } from "react";
import axios from "axios";
import { AppBar, Toolbar, Button, Container, Box, Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Paper, Divider } from "@mui/material";
import Profile from "./Profile";

const AdminManagement = () => {
  const [activeTab, setActiveTab] = useState("departments");
  const [assetHeads, setAssetHeads] = useState([]);
  const [allocatedDepartments, setAllocatedDepartments] = useState([]);
  const [newAssetHead, setNewAssetHead] = useState("");
  const [newAllocatedDept, setNewAllocatedDept] = useState("");

  const [hodName, setHodName] = useState("");
  const [hodEmail, setHodEmail] = useState("");
  const [hodPassword, setHodPassword] = useState("");
  const [hodDepartment, setHodDepartment] = useState("");

  const [deptInChargeName, setDeptInChargeName] = useState("");
  const [deptInChargeEmail, setDeptInChargeEmail] = useState("");
  const [deptInChargePassword, setDeptInChargePassword] = useState("");
  const [deptInChargeDepartment, setDeptInChargeDepartment] = useState("");

  const fetchValues = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/config");
      setAssetHeads(response.data.assetHeads || []);
      setAllocatedDepartments(response.data.allocatedDept || []);
    } catch (error) {
      console.error("Error fetching values:", error);
    }
  };

  useEffect(() => {
    fetchValues();
  }, []);

  const updateConfig = async (updatedAssetHeads, updatedAllocatedDepts) => {
    try {
      await axios.put("http://localhost:5000/api/admin/update-config", {
        assetHeads: updatedAssetHeads,
        allocatedDept: updatedAllocatedDepts,
      });
    } catch (error) {
      console.error("Error updating config:", error);
    }
  };

  const handleAddAssetHead = async () => {
    if (newAssetHead.trim()) {
      const updatedAssetHeads = [...assetHeads, newAssetHead];
      setAssetHeads(updatedAssetHeads);
      setNewAssetHead("");
      await updateConfig(updatedAssetHeads, allocatedDepartments);
    }
  };

  const handleAddAllocatedDept = async () => {
    if (newAllocatedDept.trim()) {
      const updatedAllocatedDepts = [...allocatedDepartments, newAllocatedDept];
      setAllocatedDepartments(updatedAllocatedDepts);
      setNewAllocatedDept("");
      await updateConfig(assetHeads, updatedAllocatedDepts);
    }
  };

  const handleDeleteAssetHead = async (head) => {
    const updatedAssetHeads = assetHeads.filter((h) => h !== head);
    setAssetHeads(updatedAssetHeads);
    await updateConfig(updatedAssetHeads, allocatedDepartments);
  };

  const handleDeleteAllocatedDept = async (dept) => {
    const updatedAllocatedDepts = allocatedDepartments.filter((d) => d !== dept);
    setAllocatedDepartments(updatedAllocatedDepts);
    await updateConfig(assetHeads, updatedAllocatedDepts);
  };

  const handleCreateHod = async () => {
    if (hodName && hodEmail && hodPassword && hodDepartment) {
      try {
        await axios.post("http://localhost:5000/api/admin/createuser", {
          name: hodName,
          email: hodEmail,
          password: hodPassword,
          userLevel: 2,
          userType: "HOD",
          allocatedDept: hodDepartment,
        });
        setHodName("");
        setHodEmail("");
        setHodPassword("");
        setHodDepartment("");
        alert(`Head of Department of  ${hodDepartment} created Successfully!`)
      } catch (error) {
        console.error("Error creating HOD:", error);
      }
    } else {
      console.error("Please fill all fields");
    }
  };

  const handleCreateDeptInCharge = async() => {
    if(deptInChargeName && deptInChargeEmail && deptInChargePassword && deptInChargeDepartment){
    try {
      await axios.post("http://localhost:5000/api/admin/createuser", {
        name: deptInChargeName,
        email: deptInChargeEmail,
        password: deptInChargePassword,
        userLevel: 5,
        userType: "DeptInCharge",
        allocatedDept: deptInChargeDepartment,
      });
      setDeptInChargeName("");
      setDeptInChargeEmail("");
      setDeptInChargePassword("");
      setDeptInChargeDepartment("");
      alert(`Department-In-Charge of ${deptInChargeDepartment} created Successfully!`)
    } catch (error) {
      console.error("Error Creating Department-in-charge", error);
    }
  }else{
    console.error("PLease fill in all fields");
    
  }
}

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userLevel');
  window.location.href = '/login';
};

  const renderContent = () => {
    switch (activeTab) {
      case "departments":
        return (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Manage Allocated Departments
            </Typography>
            <TextField
              fullWidth
              label="Add new Allocated Department"
              value={newAllocatedDept}
              onChange={(e) => setNewAllocatedDept(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary" onClick={handleAddAllocatedDept}>
              Add
            </Button>
            <Divider sx={{ my: 2 }} />
            {allocatedDepartments.map((dept) => (
              <Box key={dept} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>{dept}</Typography>
                <Button variant="outlined" color="secondary" onClick={() => handleDeleteAllocatedDept(dept)}>
                  Delete
                </Button>
              </Box>
            ))}
          </Paper>
        );
      case "assetheads":
        return (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Manage Asset Heads
            </Typography>
            <TextField
              fullWidth
              label="Add new Asset Head"
              value={newAssetHead}
              onChange={(e) => setNewAssetHead(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary" onClick={handleAddAssetHead}>
              Add
            </Button>
            <Divider sx={{ my: 2 }} />
            {assetHeads.map((head) => (
              <Box key={head} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>{head}</Typography>
                <Button variant="outlined" color="secondary" onClick={() => handleDeleteAssetHead(head)}>
                  Delete
                </Button>
              </Box>
            ))}
          </Paper>
        );
      case "addHod":
        return (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create New HOD
            </Typography>
            <TextField fullWidth label="HOD Name" value={hodName} onChange={(e) => setHodName(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth type="email" label="HOD Email" value={hodEmail} onChange={(e) => setHodEmail(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth type="password" label="HOD Password" value={hodPassword} onChange={(e) => setHodPassword(e.target.value)} sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Department</InputLabel>
              <Select value={hodDepartment} onChange={(e) => setHodDepartment(e.target.value)} label="Department">
                <MenuItem value="">
                  <em>Select Department</em>
                </MenuItem>
                {allocatedDepartments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={handleCreateHod}>
              Create HOD
            </Button>
          </Paper>
        );
      case "addDeptInCharge":
        return (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create New Department In Charge
            </Typography>
            <TextField fullWidth label="Name of Dept-in-charge" value={deptInChargeName} onChange={(e) => setDeptInChargeName(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth type="email" label="Email of Dept-in-charge" value={deptInChargeEmail} onChange={(e) => setDeptInChargeEmail(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth type="password" label="Set Password" value={deptInChargePassword} onChange={(e) => setDeptInChargePassword(e.target.value)} sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel> Select Department</InputLabel>
              <Select value={deptInChargeDepartment} onChange={(e) => setDeptInChargeDepartment(e.target.value)} label="Select Department">
                <MenuItem value="">
                  <em>Select Department</em>
                </MenuItem>
                {allocatedDepartments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={handleCreateDeptInCharge}>
              Create Department-in-charge
            </Button>
          </Paper>
        );

      case "updateProfile":
        return <Profile />
        
      default:
        return null;
    }
  };

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar sx={{ justifyContent: "center" }}>
          <Button color="inherit" onClick={() => setActiveTab("departments")} sx={{ mx: 2 }}>
            View Departments
          </Button>
          <Button color="inherit" onClick={() => setActiveTab("assetheads")} sx={{ mx: 2 }}>
            View Asset Heads
          </Button>
          <Button color="inherit" onClick={() => setActiveTab("addHod")} sx={{ mx: 2 }}>
            Add New Head of Department
          </Button>
          <Button color="inherit" onClick={() => setActiveTab("addDeptInCharge")} sx={{ mx: 2 }}>
            Add New Department In Charge
          </Button>
          <Button color="inherit" onClick={() => setActiveTab("updateProfile")} sx={{ mx: 2 }}>
            Update Profile
          </Button>
          <Button color="inherit" onClick={() => logout()} sx={{ mx: 2 }}>
            LOGOUT
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        {renderContent()}
      </Container>
    </Box>
  );
};

export default AdminManagement;
