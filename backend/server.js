const express = require('express');
const cors = require('cors');
const { dbConnect } = require('./database/db');
const apiRouter = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

dbConnect();

app.get('/', (req, res) => {
  res.send('Backend API Server Running');
});

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});