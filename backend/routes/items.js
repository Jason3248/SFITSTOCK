const express = require('express');
const stock = require('../models/stock');
const approvedStock = require('../models/approvedStock')
const router = express.Router();
const XLSX = require('xlsx');
const { generateStockId } = require('../../src/utils/stockIdHelper')
const deptStock = require('../models/deptStock')
const instStock = require('../models/instStock')


router.post('/final', async (req, res) => {
  const {
    _id,
    assetHeads,
    specification,
    dateOfPurchase,
    financialYear,
    batchNo,
    vendorName,
    quantity,
    totalAmount,
    roomNo,
    purpose,
    bills,
    allocatedDept,
  } = req.body;

  if (!allocatedDept || !roomNo || !specification || !quantity) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingStocks = await stock.find({
      allocatedDept,
      roomNo,
      specification,
      dateOfPurchase,
      vendorName,
    }).sort({ _id: 1 });

    let maxQuantity = 0;
    if (existingStocks.length > 0) {
      const lastStock = existingStocks[existingStocks.length - 1];
      const parts = lastStock._id.split('/');
      maxQuantity = parseInt(parts[5]);
    }

    for (let i = 1; i <= quantity; i++) {
      const newId = `${allocatedDept}/${roomNo}/${specification}/${dateOfPurchase}/${vendorName}/${maxQuantity + i}`;
      const newStock = new approvedStock({
        _id: newId,
        assetHeads,
        specification,
        dateOfPurchase,
        financialYear,
        batchNo,
        vendorName,
        quantity: 1,
        totalAmount,
        roomNo,
        purpose,
        bills,
        allocatedDept,
      });

      await newStock.save();
    }

    res.status(201).json({ message: `${quantity} stock items added successfully` });
  } catch (err) {
    console.error("Error creating stock items:", err);
    res.status(500).json({ error: 'Failed to create item', details: err.message });
  }
});

router.get("/department/:department", async (req, res) => {
  try {
    const { department } = req.params;
    const stocks = await deptStock.find({ allocatedDept: department });
    return res.status(200).json(stocks);
  } catch (err) {
    console.error("Error fetching department stocks:", err);
    return res.status(500).json({ error: "Failed to fetch stocks" });
  }
});

// router.post("/uploadStockExcel", async (req, res) => {
//   try {
//     const { stocks } = req.body;

//     if (!stocks || !Array.isArray(stocks)) {
//       return res.status(400).json({ error: "Invalid data format." });
//     }

//     const newStocks = stocks.map(stock => {
//       const { assetHeads, specification, vendorName, quantity, batchNo, totalAmount, roomNo, dateOfPurchase, purpose, financialYear, bills, stockType, allocatedDept } = stock;
      
//       // Validate required fields
//       if (!assetHeads || !specification || !vendorName || !quantity || !batchNo || !totalAmount || !dateOfPurchase || !purpose || !financialYear || !stockType) {
//         throw new Error("Missing required fields in stock data.");
//       }

//       let parsedAllocatedDept = [];
//       if (stockType === "Departmental Stock") {
//         try {
//           parsedAllocatedDept = JSON.parse(allocatedDept);
//           if (typeof parsedAllocatedDept !== "object") throw new Error();
//         } catch (e) {
//           throw new Error("Invalid allocatedDept format. It should be a JSON object.");
//         }
//       }

//       return {
//         assetHeads,
//         specification,
//         vendorName,
//         quantity: parseInt(quantity),
//         batchNo,
//         totalAmount: parseFloat(totalAmount),
//         roomNo: stockType === "Institutional Stock" ? roomNo : "",
//         dateOfPurchase,
//         purpose,
//         financialYear,
//         bills,
//         stockType,
//         allocatedDept: stockType === "Departmental Stock" ? Object.entries(parsedAllocatedDept).map(([dept, allocatedQuantity]) => ({ department: dept, allocatedQuantity })) : []
//       };
//     });

//     // Insert into MongoDB
//     await approvedStock.insertMany(newStocks);

//     res.status(200).json({ message: "Stocks uploaded successfully." });

