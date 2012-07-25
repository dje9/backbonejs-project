(function ($) {
  window.Question = Backbone.Model.extend({
    url: function () {
      var MAX_ID = 128000;
      if (this.id === undefined || this.id === null) {
        this.id = Math.floor((MAX_ID * Math.random()) + 1)
      }
      return '/votingdevice/questions/' + this.id;
    },
    update: function (newValue) {
      this.attributes.value = newValue;
      console.log('value changed');
      this.trigger('refresh');
    },
    isTrue: function () {
      return this.attributes.value === true;
    },
    isFalse: function () {
      return !this.isTrue();
    }
  });

  window.Questions = Backbone.Collection.extend({
    model: window.Question,
    url: '/votingdevice/questions'
  });

  window.VoteDeviceView = Backbone.View.extend({
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
      var target = e.currentTarget;
      var id = target.getAttribute('data-id');
      var value = target.getAttribute('data-value');
      var model = _.find(this.questions.models, function (model) {
        return model.attributes.id == id;
      });
      model.update(value);
    },
    render: function () {
      console.log('VoteDeviceView:render');

      var models = this.questions.models;
      var renderedContent = this.template({
        questions: models
      });
      console.log(renderedContent);
      $(this.el).html(renderedContent);
      return this;
    }
  });

  window.VotingDevice = Backbone.Router.extend({
    routes: {
      '': 'home',
      'blank': 'blank'
    },
    initialize: function () {
      this.questions = new window.Questions();
      var q = new Question({
        id: 3434,
        text: 'Are you a democrat',
        name: 'q12',
        value: true
      });
      this.questions.add(q);
      console.log(q);
      this.voteDeviceView = new window.VoteDeviceView(this.questions);
    },
    home: function () {
      var container = $('#container');
      container.html(this.voteDeviceView.render().el);
    },
    blank: function () {
      var container = $('#container');
      container.empty();
      container.text('blank');
    }
  });

  $(function () {
    window.App = new VotingDevice();
    Backbone.history.start();
  });

})(jQuery);
