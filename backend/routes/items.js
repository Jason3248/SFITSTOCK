const express = require('express');
const approvedStock = require('../models/approvedStock')
const router = express.Router();
const XLSX = require('xlsx');
const { generateStockId } = require('../../src/utils/stockIdHelper')
const deptStock = require('../models/deptStock')
const instStock = require('../models/instStock')

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
      if (!assetHeads || !specification || !vendorName || !quantity || !batchNo || !totalAmount || !dateOfPurchase || !financialYear || !stockType) {
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
          const uniqueId = `INST/${assetHeads}/${specification}/${dateOfPurchase}/${vendorName}/${batchNo}/${i}`;

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
            const uniqueId = `${department}/${assetHeads}/${specification}/${dateOfPurchase}/${vendorName}/${batchNo}/${i}`;

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


router.post("/addStock", async (req, res) => {
  console.log(req.body);
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

    if (stockType === "Institutional Stock") {
      
      let createdInstitutionalStocks = [];

      for (let i = 1; i <= quantity; i++) {
        const uniqueId = `INST/${assetHeads}/${specification}/${dateOfPurchase}/${vendorName}/${batchNo}/${i}`;

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
          status: "Approved",
          batchId
        });

        await newInstitutionalStock.save();
        createdInstitutionalStocks.push(newInstitutionalStock);
      }

      return res.status(201).json({ 
        message: `${quantity} institutional stock items added successfully`, 
        createdStocks: createdInstitutionalStocks 
      });
    }

    if (stockType === "Departmental Stock") {
      let createdStocks = [];

      for (let dept of allocatedDept) {
        const batchId = `${dept.department}/${assetHeads}/${specification}/${dateOfPurchase}/${vendorName}/${financialYear}`;
        for (let i = 1; i <= dept.allocatedQuantity; i++) {
          const uniqueId = `${dept.department}/${assetHeads}/${specification}/${dateOfPurchase}/${vendorName}/${batchNo}/${i}`;

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
            status: "Pending",
            batchId
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


router.post("/searchStocks", async (req, res) => {
  try {
    const deptStocks = await deptStock.aggregate([
      {
        $group: {
          _id: {
            assetHeads: "$assetHeads",
            allocatedDept: "$allocatedDept",
            specification: "$specification",
            dateOfPurchase: "$dateOfPurchase",
            vendorName: "$vendorName",
            batchNo: "$batchNo",
            roomNo: "$roomNo",
            financialYear: "$financialYear"
          },
          totalQuantity: { $sum: 1 },
          totalAmount: { $sum: "$individualAmount" },
          stocks: { $push: "$_id" },
          details: { $push: "$$ROOT" },
          stockType: { $first: "Departmental Stock" }
        }
      }
    ]);

    const instStocks = await instStock.aggregate([
      {
        $group: {
          _id: {
            assetHeads: "$assetHeads",
            financialYear: "$financialYear",
            specification: "$specification",
            dateOfPurchase: "$dateOfPurchase",
            vendorName: "$vendorName",
            batchNo: "$batchNo",
            roomNo: "$roomNo",
            financialYear: "$financialYear"
          },
          totalQuantity: { $sum: 1 },
          totalAmount: { $sum: "$individualAmount" },
          stocks: { $push: "$_id" },
          details: { $push: "$$ROOT" },
          stockType: { $first: "Institutional Stock" }
        }
      }
    ]);

    res.status(200).json([...deptStocks, ...instStocks]);
  } catch (err) {
    console.error("Error fetching stocks:", err);
    res.status(500).json({ error: "Failed to fetch stocks" });
  }
});

// Update Stock Batch (Including _id Update)
router.put("/updateStock", async (req, res) => {
  try {
    const { stockType, batchCriteria, updatedFields } = req.body;
    let collection = stockType === "Institutional Stock" ? instStock : deptStock;

    const updateQuery = {
      assetHeads: batchCriteria.assetHeads,
      allocatedDept: batchCriteria.allocatedDept,
      specification: batchCriteria.specification,
      dateOfPurchase: batchCriteria.dateOfPurchase,
      vendorName: batchCriteria.vendorName,
      batchNo: batchCriteria.batchNo,
      roomNo: batchCriteria.roomNo,
      financialYear: batchCriteria.financialYear
    };

    // Find all matching stocks
    const stocksToUpdate = await collection.find(updateQuery).lean();

    if (stocksToUpdate.length === 0) {
      return res.status(404).json({ message: "No matching stock found for update." });
    }

    let idChanged = false;
    let newStocks = [];

    stocksToUpdate.forEach((stock, index) => {
      let updatedStock = { ...stock, ...updatedFields };

      // If any field affecting `_id` has changed, we need to delete old and insert new
      if (
        updatedFields.allocatedDept || updatedFields.specification ||
        updatedFields.dateOfPurchase || updatedFields.vendorName ||
        updatedFields.batchNo || updatedFields.roomNo
      ) {
        idChanged = true;
        updatedStock._id = `${updatedStock.allocatedDept}/${updatedStock.specification}/${updatedStock.dateOfPurchase}/${updatedStock.vendorName}/${updatedStock.batchNo}/${index + 1}`;
      }

      newStocks.push(updatedStock);
    });

    // If `_id` is changing, delete old stocks and insert new ones
    if (idChanged) {
      await collection.deleteMany(updateQuery);
      await collection.insertMany(newStocks);
    } else {
      await collection.updateMany(updateQuery, { $set: updatedFields });
    }

    res.status(200).json({
      message: "Stock batch updated successfully",
      modifiedCount: newStocks.length
    });
  } catch (err) {
    console.error("Error updating stock batch:", err);
    res.status(500).json({ error: "Failed to update stock batch" });
  }
});



// Delete Stock Batch
router.delete("/deleteStock", async (req, res) => {
  try {
    const { stockType, batchCriteria } = req.body;
    let collection = stockType === "Institutional Stock" ? instStock : deptStock;

    const deleteQuery = {
      assetHeads: batchCriteria.assetHeads,
      allocatedDept: batchCriteria.allocatedDept,
      specification: batchCriteria.specification,
      dateOfPurchase: batchCriteria.dateOfPurchase,
      vendorName: batchCriteria.vendorName,
      batchNo: batchCriteria.batchNo,
      roomNo: batchCriteria.roomNo,
      financialYear: batchCriteria.financialYear
    };

    const deleteResult = await collection.deleteMany(deleteQuery);

    res.status(200).json({
      message: "Stock batch deleted successfully",
      deletedCount: deleteResult.deletedCount
    });
  } catch (err) {
    console.error("Error deleting stock batch:", err);
    res.status(500).json({ error: "Failed to delete stock batch" });
  }
});


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

router.post("/search", async (req, res) => {
  try {
    const { stockType, allocatedDept, assetHead, specification, roomNo, startDate, endDate, minAmount, maxAmount } = req.body;

    let collection = stockType === "institutional" ? instStock : deptStock;

    // Step 1: Initial Match Conditions
    let preGroupMatch = {};
    if (allocatedDept) preGroupMatch.allocatedDept = allocatedDept;
    if (specification) preGroupMatch.specification = specification;
    if (assetHead) preGroupMatch.assetHeads = assetHead;
    if (roomNo) preGroupMatch.roomNo = roomNo;

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
            roomNo: "$roomNo", 
            dateOfPurchase: "$dateOfPurchase",
            financialYear: "$financialYear"
          },
          totalQuantity: { $sum: 1 },
          totalAmount: { $sum: { $multiply: ["$individualAmount", 1] } },
          stockType: { $first: "$stockType"},
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


router.get('/groupedBatches', async (req, res) => {
  try {
    const groupedStocks = await approvedStock.aggregate([
      {
        $group: {
          
          assetHeads: { $first: "$assetHeads" },
          specification: { $first: "$specification" },
          vendorName: { $first: "$vendorName" },
          stockType: { $first: "$stockType" },
          allocatedDept: { $push: "$allocatedDept" },
          quantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$totalAmount" },
          dateOfPurchase: { $first: "$dateOfPurchase" },
          financialYear: { $first: "$financialYear" },
          purpose: { $first: "$purpose" },
          bills: { $first: "$bills" }
        }
      }
    ]);

    res.json(groupedStocks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stock batches", error });
  }
});

router.put('/updateBatch/:batchNo', async (req, res) => {
  try {
    const { batchNo } = req.params;
    const updatedData = req.body;

    // Update all stocks within this batch number
    await approvedStock.updateMany({ batchNo }, { $set: updatedData });

    res.json({ message: "Stock batch updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating stock batch", error });
  }
});

router.get('/groupStocks', async (req, res) => {
  try {
    const aggregateStocks = async (model) => {
      return await model.aggregate([
        {
          $addFields: {
            allocatedDept: {
              $cond: {
                if: { $eq: [{ $type: "$allocatedDept" }, "string"] },
                then: ["$allocatedDept"],
                else: "$allocatedDept"
              }
            }
          }
        },
        {
          $addFields: {
            dateOfPurchase: {
              $cond: {
                if: { $regexMatch: { input: "$dateOfPurchase", regex: /^\d{4}-\d{2}-\d{2}$/ } },
                then: { $dateFromString: { dateString: "$dateOfPurchase", format: "%Y-%m-%d" } },
                else: null
              }
            }
          }
        },
        { $match: { dateOfPurchase: { $type: "date" } } },
        {
          $group: {
            _id: {
              assetHeads: "$assetHeads",
              financialYear: "$financialYear",
              monthYear: { $dateToString: { format: "%Y-%m", date: "$dateOfPurchase" } }
            },
            totalQuantity: { $sum: "$quantity" },
            totalAmount: { $sum: "$individualAmount" },
            stocks: {
              $push: {
                specification: "$specification",
                quantity: "$quantity",
                totalAmount: "$individualAmount",
                dateOfPurchase: "$dateOfPurchase",
                bills: "$bills",
                allocatedDept: { $ifNull: ["$allocatedDept", []] },
                stockType: model === instStock ? 'Institutional Stock' : "Departmental Stock"
              }
            }
          }
        },
        {
          $group: {
            _id: {
              assetHeads: "$_id.assetHeads"
            },
            monthlyBreakdown: {
              $push: {
                monthYear: "$_id.monthYear",
                totalQuantity: "$totalQuantity",
                totalAmount: "$totalAmount",
                stocks: "$stocks"
              }
            },
            totalQuantity: { $sum: "$totalQuantity" },
            totalAmount: { $sum: "$totalAmount" }
          }
        },
        {
          $project: {
            _id: 0,
            assetHeads: "$_id.assetHeads",
            totalQuantity: 1,
            totalAmount: 1,
            monthlyBreakdown: 1
          }
        },
        { $sort: { assetHeads: 1 } }
      ]);
    };

    // Get aggregated data from both deptStock and instStock models
    const deptStocks = await aggregateStocks(deptStock);
    const instStocks = await aggregateStocks(instStock);

    // Merge the results
    const mergedStocks = [...deptStocks, ...instStocks];

    // Final aggregation: Group all results by `assetHeads`
    const finalAggregation = mergedStocks.reduce((acc, stock) => {
      const existingGroup = acc.find((item) => item.assetHeads === stock.assetHeads);
      if (existingGroup) {
        existingGroup.monthlyBreakdown.push(...stock.monthlyBreakdown);
        existingGroup.totalQuantity += stock.totalQuantity;
        existingGroup.totalAmount += stock.totalAmount;
      } else {
        acc.push(stock);
      }
      return acc;
    }, []);

    res.json(finalAggregation);
  } catch (err) {
    console.error("Error in aggregation:", err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});






module.exports = router;
