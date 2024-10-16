import React, { useState, useEffect } from "react";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig"; // Import Firebase storage
import StockQuery from "./StockQuery";
import "../styles/PurchaseInCharge.css"
import Profile from './Profile';
function PurchaseInCharge() {
  const [stocks, setStocks] = useState([]);
  const [approvedStocks, setApprovedStocks] = useState([]);
  const [assetHeads, setAssetHeads] = useState([]);
  const [allocatedDepartments, setAllocatedDepartments] = useState([]);
  const [selectedOption, setSelectedOption] = useState('Add Stock'); // New state variable
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
    allocatedDept: "",
    hodApprovalStatus: "pending",
    principalApprovalStatus: "pending",
    directorApprovalStatus: "pending",
    rejectionReason: '',
    rejectedBy: ''
  });

  const [editId, setEditId] = useState(null);

  // Fetch config (assetHeads and allocatedDept) from backend
  const fetchConfig = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/config");
      setAssetHeads(res.data.assetHeads || []);
      setAllocatedDepartments(res.data.allocatedDept || []);
    } catch (err) {
      console.error("Error fetching config", err);
    }
  };

const fetchStocks = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/items/groupStocks");
    setStocks(res.data);  // This will now hold grouped data with details
  } catch (err) {
    console.error("Error fetching items", err);
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
    fetchStocks();
    fetchApprovedStocks();
    fetchConfig(); // Load asset heads and allocated departments from config
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStockData({ ...stockData, [name]: value });
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  }
  const uploadFile = async () => {
    if (!file) return null;
    const storageRef = ref(storage, `bills/${file.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl; // Return the download URL for use
    } catch (error) {
      console.error("File upload failed", error);
      return null; // Return null if the upload fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let uploadedBillUrl = "";
      if (file) {
        uploadedBillUrl = await uploadFile(); // Get the uploaded file URL
      }
      // Ensure the correct bills URL is used
      if (editId) {
        const encodedId = encodeURIComponent(editId);
        await axios.put(
          `http://localhost:5000/api/items/put/${encodedId}`,
          {
            ...stockData,
            bills: uploadedBillUrl || stockData.bills, // Set the bill file URL or keep the existing one
          }
        );
      } else {
        await axios.post("http://localhost:5000/api/items/post", {
          ...stockData,
          bills: uploadedBillUrl, // Set the bill file URL
        });
      }

      setEditId(null);
      fetchStocks();
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
        allocatedDept: "",
        hodApprovalStatus: "pending",
        principalApprovalStatus: "pending",
        directorApprovalStatus: "pending"
      });
      setSelectedOption('Stocks for Approval');
    } catch (error) {
      console.error("Error adding/updating item", error);
    }
  };
  const handleEdit = (stock) => {
    setStockData({
      assetHeads: stock.assetHeads,
      specification: stock.specification,
      vendorName: stock.vendorName,
      quantity: stock.quantity,
      batchNo: stock.batchNo,
      totalAmount: stock.totalAmount,
      roomNo: stock.roomNo,
      dateOfPurchase: stock.dateOfPurchase,
      purpose: stock.purpose,
      financialYear: stock.financialYear,
      bills: stock.bills,
      allocatedDept: stock.allocatedDept,
      hodApprovalStatus: stock.hodApprovalStatus,
      principalApprovalStatus: stock.principalApprovalStatus,
      directorApprovalStatus: stock.directorApprovalStatus
    });
    setEditId(stock._id);
    setSelectedOption('Add Stock'); // Redirect to Add Stock to edit
  };
  const handleDelete = async (id) => {
    try {
      const encodedId = encodeURIComponent(id);
      await axios.delete(`http://localhost:5000/api/items/delete/${encodedId}`);
      fetchStocks();
    } catch (err) {
      console.error("Error deleting item", err);
    }
  };
  const rejectedStocks = stocks.filter(
    (group) =>
      group.details.some(stock => {
       return ( stock.hodApprovalStatus === 'rejected' ||
        stock.principalApprovalStatus === 'rejected' ||
        stock.directorApprovalStatus === 'rejected')
      })

  );
  const addToFinalDatabase = async (stock) => {
    try {
      await axios.post("http://localhost:5000/api/items/add", { _id: stock._id });
      alert("Stock successfully added to the Final database");

      await axios.put(`http://localhost:5000/api/items/put/${stock._id}`, {
        ...stock,
        assessmentStatus: 'completed',
      });

      setStocks(stocks.filter((s) => s._id !== stock._id));
      fetchApprovedStocks();
    } catch (err) {
      console.error("Error adding stock to the new database", err);
    }
  };
  const addAllApprovedStocksToDatabase = async (group) => {
    const allApproved = group.details.every(stock =>
      stock.hodApprovalStatus === 'approved' &&
      stock.principalApprovalStatus === 'approved' &&
      stock.directorApprovalStatus === 'approved'
    );

    if (allApproved) {
      for (const stock of group.details) {
        await addToFinalDatabase(stock);
      }
    } else {
      alert("Not all stocks are approved.");
    }
  };
  const toggleDrillDown = (index) => {
    setStocks((prevStocks) =>
      prevStocks.map((stock, i) =>
        i === index ? { ...stock, drillDown: !stock.drillDown } : stock
      )
    );
  };
  const toggleApprovedDrillDown = (index) => {
    setApprovedStocks((prevStocks) =>
      prevStocks.map((stock, i) =>
        i === index ? { ...stock, drillDown: !stock.drillDown } : stock
      )
    );
  }
  return (
    <div className="purchase-in-charge-container">
      <div className="sidebarParent">
        <div className="sidebar">
          <button onClick={() => setSelectedOption('Add Stock')}>Add Stock</button>
          <button onClick={() => setSelectedOption('Stocks for Approval')}>Stocks for Approval</button>
          <button onClick={() => setSelectedOption('Approved Stocks')}>Approved Stocks</button>
          {rejectedStocks.length > 0 && (
            <button onClick={() => setSelectedOption('Rejected Stocks')}>Some Stocks Have Been Rejected.Click to View</button>
          )}
          <button onClick={() => setSelectedOption('Fetch Stocks')}>Fetch Stocks</button>
          <button onClick={() => setSelectedOption('Update Profile')}>Update Profile</button>
        </div>
      </div>
      <div className="content">
        {selectedOption === 'Add Stock' && (
          <div>
            <h1>Add Stock</h1>
            <form onSubmit={handleSubmit} className="stock-form">
              <label>
                Asset Head:
                <select
                  name="assetHeads"
                  value={stockData.assetHeads}
                  onChange={handleChange}
                  required>
                  <option value="">Select an Asset Head</option>
                  {assetHeads.map((head, index) => (
                    <option key={index} value={head}>
                      {head}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Type/Specification:
                <input
                  type="text"
                  name="specification"
                  value={stockData.specification}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Vendor Name:
                <input
                  type="text"
                  name="vendorName"
                  value={stockData.vendorName}
                  onChange={handleChange}
                />
              </label>
              <label>
                Quantity:
                <input
                  type="number"
                  name="quantity"
                  value={stockData.quantity}
                  onChange={handleChange}
                />
              </label>
              <label>
                Batch No:
                <input
                  type="text"
                  name="batchNo"
                  value={stockData.batchNo}
                  onChange={handleChange}
                />
              </label>
              <label>
                Total Amount:
                <input
                  type="number"
                  name="totalAmount"
                  value={stockData.totalAmount}
                  onChange={handleChange}
                />
              </label>
              <label>
                Room No.:
                <input
                  type="text"
                  name="roomNo"
                  value={stockData.roomNo}
                  onChange={handleChange}
                />
              </label>
              <label>
                Date of Purchase:
                <input
                  type="date"
                  name="dateOfPurchase"
                  value={stockData.dateOfPurchase}
                  onChange={handleChange}
                />
              </label>
              <label>
                Purpose:
                <input
                  type="text"
                  name="purpose"
                  value={stockData.purpose}
                  onChange={handleChange}
                />
              </label>
              <label>
                Financial Year:
                <input
                  type="text"
                  name="financialYear"
                  value={stockData.financialYear}
                  onChange={handleChange}
                />
              </label>
              <label>
                Bills (Invoice):
                <input type="file" name="bills" onChange={handleFileChange} />
              </label>
              <label>
                Allocated Department:
                <select
                  name="allocatedDept"
                  value={stockData.allocatedDept}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Department</option>
                  {allocatedDepartments.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit">{editId ? "Update" : "Add"} Stock</button>
            </form>
          </div>
        )}
        {selectedOption === 'Stocks for Approval' && (
          <div>
            <h1>Stocks For Approval</h1>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Asset Head</th>
                  <th>Type/Specification</th>
                  <th>Date of Purchase</th>
                  <th>Financial Year</th>
                  <th>Batch No</th>
                  <th>Total Quantity</th>
                  <th>Department</th>
                  <th>Amount</th>
                  <th>Room No.</th>
                  <th>Vendor Name</th> 
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((group, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td>{group._id.assetHeads}</td>
                      <td>{group._id.specification}</td>
                      <td>{group._id.dateOfPurchase}</td>
                      <td>{group._id.financialYear}</td>
                      <td>{group._id.batchNo}</td>
                      <td>{group.totalQuantity}</td>
                      <td>{group._id.allocatedDept}</td>
                      <td>{group._id.totalAmount}</td>
                      <td>{group._id.roomNo}</td>
                      <td>{group._id.vendorName}</td>
                      <td>
                        <button onClick={() => toggleDrillDown(index)}>
                          {group.drillDown ? "View Less" : "View All Stocks"}
                        </button>
                      </td>
                      <td>

                      </td>
                    </tr>
                    {group.drillDown && (
                      <tr>
                        <td colSpan="16">
                          <table className="drilldown-table">
                            <thead>
                              <tr>
                                <th>Individual Stock Unique ID</th>
                                <th>Asset Head</th>
                                <th>Type/Specification</th>
                                <th>Date of Purchase</th>
                                <th>Financial Year</th>
                                <th>Batch No</th>
                                <th>Total Quantity</th>
                                <th>Department</th>
                                <th>Amount</th>
                                <th>Room No.</th>
                                <th>Vendor Name</th>
                                <th>Invoice</th>
                                <th>Approval By HOD</th>
                                <th>Approval By Principal</th>
                                <th>Approval By Director</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.details.map((stock, idx) => (
                                <tr key={idx}>
                                  <td>{stock._id}</td>
                                  <td>{stock.assetHeads}</td>
                                  <td>{stock.specification}</td>
                                  <td>{stock.dateOfPurchase}</td>
                                  <td>{stock.financialYear}</td>
                                  <td>{stock.batchNo}</td>
                                  <td>{stock.quantity}</td>
                                  <td>{stock.allocatedDept}</td>
                                  <td>{stock.totalAmount}</td>
                                  <td>{stock.roomNo}</td>
                                  <td>{stock.vendorName}</td>
                                  <td>{
                                     <a href= {stock.bills} target="_blank" rel="noopener noreferrer">View Invoice</a>
                                    }
                                  </td>
                                  <td>{stock.hodApprovalStatus}</td>
                                  <td>{stock.principalApprovalStatus}</td>
                                  <td>{stock.directorApprovalStatus}</td>
                                  <td>
                              {stock.hodApprovalStatus === 'approved' &&
                                stock.principalApprovalStatus === 'approved' &&
                                stock.directorApprovalStatus === 'approved' ? (
                                <button onClick={() => addToFinalDatabase(stock)}>Add to Database</button>
                              ) : (
                                <>
                                  <button onClick={() => handleEdit(stock)}>Edit</button>
                                  <button onClick={() => handleDelete(stock._id)}>Delete</button>
                                </>
                              )}
                            </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      
                    )}
                     <tr>
                        <td colSpan="16">
                          <button onClick={() => addAllApprovedStocksToDatabase(group)} style={{ marginTop: '10px' }}>Add Only Approved Stocks</button>
                        </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selectedOption === 'Approved Stocks' && (
          <div>
            <h1>Approved Stock List</h1>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Asset Head</th>
                  <th>Type/Specification</th>
                  <th>Date of Purchase</th>
                  <th>Financial Year</th>
                  <th>Batch No</th>
                  <th>Quantity</th>
                  <th>Department</th>
                  <th>Amount</th>
                  <th>Room No.</th>
                  <th>Vendor Name</th>
                </tr>
              </thead>
              <tbody>
              {approvedStocks.map((group, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td>{group._id.assetHeads}</td>
                      <td>{group._id.specification}</td>
                      <td>{group._id.dateOfPurchase}</td>
                      <td>{group._id.financialYear}</td>
                      <td>{group._id.batchNo}</td>
                      <td>{group.totalQuantity}</td>
                      <td>{group._id.allocatedDept}</td>
                      <td>{group._id.totalAmount}</td>
                      <td>{group._id.roomNo}</td>
                      <td>{group._id.vendorName}</td>        
                      <td>
                        <button onClick={() => toggleApprovedDrillDown(index)}>
                          {group.drillDown ? "View Less" : "View All Stocks"}
                        </button>
                      </td>
                    </tr>
                    {group.drillDown && (
                      <tr>
                        <td colSpan="16">
                          <table className="drilldown-table">
                            <thead>
                              <tr>
                                <th>Individual Stock Unique ID</th>
                                <th>Asset Head</th>
                                <th>Type/Specification</th>
                                <th>Date of Purchase</th>
                                <th>Financial Year</th>
                                <th>Batch No</th>
                                <th>Total Quantity</th>
                                <th>Department</th>
                                <th>Amount</th>
                                <th>Room No.</th>
                                <th>Vendor Name</th>
                                <th>Invoice</th>
                                <th>Approval By HOD</th>
                                <th>Approval By Principal</th>
                                <th>Approval By Director</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.details.map((stock, idx) => (
                                <tr key={idx}>
                                  <td>{stock._id}</td>
                                  <td>{stock.assetHeads}</td>
                                  <td>{stock.specification}</td>
                                  <td>{stock.dateOfPurchase}</td>
                                  <td>{stock.financialYear}</td>
                                  <td>{stock.batchNo}</td>
                                  <td>{stock.quantity}</td>
                                  <td>{stock.allocatedDept}</td>
                                  <td>{stock.totalAmount}</td>
                                  <td>{stock.roomNo}</td>
                                  <td>{stock.vendorName}</td>
                                  <td>{
                                     <a href= {stock.bills} target="_blank" rel="noopener noreferrer">View Invoice</a>
                                    }
                                  </td>
                                  <td>{stock.hodApprovalStatus}</td>
                                  <td>{stock.principalApprovalStatus}</td>
                                  <td>{stock.directorApprovalStatus}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            
          </div>
        )}
         {selectedOption === 'Rejected Stocks' && (
      <div>
        <h1>Rejected Stocks</h1>
        {rejectedStocks.length > 0 ? (
          <table className="styled-table">
            <thead>
              <tr>
                <th>Stock Unique Identification</th>
                <th>Asset Head</th>
                <th>Specification</th>
                <th>Vendor Name</th>
                <th>Batch No</th>
                <th>Allocated Dept</th>
                <th>Date of Purchase</th>
                <th>Financial Year</th>
                <th>Rejected By</th>
                <th>Rejection Reason</th>
              </tr>
            </thead>
            <tbody>
              {rejectedStocks.map((group) =>
                group.details.map((stock) => (
                  stock.hodApprovalStatus === 'rejected' ||
                  stock.principalApprovalStatus === 'rejected' ||
                  stock.directorApprovalStatus === 'rejected' ? (
                    <tr key={stock._id}>
                      <td>{stock._id}</td>
                      <td>{stock.assetHeads}</td>
                      <td>{stock.specification}</td>
                      <td>{stock.vendorName}</td>
                      <td>{stock.batchNo}</td>
                      <td>{stock.allocatedDept}</td>
                      <td>{stock.dateOfPurchase}</td>
                      <td>{stock.financialYear}</td>
                      <td>{stock.rejectedBy}</td>
                      <td>{stock.rejectionReason}</td>
                      <td>
                        <button className="edit-btn" type="button" onClick={() => handleEdit(stock)}>EDIT STOCK</button>
                      </td>
                    </tr>
                  ) : null
                ))
              )}
            </tbody>
          </table>
        ) : (
          <p>No rejected stocks to display.</p>
        )}
      </div>
    )}
        {
          selectedOption === 'Fetch Stocks' && (
            <><StockQuery /></>
          )
        }
        {
          selectedOption === 'Update Profile' && (
              <Profile />
          )
        }
      </div>
    </div>
  );
}
export default PurchaseInCharge;