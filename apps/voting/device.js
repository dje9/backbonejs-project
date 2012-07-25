(function ($) {
  /*window.Album = Backbone.Model.extend({

    isFirstTrack: function (index) {
      return index === 0;
    },

    isLastTrack: function (index) {
      return index >= this.get('tracks').length - 1;
    },

    trackUrlAtIndex: function (index) {
      if (this.get('tracks').length >= index) {
        var url = this.get('tracks')[index].url;
        return url;
      }
      return null;
    }
  });

  window.Albums = Backbone.Collection.extend({
    model: Album,
    url: '/albums'
  });

  window.Playlist = Albums.extend({
    isFirstAlbum: function (index) {
      return (index === 0)
    },

    isLastAlbum: function (index) {
      return (index === (this.models.length - 1))
    }

  });

  window.Player = Backbone.Model.extend({
    defaults: {
      'currentAlbumIndex': 0,
      'currentTrackIndex': 0,
      'state': 'stop'
    },
    initialize: function () {
      this.playlist = new Playlist();
    },

    play: function () {
      this.set({
        'state': 'play'
      });
      return true;
    },

    pause: function () {
      this.set({
        'state': 'pause'
      });
    },

    isPlaying: function () {
      return (this.get('state') === 'play');
    },
    isStopped: function () {
      return (!this.isPlaying());
    },
    currentAlbum: function () {
      if (this.playlist.length === 0) return;
      return this.playlist.at(this.get('currentAlbumIndex'));
    },
    currentTrackUrl: function () {
      var album = this.currentAlbum();
      if (album === undefined) return;

      var index = this.get('currentTrackIndex');
      console.log(index);

      return album.trackUrlAtIndex(index);
    },
    nextTrack: function () {
      var currentTrackIndex = this.get('currentTrackIndex'),
        currentAlbumIndex = this.get('currentAlbumIndex');
      if (this.currentAlbum().isLastTrack(currentTrackIndex)) {
        if (this.playlist.isLastAlbum(currentAlbumIndex)) {
          this.set({
            'currentAlbumIndex': 0
          });
          this.set({
            'currentTrackIndex': 0
          });
        } else {
          this.set({
            'currentAlbumIndex': currentAlbumIndex + 1
          });
          this.set({
            'currentTrackIndex': 0
          });
        }
      } else {
        this.set({
          'currentTrackIndex': currentTrackIndex + 1
        });
      }
      this.logCurrentAlbumAndTrack();
    },

    prevTrack: function () {
      var currentTrackIndex = this.get('currentTrackIndex'),
        currentAlbumIndex = this.get('currentAlbumIndex'),
        lastModelIndex = 0;
      if (this.currentAlbum().isFirstTrack(currentTrackIndex)) {
        if (this.playlist.isFirstAlbum(currentAlbumIndex)) {
          lastModelIndex = this.playlist.models.length - 1;
          this.set({
            'currentAlbumIndex': lastModelIndex
          });
        } else {
          this.set({
            'currentAlbumIndex': currentAlbumIndex - 1
          });
        }
        // In either case, go to last track on album
        var lastTrackIndex = this.currentAlbum().get('tracks').length - 1;
        this.set({
          'currentTrackIndex': lastTrackIndex
        });
      } else {
        this.set({
          'currentTrackIndex': currentTrackIndex - 1
        });
      }
      this.logCurrentAlbumAndTrack();
    },

    logCurrentAlbumAndTrack: function () {
      console.log("Player " + this.get('currentAlbumIndex') + ':' + this.get('currentTrackIndex'), this);
    }

  });

  window.library = new Albums();
  window.player = new Player();

  var fotl = new Album({
    title: 'The Experience',
    artist: 'The Prodigy',
    tracks: [{
      title: 'Track 1',
      url: '/music/blue.mp3'
    }, {
      title: 'Track 2',
      url: '/music/jazz.mp3'
    }, {
      title: 'Track 3',
      url: '/music/mimimalish.mpe'
    }, {
      title: 'Track 4',
      url: '/music/slower.mp3'
    }]
  });
  window.library.add(fotl);



  window.AlbumView = Backbone.View.extend({
    template: _.template($('#album-template').html()),
    tagName: 'li',
    className: 'album',

    initialize: function () {

      _.bindAll(this, 'render');

    },

    render: function () {
      var renderedContent = this.template(this.model.toJSON());
      $(this.el).html(renderedContent);
      return this;
    }
  });

  window.LibraryAlbumView = AlbumView.extend({
    events: {
      'click .queue.add': 'select'
    },

    select: function () {
      this.collection.trigger('select', this.model);

      console.log('Triggered select', this.collection);
    }
  });

  window.PlaylistAlbumView = AlbumView.extend({
    events: {
      'click .queue.remove': 'removeFromPlaylist'
    },

    initialize: function () {
      _.bindAll(this, 'render', 'updateState', 'updateTrack', 'remove');

      this.player = this.options.player;
      this.player.bind('change:state', this.updateState);
      this.player.bind('change:currentTrackIndex', this.updateTrack);

      this.model.bind('remove', this.remove);
    },

    render: function () {
      $(this.el).html(this.template(this.model.toJSON()));
      this.updateTrack();
      return this;
    },

    updateState: function () {
      var isAlbumCurrent = (this.player.currentAlbum() === this.model);
      $(this.el).toggleClass('current', isAlbumCurrent);
    },

    updateTrack: function () {
      var isAlbumCurrent = (this.player.currentAlbum() === this.model);
      if (isAlbumCurrent) {
        var currentTrackIndex = this.player.get('currentTrackIndex');
        this.$("li").each(function (index, el) {
          $(el).toggleClass('current', index === currentTrackIndex);
        });
      }
      this.updateState();
    },

    removeFromPlaylist: function () {
      this.options.playlist.remove(this.model);
      console.log('removed called');
      //this.player.reset();
    }
  });

  window.PlaylistView = Backbone.View.extend({
    tag: 'section',
    className: 'playlist',
    template: _.template($("#playlist-template").html()),

    events: {
      'click .play': 'play',
      'click .pause': 'pause',
      'click .next': 'nextTrack',
      'click .prev': 'prevTrack'
    },

    initialize: function () {
      _.bindAll(this, 'render', 'renderAlbum', 'updateState', 'updateTrack', 'queueAlbum');
      this.collection.bind('refresh', this.render);
      this.collection.bind('add', this.renderAlbum);

      // TODO: May need to bind to currentAlbumIndex too
      this.player = this.options.player;
      this.player.bind('change:state', this.updateState);
      this.player.bind('change:currentTrackIndex', this.updateTrack);
      this.createAudio();

      this.library = this.options.library;
      this.library.bind('select', this.queueAlbum);
    },

    createAudio: function () {
      this.audio = new Audio();
    },

    render: function () {
      $(this.el).html(this.template(this.player.toJSON()));
      this.collection.each(this.renderAlbum);

      this.updateState();
      return this;
    },

    renderAlbum: function (album) {
      var view = new PlaylistAlbumView({
        model: album,
        player: this.player,
        playlist: this.collection
      });
      this.$("ul").append(view.render().el);
    },

    updateState: function () {
      this.updateTrack();
      this.$("button.play").toggle(this.player.isStopped());
      this.$("button.pause").toggle(this.player.isPlaying());
    },

    updateTrack: function () {
      this.audio.src = this.player.currentTrackUrl();
      if (this.player.get('state') == 'play') {
        this.audio.play();
      } else {
        this.audio.pause();
      }
    },

    queueAlbum: function (album) {
      this.collection.add(album);
    },

    play: function () {
      this.player.play();
    },

    pause: function () {
      this.player.pause();
    },

    nextTrack: function () {
      this.player.nextTrack();
    },

    prevTrack: function () {
      this.player.prevTrack();
    }

  });

  window.LibraryView = Backbone.View.extend({

    tagName: 'section',
    className: 'library',

    initialize: function () {
      _.bindAll(this, 'render');
      this.template = _.template($('#library-template').html());
      this.collection.bind('refresh', this.render);
    },

    render: function () {
      var $albums, collection = this.collection;
      $(this.el).html(this.template({}));
      $albums = this.$('.albums');
      collection.each(function (album) {
        var view = new LibraryAlbumView({
          model: album,
          collection: collection
        });
        $albums.append(view.render().el);
      });

      return this;
    }
  });
*/
  window.Question = Backbone.Model.extend({
    url: function () {
      var MAX_ID = 128000;
      if(this.id === undefined || this.id === null) { 
        this.id = Math.floor((MAX_ID * Math.random()) + 1)            
      } 
      return '/questions/' + this.id;    
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
    url: '/questions'
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
    submit: function(options) {
      console.log('submit entered');
      console.log(options);      
    },
    change: function(e) {
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
      var renderedContent = this.template( { questions: models });
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
      var q = new Question({id: 3434, text: 'Are you a democrat', name: 'q12', value: true});
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
