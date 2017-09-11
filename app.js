var PORT = 80;

//Express
var express = require('express');
var app = express();
app.use(express.logger());
app.use(express.compress());

//MongoDB
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/iic2173";


//When the server is called
app.get('/', function (req,res) {

   //create the element that's going to be stored in the database
  var d = new Date();
  var new_element = {
    "ip": req.ip,
    "date":d.toUTCString()
  };

  //Insert the new element to the databse
  MongoClient.connect(url, function(err, db) {
    db.collection('connections').insertOne(new_element, function(err, resDB){
      if (err) throw err;
      //Get the elements from the database
      //Sort in descending order. Show the last 10 connections
      var mysort = { date: -1 };
      db.collection('connections')
      .find({ "ip": { $exists: true, $ne: null } }) //Only show elements that contain an ip
      .sort(mysort)
      .limit(10) //Amount of connections to show
      .toArray(function(err, result){
        res.send(result); //send the sorted elements to the client
        db.close();
      });
    });
  });

});

// Start the server
var port = process.env.PORT || PORT; // 80 for web, 3000 for development
app.listen(port, function() {
  console.log("Node.js server running on port %s", port);
});

