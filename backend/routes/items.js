const express = require('express');
const stock = require('../models/stock');
const approvedStock = require('../models/approvedStock')
const router = express.Router();
const XLSX = require('xlsx');
/*
router.post('/post', async (req, res) => {
  console.log(req.body); // Log incoming request body
  const { allocatedDept, roomNo, specification, quantity } = req.body;
  
  if (!allocatedDept || !roomNo || !specification || !quantity) {
      return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingStocks = await stock.find({
      allocatedDept,
      roomNo,
      specification,
  }).sort({ _id: 1 });  // Sorting based on custom _id

  // 2. Extract the maximum quantity from the existing stocks
  let maxQuantity = 0;
  if (existingStocks.length > 0) {
      const lastStock = existingStocks[existingStocks.length - 1];
      const lastId = lastStock._id;
      const parts = lastId.split('/');
      maxQuantity = parseInt(parts[3]);  // Extracting the last part of the _id
  }

  // 3. Add the new stocks in the loop
  for (let i = 1; i <= quantity; i++) {
      const newId = `${allocatedDept}/${roomNo}/${specification}/${maxQuantity + i}`;
      const newStock = new stock({
          allocatedDept,
          roomNo,
          specification,
          quantity: 1,  // Since we are adding individual stocks
          _id: newId,
      });
      await newStock.save();
  }

  return res.status(201).json({ message: `${quantity} stock items added successfully` });
  } catch (error) {
      console.error('Error in POST /post:', error); // More detailed logging
      return res.status(500).json({ error: 'Error adding stock', details: error.message });
  }
});
*/
/*
router.post('/post', async (req, res) => {
  const { allocatedDept, roomNo, specification, quantity } = req.body;
  
  try {
      // 1. Fetch existing stocks with the same `allocatedDept`, `roomNo`, and `specification`
      const existingStocks = await stock.find({
          allocatedDept,
          roomNo,
          specification,
      }).sort({ _id: 1 });  // Sorting based on custom _id

      // 2. Extract the maximum quantity from the existing stocks
      let maxQuantity = 0;
      if (existingStocks.length > 0) {
          const lastStock = existingStocks[existingStocks.length - 1];
          const lastId = lastStock._id;
          const parts = lastId.split('/');
          maxQuantity = parseInt(parts[3]);  // Extracting the last part of the _id
      }

      // 3. Add the new stocks in the loop
      for (let i = 1; i <= quantity; i++) {
          const newId = `${allocatedDept}/${roomNo}/${specification}/${maxQuantity + i}`;
          const newStock = new stock({
              allocatedDept,
              roomNo,
              specification,
              quantity: 1,  // Since we are adding individual stocks
              _id: newId,
          });
          await newStock.save();
      }

      return res.status(201).json({ message: `${quantity} stock items added successfully` });
  } catch (error) {
      return res.status(500).json({ error: 'Error adding stock' });
  }
});
*/

