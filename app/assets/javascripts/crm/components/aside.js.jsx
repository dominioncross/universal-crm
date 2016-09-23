var Aside = React.createClass({
  
  home: function(){
    $("#customer_summary").hide();
    $("#customer_search").show();
    this.props.setCustomerId(null);
    this.props.setTicketId(null);
  },
  render: function(){
    return(
      <aside className="sidebar sidebar-left">
        <nav>
          <h5 className="sidebar-header">Tickets</h5>
          <ul className="nav nav-pills nav-stacked">
            <li>
              <a style={{cursor: 'pointer'}} onClick={this.home}>
                <i className="fa fa-home fa-fw" />
                Home
              </a>
            </li>
            <li>
              <a style={{cursor: 'pointer'}} onClick={this.props.loadPriorityTickets}>
                <i className="fa fa-flag fa-fw" />
                Priority
              </a>
            </li>
            <li>
              <a style={{cursor: 'pointer'}} onClick={this.props.loadActiveTickets}>
                <i className="fa fa-folder-open fa-fw" />
                Open
              </a>
            </li>
            <li>
              <a style={{cursor: 'pointer'}} onClick={this.props.loadClosedTickets}>
                <i className="fa fa-check fa-fw" />
                Closed
              </a>
            </li>
          </ul>
        </nav>
      </aside>
    )
  }
})