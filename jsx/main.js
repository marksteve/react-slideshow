window.React = require('react/addons');

require('Mousetrap');
var Firebase = require('firebase');
var Slide = require('./slide');
var Spinner = require('./spinner');

var firebase = new Firebase("https://react-slideshow.firebaseio.com");

var ReactSlideshow = React.createClass({
  getInitialState: function() {
    return {
      slides: {},
      currentSlide: null
    };
  },
  componentWillMount: function() {
    var slideRef = this.props.firebase.child('slides').orderByKey();
    slideRef.on('child_added', this.updateSlide);
    slideRef.on('child_changed', this.updateSlide);

    var currentSlideRef = this.props.firebase.child('currentSlide');
    currentSlideRef.on('value', this.updateCurrentSlide);
  },
  componentDidMount: function() {
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
      this.props.firebase.child('currentSlide')
        .set(keys[prevIndex]);
    }
  },
  nextSlide: function() {
    var nextIndex = this.currentIndex() + 1;
    var keys = Object.keys(this.state.slides);
    if (nextIndex < keys.length) {
      this.props.firebase.child('currentSlide')
        .set(keys[nextIndex]);
    }
  },
  addSlide: function() {
    var newSlide = this.props.firebase.child('slides')
      .push({
        title: "Slide title",
        content: "Slide content"
      });
    this.props.firebase.child('currentSlide')
      .set(newSlide.key());
  },
  editSlide: function() {
  },
  render: function() {
    return (
      <div className="screen">
        <div className="slides">
          {this.renderSlides()}
        </div>
        <div className="controls">
          <button className="edit-slide" onClick={this.editSlide}>
            Edit slide
          </button>
          <button className="add-slide" onClick={this.addSlide}>
            New slide
          </button>
        </div>
      </div>
    );
  }
});

var auth = firebase.getAuth();

if (auth) {
  console.log("Logged in as", auth);
  init(auth);
} else {
  firebase.authWithOAuthPopup(
    'github',
    function(error) {
      if (error) {
        alert(error);
      }
    }
  );
}

function init(auth) {
  React.render(
    <ReactSlideshow
      auth={auth}
      firebase={firebase}
    />,
    document.getElementById('react-slideshow')
  );
}
