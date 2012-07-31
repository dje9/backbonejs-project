function Question() {
  var mongo = require('mongodb');
  var Server = mongo.Server;
  var Db = mongo.Db;
  var server = new Server('127.0.0.1', 27017, {
    auto_reconnect: true
  });
  var db = new Db('questions', server);
  this.save = function () {
    var thisobj = this;
    db.open(function (err, db) {
      if (!err) {
        console.log('connected');
        db.collection('questions', function (err, collection) {
          if (!err) {
            console.log('collected');
            var docs = {
              id: thisobj.id,
              text: thisobj.text,
              value: thisobj.value,
              name: thisobj.name
            };
            collection.insert(docs, function (err, result) {
              if (err) {
                console.log('insertion failed');
              } else {
                console.log('inserted');
                console.log(docs);
              }
            });
          }
        });
      }
    });
  }
}
module.exports = Question
