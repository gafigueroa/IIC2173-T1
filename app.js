var PORT = 80;

// Express is a web framework for node.js
// that makes nontrivial applications easier to build
var express = require('express');

// Create the server instance
var app = express();

// Print logs to the console and compress pages we send
app.use(express.logger());
app.use(express.compress());

var json = {};

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/iic2173";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
    db.collection('connections').insert(json, function(err, records) {

    });
  db.close();
});

// Return all pages in the /static directory
// whenever they are requested at '/'
// e.g., http://localhost:3000/index.html
// maps to /static/index.html on this machine
app.use(express.static(__dirname + '/static'));

app.get('/', function (req,res) {
   console.log(req.ip);
   var d = new Date();
   var new_element = {
   		"ip": req.ip,
   		"date":d.toUTCString()
   };
   MongoClient.connect(url, function(err, db) {
	  db.collection('connections').updateOne(json, json, function(err, res){
   		if (err) throw err;
	    db.close();
   		});

	  var mysort = { date: -1 };
	  db.collection('connections').find({ "ip": { $exists: true, $ne: null } }).sort(mysort).limit(10).toArray(function(err, result){
	  	result.sort(function(a, b){
	    	return b.date - a.date;
		});
	  	res.send(result);
	  	db.close();
	  });
	});
   if ("connections" in json){
   		json["connections"].push(new_element);
   } else {
       json["connections"] = [new_element];
   }
   MongoClient.connect(url, function(err, db) {
	  db.collection('connections').insertOne(new_element, function(err, res){
	  	if (err) throw err;
	    console.log("1 document inserted");
	    db.close();
	  });
	});
});

// Start the server
var port = process.env.PORT || PORT; // 80 for web, 3000 for development
app.listen(port, function() {
        console.log("Node.js server running on port %s", port);
});

