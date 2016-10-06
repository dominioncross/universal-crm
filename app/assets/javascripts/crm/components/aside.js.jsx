var Aside = React.createClass({
  
  home: function(){
    this.props._goTicketList('email');
  },
  loadTickets: function(e){
    this.props._goTicketList($(e.target).attr('data-status'), null);
  },
  loadFlaggedTickets: function(e){
    this.props._goTicketList(null, $(e.target).attr('data-flag'));
  },
  render: function(){
    return(
      <aside className="sidebar sidebar-left">
        <nav>
          <h5 className="sidebar-header">Tickets</h5>
          <ul className="nav nav-pills nav-stacked">
            <li className="hidden">
              <a style={{cursor: 'pointer'}} onClick={this.home}>
                <i className="fa fa-home fa-fw" />
                Home
              </a>
            </li>
            <li>
              <a style={{cursor: 'pointer'}} onClick={this.loadTickets} data-status='email'>
                <i className="fa fa-envelope fa-fw" />
                Inbox
              </a>
            </li>
            <li>
              <a style={{cursor: 'pointer'}} onClick={this.loadTickets} data-status='active'>
                <i className="fa fa-folder-open fa-fw" />
                Open
              </a>
            </li>
            <li>
              <a style={{cursor: 'pointer'}} onClick={this.loadTickets} data-status='actioned'>
                <i className="fa fa-check fa-fw" />
                Actioned
              </a>
            </li>
            <li>
              <a style={{cursor: 'pointer'}} onClick={this.loadTickets} data-status='closed'>
                <i className="fa fa-ban fa-fw" />
                Closed
              </a>
            </li>
            {this.flagLinks()}
          </ul>
          <h5 className="sidebar-header">Customers</h5>
          <ul className="nav nav-pills nav-stacked">
            <li>
              <a style={{cursor: 'pointer'}} onClick={this.displayNewCustomer}>
                <i className="fa fa-plus fa-fw" />
                New
              </a>
            </li>
          </ul>
          <RecentCompanies _goCompany={this.props._goCompany} gs={this.props.gs} sgs={this.props.sgs} />
        </nav>
        <Modal ref='new_customer_modal' modalTitle="New Customer" modalContent={<NewCustomer />} />
      </aside>
    )
  },
  displayNewCustomer: function(){
    var modal = ReactDOM.findDOMNode(this.refs.new_customer_modal);
    if (modal){
      $(modal).modal('show', {backdrop: 'static'});
    }
  },
  flagLinks: function(){
    if (this.props.gs && this.props.gs.config){
      h = []
      for (var i=0;i<this.props.gs.config.ticket_flags.length;i++){
        flag = this.props.gs.config.ticket_flags[i];
        h.push(
          <li key={flag['label']}>
            <a onClick={this.loadFlaggedTickets} data-flag={flag['label']} style={{cursor: 'pointer'}}>
              <i className="fa fa-fw fa-tag" style={{color: `#${flag['color']}`}}/> {flag['label']}
            </a>
          </li>
        )
      }
      return(h);
    }
  }
})