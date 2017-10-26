/*
  global React
  global $
*/
var Newsfeed = createReactClass({
  getInitialState: function(){
    return({
      results: [],
      loading: false,
      pagination: null,
      pageNum: null,
      userId: null,
      ticketKind: null
    });
  },
  componentDidMount: function(){
    this.init();
  },
  init: function(){
    this.loadFeed();
  },
  loadFeed: function(page, userId, ticketKind){
    if (!this.state.loading){
      var _this=this;
      this.setState({loading: true, userId: userId, ticketKind: ticketKind});
      page = (page==undefined ? 1 : page);
      $.ajax({
        type: 'GET',
        url: `/crm/newsfeed.json`,
        data: {
          page: page,
          user_id: userId,
          subject_kind: ticketKind
        },
        success: function(data){
          _this.setState({
            results: data.results,
            loading: false,
            pagination: data.pagination,
            pageNum: page
          });
        }
      });
    }
  },
  render: function(){
    return(
      <div className="panel">
        <div className="panel-body">
          {this.ticketKindList()}
          {this.userList()}
          <hr />
          {this.resultList()}
          <Pagination
            pagination={this.state.pagination}
            currentPage={this.state.pageNum}
            pageResults={this.pageResults}
            displayDescription={true}
            />
        </div>
      </div>
    );
  },
  ticketKindList: function(){
    var u = [];
    u.push(<button key='email' className={`btn btn-sm btn-${this.state.ticketKind=='email' ? 'primary' : 'default'}`} data-kind="email" onClick={this.selectTicketKind} >Emails</button>);
    u.push(<button key='task' className={`btn btn-sm btn-${this.state.ticketKind=='task' ? 'primary' : 'default'}`} data-kind="task" onClick={this.selectTicketKind} >Tasks</button>);
    u.push(<button key='normal' className={`btn btn-sm btn-${this.state.ticketKind=='normal' ? 'primary' : 'default'}`} data-kind="normal" onClick={this.selectTicketKind} >Notes</button>);
    return(<div className="btn-group">{u}</div>);
  },
  userList: function(){
    if (this.props.gs && this.props.gs.users){
      var u = [];
      for (var i=0;i<this.props.gs.users.length;i++){
        var user = this.props.gs.users[i];
        u.push(<div className="col-xs-2" key={user.id}>{this.userButton(user)}</div>);
      }
      return(<div className="row">{u}</div>);
    }
  },
  userButton: function(user){
    return(
      <button className={`btn btn-${this.state.userId==user.id ? 'primary' : 'default'} btn-sm btn-block`} onClick={this.selectUser} data-id={user.id} data-name={user.name}>{user.name}</button>
    );
  },
  selectUser: function(e){
    var userId = $(e.target).attr('data-id');
    this.loadFeed(1, userId, this.state.ticketKind);
  },
  selectTicketKind: function(e){
    var ticketKind = $(e.target).attr('data-kind');
    this.loadFeed(1, this.state.userId, ticketKind);
  },
  resultList: function(){
    var c = [];
    var pastSubjectId=null;
    var subjectTitle='';
    var commentTitle = this.commentTitle;
    var gs=this.props.gs;
    var sgs=this.props.sgs;
    var selectTicketId=this.selectTicketId;
    this.state.results.forEach(function(result){
      if (result.type=='ticket'){
        c.push(
          <li className="list-group-item" key={result.result.id}>
            <h4>Ticket created by {result.result.creator_name}:</h4>
            <h5 className="list-group-item-heading">
              <TicketTitleButton 
                ticket={result.result}
                selectTicketId={selectTicketId}
                gs={gs}
                sgs={sgs}
              />
            </h5>
          </li>
        );
      }else if (result.type=='comment'){
        c.push(
          <li className="list-group-item" key={result.result.id}>
            <h4>{result.result.author} commented on:</h4>
            <h5>
              <TicketTitleButton 
                ticket={result.subject}
                selectTicketId={selectTicketId}
                gs={gs}
                sgs={sgs}
              />
            </h5>
            <div className="chat-widget">
              <Comment key={result.result.id} comment={result.result} />
            </div>
          </li>
        );
      }
    });
    return(<ul className="list-group">{c}</ul>);
  },
  commentTitle: function(comment){
    if (comment.subject_type=='UniversalCrm::Ticket'){
      return(
        <h4 onClick={this.goTicket} data-subjectId={comment.subject_id} style={{cursor: 'pointer', fontWeight: 'bold'}} >{comment.subject_name}</h4>
      );
    }
  },
  selectTicketId: function(ticketId){
    this.props._goTicket(ticketId);
  },
  pageResults: function(page){
    this.loadFeed(page, this.state.userId, this.state.ticketKind);
    this.setState({currentPage: page});
  }
});
