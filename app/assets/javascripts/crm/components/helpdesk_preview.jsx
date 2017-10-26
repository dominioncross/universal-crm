var HelpdeskPreview = createReactClass({
  getInitialState: function(){
    return({
      tickets: null,
      ticket: null,
      loading: false
    })
  },
  componentDidMount: function(){
    this.loadTickets();
  },
  render: function(){
    return(
      <div className="row">
        <div className="col-sm-4">{this.ticketList()}</div>
        <div className="col-sm-8">{this.ticketShow()}</div>
      </div>      
    );
  },
  loadTickets: function(status, flag, page){
    if (!this.state.loading){
      this.setState({loading: true});
      var _this = this;
      $.ajax({
        method: 'GET',
        url: `/crm/tickets?subject_id=${this.props.subjectId}&kind=email&subject_type=${this.props.subjectType}`,
        success: function(data){
          _this.setState({
            loading: false,
            tickets: data.tickets
          });
        }
      });
    }
  },
  ticketList: function(){
    h = []
    if (this.state.tickets){
      for (var i=0;i<this.state.tickets.length;i++){
        ticket = this.state.tickets[i];
        h.push(
          <li className="list-group-item" key={ticket.id}>
            <div className="text-mtued small">{ticket.updated_at}</div>
            <a style={{cursor: 'pointer'}} onClick={this.selectTicket} data-id={ticket.id}>{ticket.title}</a>
            {this.statusLabel(ticket.status)}
          </li>
        )
      }
     return(<ul className="list-group">{h}</ul>);
    }else{
      return(null);
    }
  },
  ticketShow: function(){
    if (this.state.ticket){
      return(
        <div className="panel panel-info">
          <div className="panel-heading">
            <h3 className="panel-title">{this.state.ticket.title}</h3>
          </div>
          <div className="panel-body">
            <dl className="dl-horizontal">
              <dt>Status</dt>
              <dd>{this.state.ticket.status}</dd>
              <dt>Submitted</dt>
              <dd>{this.state.ticket.created_at}</dd>
              <dt>Last actioned</dt>
              <dd>{this.state.ticket.updated_at}</dd>
              <dt>Reference</dt>
              <dd>{this.state.ticket.document_name==undefined ? 'N/A' : this.state.ticket.document_name}</dd>
              <dt>URL</dt>
              <dd className="small">{this.state.ticket.referring_url==undefined ? 'N/A' : this.referringUrl()}</dd>
            </dl>
            <blockquote>
              <div dangerouslySetInnerHTML={{__html: this.state.ticket.content.replace(/(?:\r\n|\r|\n)/g, '<br />')}} />
            </blockquote>
            <Comments 
              subject_type='UniversalCrm::Ticket'
              subject_id={this.state.ticket.id}
              openComments={false}
              hidePrivateComments={true}
              />
          </div>
        </div>
      );
    }
  },
  selectTicket: function(e){
    ticketId = $(e.target).attr('data-id');
    ticket = findObjectByKeyValue(this.state.tickets, 'id', ticketId)
    this.setState({ticket: ticket});
  },
  statusLabel: function(s){
    if (s=='closed'){
      return(<span className="label label-default" style={{marginLeft: '5px'}}>Closed</span>)
    }else{
      return(null);
    }
  },
  referringUrl: function(){
    if (this.state.ticket.referring_url){
      return(<a href={this.state.ticket.referring_url}>{this.state.ticket.referring_url}</a>)
    }  
  }
})