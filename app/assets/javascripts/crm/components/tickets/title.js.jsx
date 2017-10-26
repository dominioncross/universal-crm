var TicketTitle = createReactClass({
  
  render: function(){
    if (this.props.ticket){
      return(
        <h4>
          {this.props.closedLabel()}
          {this.props.ticket.title}
        </h4>  
      )
    }else{
      return(<div></div>)   
    }
  }  
});