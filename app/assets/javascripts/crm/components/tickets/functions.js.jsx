/*
  global React
*/
var TicketFunctions = createReactClass({
  render: function(){
    return(
      <div>
        <div className="pull-right">
          {this.buttons()}
        </div>
        {this.ticketFlags()}
        &nbsp;
      </div>
    );
  },
  ticketFlags: function(){
    var btns = [];
    for (var i=0;i<this.props.ticketFlags.length;i++){
      var flag = this.props.ticketFlags[i];
      var flagStyle = this.flagButtonStyle(flag.label, `#${flag.color}`);
      var btn = [];
      btn.push(<button key={`add_${flag.label}`} className="btn no-margin btn-xs" style={flagStyle} onClick={this.addFlag} name={`add_${flag.label}`}>{flag.label}</button>);
      if (this.flagged(flag.label)){
        btn.push(<button key={`remove_${flag.label}`} className="btn no-margin btn-xs btn-default" style={flagStyle} onClick={this.removeFlag} name={`remove_${flag.label}`}>x</button>);
      }
      btns.push(<div key={`btn_group_${flag.label}`} className="btn-group" style={{marginRight: '5px'}}>{btn}</div>);
    }
    if (this.props.status != 'closed'){
      return (<span>{btns}</span>);
    }else{
      return(<span>&nbsp;</span>);
    }
  },
  removeFlag: function(e){
    var flag = e.target.name.replace('remove_','');
    if (this.flagged(flag)){
      this.props.changeTicketFlag(flag, false);
    }
  },
  addFlag: function(e){
    var flag = e.target.name.replace('add_','');
    if (!this.flagged(flag)){
      this.props.changeTicketFlag(flag, true);
    }
  },
  flagButtonStyle: function(flag_label, color){
    if (this.flagged(flag_label)){
      return({background: color, color: '#FFF'});
    }
  },
  flagged: function(flag_label){
    return this.props.flags.indexOf(flag_label.toString())>-1;
  },
  buttons: function(){
    var b = [];
    if (this.props.status == 'closed'){
      b.push(<li key='reopen'>{this.reopenButton()}</li>);
    }else if (this.props.status == 'active' || this.props.status == 'actioned'){
      b.push(<li key='assign'>{this.assignUserButton()}</li>);
      b.push(<li key='change'>{this.customerChangeButton()}</li>);
      b.push(<li key='actioned'>{this.actionedButton()}</li>);
      b.push(<li key='close'>{this.closeButton()}</li>);
    }
    return(<ul className="list-inline">{b}</ul>);
  },
  reopenButton: function(){
    return(
      <button className="btn no-margin btn-info btn-xs" onClick={this.props.changeTicketStatusActive}>
        <i className="fa fa-folder-open" /> Reopen
      </button>
    );
  },
  assignUserButton: function(){
    return(<AssignUserButton ticket={this.props.ticket} gs={this.props.gs} />);
  },
  customerChangeButton: function(){
    return(<ChangeCustomerButton ticket={this.props.ticket} />);
  },
  actionedButton: function(){
    if (this.props.status == 'actioned'){
      return(
        <button className="btn no-margin btn-warning btn-xs" onClick={this.props.changeTicketStatusActive} disabled={this.props.replyCount==0}>
          <i className="fa fa-exclamation-triangle" /> Remove Follow up
        </button>
      );
    }else{
      return(
        <button className="btn no-margin btn-warning btn-xs" onClick={this.props.changeTicketStatusActioned} disabled={this.props.replyCount==0}>
          <i className="fa fa-exclamation-triangle" /> Follow up
          {this.notesRequired()}
        </button>
      );
    }
  },
  notesRequired: function(){
    if (this.props.replyCount==0){
      return(<em> (Notes required)</em>);
    }
  },
  closeButton: function(){
    return(
      <button className="btn no-margin btn-danger btn-xs" onClick={this.props.changeTicketStatusClosed}>
        <i className="fa fa-ban" /> Close Ticket
      </button>
    );
  }
});