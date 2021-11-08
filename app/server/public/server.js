//server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');


let app = express();

const port = process.env.PORT || 8000;

app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, '../../../build')));

app.get('/', (req, res)=> {
  res.send('Express server is up and running.');
})

app.use(require('../src/routes/userRouter'));
app.use(require('../src/routes/cartRouter'));
app.use(require('../src/routes/productRouter'));

app.listen(port, _=> console.log(`The server is listening on port ${port}`));