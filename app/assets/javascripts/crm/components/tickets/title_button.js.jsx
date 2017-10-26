/*
  global React
  global ReactDOM
  global $
*/
var TicketTitleButton = createReactClass({
  selectTicket: function(){
    this.props.selectTicketId(this.props.ticket.id);
  },
  render: function(){
    if (this.props.ticket){
      return(
        <div onClick={this.selectTicket} style={{cursor: 'pointer', fontWeight: 'bold'}}>
          <div className='pull-right small hidden-xs'>Ticket: #{this.props.ticket.number}</div>
          {this.statusLabel()}
          {this.ticketIcon()}
          {this.props.ticket.title}
          <TicketDueOn ticket={this.props.ticket} margin={true} editable={false} />
          <Flags flags={this.props.ticket.flags} gs={this.props.gs} />
          {this.tags()}
        </div>  
      );
    }else{
      return(null); 
    }
  },
  ticketIcon: function(){
    var icon;
    if (this.props.ticket.kind.toString()=='email'){
      icon = 'fa-envelope text-info';
    }else if (this.props.ticket.kind.toString()=='normal'){
      icon = 'fa-sticky-note text-warning';
    } else if (this.props.ticket.kind.toString()=='task'){
      icon = 'fa-check-circle text-success';
    }
    return(<i className={`fa fa-fw ${icon}`} style={{marginRight: '5px'}} />);
  },
  statusLabel: function(){
    if (this.props.ticket && this.props.ticket.status == 'closed'){
      return(<span className='label label-default' style={{marginRight: '5px'}}>Closed</span>);
    }else if (this.props.ticket && this.props.ticket.status == 'actioned'){
      return(<span className='label label-warning' style={{marginRight: '5px'}}>Follow up</span>);
    }
  },
  tags: function(){
    var t = [];
    for (var i=0;i<this.props.ticket.tags.length;i++){
      var tag_label = this.props.ticket.tags[i];
      t.push(<span className="badge badge-info" key={i} style={{marginRight: '2px'}}>{tag_label}</span>);      
    }
    if (t.length>0){
      return(<span style={{marginLeft: '10px'}}>{t}</span>);
    }else{
      return(null);
    }
  }
});