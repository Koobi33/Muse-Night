module.exports = function(server, db) {
  server.get('/', (req, res) => {
    res.send('hello from ROOT');
  });



  server.post('/send',async (req, res) => {
const data = req.body;
console.log(body);
    // const collection = db.collection("users");
    //     collection.insertOne(req.body, function(err, result){
    //     if(err){
    //       return console.log(err);
    //     } else {
    //       console.log(result);
    //       res
    //         .status(200)
    //         .send({ data: 'ok' })
    //     }
    // });
  });
};
