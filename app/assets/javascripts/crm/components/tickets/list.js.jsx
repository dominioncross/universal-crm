/*global React*/
/*global $*/
var TicketList = createReactClass({
  getInitialState: function(){
    return({
      subjectId: null,
      subjectType: null,
      tickets: null,
      selectedTicketId: null,
      status: null,
      flag: null,
      loading: false,
      pagination: null,
      pageNum: null,
      pastProps: null
    });
  },
  init: function(){
    this.setState({status: this.props.status, flag: this.props.flag, subjectId: this.props.subjectId, subjectType: this.props.subjectType});
    this.loadTickets(this.props.status, this.props.flag, this.props.gs.searchWord);
  },
  componentDidMount: function(){
    this.init();
  },
  componentDidUpdate: function(){
    if (this.state.pastProps != this.props && !this.state.loading){
      this.init();
    }
  },
  loadTickets: function(status, flag, keyword, page){
    console.log(keyword);
    if (!this.state.loading){
      this.setState({loading: true, pastProps: this.props});
      scrollTo('body');
      if (page==undefined){page=1;}
      var _this = this;
      $.ajax({
        method: 'GET',
        url: "/crm/tickets",
        data: {
          q: keyword,
          status: this.props.gs.ticketStatus,
          date_start: this.props.gs.dateStart,
          date_end: this.props.gs.dateEnd,
          subject_id: this.props.subjectId,
          subject_type: this.props.subjectType,
          flag: this.props.gs.ticketFlag,
          page
        },
        success: function(data){
          _this.setState({
            loading: false,
            tickets: data.tickets,
            pagination: data.pagination,
            pageNum: page});
        }
      });
    }
  },
  render: function(){
    if (this.state.tickets && this.state.tickets.length>0){
      var t = [];
      for (var i=0;i<this.state.tickets.length;i++){
        t.push(
          <li key={i} className="list-group-item">
            <TicketListItem
              ticket={this.state.tickets[i]}
              _goTicket={this.props._goTicket}
              _goCustomer={this.props._goCustomer}
              _goCompany={this.props._goCompany}
              setCustomerId={this.props.setCustomerId}
              gs={this.props.gs} sgs={this.props.sgs}
              />
          </li>
        );
      }
      var ticketCountTitle = null;
      if (this.ticketCount()){
        ticketCountTitle = this.ticketCountTitle();
      }
      return(
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">{ticketCountTitle}</h3>
          </div>
          <div className="panel-body">
            <ul className="list-group">
              {t}
            </ul>
            <Pagination
              pagination={this.state.pagination}
              currentPage={this.state.pageNum}
              pageResults={this.pageResults}
              displayDescription={true}
              />
          </div>
        </div>
      );
    }else{
      return(null);
    }
  },
  ticketCount: function(){
    if (this.state.pagination){
      return this.state.pagination.total_count;
    }else{
      return null;
    }
  },
  ticketCountTitle: function(){
    if (this.ticketCount()){
      var h = `${this.ticketCount()} ticket`;
      if (this.ticketCount() != 1){h += `s`}
      return h;
    }
  },
  pageResults: function(page){
    this.loadTickets(this.state.status, this.state.flag, this.props.gs.searchWord, page);
    this.setState({currentPage: page});
  }
})
