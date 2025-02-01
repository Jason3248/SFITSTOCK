const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


const PORT = 5000;


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const authRoutes = require('./routes/userAuth');
app.use('/api/auth', authRoutes);

const itemRoutes = require('./routes/items');
app.use('/api/items', itemRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

/*
const password = "user1password"; 
const saltRounds = 10; 

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error("Error hashing password:", err);
  } else {
    console.log("Hashed Password:", hash);
    
  }
});
*/