//   } catch (error) {
//     console.error("Error processing Excel upload:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
router.post("/uploadStockExcel", async (req, res) => {
  try {
    const { stocks } = req.body;

    if (!stocks || !Array.isArray(stocks)) {
      return res.status(400).json({ error: "Invalid data format." });
    }

    let createdStocks = [];

    for (const stock of stocks) {
      const {
        assetHeads,
        specification,
        vendorName,
        quantity,
        batchNo,
        totalAmount,
        roomNo,
        dateOfPurchase,
        purpose,
        financialYear,
        bills,
        stockType,
        allocatedDept
      } = stock;

      // Validate required fields
      if (!assetHeads || !specification || !vendorName || !quantity || !batchNo || !totalAmount || !dateOfPurchase || !purpose || !financialYear || !stockType) {
        throw new Error("Missing required fields in stock data.");
      }

      const individualAmount = totalAmount / quantity;

      let parsedAllocatedDept = [];
      if (stockType === "Departmental Stock") {
        try {
          parsedAllocatedDept = JSON.parse(allocatedDept);
          if (typeof parsedAllocatedDept !== "object") throw new Error();
        } catch (e) {
          throw new Error("Invalid allocatedDept format. It should be a JSON object.");
        }
      }

      // Save stock to approvedStock collection
      const newApprovedStock = new approvedStock({
        assetHeads,
        specification,
        vendorName,
        quantity: parseInt(quantity),
        batchNo,
        totalAmount: parseFloat(totalAmount),
        roomNo: stockType === "Institutional Stock" ? roomNo : "",
        dateOfPurchase,
        purpose,
        financialYear,
        bills,
        stockType,
        allocatedDept: stockType === "Departmental Stock" ? Object.entries(parsedAllocatedDept).map(([dept, allocatedQuantity]) => ({ department: dept, allocatedQuantity })) : []
      });

      await newApprovedStock.save();

      // If Institutional Stock, create entries in instStock
      if (stockType === "Institutional Stock") {
        for (let i = 1; i <= quantity; i++) {
          const uniqueId = `INST/${specification}/${dateOfPurchase}/${vendorName}/${batchNo}/${i}`;

          const newInstitutionalStock = new instStock({
            _id: uniqueId,
            assetHeads,
            specification,
            vendorName,
            quantity: 1,
            dateOfPurchase,
            financialYear,
            batchNo,
            totalAmount,
            individualAmount,
            bills,
            purpose,
            stockType: "Institutional Stock",
            roomNo,
            status: "Approved"
          });

          await newInstitutionalStock.save();
          createdStocks.push(newInstitutionalStock);
        }
      }

      // If Departmental Stock, create entries in deptStock
      if (stockType === "Departmental Stock") {
        for (let dept of Object.entries(parsedAllocatedDept)) {
          const [department, allocatedQuantity] = dept;

          for (let i = 1; i <= allocatedQuantity; i++) {
            const uniqueId = `${department}/${specification}/${dateOfPurchase}/${vendorName}/${batchNo}/${i}`;

            const newDepartmentalStock = new deptStock({
              _id: uniqueId,
              assetHeads,
              specification,
              vendorName,
              quantity: 1,
              dateOfPurchase,
              financialYear,
              batchNo,
              totalAmount,
              individualAmount,
              bills,
              purpose,
              allocatedDept: department,
              roomNo: "",
              status: "Pending"
            });

            await newDepartmentalStock.save();
            createdStocks.push(newDepartmentalStock);
          }
        }
      }
    }

    res.status(200).json({
      message: "Stocks uploaded successfully.",
      createdStocks
    });

  } catch (error) {
    console.error("Error processing Excel upload:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});


router.get("/departmentGrouped/:department", async (req, res) => {
  try {
    const { department } = req.params;

    // Aggregate stocks by batch entry (keeping them separate per addition)
    const groupedStocks = await deptStock.aggregate([
      {
        $match: { allocatedDept: department, roomNo: "" } // Only unallocated stocks
      },
      {
        $group: {
          _id: { 
            assetHeads: "$assetHeads",
            specification: "$specification",
            vendorName: "$vendorName",
            batchNo: "$batchNo",
            dateOfPurchase: "$dateOfPurchase"
          },
          totalQuantity: { $sum: 1 },
          stocks: { $push: "$_id" } // Store IDs for later allocation
        }
      },
      { $sort: { "_id.dateOfPurchase": 1 } }
    ]);

    return res.status(200).json(groupedStocks);
  } catch (err) {
    console.error("Error fetching grouped stocks:", err);
    return res.status(500).json({ error: "Failed to fetch grouped stocks" });
  }
});

router.put("/assignRooms", async (req, res) => {
  try {
    const { batchDetails, roomAssignments } = req.body;
    
    if (!batchDetails || !roomAssignments || roomAssignments.length === 0) {
      return res.status(400).json({ error: "Batch details and room assignments are required" });
    }

    const { specification, vendorName, batchNo, dateOfPurchase, department } = batchDetails;

    // Fetch stocks matching the given batch details
    const unassignedStocks = await deptStock.find({
      allocatedDept: department,
      specification,
      vendorName,
      batchNo,
      dateOfPurchase,
      roomNo: "" // Only unassigned stocks
    });

    if (unassignedStocks.length === 0) {
      return res.status(400).json({ error: "No available stocks to assign for this batch" });
    }

    let updatedStocks = [];

    // Assign rooms based on the given allocation
    for (const { roomNo, quantity } of roomAssignments) {
      if (quantity > unassignedStocks.length) {
        return res.status(400).json({ error: `Not enough stocks available for room ${roomNo}` });
      }

      const stocksToAssign = unassignedStocks.splice(0, quantity);

      const updatePromises = stocksToAssign.map(stock =>
        deptStock.findByIdAndUpdate(stock._id, { roomNo, status: "Assigned" }, { new: true })
      );

      const updatedBatch = await Promise.all(updatePromises);
      updatedStocks.push(...updatedBatch);
    }

    return res.status(200).json({
      message: "Stocks assigned successfully",
      updatedStocks
    });

  } catch (err) {
    console.error("Error updating stock:", err);
    return res.status(500).json({ error: "Failed to update stock" });
  }
});



// Update roomNo for departmental stock
// router.put("/assignRoom", async (req, res) => {
//   try {
//     const { _id, roomNo } = req.body;

//     const updatedStock = await deptStock.findByIdAndUpdate(
//       _id,
//       { roomNo, status: "Assigned" },
//       { new: true }
//     );

//     if (!updatedStock) {
//       return res.status(404).json({ error: "Stock not found" });
//     }

//     return res.status(200).json({ message: "Room assigned successfully", updatedStock });
//   } catch (err) {
//     console.error("Error updating stock:", err);
//     return res.status(500).json({ error: "Failed to update stock" });
//   }
// });

// router.put("/assignRooms", async (req, res) => {
//   try {
//     const { department, roomNo, quantity } = req.body;

//     if (!department || !roomNo || !quantity) {
//       return res.status(400).json({ error: "Department, roomNo, and quantity are required" });
//     }

//     // Fetch unassigned stocks for the department
//     const unassignedStocks = await deptStock.find({
//       allocatedDept: department,
//       roomNo: ""  // Only select unassigned stocks
//     }).limit(quantity);

//     if (unassignedStocks.length === 0) {
//       return res.status(400).json({ error: "No available stocks to assign" });
//     }

//     // Update the selected stocks with the roomNo
//     const updatePromises = unassignedStocks.map(stock => 
//       deptStock.findByIdAndUpdate(stock._id, { roomNo, status: "Assigned" }, { new: true })
//     );

//     const updatedStocks = await Promise.all(updatePromises);

//     return res.status(200).json({
//       message: `${updatedStocks.length} stocks assigned to Room No ${roomNo}`,
//       updatedStocks
//     });

//   } catch (err) {
//     console.error("Error updating stock:", err);
//     return res.status(500).json({ error: "Failed to update stock" });
//   }
// });

// Add stock and allocate departmental stocks
// router.post("/addStock", async (req, res) => {
//   const {
//     assetHeads,
//     specification,
//     vendorName,
//     quantity,
//     batchNo,
//     totalAmount,
//     dateOfPurchase,
//     purpose,
//     financialYear,
//     bills,
//     allocatedDept,
//     stockType
//   } = req.body;

//   try {
//     if (!assetHeads || !specification || !vendorName || !quantity || !dateOfPurchase || !allocatedDept) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     // const stockId = generateStockId(allocatedDept, specification, stockType);

//     // Store stock in main collection
//     const newStock = new approvedStock({
      
//       assetHeads,
//       specification,
//       vendorName,
//       quantity,
//       batchNo,
//       totalAmount,
//       dateOfPurchase,
//       purpose,
//       financialYear,
//       bills,
//       allocatedDept,
//       stockType
//     });

//     await newStock.save();

//     // Creating individual departmental stocks
//     let createdStocks = [];
//     for (let dept of allocatedDept) {
//       for (let i = 1; i <= dept.allocatedQuantity; i++) {
//         const uniqueId = `${dept.department}/${specification}/${dateOfPurchase}/${vendorName}/${batchNo}/${i}`;

//         const newDepartmentalStock = new deptStock({
//           _id: uniqueId,
//           assetHeads,
//           specification,
//           vendorName,
//           quantity: 1,
//           dateOfPurchase,
//           financialYear,
//           batchNo,
//           totalAmount,
//           bills,
//           purpose,
//           allocatedDept: dept.department,
//           roomNo: "",
//           status: "Pending"
//         });

//         await newDepartmentalStock.save();
//         createdStocks.push(newDepartmentalStock);
//       }
//     }

//     return res.status(201).json({ message: `${quantity} stock items added successfully`, createdStocks });
//   } catch (err) {
//     console.error("Error adding stock:", err);
//     return res.status(500).json({ error: "Failed to add stock", details: err.message });
//   }
// });

router.post("/addStock", async (req, res) => {
  const {
    assetHeads,
    specification,
    vendorName,
    quantity,
    batchNo,
    totalAmount,
    dateOfPurchase,
    purpose,
    financialYear,
    bills,
    allocatedDept,
    stockType,
    roomNo // For Institutional Stock only
  } = req.body;

  try {
    if (!assetHeads || !specification || !vendorName || !quantity || !dateOfPurchase) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const individualAmount = totalAmount / quantity;

    // Store stock in main approvedStock collection
    const newStock = new approvedStock({
      assetHeads,
      specification,
      vendorName,
      quantity,
      batchNo,
      totalAmount,
      dateOfPurchase,
      purpose,
      financialYear,
      bills,
      allocatedDept: stockType === "Institutional Stock" ? undefined : allocatedDept,
      stockType,
      roomNo: stockType === "Institutional Stock" ? roomNo : ""
    });

    await newStock.save();

    // If Institutional Stock, create individual records in institutionalStock collection
    if (stockType === "Institutional Stock") {
      let createdInstitutionalStocks = [];

      for (let i = 1; i <= quantity; i++) {
        const uniqueId = `INST/${specification}/${dateOfPurchase}/${vendorName}/${batchNo}/${i}`;

        const newInstitutionalStock = new instStock({
          _id: uniqueId,
          assetHeads,
          specification,
          vendorName,
          quantity: 1,
          dateOfPurchase,
          financialYear,
          batchNo,
          totalAmount,
          individualAmount,
          bills,
          purpose,
          stockType: "Institutional Stock",
          roomNo, // Institutional Stocks have roomNo at the time of creation
          status: "Approved"
        });

        await newInstitutionalStock.save();
        createdInstitutionalStocks.push(newInstitutionalStock);
      }

      return res.status(201).json({ 
        message: `${quantity} institutional stock items added successfully`, 
        createdStocks: createdInstitutionalStocks 
      });
    }

    // If Departmental Stock, create individual records in deptStock collection
    if (stockType === "Departmental Stock") {
      let createdStocks = [];

      for (let dept of allocatedDept) {
        for (let i = 1; i <= dept.allocatedQuantity; i++) {
          const uniqueId = `${dept.department}/${specification}/${dateOfPurchase}/${vendorName}/${batchNo}/${i}`;

          const newDepartmentalStock = new deptStock({
            _id: uniqueId,
            assetHeads,
            specification,
            vendorName,
            quantity: 1,
            dateOfPurchase,
            financialYear,
            batchNo,
            totalAmount,
            individualAmount,
            bills,
            purpose,
            allocatedDept: dept.department,
            roomNo: "",
            status: "Pending"
          });

          await newDepartmentalStock.save();
          createdStocks.push(newDepartmentalStock);
        }
      }

      return res.status(201).json({ 
        message: `${quantity} departmental stock items added successfully`, 
        createdStocks 
      });
    }

  } catch (err) {
    console.error("Error adding stock:", err);
    return res.status(500).json({ error: "Failed to add stock", details: err.message });
  }
});



router.post('/final', async (req, res) => {
  console.log(req.body);
  
  try {
    const {
      assetHeads,
      specification,
      vendorName,
      quantity,
      batchNo,
      totalAmount,
      roomNo,
      dateOfPurchase,
      purpose,
      financialYear,
      bills,
      allocatedDept,
      stockType,
    } = req.body;

    // Generate a unique stock ID
    const stockId = generateStockId(allocatedDept, specification, stockType);

    // let uploadedBillUrl = '';
    // // If there's a bill, upload it to Firebase and get the download URL
    // if (bills) {
    //   uploadedBillUrl = await firebaseStorage.uploadFile(bills);
    // }

    // Create the new stock entry
    const newStock = new approvedStock({
      _id: stockId,  // Custom ID based on department allocation and stock type
      assetHeads,
      specification,
      vendorName,
      quantity,
      batchNo,
      totalAmount,
      roomNo: stockType === 'Institutional Stock' ? roomNo : '', // Room number only for institutional stock
      dateOfPurchase,
      purpose,
      financialYear,
      bills,  // Save the bill URL or the provided bill data
      allocatedDept,  // Array of departments for departmental stock
      stockType,
    });

    // Save the new stock entry to the database
    const savedStock = await newStock.save();
    res.status(201).json(savedStock);
  } catch (err) {
    console.error('Error creating stock entry', err);
    res.status(500).json({ error: 'Error creating stock entry' });
  }
});

// Update a stock entry (for editing existing stocks)
router.put('/put/:id',  async (req, res) => {
  const { id } = req.params;
  const {
    assetHeads,
    specification,
    vendorName,
    quantity,
    batchNo,
    totalAmount,
    roomNo,
    dateOfPurchase,
    purpose,
    financialYear,
    bills,
    allocatedDept,
    stockType,
  } = req.body;

  try {
    const updatedStock = await approvedStock.findByIdAndUpdate(
      id,
      {
        assetHeads,
        specification,
        vendorName,
        quantity,
        batchNo,
        totalAmount,
        roomNo,
        dateOfPurchase,
        purpose,
        financialYear,
        bills,
        allocatedDept,
        stockType,
      },
      { new: true }
    );
    res.status(200).json(updatedStock);
  } catch (err) {
    console.error('Error updating stock entry', err);
    res.status(500).json({ error: 'Error updating stock entry' });
  }
});

// Allocate stock to departments for Departmental Stock
router.post('/addDepartmentalStock', async (req, res) => {
  const {
    assetHeads,
    specification,
    vendorName,
    totalQuantity,
    batchNo,
    totalAmount,
    dateOfPurchase,
    purpose,
    financialYear,
    bills,
    allocatedDept,  // Array of department and allocated quantity
    stockType,
  } = req.body;

  // Calculate the total allocated quantity and check if it matches the total quantity
  const totalAllocatedQuantity = allocatedDept.reduce((sum, dept) => sum + dept.allocatedQuantity, 0);

  if (totalAllocatedQuantity !== totalQuantity) {
    return res.status(400).json({ message: 'Total allocated quantity does not match the total quantity!' });
  }

  try {
    // Create the new Departmental Stock entry
    const newStock = new approvedStock({
      assetHeads,
      specification,
      vendorName,
      totalQuantity,
      batchNo,
      totalAmount,
      dateOfPurchase,
      purpose,
      financialYear,
      bills,
      allocatedDept,  // Store the array with department and allocated quantity
      stockType,
    });

    await newStock.save();
    res.status(201).json({ message: 'Departmental Stock added successfully!', stock: newStock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding Departmental Stock', error });
  }
})


// addDepartmentalStock = async (req, res) => {
//   const {
//     assetHeads,
//     specification,
//     vendorName,
//     totalQuantity,
//     batchNo,
//     totalAmount,
//     dateOfPurchase,
//     purpose,
//     financialYear,
//     bills,
//     allocatedDept,  // Array of department and allocated quantity
//     stockType,
//   } = req.body;

//   // Calculate the total allocated quantity and check if it matches the total quantity
//   const totalAllocatedQuantity = allocatedDept.reduce((sum, dept) => sum + dept.allocatedQuantity, 0);

//   if (totalAllocatedQuantity !== totalQuantity) {
//     return res.status(400).json({ message: 'Total allocated quantity does not match the total quantity!' });
//   }

//   try {
//     // Create the new Departmental Stock entry
//     const newStock = new Stock({
//       assetHeads,
//       specification,
//       vendorName,
//       totalQuantity,
//       batchNo,
//       totalAmount,
//       dateOfPurchase,
//       purpose,
//       financialYear,
//       bills,
//       allocatedDept,  // Store the array with department and allocated quantity
//       stockType,
//     });

//     await newStock.save();
//     res.status(201).json({ message: 'Departmental Stock added successfully!', stock: newStock });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error adding Departmental Stock', error });
//   }
// };


router.get('/groupStocks', async (req, res) => {
  try {
    const groupedStocks = await stock.aggregate([
      {
        $group: {
          _id: {
          
            assetHeads: "$assetHeads",
            allocatedDept: "$allocatedDept",
            batchNo: "$batchNo",
            vendorName: "$vendorName",
            quantity: "$quantity",
            bills: "$bills",
            purpose: "$purpose",
            roomNo: "$roomNo",
            totalAmount: "$totalAmount",
            financialYear: "$financialYear",
            batchNo: "$batchNo",
            specification: "$specification",
            dateOfPurchase: "$dateOfPurchase",
            vendorName: "$vendorName"
          },
          totalQuantity: { $sum: 1 }, // Counting all documents with the same group key
          details: { $push: "$$ROOT" } // Collecting all individual stock documents
        }
      }
    ]);
    res.json(groupedStocks);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
})


router.get("/groupDeptApprovedStocks/:department", async (req, res) => {
  try {
    const department = req.params.department;

    const groupedStocks = await approvedStock.aggregate([
      {
        $addFields: {
          dateOfPurchase: { $dateFromString: { dateString: "$dateOfPurchase", format: "%Y-%m-%d" } }
        }
      },
      {
        $match: {
          dateOfPurchase: { $type: "date" },
          "allocatedDept.department": department
        }
      },
      {
        $unwind: "$allocatedDept"
      },
      {
        $match: {
          "allocatedDept.department": department
        }
      },
      {
        $group: {
          _id: {
            assetHeads: "$assetHeads",
            financialYear: "$financialYear",
            monthYear: { $dateToString: { format: "%Y-%m", date: "$dateOfPurchase" } }
          },
          totalQuantity: { $sum: "$allocatedDept.allocatedQuantity" },
          totalAmount: { $sum: "$totalAmount" },
          stocks: {
            $push: {
              specification: "$specification",
              quantity: "$allocatedDept.allocatedQuantity",
              totalAmount: "$totalAmount",
              dateOfPurchase: "$dateOfPurchase",
              bills: "$bills",
              allocatedDept: "$allocatedDept.department",
              stockType: "$stockType"
            }
          }
        }
      },
      {
        $group: {
          _id: {
            assetHeads: "$_id.assetHeads",
            monthYear: "$_id.monthYear"
          },
          totalQuantity: { $sum: "$totalQuantity" },
          totalAmount: { $sum: "$totalAmount" },
          stocks: { $push: "$stocks" }
        }
      },
      {
        $project: {
          _id: 0,
          assetHeads: "$_id.assetHeads",
          monthYear: "$_id.monthYear",
          totalQuantity: 1,
          totalAmount: 1,
          stocks: {
            $reduce: {
              input: "$stocks",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }
          }
        }
      },
      {
        $group: {
          _id: "$assetHeads",
          totalQuantity: { $sum: "$totalQuantity" },
          totalAmount: { $sum: "$totalAmount" },
          monthlyBreakdown: {
            $push: {
              monthYear: "$monthYear",
              totalQuantity: "$totalQuantity",
              totalAmount: "$totalAmount",
              stocks: "$stocks"
            }
          }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    res.json(groupedStocks);
  } catch (err) {
    console.error("Error in aggregation:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});
router.get('/groupApprovedStocks', async (req, res) => {
  try {
    const groupedStocks = await approvedStock.aggregate([
      {
        $addFields: {
          // Convert 'dateOfPurchase' string (yyyy-mm-dd) to Date object
          dateOfPurchase: { $dateFromString: { dateString: "$dateOfPurchase", format: "%Y-%m-%d" } }
        }
      },
      {
        $match: {
          dateOfPurchase: { $type: "date" } // Ensure the field is now a valid Date object
        }
      },
      // Group data strictly by monthYear
      {
        $group: {
          _id: {
            assetHeads: "$assetHeads",
            financialYear: "$financialYear",
            monthYear: { $dateToString: { format: "%Y-%m", date: "$dateOfPurchase" } }
          },
          totalQuantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$totalAmount" },
          // Aggregate stocks at this level to avoid splitting by specification
          stocks: {
            $push: {
              specification: "$specification",
              quantity: "$quantity",
              totalAmount: "$totalAmount",
              dateOfPurchase: "$dateOfPurchase",
              bills: "$bills",
              allocatedDept: "$allocatedDept",
              stockType: "$stockType"
            }
          }
        }
      },
      // Regroup to consolidate stocks at the monthYear level
      {
        $group: {
          _id: {
            assetHeads: "$_id.assetHeads",
            monthYear: "$_id.monthYear"
          },
          totalQuantity: { $sum: "$totalQuantity" },
          totalAmount: { $sum: "$totalAmount" },
          stocks: { $push: "$stocks" }
        }
      },
      {
        $project: {
          _id: 0,
          assetHeads: "$_id.assetHeads",
          monthYear: "$_id.monthYear",
          totalQuantity: 1,
          totalAmount: 1,
          stocks: {
            $reduce: {
              input: "$stocks",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }
          }
        }
      },
      {
        $group: {
          _id: "$assetHeads",
          totalQuantity: { $sum: "$totalQuantity" },
          totalAmount: { $sum: "$totalAmount" },
          monthlyBreakdown: {
            $push: {
              monthYear: "$monthYear",
              totalQuantity: "$totalQuantity",
              totalAmount: "$totalAmount",
              stocks: "$stocks"
            }
          }
        }
      },
      // Sort monthly breakdown by descending monthYear
      {
        $addFields: {
          monthlyBreakdown: {
            $sortArray: {
              input: "$monthlyBreakdown",
              sortBy: { monthYear: -1 }
            }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json(groupedStocks);
  } catch (err) {
    console.error("Error in aggregation:", err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});
// router.get('/groupApprovedStocks', async (req, res) => {
//   try {
//     const groupedStocks = await approvedStock.aggregate([
//       {
//         $addFields: {
//           // Convert 'dateOfPurchase' string (yyyy-mm-dd) to Date object
//           dateOfPurchase: { $dateFromString: { dateString: "$dateOfPurchase", format: "%Y-%m-%d" } }
//         }
//       },
//       {
//         $match: {
//           dateOfPurchase: { $type: "date" }  // Ensure the field is now a valid Date object
//         }
//       },
//       {
//         $group: {
//           _id: {
//             assetHeads: "$assetHeads",
//             financialYear: "$financialYear",
//             monthYear: { $dateToString: { format: "%Y-%m", date: "$dateOfPurchase" } } // Format as yyyy-mm
//           },
//           totalQuantity: { $sum: 1 },
//           totalAmount: { $sum: "$totalAmount" }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           assetHeads: "$_id.assetHeads",
//           totalQuantity: 1,
//           totalAmount: 1,
//           monthYear: "$_id.monthYear",
//         }
//       },
//       {
//         $group: {
//           _id: "$assetHeads",
//           totalQuantity: { $sum: "$totalQuantity" },
//           totalAmount: { $sum: "$totalAmount" },
//           monthlyBreakdown: {
//             $push: {
//               monthYear: "$monthYear",
//               totalQuantity: "$totalQuantity",
//               totalAmount: "$totalAmount"
//             }
//           }
//         }
//       },
//       { $sort: { "_id": 1 } }
//     ]);

//     res.json(groupedStocks);
//   } catch (err) {
//     console.error("Error in aggregation:", err);
//     res.status(500).json({ message: 'Server Error', error: err.message });
//   }
// });
router.get('/get', async (req, res) => {
  try {
    const items = await stock.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.put('/put/:id', async (req, res) => {
  const { assetHeads, specification, dateOfPurchase, financialYear, batchNo, vendorName, quantity, totalAmount, roomNo, purpose, bills, allocatedDept } = req.body;

  try {

    const stockId = decodeURIComponent(req.params.id);
    const stockToUpdate = await stock.findById(stockId);
    if (!stockToUpdate) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    let updatedBills = bills || stockToUpdate.bills;

    if (req.file) {
      const fileUrl = await uploadFileToFirebase(req.file); 
      updatedBills = fileUrl || updatedBills;
    }

    const updatedItem = await stock.findByIdAndUpdate(
      stockId,
      {
        assetHeads,
        specification,
        dateOfPurchase,
        financialYear,
        batchNo,
        vendorName,
        quantity,
        totalAmount,
        roomNo,
        purpose,
        bills: updatedBills,  // Update the bills field
        allocatedDept
      },
      { new: true }
    );

    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item', err });
  }
});


router.delete('/delete/:id', async (req, res) => {
  try {
    const stockId = decodeURIComponent(req.params.id);
    await stock.findByIdAndDelete(stockId);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});


router.get('/getstocks/:department',async (req, res) => {
  try {
    const department = req.params.department;
    const stocks = await stock.find({ allocatedDept: department});
    res.json(stocks);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

router.put('/approve/:department/:id', async (req, res) => {
  const { department, id } = req.params;
  const { hodApprovalStatus, rejectionReason } = req.body;
  const stockId = decodeURIComponent(id); // Decode the _id

  try {
    const update = { hodApprovalStatus };
    if (hodApprovalStatus === 'rejected') {
      update.rejectedBy = 'HOD';
      update.rejectionReason = rejectionReason;
    } else {
      update.rejectedBy = '';
      update.rejectionReason = '';
    }

    const updatedStock = await stock.findOneAndUpdate(
      { _id: stockId, allocatedDept: department },
      update,
      { new: true }
    );

    if (!updatedStock) {
      return res.status(404).send('Stock not found');
    }

    res.json(updatedStock);
  } catch (err) {
    console.error('Error updating stock approval:', err);
    res.status(500).send('Server error');
  }
});

router.get('/approve/cmpn', async (req, res) => {
  try {
    const stocks = await stock.find({ allocatedDept: 'CMPN' });
    res.json(stocks);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.put('/approve/cmpn/:id', async (req, res) => {
  try {
    const { hodApprovalStatus, rejectionReason } = req.body;
    const stockId = decodeURIComponent(req.params.id); // Decode the _id
    console.log('Decoded Stock ID:', stockId);

    const update = { hodApprovalStatus };
    if (hodApprovalStatus === 'rejected') {
      update.rejectedBy = 'HOD';
      update.rejectionReason = rejectionReason;
    } else {
      update.rejectedBy = '';
      update.rejectionReason = '';
    }

    // Use findOneAndUpdate with the decoded custom _id
    const updatedStock = await stock.findOneAndUpdate(
      { _id: stockId },
      update,
      { new: true }
    );

    if (!updatedStock) {
      return res.status(404).send('Stock not found');
    }

    res.json(updatedStock);
  } catch (err) {
    console.error('Error updating stock approval:', err);
    res.status(500).send('Server error');
  }
});

router.get('/principal-pending', async (req, res) => {
  try {
    const items = await stock.find({
      hodApprovalStatus: 'approved',
      principalApprovalStatus: 'pending'

    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

//added 19-Jan-25
router.get('/nondept-stocks', async(req, res, next) => {
  try {
    const items = await stock.find({
      allocatedDept: 'EXAM CELL'
    })
  } catch (error) {
    
  }
})

router.put('/principal/:id', async (req, res) => {
  try {
  
    const { principalApprovalStatus, rejectionReason } = req.body;
    const update = { principalApprovalStatus };
    const stockId = decodeURIComponent(req.params.id);
    if(principalApprovalStatus === 'rejected'){
      update.rejectedBy = 'Principal',
      update.rejectionReason = rejectionReason
    }else {

      update.rejectedBy = '';
      update.rejectionReason = '';
    }

    const updatedStock = await stock.findByIdAndUpdate(
      { _id: stockId },
      update,
      { new: true }
    );

    if (!updatedStock) {
      return res.status(404).send('Stock not found');
    }

    res.json(updatedStock);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/add', async (req, res) => {
  try {
    
    const { _id } = req.body; 
    const stockItem = await stock.findById(_id);
    console.log(stockItem);
    if (!stockItem) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const newApprovedStock = new approvedStock({
      _id: stockItem._id,
      assetHeads: stockItem.assetHeads, // Copy assetHeads array
      allocatedDept: stockItem.allocatedDept, // Copy allocatedDept array
      specification: stockItem.specification,
      dateOfPurchase: stockItem.dateOfPurchase,
      financialYear: stockItem.financialYear,
      batchNo: stockItem.batchNo,
      vendorName: stockItem.vendorName,
      quantity: stockItem.quantity,
      totalAmount: stockItem.totalAmount,
      roomNo: stockItem.roomNo,
      purpose: stockItem.purpose,
      bills: stockItem.bills,
      hodApprovalStatus: stockItem.hodApprovalStatus,
      principalApprovalStatus: stockItem.principalApprovalStatus,
      directorApprovalStatus: stockItem.directorApprovalStatus
    });

    await newApprovedStock.save();

    res.status(201).json(newApprovedStock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add stock to new database' });
  }
});

router.get('/getApproved', async(req, res) => {
  try {
   const approvedItems = await approvedStock.find();
    res.json(approvedItems)
  } catch (error) {
    res.status(500).json({error: 'error fetching approved items'})
  }
});

router.get('/director-pending', async (req, res) => {
  try {
    const items = await stock.find({
      hodApprovalStatus: 'approved',
      principalApprovalStatus: 'approved',
      directorApprovalStatus: 'pending'
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.put('/director/:id', async (req, res) => {
  try {
    const stockId = decodeURIComponent(req.params.id);
    const { directorApprovalStatus, rejectionReason } = req.body;
    const update = { directorApprovalStatus }

    if(directorApprovalStatus === 'rejected'){
      update.rejectedBy = 'Director',
      update.rejectionReason = rejectionReason
    }else {

      update.rejectedBy = '';
      update.rejectionReason = '';
    }

    const updatedStock = await stock.findByIdAndUpdate(
      {_id: stockId},
      update,
      { new: true }
    );

    if (!updatedStock) {
      return res.status(404).send('Stock not found');
    }

    res.json(updatedStock);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/export-excel', async (req, res) => {
  try {
    const { _id, allocatedDept, roomNo, specification, quantity, dateOfPurchase } = req.body;
    const query = {};

    if (_id) query._id = _id;
    if (allocatedDept) query.allocatedDept = allocatedDept;
    if (roomNo) query.roomNo = roomNo;
    if (specification) query.specification = specification;
    if (quantity) query.quantity = quantity;
    if (dateOfPurchase) query.dateOfPurchase = dateOfPurchase;

    const stocks = await approvedStock.find(query);

    if (!stocks || stocks.length === 0) {
      return res.status(404).send('No stocks found to export');
    }

    // Create the data array for the Excel file
    const data = stocks.map(stock => ([
      stock.allocatedDept,
      stock.roomNo,
      stock.specification,
      stock.quantity,
      stock.dateOfPurchase, // Format date
      stock.vendorName,
      stock.totalAmount,
    ]));

    // Get the current date for "Date of Report"
    const currentDate = new Date().toLocaleDateString();

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    
    const worksheetData = [
      ['ST. FRANCIS INSTITUTE OF TECHNOLOGY'], // Heading
      ['Stock Verification Report'], // Sub-heading
      [`Room No: ${roomNo || 'Not Specified'}`], // Room number dynamically populated
      [`Date of Report: ${currentDate}`], // Date of download
      [], // Empty row for separation
      ['Allocated Dept', 'Room No', 'Specification', 'Quantity', 'Date of Purchase', 'Vendor Name', 'Total Amount'], // Column headers
      ...data, // Data rows
      [], // Empty row
      ['Notes:'], // Notes or footer section
      ['This document is system-generated and confidential. Handle with care.'],
      ['Verified By: _____________________________'], // Placeholder for verification signature
    ];

    // Create a new worksheet from the data
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Apply some formatting for headings, subheadings, and columns
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Format Heading
    worksheet['A1'].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };
    
    // Format Sub-heading
    worksheet['A2'].s = { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } };
    
    // Column headers
    for (let col = 0; col <= 6; col++) {
      const headerCell = XLSX.utils.encode_cell({ r: 5, c: col });
      if (worksheet[headerCell]) {
        worksheet[headerCell].s = {
          font: { bold: true },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }
    }

 
    worksheet['!cols'] = [
      { wch: 20 }, // Allocated Dept
      { wch: 15 }, // Room No
      { wch: 25 }, // Specification
      { wch: 10 }, // Quantity
      { wch: 18 }, // Date of Purchase
      { wch: 20 }, // Vendor Name
      { wch: 15 }, // Total Amount
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stocks');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename=stocks.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
 
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting to Excel:', error.message, error.stack); // Log the error for debugging
    res.status(500).send('Server error while exporting to Excel');
  }
});

// router.post("/search", async (req, res) => {
//   try {
//     const { stockType, allocatedDept, specification, startDate, endDate } = req.body;

//     let collection = stockType === "institutional" ? instStock : deptStock;

//     let matchConditions = {};
//     if (allocatedDept) matchConditions.allocatedDept = allocatedDept;
//     if (specification) matchConditions.specification = specification;
//     if (startDate && endDate) {
//       matchConditions.dateOfPurchase = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     }

//     // Aggregate stocks by batch entry
//     const groupedStocks = await collection.aggregate([
//       { $match: matchConditions },
//       {
//         $group: {
//           _id: {
//             specification: "$specification",
//             vendorName: "$vendorName",
//             batchNo: "$batchNo",
//             allocatedDept: "$allocatedDept",
//             dateOfPurchase: "$dateOfPurchase"
//           },
//           totalQuantity: { $sum: 1 },
//           totalAmount: { $sum: { $multiply: ["$individualAmount", 1] } }, // Ensure correct total
//           stocks: { $push: "$_id" } // Store IDs for later
//         }
//       },
//       { $sort: { "_id.dateOfPurchase": 1 } }
//     ]);

//     res.status(200).json(groupedStocks);
//   } catch (err) {
//     console.error("Error fetching stock data:", err);
//     res.status(500).json({ error: "Failed to fetch stock data" });
//   }
// });


// router.post('/search', async (req, res) => {
//   const { _id, allocatedDept, roomNo, specification, quantity, startDate, endDate } = req.body;

//   try {
//     const query = {};
//     if (_id) query._id = _id;
//     if (allocatedDept) query.allocatedDept = allocatedDept;
//     if (roomNo) query.roomNo = roomNo;
//     if (specification) query.specification = specification;
//     if (quantity) query.quantity = quantity;

//     // Add date range filter
//     if (startDate && endDate) {
//       query.dateOfPurchase = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     }

//     const results = await approvedStock.find(query);
//     res.status(200).json(results);
//   } catch (err) {
//     res.status(500).json({ error: 'Error querying stocks', details: err.message });
//   }
// });

// router.post('/search', async (req, res) => {
//   const { stockType, _id, allocatedDept, roomNo, specification, quantity, startDate, endDate } = req.body;

//   try {
//     if (!stockType) {
//       return res.status(400).json({ error: 'Stock type is required' });
//     }

//     const collection = stockType === 'Institutional Stock' ? instStock : deptStock;
    
//     const query = {};
//     if (_id) query._id = _id;
//     if (allocatedDept) query.allocatedDept = allocatedDept;
//     if (roomNo) query.roomNo = roomNo;
//     if (specification) query.specification = specification;
//     if (quantity) query.quantity = quantity;
//     if (startDate && endDate) {
//       query.dateOfPurchase = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     }

//     const results = await collection.find(query);
//     res.status(200).json(results);
//   } catch (err) {
//     res.status(500).json({ error: 'Error querying stocks', details: err.message });
//   }
// });

// router.post("/search", async (req, res) => {
//   try {
//     const { stockType, allocatedDept, roomNo, specification, startDate, endDate } = req.body;

//     let matchConditions = {};
    
//     if (stockType) matchConditions.stockType = stockType;
//     if (allocatedDept) matchConditions.allocatedDept = allocatedDept;
//     if (roomNo) matchConditions.roomNo = roomNo;
//     if (specification) matchConditions.specification = specification;
//     if (startDate && endDate) {
//       matchConditions.dateOfPurchase = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     }

//     const groupedStocks = await approvedStock.aggregate([
//       { $match: matchConditions },
//       {
//         $group: {
//           _id: {
//             specification: "$specification",
//             vendorName: "$vendorName",
//             batchNo: "$batchNo",
//             dateOfPurchase: "$dateOfPurchase",
//             allocatedDept: "$allocatedDept"
//           },
//           totalQuantity: { $sum: "$quantity" },
//           totalAmount: { $sum: "$totalAmount" } // Calculate total amount
//         }
//       },
//       { $sort: { "_id.dateOfPurchase": 1 } }
//     ]);

//     res.status(200).json(groupedStocks);
//   } catch (err) {
//     console.error("Error fetching grouped stock:", err);
//     res.status(500).json({ error: "Failed to fetch stock data" });
//   }
// });
// router.post("/search", async (req, res) => {
//   try {
//     const { stockType, allocatedDept, specification, startDate, endDate, minAmount, maxAmount } = req.body;
//     console.log("Start-Date", startDate);
//     console.log("End-Date", endDate);
    

//     let collection = stockType === "institutional" ? instStock : deptStock;

//     let matchConditions = {};

//     if (allocatedDept) matchConditions.allocatedDept = allocatedDept;
//     if (specification) matchConditions.specification = specification;

//     // Aggregate stocks by batch entry
//     const groupedStocks = await collection.aggregate([
//       // Convert dateOfPurchase from string to Date
//       {
//         $addFields: {
//           convertedDate: { $toDate: "$dateOfPurchase" }
//         }
//       },

//       // Apply filters
      

    
//       {
//         $group: {
//           _id: {
//             specification: "$specification",
//             vendorName: "$vendorName",
//             batchNo: "$batchNo",
//             allocatedDept: "$allocatedDept",
//             dateOfPurchase: "$dateOfPurchase"
//           },
//           totalQuantity: { $sum: 1 },
//           totalAmount: { $sum: { $multiply: ["$individualAmount", 1] } }, // Sum totalAmount for the batch
//           stocks: { $push: "$_id" } // Store IDs for later
//         }
//       },

//       {
//         $match: {
//           ...matchConditions,
//           ...(startDate && endDate && {
//             convertedDate: { 
//               $gte: new Date(startDate), 
//               $lte: new Date(endDate) 
//             }
//           }),
//           ...(minAmount || maxAmount ? {
//             totalAmount: {
//               ...(minAmount && { $gte: parseFloat(minAmount) }),
//               ...(maxAmount && { $lte: parseFloat(maxAmount) })
//             }
//           } : {})
//         }
//       },

//       // Sort by dateOfPurchase (converted)
//       { $sort: { "_id.dateOfPurchase": 1 } }
//     ]);

//     res.status(200).json(groupedStocks);
//   } catch (err) {
//     console.error("Error fetching stock data:", err);
//     res.status(500).json({ error: "Failed to fetch stock data" });
//   }
// });


//2nd priority
// router.post("/search", async (req, res) => {
//   try {
//     const { stockType, allocatedDept, specification, startDate, endDate, minAmount, maxAmount } = req.body;
//     console.log(startDate);
//     console.log(endDate);
    
    

//     let collection = stockType === "institutional" ? instStock : deptStock;

//     // Step 1: Apply initial filters before grouping
//     let preGroupMatch = {};
//     if (allocatedDept) preGroupMatch.allocatedDept = allocatedDept;
//     if (specification) preGroupMatch.specification = specification;
//     if (startDate && endDate) {
//       preGroupMatch.dateOfPurchase = { 
//         $gte: new Date(startDate), 
//         $lte: new Date(endDate) 
//       };
//     }

//     // Step 2: Aggregation Pipeline
//     const groupedStocks = await collection.aggregate([
//       { $match: preGroupMatch }, // Apply filters before grouping
      
//       {
//         $group: {
//           _id: {
//             specification: "$specification",
//             vendorName: "$vendorName",
//             batchNo: "$batchNo",
//             allocatedDept: "$allocatedDept",
//             dateOfPurchase: "$dateOfPurchase"
//           },
//           totalQuantity: { $sum: 1 },
//           totalAmount: { $sum: { $multiply: ["$individualAmount", 1] } }, 
//           stocks: { $push: "$_id" }
//         }
//       },

//       // Step 3: Apply filters on aggregated data (e.g., totalAmount)
//       {
//         $match: {
//           ...(minAmount || maxAmount ? {
//             totalAmount: {
//               ...(minAmount && { $gte: parseFloat(minAmount) }),
//               ...(maxAmount && { $lte: parseFloat(maxAmount) })
//             }
//           } : {})
//         }
//       },

//       { $sort: { "_id.dateOfPurchase": 1 } }
//     ]);

//     res.status(200).json(groupedStocks);
//   } catch (err) {
//     console.error("Error fetching stock data:", err);
//     res.status(500).json({ error: "Failed to fetch stock data" });
//   }
// });


router.post("/search", async (req, res) => {
  try {
    const { stockType, allocatedDept, assetHead, specification, startDate, endDate, minAmount, maxAmount } = req.body;

    let collection = stockType === "institutional" ? instStock : deptStock;

    // Step 1: Initial Match Conditions
    let preGroupMatch = {};
    if (allocatedDept) preGroupMatch.allocatedDept = allocatedDept;
    if (specification) preGroupMatch.specification = specification;
    if (assetHead) preGroupMatch.assetHeads = assetHead;

    const aggregationPipeline = [
      // Step 2: Convert dateOfPurchase from string to Date
      {
        $addFields: {
          convertedDate: { $toDate: "$dateOfPurchase" }
        }
      },

      // Step 3: Apply Date Range Filter (if provided)
      {
        $match: {
          ...preGroupMatch,
          ...(startDate && endDate && {
            convertedDate: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          })
        }
      },

      // Step 4: Grouping
      {
        $group: {
          _id: {
            specification: "$specification",
            vendorName: "$vendorName",
            batchNo: "$batchNo",
            allocatedDept: "$allocatedDept",
            assetHeads: "$assetHeads",
            dateOfPurchase: "$dateOfPurchase"
          },
          totalQuantity: { $sum: 1 },
          totalAmount: { $sum: { $multiply: ["$individualAmount", 1] } },
          stocks: { $push: "$_id" }
        }
      },

      // Step 5: Apply Amount Filters After Grouping
      {
        $match: {
          ...(minAmount || maxAmount ? {
            totalAmount: {
              ...(minAmount && { $gte: parseFloat(minAmount) }),
              ...(maxAmount && { $lte: parseFloat(maxAmount) })
            }
          } : {})
        }
      },

      { $sort: { "_id.dateOfPurchase": 1 } }
    ];

    const groupedStocks = await collection.aggregate(aggregationPipeline);

    res.status(200).json(groupedStocks);
  } catch (err) {
    console.error("Error fetching stock data:", err);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});







module.exports = router;
