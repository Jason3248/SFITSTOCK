const express = require('express');
const stock = require('../models/stock');
const approvedStock = require('../models/approvedStock')
const router = express.Router();
const XLSX = require('xlsx');

router.post('/post', async (req, res) => {
  const { _id, assetHeads, specification, dateOfPurchase, financialYear, batchNo, vendorName, quantity, totalAmount, roomNo, purpose, bills, allocatedDept } = req.body;
  
  console.log(req.body); 
  
  if (!allocatedDept || !roomNo || !specification || !quantity) {
      return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    
    const existingStocks = await stock.find({
      allocatedDept,
      roomNo,
      specification,
      dateOfPurchase,
      vendorName
    }).sort({ _id: 1 });

    // Determine max quantity
    let maxQuantity = 0;
    if (existingStocks.length > 0) {
      const lastStock = existingStocks[existingStocks.length - 1];
      const lastId = lastStock._id;
      const parts = lastId.split('/');
      maxQuantity = parseInt(parts[5]);  // Adjust index for quantity part of the _id
    }

    let createdStocks = [];

    for (let i = 1; i <= quantity; i++) {
      const newId = `${allocatedDept}/${roomNo}/${specification}/${dateOfPurchase}/${vendorName}/${maxQuantity + i}`;
      console.log(newId);  // Log the new _id being created
      
      const newStock = new stock({
        allocatedDept,
        roomNo,
        specification,
        quantity: 1,  // Adding one stock at a time
        _id: newId,
        assetHeads,
        dateOfPurchase,
        financialYear,
        batchNo,
        vendorName,
        totalAmount,
        bills,
        purpose
      });

      await newStock.save();  // Save new stock
      createdStocks.push(newStock);  // Track created stock
    }

    console.log(createdStocks);  // Log all created stocks after the loop
    
    return res.status(201).json({ message: `${quantity} stock items added successfully` });
  } catch (err) {
    console.error("Error creating stock items:", err);  // Log the error for debugging
    return res.status(500).json({ error: 'Failed to create item', details: err.message });
  }
});


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

router.get('/approve/aiml', async (req, res) => {
  try {
    const aimlStocks = await stock.find({ allocatedDept: 'AIML' });
    res.json(aimlStocks);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.put('/approve/aiml/:id', async (req, res) => {
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



router.get('/approve/inft', async (req, res) => {
  try {
    const cseStocks = await stock.find({ allocatedDept: 'INFT' });
    res.json(cseStocks);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.put('/approve/inft/:id', async (req, res) => {
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


router.get('/approve/extc', async (req, res) => {
  try {
    const aimlStocks = await stock.find({ allocatedDept: 'EXTC' });
    res.json(aimlStocks);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.put('/approve/extc/:id', async (req, res) => {
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


router.get('/approve/ecs', async (req, res) => {
  try {
    const aimlStocks = await stock.find({ allocatedDept: 'ECS' });
    res.json(aimlStocks);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.put('/approve/ecs/:id', async (req, res) => {
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

router.get('/approve/elec', async (req, res) => {
  try {
    const aimlStocks = await stock.find({ allocatedDept: 'ELEC' });
    res.json(aimlStocks);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.put('/approve/elec/:id', async (req, res) => {
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
      [`Room No: ${roomNo || 'All'}`], // Room number dynamically populated
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

router.post('/search', async (req, res) => {
  const { _id, allocatedDept, roomNo, specification, quantity, startDate, endDate } = req.body;

  try {
    const query = {};
    if (_id) query._id = _id;
    if (allocatedDept) query.allocatedDept = allocatedDept;
    if (roomNo) query.roomNo = roomNo;
    if (specification) query.specification = specification;
    if (quantity) query.quantity = quantity;

    // Add date range filter
    if (startDate && endDate) {
      query.dateOfPurchase = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const results = await approvedStock.find(query);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error querying stocks', details: err.message });
  }
});

module.exports = router;
