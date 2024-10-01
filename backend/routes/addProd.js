const express = require('express');
const User = require('../models/User');
const Stock = require('../models/stock');
const router = express.Router();
const { body, validationResult } = require('express-validator');
var fetchuser = require('../middleware/fetchuser');
const { upload } = require('../multer')

router.post('/newItem', upload.array('file', 5), async (req, res) => {

    try {

        console.log(req.body)

        // userId = req.user.id;
        // const user = await User.findById(userId).select("-password")

        const newItem = new Stock({
            equipmentType: req.body.equipmentType,
            stockType: req.body.category,
            nameOfEquipment: req.body.equipmentName,
            quantity: req.body.quantity,
            batchNo: req.body.batchNo,
            department: req.body.department,
            rate: req.body.rate,
            totalAmount: req.body.amount,
            dateOfPurchase: req.body.dateOfPurchase,
            purpose: req.body.purpose,
            remarks: req.body.remarks,
            warranty: req.body.warranty,
            checkedby: req.body.checkedby,

        })
        console.log(req.files)
        for (let i = 0; i < req.files.length; i++) {
            newItem.bills.push(`http://localhost:5000/api/image/${req.files[i].filename}`);
        }

        const addItem = await newItem.save();
        console.log(addItem);
        res.status(200).json(addItem)
    } catch (err) {
        console.log(err.message)
        res.status(500).json(err.message);
    }
})

router.post('/get', async (req, res) => {
    try {
        let products;
        if (req.body.category && req.body.department) {
             products = await Stock.find({ $and: [{ category: req.body.category }, { department: req.body.department }] });
        }
        else {
             products = await Stock.find({ $or: [{ category: req.body.category }, { department: req.body.department }] });
        }
        // res.status(200).json(products)

        // const nameFilter = req.query.category ? { category: req.query.category } : {};
        // const ageFilter = req.query.department ? { department: parseInt(req.query.department) } : {};
        // const filter = [nameFilter, ageFilter];

        // const prod = await Stock.find({ $and: filter })
        // console.log(prod)
        res.status(200).json(products)
    } catch (err) {
        console.log(err.message)
        res.status(500).json(err.message);
    }
})

module.exports = router

