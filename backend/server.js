const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require("mongodb").MongoClient;
const db             = require('./dbconfig');
// const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true });

// const morgan = require('morgan');



const server = express();
const PORT = process.env.PORT || 3020;

server.use(cors());
// server.use(morgan('short'));
server.use(bodyParser.urlencoded({extended: false}));

MongoClient.connect(db.url, (err, database) => {
  if (err) return console.log(err)
  require('./routes')(server, database);
  server.listen(PORT, ()=> {console.log(`server just starting on ${PORT} port`  + '\n ')});
});


