/*
  global React
  global ReactDOM
  global $
 */ 
var AssignUser = createReactClass({
  getInitialState: function(){
    return({
      loading: false,
      assignedTo: null
    });
  },
  render: function(){
    return(
      <div>
        <p><strong>{this.props.ticket.numbered_title}</strong></p>
        <p>Select a person to assign this ticket to.  They will be notified by email that they will be responsible from now on.</p>
        {this.assignedUser()}
        {this.users()}
      </div>
    );
  },
  users: function(){
    if (this.props.gs && this.props.gs.users){
      var u = [];
      for (var i=0;i<this.props.gs.users.length;i++){
        var user = this.props.gs.users[i];
        u.push(<div className="col-xs-3" key={user.id}>{this.userButton(user)}</div>);
      }
      return(<div className="row">{u}</div>);
    }
  },
  userButton: function(user){
    return(
      <button className="btn btn-primary btn-sm btn-block" onClick={this.assignUser} data-id={user.id} data-name={user.name}>{user.name}</button>
    );
  },
  assignUser: function(e){
    var button = $(e.target);
    var userId = button.attr('data-id');
    if (confirm(`Are you sure you want to assign this ticket to ${button.attr('data-name')}?`)){
      var _this=this;
      if (!this.state.loading){
        this.setState({loading: true});
        $.ajax({
          method: 'PATCH',
          url: `/crm/tickets/${this.props.ticket.id}/assign_user?user_id=${userId}`,
          success: function(data){
            _this.setState({loading: false, assignedTo: data.user});
          }
        });
      }
    }
  },
  assignedUser: function(){
    if (this.state.assignedTo){
      return(
        <p className="lead">Ticket has been assigned to: {this.state.assignedTo.name}</p>
      );
    }
  }
});