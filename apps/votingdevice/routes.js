var express = require('express');

var routes = function (app) {
  app.get('/votingdevice', function (req, res) {     
    res.redirect('/votingdevice/index.html');
  });
};

module.exports = routes;
