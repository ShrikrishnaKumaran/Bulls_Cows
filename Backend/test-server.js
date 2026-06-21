require('dotenv').config();
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Test API works!' });
});

const PORT = 5000;
const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Server object:`, typeof server);
});

// Keep alive
setInterval(() => {
  console.log('Server still alive...');
}, 5000);
