module.exports = React.createClass({
  displayName: 'Progress',
  render: function() {
    var style = {
      width: (100 * this.props.current / this.props.total) + '%'
    };
    return (
      <div className="progress" style={style} />
    );
  }
});
