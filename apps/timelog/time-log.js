function formatDateAsTitle(date) {
  return date.toLocaleDateString();
}


window.Task = Backbone.Model.extend({
    tag: '',
    url: function () {
      var url = '';
      if (this.id !== undefined && this.id !== null) url = '/timelog/api/tasks/' + this.id;
      else url = '/timelog/api/tasks/';
      return url;
    },  
  initialize: function(attributes, options) {
    if (!attributes.createdAt)
      this.attributes.createdAt = new Date().toDateString();
    if (tag = this.extractTag(attributes.title))
      this.attributes.tag = tag
    else
      this.attributes.tag = null
    this.bind('change:title', this.updateTag, this);
    },
  validate: function(attributes){    
    var mergedAttributes = _.extend(_.clone(this.attributes), attributes);
    if (!mergedAttributes.title || mergedAttributes.title.trim() === '')
      return("Task title must not be blank.");
      },
  updateTag: function(model, newTitle) {
    var tag = this.extractTag(newTitle);
    if(tag)
      this.set({tag:tag});
    else
      this.set({tag:null});
  },
  extractTag: function(text){
    if(this.attributes.title)
      var matches = this.attributes.title.match(/\s#(\w+)/);
     // if(matches.length > 0)
       // return matches[1];

    return '';
    },  
  markComplete: function () {
    var completedAt = (new Date).getTime();
    var duration = 0;
    var length = this.collection.completedTasks().length;
    if (this.collection) var mostRecentCompletedTask = this.collection.completedTasks()[length - 1];
    if (mostRecentCompletedTask) {
      var durationInMilliseconds = (completedAt - mostRecentCompletedTask.get('completedAt'));
      var floatDurationSeconds = durationInMilliseconds / 1000;
      duration = parseInt(floatDurationSeconds, 10);
    }
    this.set({
      completedAt: completedAt,
      duration: duration
    });
  },
  markIncomplete: function () {
    this.set({
      completedAt: null,
      duration: 0
    });
  },
  isCompleted: function () {

    return this.attributes.completedAt;
  }
});

window.Tasks = Backbone.Collection.extend({
  model: window.Task,
  url: '/timelog/api/tasks',
  initialize: function (options) {
    this.bind('destroy', this.willDestroyTask, this);
  },
  setDate: function (year, month, day) {
    var date = new Date();

    if (month === undefined && day === undefined) date = year;

    this.day = date.getDate();
    this.month = date.getMonth() + 1;
    this.year = date.getFullYear();

    this.url = '/timelog/api/tasks/' + year + '/' + month + '/' + day;

    this.fetch();

    this.trigger('change:date');

    console.log('change:date triggered');
  },
  hasStarted: function () {
    var completedTasks = this.completedTasks();
    
    if (completedTasks.length === 0) return false;

    for (var task in completedTasks)
      //if (completedTasks[task].title === 'Start') return true

    return false
  },
  completedTasks: function () {
    tasks = [{
      title: 'Save yourself'
    }];
    return tasks;
  },
  incompleteTasks: function () {
    tasks = [{
      title: 'Save noone'
    }];
    return tasks;
  },
  createStartTask: function () {
    var attributes = {
      title: 'Start',
      completedAt: new Date().getTime(),
      duration: 0
    };
    var options = {
      success: function () {
        console.log('triggering start');
        this.trigger('start', this);
      },
      error: function () {
        alert('fail');
      },
    };
    this.create(attributes, options);
  },

  tagReports: function () {},
  metaData: {
    date: new Date(),
    duration: this.duration,
    tagReports: this.tagReports
  },
  goToPreviousDate: function () {},
  gotToNextDate: function () {},
  isToday: function () {
    var date = this.currentDate();
    var today = new Date();
    var isTrue = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
    //console.log(isTrue);
    return !isTrue;
  },
  duration: function () {
    var durationSeconds = 0
    for (duration in this.pluck('duration'))
    if (duration > 0) durationSeconds += duration;
    return durationSeconds;
  },
  currentDate: function () {
    var date = new Date(this.year, this.month - 1, this.day);
    return date;
  },

  willDestroyTask: function (task) {
    this.registerUndo(task.toJSON());
  },
  registerUndo: function (attributes) {
    this.undoAttributes = attributes;
    if (this.undoAttributes.id) delete(this.undoAttributes.id);
    if (this.undoAttributes.createdAt) delete(this.undoAttributes.createdAt);
  },
  applyUndo: function () {
    this.create(this.undoAttributes);
    this.resetUndo();
  },
  undoItem: function () {
    return this.undoAttributes;
  },


});

//window.tasks = new Tasks();
//window.tasks.add({
 // title: 'Save the princess'
//});

window.UndoView = Backbone.View.extend({
  tagName: 'li',
  id: 'undo-template',
  template: _.template($('#undo-template').html()),
  className: 'task',
  events: {
    'click .undo-button': 'applyUndo'
  },
  render: function () {
    $(this.el).html(this.template(this.collection.undoItem()));
    return this;
  },
  applyUndo: function () {
    this.collection.applyUndo();
  }
});




window.CompletedTaskView = Backbone.View.extend({
  tagName: 'ul',
  id: 'completed-tasks',
  initialize: function () {
    this.collection.bind('add', this.render, this);
    this.collection.bind('change', this.render, this);
    this.collection.bind('remove', this.render, this);
  },
  render: function () {
    $(this.el).empty();

    for (var task in this.collection.completedTasks()) {
      var completedTaskView = new CompletedTaskView({ model: task });
      $(this.el).append(completedTaskView.render().el);
      if (this.collection.completedTasks().length === 1) completedTaskView.disable();
      else {
        var length = this.collection.completedTasks().length;

        if (task === this.collection.completedTasks()[length - 1]) completedTaskView.enable();
        else completedTaskView.disable();
      }
    }

    return this;
  }


});

window.CompletedTaskView = Backbone.View.extend({
  className: 'task',
  tagName: 'li',
  template: _.template($('#completed-task-template').html()),
  events: {
    'click input.is-done': 'markComplete'
  },
  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));  
    return this;
  },
  markComplete: function () {
    //if ($('.is-done').prop('checked')) this.model.markComplete()
    //else this.model.markIncomplete()
    this.model.save()
  },
  disable: function () {
    //$('input').prop('disabled', true);
  },
  enable: function () {
   // $('input').prop('disabled', false);
  }


});

