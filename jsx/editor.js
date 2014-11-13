module.exports = React.createClass({
  displayName: 'Editor',
  componentDidUpdate: function(nextProps) {
    if (
      this.props.enabled &&
      nextProps.enabled !== this.props.enabled
    ) {
      Velocity(
        this.getDOMNode(),
        'transition.expandIn',
        {duration: 200}
      );
      this.refs.content.getDOMNode().focus();
    }
  },
  onChange: function() {
    this.props.firebase.child('slides')
      .child(this.props.slideKey)
      .set({
        title: this.refs.title.getDOMNode().value,
        content: this.refs.content.getDOMNode().value
      });
  },
  render: function() {
    return this.props.enabled ? (
      <div className="editor">
        <input
          ref="title"
          type="text"
          defaultValue={this.props.slide.title}
          onChange={this.onChange}
        />
        <textarea
          ref="content"
          defaultValue={this.props.slide.content}
          onChange={this.onChange}
        />
        <div className="exit-edit">
          <button
            onClick={this.props.onExit}
          >
            Done
          </button>
        </div>
      </div>
    ) : null;
  }
});
