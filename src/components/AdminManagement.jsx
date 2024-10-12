import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/adminmanagement.css"; // Import your updated CSS

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

  return (
    <div className="admin-management-container">
      <h1 className="admin-dashboard-heading">Admin Dashboard</h1> {/* Added Heading */}
      
      <div className="section-wrapper">
        <div className="section">
          <h2 className="section-title">Manage Asset Heads</h2>
          <div className="input-container">
            <input
              type="text"
              value={newAssetHead}
              onChange={(e) => setNewAssetHead(e.target.value)}
              className="input-field"
              placeholder="Add new Asset Head"
            />
            <button onClick={handleAddAssetHead} className="add-button">
              Add
            </button>
          </div>
          <ul className="list">
            {assetHeads.map((head) => (
              <li key={head} className="list-item">
                {head}{" "}
                <button onClick={() => handleDeleteAssetHead(head)} className="delete-button">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="section">
          <h2 className="section-title">Manage Allocated Departments</h2>
          <div className="input-container">
            <input
              type="text"
              value={newAllocatedDept}
              onChange={(e) => setNewAllocatedDept(e.target.value)}
              className="input-field"
              placeholder="Add new Allocated Department"
            />
            <button onClick={handleAddAllocatedDept} className="add-button">
              Add
            </button>
          </div>
          <ul className="list">
            {allocatedDepartments.map((dept) => (
              <li key={dept} className="list-item">
                {dept}{" "}
                <button onClick={() => handleDeleteAllocatedDept(dept)} className="delete-button">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
