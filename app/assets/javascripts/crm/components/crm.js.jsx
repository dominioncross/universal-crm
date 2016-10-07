var CRM = React.createClass({
  getInitialState: function(){
    return {
      gs: {},
      customer: null,
      searchTimer: null,
      customerPagination: null,
      ticketPage: 1,
      customerPage: 1,
      mainComponent: 'Loading...',
      subComponent: null
    };
  },
  componentDidMount: function(){
    var _this = this;
    $.ajax({
      method: 'GET',
      url: `/crm/config.json`,
      success: (function(data){
        _this.setGlobalState('config', data);
        _this.init(_this);
      })
    });
    $.ajax({
      method: 'GET',
      url: `/universal_access/users.json?code=crm_user`, //probably shouldn't hardcode this here
      success: (function(data){
        _this.setGlobalState('users', data);
      })
    });
  },
  init: function(_this){
    if (_this.props.customerId){
      window.setTimeout(function(){_this._goCustomer(_this.props.customerId);}, 1000);
    }else if (_this.props.companyId){
      window.setTimeout(function(){_this._goCustomer(_this.props.companyId);}, 1000);
    }else if (_this.props.ticketId){
      window.setTimeout(function(){_this._goTicket(_this.props.ticketId);}, 1000);
    }else{
      window.setTimeout(function(){_this._goTicketList('email');}, 1000);
    }
  },
  render: function() {
    return (
      <section id="main-wrapper" className="theme-blue">
        <Header
          gs={this.state.gs} sgs={this.setGlobalState}
          username={this.props.username}
          loadCustomers={this.loadCustomers}
          handleSearch={this.handleSearch}
          _goCustomerList={this._goCustomerList}
          />
        <Aside
          gs={this.state.gs} sgs={this.setGlobalState}
          _goHome={this._goHome}
          _goCompany={this._goCompany}
          _goTicketList={this._goTicketList}
          />
        <section className="main-content-wrapper">
          <PageHeader
            gs={this.state.gs} sgs={this.setGlobalState}
            _goHome={this._goHome}
            />
          <section id="main-content">
            {this.state.subComponent}
            {this.state.mainComponent}
          </section>
        </section>
      </section>
    );
  },
  handlePageHistory: function(title, url){
    document.title = title;
    window.history.replaceState({"pageTitle":title},'', url);
    this.setGlobalState('pageTitle', title);
  },
  setGlobalState: function(key, value){
    var globalState = this.state.gs;
    globalState[key] = value;
    this.setState({gs: globalState});
  },
  //Faux Routing
  _setMainComponent: function(comp){
    this.setState({mainComponent: comp});
  },
  _goHome: function(){
    this._goTicketList('email');
    this.handlePageHistory('Home', '/crm');
  },
  _goTicketList: function(status, flag){
    this.setGlobalState('ticketStatus', status);
    this.setGlobalState('ticketFlag', flag);
    this.setGlobalState('pageTitle', title);
    this.setState({mainComponent: <TicketList _goTicket={this._goTicket} gs={this.state.gs} sgs={this.setGlobalState} status={status} flag={flag} _goCustomer={this._goCustomer} />});
    if (status!=undefined){
      var title = `${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }else if (flag!=undefined){
      var title = `${flag}`;
    }
    this.handlePageHistory(title, `/crm`);
  },
  _goTicket: function(ticketId){
    this.setState({mainComponent: <TicketShowContainer ticketId={ticketId} gs={this.state.gs} sgs={this.setGlobalState} handlePageHistory={this.handlePageHistory} _goCustomer={this._goCustomer} />});
  },
  _goCompany: function(companyId){
    this.setState({mainComponent: <CompanyShowContainer companyId={companyId} gs={this.state.gs} sgs={this.setGlobalState} handlePageHistory={this.handlePageHistory} _goTicket={this._goTicket} _goCompany={this._goCompany} />})
  },
  _goCustomer: function(customerId){
    this.setState({mainComponent: <CustomerShowContainer customerId={customerId} gs={this.state.gs} sgs={this.setGlobalState} handlePageHistory={this.handlePageHistory} _goTicket={this._goTicket} _goCustomer={this._goCustomer} />})
  },
  _goCustomerList: function(searchWord){
    this.setState({mainComponent: <CustomerList _goCustomer={this._goCustomer} gs={this.state.gs} sgs={this.setGlobalState} />});
  },
});