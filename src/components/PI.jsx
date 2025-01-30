import React, { useState, useEffect } from "react";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig"; // Import Firebase storage
import StockQuery from "./StockQuery";
import "../styles/PurchaseInCharge.css"
import Profile from './Profile';
import ViewStocks from "./ViewStocks";

function PurchaseInCharge() {
    const [approvedStocks, setApprovedStocks] = useState([]);
    const [assetHeads, setAssetHeads] = useState([]);
    const [allocatedDepartments, setAllocatedDepartments] = useState([]);
    const [selectedOption, setSelectedOption] = useState('Add Stock');
    const [file, setFile] = useState(null);
    const [stockData, setStockData] = useState({
      _id: "",
      assetHeads: "",
      specification: "",
      vendorName: "",
      quantity: 0,
      batchNo: "",
      totalAmount: 0,
      roomNo: "",
      dateOfPurchase: "",
      purpose: "",
      financialYear: "",
      bills: "",
      stockType: "Departmental Stock",
      allocatedDept: [{ department: "", allocatedQuantity: 0 }]
    });
  
    const [editId, setEditId] = useState(null);
  
    const fetchConfig = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/config");
        setAssetHeads(res.data.assetHeads || []);
        setAllocatedDepartments(res.data.allocatedDept || []);
      } catch (err) {
        console.error("Error fetching config", err);
      }
    };
  
    const fetchApprovedStocks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/items/groupApprovedStocks");
        setApprovedStocks(res.data);
      } catch (err) {
        console.error("Error fetching approved items", err);
      }
    };
  
    useEffect(() => {
      fetchApprovedStocks();
      fetchConfig(); // Load asset heads and allocated departments from config
    }, []);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setStockData({ ...stockData, [name]: value });
    };
  
    const handleAllocatedDeptChange = (index, field, value) => {
      const updatedDept = [...stockData.allocatedDept];
      updatedDept[index][field] = value;
      setStockData({ ...stockData, allocatedDept: updatedDept });
    };
  
    const handleAddDeptAllocation = () => {
      setStockData({
        ...stockData,
        allocatedDept: [
          ...stockData.allocatedDept,
          { department: "", allocatedQuantity: 0 }
        ]
      });
    };
  
    const handleRemoveDeptAllocation = (index) => {
      const updatedDept = [...stockData.allocatedDept];
      updatedDept.splice(index, 1);
      setStockData({ ...stockData, allocatedDept: updatedDept });
    };
  
    const handleFileChange = (event) => {
      setFile(event.target.files[0]);
    };
  
    const uploadFile = async () => {
      if (!file) return null;
      const storageRef = ref(storage, `bills/${file.name}`);
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
      } catch (error) {
        console.error("File upload failed", error);
        return null;
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        let uploadedBillUrl = "";
        if (file) {
          uploadedBillUrl = await uploadFile();
        }
        
        const { assetHeads, specification, vendorName, totalAmount, batchNo, dateOfPurchase, purpose, financialYear, bills, allocatedDept, stockType, quantity } = stockData;
        
        // Handle backend call for adding stock
        await axios.post("http://localhost:5000/api/items/addStock", {
          assetHeads,
          specification,
          vendorName,
          totalAmount,
          batchNo,
          dateOfPurchase,
          purpose,
          financialYear,
          bills: uploadedBillUrl || bills,
          allocatedDept,
          stockType,
          quantity
        });
  
        setEditId(null);
        setStockData({
          _id: "",
          assetHeads: "",
          specification: "",
          vendorName: "",
          quantity: 0,
          batchNo: "",
          totalAmount: 0,
          roomNo: "",
          dateOfPurchase: "",
          purpose: "",
          financialYear: "",
          bills: "",
          stockType: "Departmental Stock",
          allocatedDept: [{ department: "", allocatedQuantity: 0 }]
        });
        setSelectedOption('Stocks');
      } catch (error) {
        console.error("Error adding/updating item", error);
      }
    };
  
    return (
      <div className="purchase-in-charge-container">
        <div className="sidebarParent">
          <div className="sidebar">
            <button onClick={() => setSelectedOption('Add Stock')}>Add Stock</button>
            <button onClick={() => setSelectedOption('Stocks')}>View Stocks</button>
          </div>
        </div>
        <div className="content">
          {selectedOption === 'Add Stock' && (
            <div>
              <h1>Add Stock</h1>
              <form onSubmit={handleSubmit} className="stock-form">
                <label>
                  Asset Head:
                  <select name="assetHeads" value={stockData.assetHeads} onChange={handleChange} required>
                    <option value="">Select an Asset Head</option>
                    {assetHeads.map((head, index) => (
                      <option key={index} value={head}>{head}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Type/Specification:
                  <input type="text" name="specification" value={stockData.specification} onChange={handleChange} required />
                </label>
                <label>
                  Vendor Name:
                  <input type="text" name="vendorName" value={stockData.vendorName} onChange={handleChange} />
                </label>
                <label>
                  Quantity:
                  <input type="number" name="quantity" value={stockData.quantity} onChange={handleChange} />
                </label>
                <label>
                  Batch No:
                  <input type="text" name="batchNo" value={stockData.batchNo} onChange={handleChange} />
                </label>
                <label>
                  Total Amount:
                  <input type="number" name="totalAmount" value={stockData.totalAmount} onChange={handleChange} />
                </label>
                <label>
                  Date of Purchase:
                  <input type="date" name="dateOfPurchase" value={stockData.dateOfPurchase} onChange={handleChange} />
                </label>
                <label>
                  Purpose:
                  <input type="text" name="purpose" value={stockData.purpose} onChange={handleChange} />
                </label>
                <label>
                  Financial Year:
                  <input type="text" name="financialYear" value={stockData.financialYear} onChange={handleChange} />
                </label>
                <label>
                  Bills (Invoice):
                  <input type="file" name="bills" onChange={handleFileChange} />
                </label>
  
                <label>
                    Stock Type:
                    <select name="stockType" value={stockData.stockType} onChange={handleChange}>
                      <option value="Departmental Stock">Departmental Stock</option>
                      <option value="Institutional Stock">Institutional Stock</option>
                    </select>
                  </label>

                  {/* Room No for Institutional Stock only */}
                  {stockData.stockType === "Institutional Stock" && (
                    <label>
                      Room No.:
                      <input type="text" name="roomNo" value={stockData.roomNo} onChange={handleChange} required />
                    </label>
                  )}

                 
                  {stockData.stockType === "Departmental Stock" && (
                    <label>
                      Allocated Departments:
                      {stockData.allocatedDept.map((dept, index) => (
                        <div key={index}>
                          <select value={dept.department} onChange={(e) => handleAllocatedDeptChange(index, "department", e.target.value)}>
                            <option value="">Select Department</option>
                            {allocatedDepartments.map((dept, i) => (
                              <option key={i} value={dept}>{dept}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={dept.allocatedQuantity}
                            onChange={(e) => handleAllocatedDeptChange(index, "allocatedQuantity", e.target.value)}
                            placeholder="Allocated Quantity"
                          />
                          <button type="button" onClick={() => handleRemoveDeptAllocation(index)}>Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={handleAddDeptAllocation}>Add Department</button>
                    </label>
)}

  
                <button type="submit">{editId ? "Update" : "Add"} Stock</button>
              </form>
            </div>
          )}
            {/* {selectedOption === 'Stocks' && (
              <><ViewStocks /></>
        )
        } */}
        </div>
      </div>
    );
  }
  
  
  export default PurchaseInCharge;
  