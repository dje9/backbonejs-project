/*global window, _, $ */
var backbone, VotingDeviceView, VotingDeviceRouter;

window.Question = window.Backbone.Model.extend({
  url: function () {
    var MAX_ID = 128000;
    if (this.id === undefined || this.id === null) {
      this.id = Math.floor((MAX_ID * Math.random()) + 1);
    }
    return '/votingdevice/question/' + this.id;
  },
  update: function (newValue) {
    this.attributes.value = newValue; 
    this.trigger('refresh');
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
window.VotingDeviceView = window.Backbone.View.extend({
  template: _.template($('#voting-template').html()),
  tagName: 'div',
  className: 'questionaire',
  events: {
    'click .submit': 'submit',
    'click .vote': 'change'
  },
  initialize: function (options) {
    this.questions = options;
    _.bindAll(this, 'render', 'change', 'submit');
    this.questions.bind('refresh', this.render);
  },
  submit: function (options) {
    console.log('submit entered');
    console.log(options);
  },
  change: function (e) {
    var target, id, value, model;
    target = e.currentTarget;
    id = target.getAttribute('data-id');
    value = target.getAttribute('data-value');
    model = _.find(this.questions.models, function (model) {
      return model.attributes.id === id;
    });
    model.update(value);
  },
  render: function () {
    var models, renderedContent;
    models = this.questions.models;
    renderedContent = this.template({
      questions: models
    });
    $(this.el).html(renderedContent);
    return this;
  }
});
window.VotingDeviceRouter = window.Backbone.Router.extend({
  routes: {
    '': 'home'
  },
  initialize: function () {
    this.questions = new window.Questions();
    var q = new window.Question({
      id: 3434,
      text: 'Are you a democrat',
      name: 'q12',
      value: true
    });
    this.questions.add(q);
    this.votingDeviceView = new window.VotingDeviceView(this.questions);
  },
  home: function () {
    var container = $('#container');
    container.html(this.votingDeviceView.render().el);
  }
});
$(function () {
  window.app = new window.VotingDeviceRouter();
  window.Backbone.history.start(window.app);
});
