require('velocity-animate');
require('velocity-animate/velocity.ui');

var marked = require('marked');

module.exports = React.createClass({
  displayName: 'Slide',
  render: function() {
    var htmlContent = marked(this.props.content);
    return (
      <div
        className="slide"
        dangerouslySetInnerHTML={{__html: htmlContent}}
      />
    );
  }
});
