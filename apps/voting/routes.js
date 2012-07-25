var Question = require('./public/model/Question.js');
var express = require('express');

var routes = function (app) {
  app.use(express.static(__dirname + '/public'));

  app.get('/votingdevice', function (req, res) {
    res.sendfile(__dirname + '/index.html');
  });
  app.get('/votingdevice/test', function (req, res) {
    res.sendfile(__dirname + '/SpecRunner.html');
  });
  app.post('/votingdevice/questions', function (req, res) {
    var body = req.body;

    var MAX_ID = 64000;
    var id = Math.floor((MAX_ID * Math.random()) + 1);
    var name = 'q' + id;
    var q = new Question();
    q.id = id;
    q.name = name;
    q.text = body.text;
    q.save();

    res.send({
      question: q
    });
  });
  app.post('/votingdevice/questions/:id', function (req, res) {
    var id = req.params.id;
    var body = req.body;

    var q = new Question();
    var name = 'q' + id;
    q.id = id;
    q.name = name;
   
    q.text = body.text;
    q.save();

    res.send({
      question: q
    });
  });
};

module.exports = routes;
