var Question = require('./public/database.js');
var express = require('express');

var routes = function (app) {
  app.use(express.static(__dirname + '/public'));
  var io = app.settings['io'];
  var sio = io.listen(app);

  sio.sockets.on('connection', function (socket) {   
    socket.on('question:update', function (data) {
        if(data) {
          // Save to datbase
          data.text = 'hello world';
          data.id = 343943;
          
          socket.emit('question:updated');
        }
      });
  });  

  app.get('/votingdevice', function (req, res) {
    res.sendfile(__dirname + '/index.html');
  });
  app.get('/votingdevice/test', function (req, res) {
    res.sendfile(__dirname + '/mocha-testrunner.html');
  });
  app.get('/api/question/:id', function (req, res) {
    //sio.sockets.emit('event:welcome', 'data');
    var id = req.id;    
    var q = new Question();
    //res.send({});
    res.send({id:3434, text:'It worked', name:'q2323', value:true });
    //res.sendfile(__dirname + '/index.html');   
  });
  app.post('/votingdevice/questions', function (req, res) {
    var body = req.body;
    var MAX_ID = 128000;
    var id = Math.floor((MAX_ID * Math.random()) + 1);
    var name = 'q' + id;
    var q = new Question();
    q.id = id;
    q.name = name;
    q.text = body.text;
    q.save();
    res.send(req.body);
  });
  app.post('/votingdevice/question/:id', function (req, res) {
    /* Todo: Create objects filling in what doesn't exit */
    var id = req.body.id;
    var text = req.body.text;
    var name = req.body.name;
    var value = req.body.value;
    var q = new Question();
    q.id = id;
    q.name = name;
    q.text = text;
    q.value = value;
    q.save();
    res.send(q);
  });
  app.put('/votingdevice/question/:id', function (req, res) {
    var id = req.body.id;
    var text = req.body.text;
    var name = req.body.name;
    var value = req.body.value;
    var q = new Question();
    q.id = id;
    q.name = name;
    q.text = text;
    q.value = value;
    q.save();
    res.send(q);
  });
};
module.exports = routes;