window.IncompleteTaskView = Backbone.View.extend({
  className: 'task',
  tagName: 'li',
  template: _.template($('#incomplete-task-template').html()),
  events: {
    'click input.is-done': 'markComplete',
    'click .destroy': 'destroy',
    'click .edit': 'edit',
    'keypress .edit-task': 'saveOnEnter'
  },
  render: function () {
    $(this.el).html(this.model.toJSON());  
    return this;
  },
  markComplete: function(){
      if($('.is-done').attributes('checked'))
        this.model.markComplete();
      else
        this.model.markIncomplete();
      this.model.save();
  },
  edit: function(){
      $(this.el).html(this.make('input', { type:'text', class: 'edit-task', value: this.model.get('title')}));
      $('.edit-task').focus();
 },
   saveOnEnter: function(event) {
      if(event.keyCode === 13){ 
        this.model.save( {title: $('.edit-task').val()});
        this.render();
        }
   },
  destroy: function(){
      this.model.destroy();
      },

});

window.IncompleteTaskView = Backbone.View.extend({
  tagName: 'ul',
  id: 'tasks-to-complete',
  initialize: function () {
    //this.collection.bind('add', this.render, this);
    //this.collection.bind('change', this.render, this);
   // this.collection.bind('destroy', this.render, this);
  },
  render: function () {   
    $(this.el).empty();
    
    var incompleteTasks = this.collection.incompleteTasks();
    var i;
    for (i = 0; i < incompleteTasks.length; i++){
        var incompleteTaskView = new IncompleteTaskView({ model: new Task({title:'Save me' })});
      $(this.el).append(incompleteTaskView.render().el);
    }
    if (this.collection.undoItem()) {
      var undoView = new UndoView({collection: this.collection });
      $(this.el).append(undoView.render().el);
    }

    return this;
  }


});

window.DateTitleView = Backbone.View.extend({
  template: _.template($('#date-title-template').html()),
  render: function () {
    $(this.el).html(this.template(this.collection.metaData));
    return this;
  }

});

window.ElapsedClockView = Backbone.View.extend({
    className: 'elapsed-clock',
    template: _.template($('#elapsed-clock-template').html()),
    initialize: function(){
      this.collection.bind('change', this.render, this);
    },
    render: function(){
      $(this.el).html(this.template( { elapsedSeconds: this.collection.secondsSinceLastTaskWasCompleted() } ));
      return this;
      }
});

window.ClocksView = Backbone.View.extend({
    className: 'clocks',
    template: _.template($('#clocks-template').html()),
    initialize: function(){
      this.collection.bind('change', this.render, this);
     },
    render: function(){
      $(this.el).html(this.template(this.collection.metaData()));
      return this;
    }
});
      
