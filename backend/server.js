const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require("mongodb").MongoClient;
const db = require('./dbconfig');
const fs = require('fs');

const server = express();
const PORT = process.env.PORT || 3020;

server.use(cors());
server.use(bodyParser.urlencoded({extended: false}));

MongoClient.connect(db.url,  { useNewUrlParser: true }, (err, database) => {

  if (err) return console.log(err);

  const db = database.db("usersdb");
  server.get('/', async (req, res) => {
    await db.collection("prod").find({}).toArray((err, result) => {
      if(err) {
        console.log(err)
      } else {
        fs.writeFile("result", result, function(err) {
          if(err) {
            return console.log(err);
          }

          console.log("The file was saved!");
        });
        res.status(200);
        res.send('ok')
      }
    });
    // console.log(fullData);
  //  res.send(fullData);
  });

  server.post('/send',async (req, res) => {
    const data = req.body;
    db.collection("users").insertOne(data, (err, result) => {
        if(err){
          return console.log(err, 'FATAL ERROR');
        } else {
          // console.log(result);
          res
            .status(200)
            .send({ data: 'ok' })
        }
    });
  });
  server.listen(PORT, ()=> {console.log(`server just starting on ${PORT} port`  + '\n ')});
});


