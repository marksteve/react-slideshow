var Slide = require('./slide');
var Spinner = require('./spinner');

module.exports = React.createClass({
  displayName: 'Slides',
  renderSlide: function(key) {
    return (
      <Slide ref={key} key={key} {...this.props.slides[key]} />
    );
  },
  render: function() {
    var slides = Object.keys(this.props.slides)
      .map(this.renderSlide);
    return slides.length > 0 ? (
      <div className="slides">
        {slides}
      </div>
    ) : <Spinner />;
  }
});
