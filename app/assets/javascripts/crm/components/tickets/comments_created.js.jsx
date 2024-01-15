var TicketCommentsCreated = createReactClass({
  render: function(){
    return (
      <div className='pull-right'>
        {this.props.ticket.created_at} &bull; {this.commentCount()} &bull; Updated {this.props.ticket.updated_at}
      </div>
    ) 
  },
  commentCount: function(){
    html = []
    if (this.props.ticket.comment_count==1){
      html.push(`1 note`);
    }else if (this.props.ticket.comment_count>1){
      html.push(`${this.props.ticket.comment_count} notes`);
    }
    if (this.props.ticket.reply_count==1){
      html.push(`1 reply`);
    }else if (this.props.ticket.reply_count>1){
      html.push(`${this.props.ticket.reply_count} replies`);
    }
    if (this.props.ticket.attachments.length==1){
      html.push(`1 attachment`);
    }else if (this.props.ticket.attachments.length>1){
      html.push(`${this.props.ticket.attachments.length} attachments`);
    }
    if (this.props.ticket.comment_count>0 || this.props.ticket.reply_count>0 || this.props.ticket.attachments.length>0){
      return `(${html.join('/')})`;
    }else{
      return(null);
    }
  }
  
});
