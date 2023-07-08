const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const User = require('../models/User');
const Order = require('../models/Orders');
const fetch = require('../middleware/fetchdetails');
const jwtSecret = "HaHa";

const router = express.Router();

// Creating a user and storing data to MongoDB Atlas, No Login Required
router.post('/createuser', [
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  body('name').isLength({ min: 3 })
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  const salt = await bcrypt.genSalt(10);
  const securePass = await bcrypt.hash(req.body.password, salt);
  
  try {
    const user = await User.create({
      name: req.body.name,
      password: securePass,
      email: req.body.email,
      location: req.body.location
    });

    const data = {
      user: {
        id: user.id
      }
    };

    const authToken = jwt.sign(data, jwtSecret);
    success = true;
    res.json({ success, authToken });
  } catch (error) {
    console.error(error.message);
    res.json({ error: "Please enter a unique value." });
  }
});

// Authentication a User, No Login Required
router.post('/login', [
  body('email', "Enter a Valid Email").isEmail(),
  body('password', "Password cannot be blank").exists(),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
    }

    const pwdCompare = await bcrypt.compare(password, user.password);
    if (!pwdCompare) {
      return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    };

    success = true;
    const authToken = jwt.sign(data, jwtSecret);
    res.json({ success, authToken });
  } catch (error) {
    console.error(error.message);
    res.send("Server Error");
  }
});

// Get logged in User details, Login Required.
router.post('/getuser', fetch, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.send("Server Error");
  }
});

// Place an Order, Login Required
router.post('/placeorder', fetch, async (req, res) => {
  try {
    const userId = req.user.id;
    const { foodItem, quantity } = req.body;

    const order = await Order.create({
      user: userId,
      foodItem,
      quantity
    });

    res.json(order);
  } catch (error) {
    console.error(error.message);
    res.send("Server Error");
  }
});

// Get all Orders of a User, Login Required
router.post('/getorders', fetch, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId });

    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.send("Server Error");
  }
});

module.exports = router;

// db.js
const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const foodCollection = mongoose.connection.db.collection('food_items');
    const categoryCollection = mongoose.connection.db.collection('categories');
    // Rest of the code...
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

module.exports = connectDB;