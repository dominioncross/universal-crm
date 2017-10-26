var AssignUserButton = createReactClass({
  getInitialState: function(){
    return({
      
    });
  },
  render: function(){
    if (this.props.gs.users.length>0){
      return(
        <div>
          <button className="btn btn-info btn-xs" onClick={this.displayAssignUser}>
            <i className="fa fa-send" /> {this.buttonText()}
          </button>
          <Modal ref='assign_user_modal' modalTitle="Assign to:" modalContent={<AssignUser ticket={this.props.ticket} gs={this.props.gs}/>} />
        </div>
      );
    }else{
      return(null);
    }
  },
  displayAssignUser: function(){
    var modal = ReactDOM.findDOMNode(this.refs.assign_user_modal);
    if (modal){
      $(modal).modal('show', {backdrop: 'none'});
    }
  }, 
  buttonText: function(){
    if (this.props.ticket.responsible_name){
      return(`Assigned to ${this.props.ticket.responsible_name}`);
    }else{
      return 'Assign to'
    }
  }
});