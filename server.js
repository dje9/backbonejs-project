/**
 * Module dependencies.
 */

var express = require('express')
var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

// Configuration

app.configure(function () {
  app.set('port', 3000);
  app.set('io', io);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

app.configure('test', function () {
  app.set('port', 3001);
  app.use(express.errorHandler());
});


// Routes
//require('./apps/album/routes')(app);
//require('./apps/timelog/routes')(app);
require('./apps/voting/routes')(app);

io.sockets.on('connection', function (socket) {
  //socket.emit('task:welcome', 'Welcome to task server');
});


app.listen(app.settings.port, function () {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
