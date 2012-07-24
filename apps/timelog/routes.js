var express = require('express');
var redis = require('node-redis').createClient();
//var timelog = require('./time-log.js');

var routes = function (app) {

  var io = app.settings.io;

  function hget(err, obj) {

    var pies = [];

    if (obj === null) {
      req.flash('info', 'Error getting pie ...');
      res.redirect('/admin');
      return 0;
    } else {

      req.flash('info', 'Retrieving pie ' + id + ' ...');
      var pies = [];
      var pie = new Pie(id);
      pie = JSON.parse(obj);

      pies.push(pie);

    }
    res.render('pie', {
      title: 'View Pie',
      stylesheet: 'sidewalk',
      pies: pies
    });
  }


  app.post('/timelog/api/tasks/:id', function (req, res) {

    var id = req.params.id;

    var body = req.body;
    body.id = id;

    var json = JSON.stringify(body);

    redis.hset('Task:development', id, json, function (err, code) {
      if (err === null) io.sockets.emit('task:welcome', json + 'was saved ...');
    });

    res.send(json);
  });


  app.post('/timelog/api/tasks', function (req, res) {


    var io = app.settings.io;

    var id = new Date().getTime();

    var body = req.body;
    body.id = id;

    var json = JSON.stringify(body);

    redis.hset('Task:development', id, json, function (err, code) {
      if (err === null) io.sockets.emit('task:welcome', json + 'was saved ...');
    });

    res.send(json);
  });




  app.get('/timelog', function (req, res) {
    res.sendfile(__dirname + '/index.html');
  });

  app.get('/timelog/api/tasks/*', function (req, res) {
     var id = req.params.id;
    res.redirect('/timelog/');
  }); 

  app.put('/timelog/api/tasks/*', function (req, res) {
    var id = req.params.id;
    var json = req.body.json;

    function hset(err, code) {
      if (err === null) {
        // var io = app.settings.io;
        // io.sockets.emit('pie:changed', pie);
      }
    }

    function hget(err, obj) {
      if (obj === null) {
        req.flash('info', 'Error getting pie ...');
        res.redirect('/admin');
        return 0;
      }
    }

    res.send('ok');

  });

};

module.exports = routes;
