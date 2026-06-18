require('dotenv').config();

const express = require('express');
const webhookRouter = require('./src/webhook');
const app = express();

app.use(express.json());
app.use('/api', webhookRouter);

app.get('/', (req, res) => res.send('alive'));

app.listen(3000, () => {
  console.log('Server with webhook router running on port 3000');
});
