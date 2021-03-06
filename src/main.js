window.React = require('react/addons');

var FIREBASE_URL = "https://react-slideshow.firebaseio.com";

require('Mousetrap');
require('velocity-animate');
require('velocity-animate/velocity.ui');

var Firebase = require('firebase');
var Slides = require('./slides');
var Editor = require('./editor');
var Progress = require('./progress');
var Controls = require('./controls');

var ReactSlideshow = React.createClass({
  getInitialState: function() {
    return {
      slides: {},
      currentSlide: null,
      css: null,
      editMode: false
    };
  },
  componentDidMount: function() {
    this.firebase = new Firebase(FIREBASE_URL);

    var slideRef = this.firebase.child('slides').orderByKey();
    slideRef.on('child_added', this.updateFirebaseSlide);
    slideRef.on('child_changed', this.updateFirebaseSlide);
    slideRef.on('child_removed', this.deleteFirebaseSlide);

    var currentSlideRef = this.firebase.child('currentSlide');
    currentSlideRef.on('value', this.updateFirebaseCurrentSlide);

    Mousetrap.bind('left', this.prevSlide);
    Mousetrap.bind('right', this.nextSlide);
    Mousetrap.bind('esc', this.exitEditMode);
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.currentSlide == this.state.currentSlide) {
      this.setSlideCSS();
      return;
    }
    if (prevState.currentSlide) {
      var keys = this.slideKeys();
      var transitionIn, transitionOut;
      if (
        keys.indexOf(prevState.currentSlide) >
        keys.indexOf(this.state.currentSlide)
      ) {
        transitionIn = 'transition.slideLeftBigIn';
        transitionOut = 'transition.slideRightBigOut';
      } else {
        transitionIn = 'transition.slideRightBigIn';
        transitionOut = 'transition.slideLeftBigOut';
      }
      var prevNode = this.slideNode(prevState.currentSlide);
      if (prevNode) {
        Velocity(
          prevNode,
          transitionOut,
          {duration: 200, complete: this.setSlideCSS}
        );
      }
      Velocity(
        this.slideNode(this.state.currentSlide),
        transitionIn,
        {duration: 200, delay: 200}
      );
    } else {
      this.setSlideCSS();
      Velocity(
        this.slideNode(this.state.currentSlide),
        'transition.fadeIn'
      );
    }
  },
  slideNode: function(key) {
    var slide = this.refs.slides.refs[key]
    return slide ? slide.getDOMNode() : null;
  },
  slideKeys: function() {
    return Object.keys(this.state.slides);
  },
  updateFirebaseSlide: function(data) {
    var newSlides = {};
    newSlides[data.key()] = {$set: data.val()};
    this.setState(
      React.addons.update(
        this.state,
        {slides: newSlides}
      )
    );
    console.log("Loaded slide", data.key());
  },
  deleteFirebaseSlide: function(data) {
    var newSlides = {
      $apply: function(slides) {
        delete slides[data.key()];
        return slides;
      }
    };
    this.setState(
      React.addons.update(
        this.state,
        {slides: newSlides}
      )
    );

    this.prevSlide();
  },
  updateFirebaseCurrentSlide: function(data) {
    this.setState({
      currentSlide: data.val()
    });
    console.log("Current slide", this.state.currentSlide);
  },
  setSlideCSS: function() {
    var newCSS = this.currentSlide().css;
    if (newCSS != this.state.css) {
      this.setState({
        css: this.currentSlide().css
      });
    }
  },
  currentSlide: function() {
    return this.state.slides[this.state.currentSlide];
  },
  currentIndex: function() {
    return this.slideKeys().indexOf(this.state.currentSlide);
  },
  prevSlide: function() {
    var prevIndex = this.currentIndex() - 1;
    var keys = this.slideKeys();
    if (prevIndex >= 0) {
      this.firebase.child('currentSlide')
        .set(keys[prevIndex]);
    }
  },
  nextSlide: function() {
    var nextIndex = this.currentIndex() + 1;
    var keys = this.slideKeys();
    if (nextIndex < keys.length) {
      this.firebase.child('currentSlide')
        .set(keys[nextIndex]);
    }
  },
  addSlide: function() {
    var newSlide = this.firebase.child('slides')
      .push({
        title: "Lorem ipsum",
        content: "##Lorem ipsum\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        css: ""
      });
    this.firebase.child('currentSlide')
      .set(newSlide.key());
  },
  editSlide: function() {
    this.setState({
      editMode: true
    });
  },
  exitEditMode: function() {
    this.setState({
      editMode: false
    });
  },
  deleteSlide: function() {
    this.firebase.child('slides')
      .child(this.state.currentSlide).remove();
  },
  logout: function() {
    this.firebase.unauth();
  },
  render: function() {
    return (
      <div className="screen">
        <style>{this.state.css}</style>
        <Slides ref="slides" slides={this.state.slides} />
        <Editor
          enabled={this.state.editMode}
          slide={this.currentSlide()}
          slideKey={this.state.currentSlide}
          firebase={this.firebase}
          onExit={this.exitEditMode}
        />
        <Progress
          current={this.currentIndex() + 1}
          total={this.slideKeys().length}
        />
        <div className="info">
          {this.currentIndex() + 1}
          /
          {this.slideKeys().length}
          &mdash;
          {this.currentSlide() ? this.currentSlide().title : ''}
          <Controls
            onAddSlide={this.addSlide}
            onEditSlide={this.editSlide}
            onDeleteSlide={this.deleteSlide}
            onLogout={this.logout}
          />
        </div>
      </div>
    );
  }
});

function renderSlideshow(auth) {
  React.render(
    <ReactSlideshow auth={auth} />,
    document.getElementById('react-slideshow')
  );
}

var firebase = new Firebase(FIREBASE_URL);
firebase.onAuth(function(auth) {
  if (auth) {
    console.log("Logged in as", auth);
    renderSlideshow(auth);
  } else {
    React.unmountComponentAtNode(
      document.getElementById('react-slideshow')
    );
    firebase.authWithOAuthPopup(
      'github',
      function(error) {
        if (error) {
          alert(error);
        }
      }
    );
  }
});

