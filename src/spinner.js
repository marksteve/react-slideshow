module.exports = React.createClass({
  displayName: 'Spinner',
  render: function() {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    );
  }
});
