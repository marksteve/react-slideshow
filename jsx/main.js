window.React = require('react/addons');

var FIREBASE_URL = "https://react-slideshow.firebaseio.com";

require('Mousetrap');
var Firebase = require('firebase');
var Slide = require('./slide');
var Spinner = require('./spinner');

var ReactSlideshow = React.createClass({
  getInitialState: function() {
    return {
      slides: {},
      currentSlide: null
    };
  },
  componentDidMount: function() {
    this.firebase = new Firebase(FIREBASE_URL);

    var slideRef = this.firebase.child('slides').orderByKey();
    slideRef.on('child_added', this.updateSlide);
    slideRef.on('child_changed', this.updateSlide);

    var currentSlideRef = this.firebase.child('currentSlide');
    currentSlideRef.on('value', this.updateCurrentSlide);

    Mousetrap.bind('left', this.prevSlide);
    Mousetrap.bind('right', this.nextSlide);
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.currentSlide == this.state.currentSlide) {
      return;
    }
    if (prevState.currentSlide) {
      var keys = Object.keys(this.state.slides);
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
      Velocity(
        this.refs[prevState.currentSlide].getDOMNode(),
        transitionOut,
        {duration: 200}
      );
      Velocity(
        this.refs[this.state.currentSlide].getDOMNode(),
        transitionIn,
        {duration: 200, delay: 100}
      );
    } else {
      Velocity(
        this.refs[this.state.currentSlide].getDOMNode(),
        'transition.fadeIn'
      );
    }
  },
  updateSlide: function(data) {
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
  updateCurrentSlide: function(data) {
    this.setState({
      currentSlide: data.val()
    });
    console.log("Current slide", this.state.currentSlide);
  },
  renderSlides: function() {
    var slides = Object.keys(this.state.slides).map(this.renderSlide);
    return slides.length > 0 ? slides : <Spinner />;
  },
  renderSlide: function(key) {
    return (
      <Slide ref={key} key={key} {...this.state.slides[key]} />
    );
  },
  currentIndex: function() {
    return Object.keys(this.state.slides)
      .indexOf(this.state.currentSlide);
  },
  prevSlide: function() {
    var prevIndex = this.currentIndex() - 1;
    var keys = Object.keys(this.state.slides);
    if (prevIndex >= 0) {
      this.firebase.child('currentSlide')
        .set(keys[prevIndex]);
    }
  },
  nextSlide: function() {
    var nextIndex = this.currentIndex() + 1;
    var keys = Object.keys(this.state.slides);
    if (nextIndex < keys.length) {
      this.firebase.child('currentSlide')
        .set(keys[nextIndex]);
    }
  },
  addSlide: function() {
    var newSlide = this.firebase.child('slides')
      .push({
        title: "Lorem ipsum",
        content: "##Lorem ipsum\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      });
    this.firebase.child('currentSlide')
      .set(newSlide.key());
  },
  editSlide: function() {
  },
  deleteSlide: function() {
  },
  logout: function() {
    this.firebase.unauth();
  },
  render: function() {
    return (
      <div className="screen">
        <div className="slides">
          {this.renderSlides()}
        </div>
        <div className="controls">
          <button className="add-slide" onClick={this.addSlide}>
            New slide
          </button>
          <button className="edit-slide" onClick={this.editSlide}>
            Edit slide
          </button>
          <button className="delete-slide" onClick={this.editSlide}>
            Delete slide
          </button>
          <button className="logout" onClick={this.logout}>
            Logout
          </button>
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

