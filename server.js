const express = require('express');
const cors = require('cors');
require('dotenv').config()
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const { MONGO_URI, PORT } = require('./config');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
