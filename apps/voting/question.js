var redis = require('node-redis').createClient();

function Question () {  
  this.save = function () {
    redis.hset('Pie:development', this.id, 
      JSON.stringify(this), function(err, code) { });      
  };
}

module.exports = Question;
