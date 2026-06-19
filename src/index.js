require('dotenv').config();
const express = require('express');
const webhookRouter = require('./webhook');
const app = express();

app.use(express.json());

app.use('/api', webhookRouter);

app.get('/', (req, res) => {
  res.send('AI Code Review Agent is running 🤖');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});