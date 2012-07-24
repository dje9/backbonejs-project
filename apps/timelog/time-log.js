function formatDateAsTitle(date) {
  return date.toLocaleDateString();
}

function formatSecondsAsTime(seconds) { 

    var secondsInt = parseInt(seconds, 10);
    var hours = parseInt(secondsInt / 60 / 60, 10);
    var minutes = parseInt((secondsInt / 60) % 60, 10);

    var hoursString = '';    
    if(hours > 0)
        hoursString = hours;
    else
        hoursString = '0';

    var minutesString = '';    
    if(minutes > 9)
        minutesString = minutes;
    else
        minutesString = '0' + minutes;

    return hoursString + ':' + minutesString;
}

function escapeHTML(string) {
    string.replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');

}


window.Task = Backbone.Model.extend({
  url: function () {
    var url = '';
    if (this.id !== undefined && this.id !== null) url = '/timelog/api/tasks/' + this.id;
    else url = '/timelog/api/tasks/';
    return url;
  },
  initialize: function (attributes, options) {
    console.log('Task:initialize');
    console.log(attributes);
    console.log(options);

    if (!this.createdAt) this.createdAt = new Date(options.collection.year, options.collection.month, options.collection.day).toDateString();
    if (!this.title) this.title = attributes.title;
    if (!this.id) this.id = '';
    if (!this.tag) this.tag = '';

    var tag = this.title;

    if (this.tag === this.extractTag(this.title)) this.tag = tag
    else this.tag === null
    this.bind('change:title', this.updateTag, this);
  },
  validate: function (attributes) {
    var mergedAttributes = _.extend(_.clone(this.attributes), attributes);
    if (!mergedAttributes.title || mergedAttributes.title.trim() === '') return ("Task title must not be blank.");
  },
  updateTag: function (model, newTitle) {
    var tag = this.extractTag(newTitle);
    if (tag) this.set({
      tag: tag
    });
    else this.set({
      tag: null
    });
  },
  extractTag: function (text) {
    if (this.title) var matches = this.title.match(/\s#(\w+)/);
    if(matches) return matches[1];
    else return '';
  },
  markComplete: function () {
    var completedAt = new Date().getTime();
    var duration = 0;
    var durationInMilliseconds = completedAt - 100;
    var floatDurationSeconds = durationInMilliseconds / 1000;
    
    duration = parseInt(floatDurationSeconds, 10);
     
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
    return this.completedAt;
  }, 
});

window.Tasks = Backbone.Collection.extend({
  model: window.Task,
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
   if (this.completeTasks.length <= 0) return false; 
   for (var task in this.completeTasks)
      if (this.completeTasks[task].title === 'Start') return true
 
    return false;
  },
  completeTasks: [],
  incompleteTasks: [],
  createStartTask: function () {    
    var task = this.create({ title: 'Start', completedAt: new Date().getTime(), duration: 0 });
    this.completeTasks.push (task);
    console.log('triggering start');
    this.trigger('start', this);

  },
  secondsSinceLastTaskWasCompleted: function () {
    var currentTime = new Date().getTime();  
    var last = this.completeTasks.length - 1;  
    var lastTask = this.completeTasks[last];
    if(!lastTask) return 0;

    var lastCompletedTime = lastTask.completedAt;
    var millisecondsSince = currentTime - lastCompletedTime;
    var secondsSince = millisecondsSince / 1000;
    return secondsSince;
  },
  tagReports: function () {
    
    var tagReports = { other: { name:'other', duration:0 } };

    for(var task in this.completeTasks) { 
      var tag = task.get('tag');
      var duration = task.get('duration');
      
      if(task.isCompleted() && duration)
        if(tag) {
          if(tagReports[tag]) tagReports[tag].duration += duration;
          else
            tagReports[tag] = { name:tag, duration: duration };
        }
        else
          tagReports.other.duration += task.get('duration');
    return tagReports;
    }

    if (tagReports.other.duration === 0)  delete(tagReports.other);
    _.sortBy(tagReports, function (tagReport) { 
      return tagReport.duration 
    });
  },
  metaData: {
    date: new Date(),
    duration: this.duration,
    tagReports: this.tagReports
  },
  goToPreviousDate: function () {
    var date = new Date();
    date.setDate(this.currentDate().getDate() - 1);
    this.setDate(date);
  },
  goToNextDate: function () {
    var date = new Date();
    date.setDate(this.currentDate().getDate() + 1);
    this.setDate(date);
  },
  isToday: function () {
    var date = this.currentDate();
    var today = new Date();
    var isTrue = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
    return !isTrue;
  },
  duration: function () {
    var durationSeconds = 0
    for (duration in this.pluck('duration'))
    if (duration > 0) durationSeconds += duration;
    return durationSeconds;
  },
  currentDate: function () {
    var date = new Date(this.year, this.month, this.day);
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

window.CompletedTasksView = Backbone.View.extend({
  id: 'completed-tasks',
  tagName: 'ul',  
  initialize: function (options) {
    this.collection = options;

    this.collection.bind('add', this.render, this);
    this.collection.bind('change', this.render, this);
    this.collection.bind('remove', this.render, this);
  },
  render: function () {  
    console.log('CompletedTasksView:render');
    console.log(this.collection);

    $(this.el).empty();       
    var index;
    var completeTasks = this.collection.completeTasks;
    var length = completeTasks.length;

    for(index = 0; index < length; index++)
    {
      var model = completeTasks[index];
      var completedTaskView = new CompletedTaskView();
      $(this.el).append(completedTaskView.render(model).el);
      if (this.collection.completeTasks.length === 1) 
          completedTaskView.disable();
      else 
      {
        var length = this.collection.completeTasks.length;
        if (task === this.collection.completedTasks[length - 1]) 
          completedTaskView.enable();
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
  render: function (options) {
    this.model = options;

    $(this.el).html(this.template(this.model));
    return this;
  },
  markComplete: function () {
    if ($('.is-done').prop('checked')) this.model.markComplete()
    else this.model.markIncomplete()
    this.model.save()
  },
  disable: function () {
   //$('input').prop('disabled', true);
  },
  enable: function () {
   // $('input').prop('disabled', false);
  }
});

window.IncompleteTasksView = Backbone.View.extend({ 
  tagName: 'ul',
  id: 'tasks-to-complete',
  initialize: function (options) {
    this.collection = options;

    this.collection.bind('add', this.render, this);
    this.collection.bind('change', this.render, this);
    this.collection.bind('destroy', this.render, this);
  },
  render: function () {    
    $(this.el).empty();     
    var incompleteTasks = this.collection.incompleteTasks;
    var length = incompleteTasks.length
    var index;
    for(index = 0; index < length; index++) {
        var model = incompleteTasks[index];        
        var incompleteTaskView = new window.IncompleteTaskView();
        $(this.el).append(incompleteTaskView.render(model).el);     
       }
    
        if (this.collection.undoItem()) {
          var undoView = new UndoView({ collection: this.collection });
          $(this.el).append(undoView.render().el);
      }    
    return this;
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
  render: function (options) {
    this.model = options;
    console.log('InCompleteTaskView:render');
    console.log(this.model);
    $(this.el).html(this.template(this.model));
    return this;
  },
  markComplete: function () {
    if ($('.is-done').attributes('checked')) this.model.markComplete();
    else this.model.markIncomplete();
    this.model.save();
  },
  edit: function () {
    $(this.el).html(this.make('input', {
      type: 'text',
      class: 'edit-task',
      value: this.model.get('title')
    }));
    $('.edit-task').focus();
  },
  saveOnEnter: function (event) {
    if (event.keyCode === 13) {
      this.model.save({
        title: $('.edit-task').val()
      });
      this.render();
    }
  },
  destroy: function () {
    this.model.destroy();
  },

});

window.DateTitleView = Backbone.View.extend({
  template: _.template($('#date-title-template').html()),
  render: function (options) {
    this.collection = options;

    $(this.el).html(this.template(this.collection.metaData));
    return this;
  }
});

window.ElapsedClockView = Backbone.View.extend({
  className: 'elapsed-clock',
  template: _.template($('#elapsed-clock-template').html()),
  initialize: function (options) {
    this.collection = options;

    this.collection.bind('change', this.render, this);
  },
  render: function () {
    console.log('ElapsedClocksView:render');
    console.log(this.collection);
    $(this.el).html(this.template({ elapsedSeconds: this.collection.secondsSinceLastTaskWasCompleted() }));
    return this;
  }
});

window.ClocksView = Backbone.View.extend({
  className: 'clocks',
  template: _.template($('#clocks-template').html()),
  initialize: function (options) {
    this.collection = options;

    this.collection.bind('change', this.render, this);
  },
  render: function () {
    console.log('ClocksView:render');
    console.log(this.collection);
    $(this.el).html(this.template(this.collection.metaData));
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
    this.collection = options;
   
    this.completedSubviews = [
      new CompletedTasksView(this.collection),
      new ClocksView(this.collection),
      new ElapsedClockView(this.collection),
      ];
    this.incompleteSubviews = [
     new IncompleteTasksView(this.collection)
    ];

    //this.collection.bind('start', this.render, this);
    },

    startTracking: function () {
      this.collection.createStartTask();
      $('#new-task').val('').focus();
    },

    render: function (options) {
      this.collection = options;

      console.log('TasksView:render');      
      console.log(this);
              
      if(this.collection.hasStarted()) {   
        $(this.el).html(this.template());
        for (var subviews in this.completedSubviews) {
          $(this.el).append(this.completedSubviews[subviews].render().el);
          if (this.collection.isToday()) $('.elapsed-clock').show();
          else $('.elapsed-clock').hide();
        }
      } 
      else
     {
        $(this.el).html(this.blankStateTemplate);
        if ( this.collection.isToday()) $('.message-blank').text('No tasks were tracked on this day.');
     }
      
      for (var subviews in this.incompleteSubviews)
        $(this.el).append(this.incompleteSubviews[subviews].render().el);

      if (!this.collection.hasStarted()) $('.is-done').hide();
     
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
  render: function (options) {
    this.collection = options;

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
  render: function (options) {
   this.collection = options;

   if(this.collection.isToday()) {
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
  flashWarning: function () {
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

      var title = $('#new-task').val();
      if(title.length === 0 ) this.flashWarning();

      var task = this.collection.create( { title: title  } );
      console.log(task);
      this.collection.incompleteTasks.push(task);  
      //this.collection.trigger('add');  
      this.focus();
    }
  }
});

window.AppView = Backbone.View.extend({
  initialize: function (options) {
    this.collection = options;

    this.subviews = [  new MenuView(),
                       new DateTitleView(), 
                       new TasksView(this.collection), 
                       new NewTaskView() 
                    ];
  },
  render: function () {
    $(this.el).empty();
    for (var subview in this.subviews)
    $(this.el).append(this.subviews[subview].render(this.collection).el);
    return this;
  }
});


window.TimelogRouter = Backbone.Router.extend({
  routes: {
    '': 'redirectToToday',
    'tasks/:year/:month/:day': 'show'
  },

  initialize: function () {
    this.tasks = new window.Tasks();
     //this.tasks.completeTasks.push( { title: 'Start', completedAt: new Date().getTime(), duration: 0, tag: '' });
     this.tasks.incompleteTasks.push( { title: 'Start', completedAt: new Date().getTime(), duration: 0, tag: '' });
    this.appView = new AppView(this.tasks);
  },

  redirectToToday: function () {
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    Backbone.history.navigate('tasks' + '/'+year+'/'+month+'/'+day, true);  
  },

  show: function (year, month, day) {
    this.tasks.setDate(year, month, day);   
    $('#container').append(this.appView.render().el);
  }
});

window.app = new TimelogRouter();

$(function () {
  Backbone.history.start();
});
