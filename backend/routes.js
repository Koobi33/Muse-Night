module.exports = function(server, db) {
  server.get('/', (req, res) => {
    res.send('hello from ROOT');
  });



  server.post('/send',async (req, res) => {

    db.collection("users").insertOne(req.body, function(err, result){
        if(err){
          return console.log(err);
        } else {
          console.log(result);
          res
            .status(200)
            .send({ data: 'ok' })
        }
    });
  });
};
