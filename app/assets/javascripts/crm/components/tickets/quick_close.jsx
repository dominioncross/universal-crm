/*
  global React
  global $
*/
var QuickClose = createReactClass({
  getInitialState: function(){
    return({
      ticket: null,
      pastProps: null
    });
  },
  componentDidMount: function(){
    this.init();
  },
  componentDidUpdate: function(){
    if (this.state.pastProps != this.props){
      this.init();
    }
  },
  init: function(){
    this.setState({ticket: this.props.ticket, pastProps: this.props});
  },
  render: function(){
    if (this.state.ticket){
      return(
        this.closeButton()
      );
    }else{
      return(null);
    }
  },
  closeButton: function(){
    if (this.state.ticket.status == 'active'){
      return(
        <span style={{marginRight: '10px', cursor: 'pointer'}}>
          <i className="fa fa-square-o text-success" onClick={this.closeTicket} title="Close ticket" /> <span className="small" onClick={this.closeTicket}>Close</span>
        </span>
      );
    }else{
      return(
        <span style={{marginRight: '10px', cursor: 'pointer'}}>
          <i className="fa fa-check-square text-success" onClick={this.openTicket} title="Reopen task" /> <span className="small" onClick={this.openTicket}>Close</span>
        </span>
      );
    }
  },
  closeTicket: function(){
    var _this=this;
    $.ajax({
      method: 'PATCH',
      url: `/crm/tickets/${this.state.ticket.id}/update_status?status=closed`,
      success: function(data){
        _this.setState({ticket: data.ticket});
      }
    });
  },
  openTicket: function(){
    var _this=this;
    $.ajax({
      method: 'PATCH',
      url: `/crm/tickets/${this.state.ticket.id}/update_status?status=active`,
      success: function(data){
        _this.setState({ticket: data.ticket});
      }
    });
  }
});