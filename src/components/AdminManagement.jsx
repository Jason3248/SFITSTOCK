
import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminManagement = () => {
  const [assetHeads, setAssetHeads] = useState([]);
  const [allocatedDepartments, setAllocatedDepartments] = useState([]);
  const [newAssetHead, setNewAssetHead] = useState("");
  const [newAllocatedDept, setNewAllocatedDept] = useState("");

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

  // Add new asset head
  const handleAddAssetHead = async () => {
    if (newAssetHead.trim()) {
      const updatedAssetHeads = [...assetHeads, newAssetHead];
      setAssetHeads(updatedAssetHeads);
      setNewAssetHead('');
      await updateConfig(updatedAssetHeads, allocatedDepartments);
    }
  };

  // Add new allocated department
  const handleAddAllocatedDept = async () => {
    if (newAllocatedDept.trim()) {
      const updatedAllocatedDepts = [...allocatedDepartments, newAllocatedDept];
      setAllocatedDepartments(updatedAllocatedDepts);
      setNewAllocatedDept('');
      await updateConfig(assetHeads, updatedAllocatedDepts);
    }
  };

  // Delete asset head
  const handleDeleteAssetHead = async (head) => {
    const updatedAssetHeads = assetHeads.filter(h => h !== head);
    setAssetHeads(updatedAssetHeads);
    await updateConfig(updatedAssetHeads, allocatedDepartments);
  };

  // Delete allocated department
  const handleDeleteAllocatedDept = async (dept) => {
    const updatedAllocatedDepts = allocatedDepartments.filter(d => d !== dept);
    setAllocatedDepartments(updatedAllocatedDepts);
    await updateConfig(assetHeads, updatedAllocatedDepts);
  };

  // Update config on the server
  const updateConfig = async (updatedAssetHeads, updatedAllocatedDepts) => {
    try {
      await axios.put("http://localhost:5000/api/admin/update-config", {
        assetHeads: updatedAssetHeads,
        allocatedDept: updatedAllocatedDepts
      });
    } catch (error) {
      console.error("Error updating config:", error);
    }
  };

  return (
    <div>
      <h2>Manage Asset Heads</h2>
      <input 
        type="text" 
        value={newAssetHead} 
        onChange={(e) => setNewAssetHead(e.target.value)} 
        placeholder="Add new Asset Head" 
      />
      <button onClick={handleAddAssetHead}>Add</button>
      <ul>
        {assetHeads.map((head) => (
          <li key={head}>
            {head} <button onClick={() => handleDeleteAssetHead(head)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Manage Allocated Departments</h2>
      <input 
        type="text" 
        value={newAllocatedDept} 
        onChange={(e) => setNewAllocatedDept(e.target.value)} 
        placeholder="Add new Allocated Department" 
      />
      <button onClick={handleAddAllocatedDept}>Add</button>
      <ul>
        {allocatedDepartments.map((dept) => (
          <li key={dept}>
            {dept} <button onClick={() => handleDeleteAllocatedDept(dept)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminManagement;
