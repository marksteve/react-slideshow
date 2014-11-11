require('velocity-animate');
require('velocity-animate/velocity.ui');
require('prismjs');

var marked = require('marked');

module.exports = React.createClass({
  displayName: 'Slide',
  componentDidUpdate: function() {
    var elements = this.getDOMNode().querySelectorAll('code');
    for (var i = 0; i < elements.length; i++) {
      Prism.highlightElement(elements[i]);
    }
  },
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
