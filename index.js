const express = require('express');
const cors = require('cors');
const { dbConnect } = require('./backend/database/db');
const apiRouter = require('./backend/routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

dbConnect();

app.get('/', (req, res) => {
  res.send('Welcome to the Competitive Programming Platform API');
});

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});