var express = require('express');

var routes = function (app) {

    app.get('/', function (req, res) {           
      res.sendfile(__dirname + '/index.html');   
    });

    app.get('/album', function (req, res) {     
      res.redirect('/album/index.html');
    });


    app.get('/album/test', function (req, res) {
      res.redirect('/album/SpecRunner.html');
    });

    app.get('/music/:id', function (req, res) {
      var path = __dirname + '/music/' + req.params.id;
      res.sendfile(path, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log('transferred %s', path);
        }
      });
    });

    app.get('/albums', function (req, res) {
      var path = __dirname + '/albums.json';
      res.sendfile(path, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log('transferred %s', path);
        }
      });
    });

  };

module.exports = routes;
