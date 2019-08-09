const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require("mongodb").MongoClient;
const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true });

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

  mongoClient.connect(function(err, client){
    const db = client.db("usersdb");
    const collection = db.collection("users");
    collection.insertOne(req.body, function(err, result){
      if(err){
        return console.log(err);
      }
      console.log(result.ops);
      client.close();
    });
  });

  res
    .status(200)
    .send({ data: 'ok' })
});


