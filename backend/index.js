const express = require('express');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});