// See package.json for mongodb package: npm install mongodb --save
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
fs = require('fs');


// Read the connection details from the K8s secrets/file, shouldn't change once set, if broke, make sure files/secrets exist
var mondodburlprefix = "mongodb+srv://";
var mongodburl = fs.readFileSync('./creds/mongodb/mongodburl', 'utf8');
var mongodbusername = fs.readFileSync('./creds/mongodb/mongodbusername', 'utf8');
var mongodbpassword = fs.readFileSync('./creds/mongodb/mongodbpassword', 'utf8');
const connectionstring = mondodburlprefix.concat(mongodbusername, ":", mongodbpassword, "@", mongodburl);
console.log("Connection String: " + connectionstring);


// Use connect method to connect to the server
const dbName = 'database';
const client = new MongoClient(connectionstring);


// Sample JSON Message
var obj = JSON.parse('{   "format": 1,   "heartbeat": "string",   "timestamp": "string",   "senderid": "string",   "recieverid": "string",   "message": "this is sent in a json block",   "priority": 0,   "flags": "string" }')


// Use connect method to connect to the server
MongoClient.connect(connectionstring, function(err, client) {
  assert.equal(null, err);
  console.log('Connected successfully to server');

  const db = client.db(dbName);

  // Uncomment me to test with bulk unserts
  // var i;
  // for (i = 0; i < 10000; i++) {
  //   insertDocument(db, function() {
  //     //client.close();
  //   });
  // }
  
  // This is just a normal insert, runs 1 time, fetches what was inserted to check it
  insertDocument(db, function() {
    findDocuments(db, function() {
      client.close();
    });
  });
});


const insertDocument = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('notifications');
  // Insert some documents
  collection.insertMany([{ MessageJSON: obj }], function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    console.log('Inserted into collection');
    callback(result);
  });
};


const findDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('notifications');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log('Found the following records');
    console.log(docs);
    callback(docs);
  });
};


const updateDocument = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('notifications');
  // Update document where a is 2, set b equal to 1
  collection.updateOne({ a: 2 }, { $set: { b: 1 } }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log('Updated the document with the field a equal to 2');
    callback(result);
  });
};


const removeDocument = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('notifications');
  // Delete document where a is 3
  collection.deleteOne({ a: 3 }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log('Removed the document with the field a equal to 3');
    callback(result);
  });
};


const indexCollection = function(db, callback) {
  db.collection('notifications').createIndex({ a: 1 }, null, function(err, results) {
    console.log(results);
    callback();
  });
};