router.post('/post', async (req, res) => {
  const { _id, assetHeads, specification, dateOfPurchase, financialYear, batchNo, vendorName, quantity, totalAmount, roomNo, purpose, bills, allocatedDept  } = req.body;
  console.log(req.body); 
  
  if (!allocatedDept || !roomNo || !specification || !quantity) {
      return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const existingStocks = await stock.find({
      allocatedDept,
      roomNo,
      specification,
  }).sort({ _id: 1 }); 

  let maxQuantity = 0;
  if (existingStocks.length > 0) {
      const lastStock = existingStocks[existingStocks.length - 1];
      const lastId = lastStock._id;
      const parts = lastId.split('/');
      maxQuantity = parseInt(parts[3]);  
  }

  for (let i = 1; i <= quantity; i++) {
      const newId = `${allocatedDept}/${roomNo}/${specification}/${maxQuantity + i}`;
      const newStock = new stock({
          allocatedDept,
          roomNo,
          specification,
          quantity: 1,  // Since we are adding individual stocks
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
      await newStock.save();
  }

  return res.status(201).json({ message: `${quantity} stock items added successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create item', err});
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

/*
router.put('/put/:id', async (req, res) => {
  const { assetHeads, specification, dateOfPurchase, financialYear, batchNo, vendorName, quantity, totalAmount, roomNo, purpose, bills, allocatedDept } = req.body;
  try {
    const updatedItem = await stock.findByIdAndUpdate(req.params.id, { assetHeads, specification, dateOfPurchase, financialYear, batchNo, vendorName, quantity, totalAmount, roomNo, purpose, bills, allocatedDept }, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});
*/
router.put('/put/:id', async (req, res) => {
  const { assetHeads, specification, dateOfPurchase, financialYear, batchNo, vendorName, quantity, totalAmount, roomNo, purpose, bills, allocatedDept } = req.body;

  try {
    // Find the stock by its ID
    const stockId = decodeURIComponent(req.params.id);
    const stockToUpdate = await stock.findById(stockId);
    if (!stockToUpdate) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    // Check if a file was uploaded (if bills is provided, assume the file URL has been uploaded)
    let updatedBills = bills || stockToUpdate.bills;

    // If a new file (bill) is uploaded, use its URL, otherwise keep the existing one
    if (req.file) {
      const fileUrl = await uploadFileToFirebase(req.file); // Assuming you have a function for file uploads
      updatedBills = fileUrl || updatedBills;
    }

    // Update the stock document with the new values
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
    const update = { hodApprovalStatus };

    if (hodApprovalStatus === 'rejected') {
      update.rejectedBy = 'HOD';
      update.rejectionReason = rejectionReason;
    } else {
      update.rejectedBy = '';
      update.rejectionReason = '';
    }

    const updatedStock = await stock.findByIdAndUpdate(
      req.params.id,
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

router.get('/approve/cmpn', async (req, res) => {
  try {
    const stocks = await stock.find({ allocatedDept: 'CMPN' });
    res.json(stocks);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
/*
router.put('/approve/cmpn/:id', async (req, res) => {
  try {
    const { hodApprovalStatus, rejectionReason } = req.body;
    console.log('Request Body:', req.body); // Log request body for debugging

    const update = { hodApprovalStatus };
    if (hodApprovalStatus === 'rejected') {
      update.rejectedBy = 'HOD';
      update.rejectionReason = rejectionReason;
    } else {
      update.rejectedBy = '';
      update.rejectionReason = '';
    }

    const updatedStock = await stock.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!updatedStock) {
      return res.status(404).send('Stock not found');
    }

    res.json(updatedStock);
  } catch (err) {
    console.error('Error updating stock approval:', err); // Log error
    res.status(500).send('Server error');
  }
});
*/
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
    const update = { hodApprovalStatus };

    if (hodApprovalStatus === 'rejected') {
      update.rejectedBy = 'HOD';
      update.rejectionReason = rejectionReason;
    } else {
      update.rejectedBy = '';
      update.rejectionReason = '';
    }

    const updatedStock = await stock.findByIdAndUpdate(
      req.params.id,
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
    const update = { hodApprovalStatus };

    if (hodApprovalStatus === 'rejected') {
      update.rejectedBy = 'HOD';
      update.rejectionReason = rejectionReason;
    } else {
      update.rejectedBy = '';
      update.rejectionReason = '';
    }

    const updatedStock = await stock.findByIdAndUpdate(
      req.params.id,
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
    const update = { hodApprovalStatus };

    if (hodApprovalStatus === 'rejected') {
      update.rejectedBy = 'HOD';
      update.rejectionReason = rejectionReason;
    } else {
      update.rejectedBy = '';
      update.rejectionReason = '';
    }

    const updatedStock = await stock.findByIdAndUpdate(
      req.params.id,
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
    const update = { hodApprovalStatus };

    if (hodApprovalStatus === 'rejected') {
      update.rejectedBy = 'HOD';
      update.rejectionReason = rejectionReason;
    } else {
      update.rejectedBy = '';
      update.rejectionReason = '';
    }

    const updatedStock = await stock.findByIdAndUpdate(
      req.params.id,
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
    const update = { hodApprovalStatus };

    if (hodApprovalStatus === 'rejected') {
      update.rejectedBy = 'HOD';
      update.rejectionReason = rejectionReason;
    } else {
      update.rejectedBy = '';
      update.rejectionReason = '';
    }

    const updatedStock = await stock.findByIdAndUpdate(
      req.params.id,
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
      // Clear rejection fields if status is approved
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
    const { _id } = req.body; // Ensure you're getting the id from the frontend

    // Find the stock by id
    const stockItem = await stock.findById(_id);

    if (!stockItem) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    // Create a new approved stock entry
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
      // Clear rejection fields if status is approved
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

    // Convert stocks to a format suitable for Excel
    const data = stocks.map(stock => ({
      _id: stock._id,
      allocatedDept: stock.allocatedDept,
      roomNo: stock.roomNo,
      specification: stock.specification,
      quantity: stock.quantity,
      dateOfPurchase: stock.dateOfPurchase,
      // Add other fields as needed
    }));

    // Create a new workbook and a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stocks');

    // Write the workbook to a buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Set the headers and send the buffer as an Excel file
    res.setHeader('Content-Disposition', 'attachment; filename=stocks.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting to Excel:', error); // Log the error for debugging
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

router.put('/edit/:id', async (req, res) => {
  try {
    const updatedStock = await stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedStock);
  } catch (err) {
    res.status(500).json({ error: 'Error updating stock', details: err.message });
  }
});







module.exports = router;
