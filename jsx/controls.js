module.exports = React.createClass({
  displayName: 'Controls',
  render: function() {
    return (
      <div className="controls">
        <button className="add-slide" onClick={this.props.onAddSlide}>
          New slide
        </button>
        <button className="edit-slide" onClick={this.props.onEditSlide}>
          Edit slide
        </button>
        <button className="delete-slide" onClick={this.props.onDeleteSlide}>
          Delete slide
        </button>
        <button className="logout" onClick={this.props.onLogout}>
          Logout
        </button>
      </div>
    );
  }
});

