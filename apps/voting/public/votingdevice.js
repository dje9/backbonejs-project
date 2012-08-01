 /*global window, _, $ */
var VotingDeviceView, VotingDeviceRouter;

window.socket = io.connect('http://localhost:3000');
  window.socket.on('event:welcome', function (data) {
  alert(data);
  window.socket.emit('none', 'hell');
});  

window.Question = window.Backbone.Model.extend({    
    defaults: {
      id: function () {
        var MAX_ID = 128000;
        return Math.floor((MAX_ID * Math.random()) + 1);
      },
     name: 'q',
     value: false,
     text: 'default text'      
    }, 
    url: function () {
        var MAX_ID = 128000;
        if (this.id === undefined || this.id === null) {
          this.id = Math.floor((MAX_ID * Math.random()) + 1);
        }
        return '/api/question/' + this.get('id');
    },  
    socket: window.socket,
    validate: function(attribs){
      if(attribs.text === undefined) {
        return 'Please set a text for the question';
      }
    },
    initialize: function () {
      _.bindAll(this);
      this.ioBind('update', socket, this.update, this);
      this.ioBind('delete', socket, this.delete, this);
      this.ioBind('create', socket, this.create, this);
      this.ioBind('read', socket, this.read, this);

      this.on('change:value', function () {
        console.log('Model: value has changed: ' + this.get('value'))        
      });      
      this.on('change:text', function () {
        console.log('Model: text has changed: ' + this.get('text'));      
      });            
      this.socket.on('question:updated', function () { 
          console.log('question:updated');
      });

      console.log('model has been initialized');
    },
    setValue: function (newValue) {
      if(newValue) {
        console.log('Model: setting value');       
        this.set({ value: newValue });
        this.trigger('update');
      }
    },
    setText: function (newText) {
      if(newText) {
        console.log('Model: setting text');
        this.set({ text: newText });
      }
    },    
    update: function () { 
        console.log('Model: updating'); 
        this.socket.emit('question:update', this);  
    },
    delete: function () {
    },
    create: function () {
    },
    read: function (data) {
      socket.on('votingdevice:read', function (data) {
        alert('im sending data' + data);
      }); 
      console.log('read');    
    },
    isTrue: function () {
      return this.get('value') === true;
    },
    isFalse: function () {
      return !this.get('value') === true;
    }
});

window.Questions = window.Backbone.Collection.extend({
  model: window.Question,
  url: '/api/questions',
  socket: window.socket,
  initialize: function () {
    _.bindAll(this);
  }
});

window.QuestionView = window.Backbone.View.extend({
  tagName:'li', 
  template: _.template($('#question-template').html()), 
  events: {
    'click.vote': 'changeValue'
  },
  initialize: function () {
    _.bindAll(this, 'render');
    this.model.on('change', this.render);
    this.model.on('destroy',this.remove);
  },
  remove: function () {
  },
  changeValue: function (event) {
    var target, id, value, model;
    target = event.target;
    if(target) {
      value = target.getAttribute('data-value');
      id = target.getAttribute('data-id');
      this.model.setValue(value);
    }
  },
  changeText: function (event) {
    var target, id, value, model;
    target = event.target;
    if(target) {
      this.model.setText('New Text');
    }
  },
  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  }
});

window.QuestionListView = window.Backbone.View.extend({
  tagName: 'ol',
  initialize: function () {
    _.bindAll(this, 'render');
    this.collection.on('add', function (question) { 
      console.log(question.id + ' added ');    
    });
    this.collection.on('remove', function (question) { 
      console.log(question.id + ' removed ');    
    });
    this.collection.on('change:value', function (question) { 
      console.log('QuestionListView: ' + question.id + ' value has changed');    
    });
  },
  render: function () {  
    var collection = this.collection.toArray();    
    var index;

    for(index = 0; index < collection.length; index++) {
      var view = new QuestionView({ 
        model: collection[index] 
      });
      $(this.el).append(view.render().el);
    }
    return this;
  }
});

window.VotingDeviceRouter = window.Backbone.Router.extend({
  routes: {
    '': 'home',
    'question/:id': this.getQuestion,
  },
  initialize: function () {
      var qs = new Questions();
      var q1 = new window.Question({
        id: 3434,
        text: 'Are you a democrat',
        name: 'q12',
        value: true
      });
     var q2 = new window.Question({
        id: 3464,
        text: 'Are you a older than 70',
        name: 'q14',
        value: false
      });
    qs.add([q1, q2]);
    this.view = new window.QuestionListView({
      collection: qs
    });
  },
  home: function () {
    var container = $('#container');
    container.html(this.view.render().el);
  },
  getQuestion: function (id) {
    console.log('getting question');
  }
});

$(function () {
  var app = new VotingDeviceRouter();
  window.Backbone.history.start();
  app.navigate('');
});
