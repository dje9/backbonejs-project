function Database() {

  var mongo = require('mongodb');
  var Server = mongo.Server;
  var Db = mongo.Db;
  var server = new Server('127.0.0.1', 27017, {
    auto_reconnect: true
  });

  var db = new Db('votedb', server); 
  

  this.set = function (q) {    
    db.open(function (err, db) {
      if (!err) {
        console.log('connected');
        db.collection('questions', function (err, collection) {
          if (!err) {
            console.log('collected');
            var docs = {
              id: q.id,
              text: q.text,
              value: q.value,
              name: q.name
            };
            collection.insert(docs, {safe: true }, function (err, result) {
              if (err) {
                console.log('insertion failed');
              } else {
                console.log('inserted');
                console.log(result); 
                db.close();        
              }
            });                   
          }
        });
      }
    });
  };

  this.get = function (q) {
    var thisobj = this;
    var questions = [];

    db.open(function (err, db) {
      if (!err) {
        console.log('connected');
        db.collection('questions', function (err, collection) {
          if (!err) {
            console.log('collected');
             cursor = collection.find( {id: 7687}, function (err, items) {
              if (err) {
                console.log('retrieve failed');
              } else {
                  items.each(function (err, doc) {
                  questions.push(doc);
                  //console.log(doc);
                });    
                db.close();            
              }
           });
          }
        });
      }
    });    

  };
}

module.exports = Database

var db = new Database();
//db.set({id: 7687, text: 'Hello', name: 'q22', value: true });
db.get({id: 7687 });
