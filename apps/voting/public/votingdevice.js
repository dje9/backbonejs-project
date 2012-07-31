/*global window, _, $ */
var VotingDeviceView, VotingDeviceRouter;
window.Question = window.Backbone.Model.extend({
  url: function () {
    var MAX_ID = 128000;
    if (this.id === undefined || this.id === null) {
      this.id = Math.floor((MAX_ID * Math.random()) + 1);
    }
    return '/votingdevice/question/' + this.id;
  },
  isTrue: function () {
    return this.attributes.value === true;
  },
  isFalse: function () {
    return !this.isTrue();
  }
});
window.Questions = window.Backbone.Collection.extend({
  model: window.Question,
  url: '/votingdevice/questions'
});

window.QuestionView = window.Backbone.View.extend({
  template: _.template($('#question-template').html()),
  tagName: 'li',
  initialize: function (options) {
    this.model.bind('update', this.update);
    this.model = options.model;
    _.bindAll(this, 'render');
  },
  update: function () {
    this.save(); // have the model save itself
  },
  render: function () {
    var renderedContent;
    renderedContent = this.template({
      model: this.model
    });
    $(this.el).html(renderedContent);
    return this;
  }
});
window.QuestionListView = window.Backbone.View.extend({
  template: _.template($('#questions-template').html()),
  tagName: 'ol',
  initialize: function (options) {
    this.questions = options.questions;
    this.questions.bind('add', this.render);
  },
  events: {
    'click .vote': 'change'
  },
  render: function () {
    var renderedContent;
    renderedContent = this.template({
      collection: this.questions.models
    });
    $(this.el).html(renderedContent);
    var ol = $(this.el);
    this.questions.each(function (model) {
      var view = new QuestionView({
        model: model
      });
      ol.append(view.render().el);
    });
    this.updateQuestion();
    return this;
  },
  refresh: function (e) {
    console.log(e);
  },
  change: function (e) {
    var target, id, value, model;
    target = e.currentTarget;
    value = target.getAttribute('data-value');
    id = target.getAttribute('data-id');
    model = _.find(this.questions.models, function (model) {
      return model.id == id; // === doesn't work apparently
    });
    model.attributes.value = value;
    console.log(model);
    model.trigger('update');
  },
  updateQuestion: function () {}
});
window.VotingDeviceRouter = window.Backbone.Router.extend({
  routes: {
    '': 'home'
  },
  initialize: function () {
    var qs = new window.Questions();
    var q = new window.Question({
      id: 3434,
      text: 'Are you a democrat',
      name: 'q12',
      value: true
    });
    qs.add(q);
    this.view = new window.QuestionListView({
      questions: qs
    });
  },
  home: function () {
    var container = $('#container');
    container.html(this.view.render().el);
  }
});
$(function () {
  window.app = new window.VotingDeviceRouter();
  window.Backbone.history.start(window.app);
});
