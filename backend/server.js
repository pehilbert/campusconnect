const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB (Update with your connection string)
mongoose.connect('mongodb://localhost:27017/clockwork', {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Connection error:', err);
});

// Example route
app.get('/', (req, res) => {
  res.send('Clockwork Backend is running!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
