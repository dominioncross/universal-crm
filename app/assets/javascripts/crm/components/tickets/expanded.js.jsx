/*
  global React
*/
var ExpandedTicket = createReactClass({
  getInitialState: function(){
    return({
      replyCount: 0
    });
  },
  componentDidMount: function(){
    this.setState({replyCount: this.props.ticket.reply_count});
  },
  render: function(){
    if (this.props.ticketId == this.props.ticket.id){
      return(
        <div>
          <div className="">
            <TicketFunctions
              gs={this.props.gs}
              ticket={this.props.ticket}
              status={this.props.status}
              flags={this.props.ticket.flags}
              changeTicketFlag={this.props.changeTicketFlag}
              changeTicketStatusActive={this.props.changeTicketStatusActive}
              changeTicketStatusClosed={this.props.changeTicketStatusClosed}
              changeTicketStatusActioned={this.props.changeTicketStatusActioned}
              ticketFlags={this.props.ticketFlags}
              replyCount={this.state.replyCount}
              />
            <div style={{marginTop: '2px'}}><Tags subjectType="UniversalCrm::Ticket" subjectId={this.props.ticket.id} tags={this.props.ticket.tags} /></div>
            <hr />
          </div>
          <TicketDueOn ticket={this.props.ticket} editable={true} />
          {this.actionedStatus()}
          {this.ticketDocument()}
          {this.referringUrl()}
          {this.ticketNotes()}
          {this.forwardToEmail()}
          <div className="panel">
            <div className="panel-body">
              <Attachments subjectId={this.props.ticket.id} subjectType='UniversalCrm::Ticket' gs={this.props.gs} />
            </div>
          </div>
          <Comments 
            subject_type='UniversalCrm::Ticket'
            subject_id={this.props.ticket.id}
            countComments={this.props.countComments}
            newCommentPosition='bottom'
            openComments={this.ticketOpen()}
            newCommentPlaceholder={this.newCommentPlaceholder()}
            fullWidth={false}
            allowEmail={this.props.ticket.subject_email!=undefined}
            newCommentReceived={this.newCommentReceived}
            />
          {this.emailWarning()}
        </div>
      );
    }else{
      return(null);
    }
  },
  ticketDocument: function(){
    if (this.props.ticket.document_name){
      return(
        <h4 className="text-info">REF: <strong>{this.props.ticket.document_name}</strong>{this.ticketSecondaryScope()}</h4>
      );
    }
  },
  ticketSecondaryScope: function(){
    if (this.props.ticket.secondary_scope_name){
      return(
        <span> ({this.props.ticket.secondary_scope_name})</span>
      );
    }
  },
  referringUrl: function(){
    if (this.props.ticket.referring_url){
      return(
        <h4 className="small text-info">URL: <a href={this.props.ticket.referring_url} target="_blank">{this.props.ticket.referring_url}</a></h4>
      );
    }
  },
  ticketNotes: function(){
    if (this.props.ticket.html_body){
      return(
        <blockquote>
          <div dangerouslySetInnerHTML={{__html: this.props.ticket.html_body}} />
        </blockquote>
      );
    }
    else if (this.props.ticket.content){
      return(
        <blockquote>
          <div dangerouslySetInnerHTML={{__html: this.props.ticket.content.replace(/(?:\r\n|\r|\n)/g, '<br />')}} />
        </blockquote>
      );
    }
  },
  forwardToEmail: function(){
    return(<ForwardTicket gs={this.props.gs} ticketId={this.props.ticket.id} />);
  },
  ticketOpen: function(){
    return ((this.props.ticket.status == 'active' || this.actioned()) && (this.props.gs.config.inbound_email_addresses.indexOf(this.props.ticket.from_email)<0));
  },
  email: function(){
    return this.props.ticket.kind.toString() == 'email';
  },
  emailWarning: function(){
    if (this.email() && this.ticketOpen()){
      return(
        <div className="alert alert-warning alert-sm">
          <i className="fa fa-exclamation-triangle" /> <strong>Note:</strong> Email replies will be sent to: {this.props.ticket.subject_email}
        </div>
      );
    }else{
      return(null);
    }
  },
  newCommentPlaceholder: function(){
    if (this.email()){
      return 'Reply/new note...';
    }else{
      return 'New note...';
    }
  },
  actioned: function(){
    return(this.props.ticket.status == 'actioned');
  },
  actionedStatus: function(){
    if (this.actioned()){
      return(
        <div className="alert alert-warning alert-sm text-center">
          <i className="fa fa-exclamation-triangle" /> Follow up
        </div>
      );
    }
  },
  newCommentReceived: function(data){
    var replyCount=0;
    data.forEach(function(comment){
      if(!comment.system_generated){
        replyCount+=1;
      }
    });
    this.setState({replyCount: replyCount});
  }
});