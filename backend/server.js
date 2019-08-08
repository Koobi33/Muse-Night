const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// const morgan = require('morgan');


const server = express();
const PORT = process.env.PORT || 3020;

server.use(cors());
// server.use(morgan('short'));
server.use(bodyParser.urlencoded({extended: false}));

server.get('/', (req, res) => {
  res.send('hello from ROOT');
});

server.listen(PORT, ()=> {console.log(`server just starting on ${PORT} port`  + '\n ')});

server.post('/send',async (req, res) => {
  console.log(req.body);
  res
    .status(200)
    .send({ data: 'ok' })
});