window.TasksView = Backbone.View.extend({
  className: 'tasks',
  template: _.template($('#tasks-template').html()),
  blankStateTemplate: _.template($('#blank-state-template').html()),
  events: {
    'click .start-tracking': 'startTracking'
  },
  initialize: function (options) {   
    this.completedSubviews = [
        new CompletedTaskView({collection: this.collection, model: window.Task}),
        //new ClocksView({collection: this.collection}),
        //new ElapsedClockView({collection: this.collection})
    ];
    this.incompleteSubviews = [
      //new IncompleteTaskView({ collection: this.collection })
    ];
    //this.collection.bind('start', this.render, this);
  },
  startTracking: function () {
      
      this.collection.createStartTask();
      $('#new-task').val('').focus();
  },
  render: function () {
     if(this.collection.hasStarted()){
        $(this.el).html(this.template());
            for (var subviews in this.completedSubviews){
              $(this.el).append(this.completedSubviews[subviews].render().el);
              if(this.collection.isToday())
                $('.elapsed-clock').show();
              else
                $('.elapsed-clock').hide();
            }
     }
     else {
        $(this.el).html(this.blankStateTemplate());
        if(this.collection.isToday())
          $('.message-blank').text('No tasks were tracked on this day.');
    }

      for (var subviews in this.incompleteSubviews)
        $(this.el).append(this.incompleteSubviews[subviews].render().el);  

      if(!this.collection.hasStarted()) $('.is-done').hide();
      this.delegateEvents();
      
    return this;
  }

});

window.MenuView = Backbone.View.extend({
  tagName: 'nav',
  template: _.template($('#menu-template').html()),
  events: {
    'click .previous': 'goToPreviousDate',
    'click .today': 'goToToday',
    'click .next': 'goToNextDate'
  },
  render: function () {
    $(this.el).html(this.template);
    this.delegateEvents();
    return this;
  },
  goToPreviousDate: function (event) {
    this.collection.goToPreviousDate();
  },
  goToToday: function (event) {
    this.collection.setDate(new Date());
  },
  goToNextDate: function (event) {
    this.collection.goToNextDate();
  }
});



window.NewTaskView = Backbone.View.extend({
  tagName: 'form',
  events: {
    'keypress #new-task': 'saveOnEnter',
    'focusout #new-task': 'hideWarning'
  },
  template: _.template($('#new-task-template').html()),
  initialize: function () {
    _.bindAll(this, 'render');
  },
  render: function () {
    if (this.collection.isToday()) {
      $(this.el).html(this.template);
      this.delegateEvents();
    } else $(this.el).empty();

    return this;
  },
  focus: function () {
    $('#new-task').val('').focus();
  },
  hideWarning: function () {
    $('#warning').hide();
  },
  flashWarning: function (model, err) {
    console.log(err);
    $('#warning').fadeOut(100);
    $('#warning').fadeIn(400);
  },
  resetUndo: function () {
    this.undoAttributes = null;
  },
  saveOnEnter: function (event) {
    console.log('saveOnEnter triggered');
    if (event.keyCode === 13) {
      event.preventDefault();
      var attributes = {
        title: $('#new-task').val()
      };
      var options = {
        error: function (err) {
          alert(err);
        } //this.flashWarning
      };

      var task = this.collection.create(attributes, options);

      console.log(task);

      if (task !== undefined) {
        this.hideWarning();
        this.focus();
      }

    }


  }

});



window.AppView = Backbone.View.extend({
  subviews: [
  new MenuView({
    collection: this.collection
  }),
  new DateTitleView({
    collection: this.collection
  }),
  new TasksView({
    collection: this.collection
  }),
  new NewTaskView({
    collection: this.collection
  })],
  initialize: function (options) {
    this.collection.bind('refresh', this.render, this);
  },
  render: function () {
    $(this.el).empty();
    for (var subview in this.subviews)
      $(this.el).append(this.subviews[subview].render().el);
    return this;
  }

});


window.tasks = new window.Tasks()
tasks.add({title: 'Save the princess'});
tasks.add({title: 'Save the prince'});



window.TimelogRouter = Backbone.Router.extend({
  routes: {
    '': 'redirectToToday',
    'tasks/:year/:month/:day': 'show'
  },

  initialize: function () {

  },

  redirectToToday: function () {
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    //Backbone.history.navigate('tasks' + '/'+year+'/'+month+'/'+day, true);

      
    var appView = new AppView({
      collection: window.tasks
    });

    $('#container').append(appView.render().el);
  },
  show: function (year, month, day) {
    window.tasks.setDate(year, month, day);
  }
});


window.app = new TimelogRouter();

$(function () {

  Backbone.history.start();
});
