/*
  global $
  global React
*/
var CRM = createReactClass({
  getInitialState: function(){
    return {
      gs: {},
      mainComponent: 'Loading...',
      subComponent: null
    };
  },
  componentDidMount: function(){
    var _this = this;
    $.ajax({
      method: 'GET',
      url: `/crm/init.json`,
      success: (function(data){
        document.title = data.config.system_name;
        _this.setGlobalState('config', data.config);
        _this.setGlobalState('user', data.universal_user);
        _this.setGlobalState('users', data.users);
        _this.init(_this);
      })
    });
    $(document).ready(function(){
      window.onbeforeunload = function(e){
        $.ajax({type: 'GET', url: '/crm/unload'});
      };
    });
  },
  init: function(_this){
    if (_this.props.customerId){
      window.setTimeout(function(){_this._goCustomer(_this.props.customerId);}, 1000);
    }else if (_this.props.companyId){
      window.setTimeout(function(){_this._goCompany(_this.props.companyId);}, 1000);
    }else if (_this.props.ticketId){
      window.setTimeout(function(){_this._goTicket(_this.props.ticketId);}, 1000);
    }else{
      window.setTimeout(function(){_this._goDashboard();}, 1000);
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
          _goQuickSearch={this._goQuickSearch}
          />
        <Aside
          gs={this.state.gs} sgs={this.setGlobalState}
          _goDashboard={this._goDashboard}
          _goCompany={this._goCompany}
          _goTicketList={this._goTicketList}
          _goCustomerList={this._goCustomerList}
          _goCompanyList={this._goCompanyList}
          _goSearch={this._goSearch}
          _goNewsfeed={this._goNewsfeed}
          />
        <section className="main-content-wrapper">
          <PageHeader
            gs={this.state.gs} sgs={this.setGlobalState}
            _goHome={this._goHome}
            />
          <section id="main-content">
            {this.state.supportingComponent}
            <div className="row">
              <div className="col-sm-12">
                {this.state.subComponent}
              </div>
              <div className="col-sm-12">
                {this.state.mainComponent}
              </div>
            </div>
          </section>
        </section>
      </section>
    );
  },
  handlePageHistory: function(title, url){
    window.history.replaceState({"pageTitle":title},'', url);
    this.setGlobalState('pageTitle', title);
  },
  setGlobalState: function(key, value){
    var globalState = this.state.gs;
    if (value==null){
      delete globalState[key];
    }else{
      globalState[key] = value;
    }
    this.setState({gs: globalState});
  },
  //Faux Routing
  _setMainComponent: function(comp){
    this.setState({mainComponent: comp});
  },
  _goHome: function(){
    this._goTicketList('active');
    this.setGlobalState('pageIcon', null);
    this.handlePageHistory('Home', '/crm');
  },
  _goTicketList: function(status, flag){
    this.setGlobalState('ticketStatus', status);
    this.setGlobalState('ticketFlag', flag);
    this.setGlobalState('searchWord', '');
    this.setGlobalState('pageIcon', null);
    this.setGlobalState('pageTitle', null);
    this.setGlobalState('dateStart', '');
    this.setGlobalState('dateEnd', '');
    this.handlePageHistory('Home', '/crm');
    this.setState({mainComponent: <TicketList _goTicket={this._goTicket} gs={this.state.gs} sgs={this.setGlobalState} status={status} flag={flag} _goCustomer={this._goCustomer} _goCompany={this._goCompany} />});
  },
  _goDashboard: function(){
    this.setGlobalState('pageTitle', 'Dashboard');
    this.setGlobalState('pageIcon', null);
    this.handlePageHistory('Dashboard', '/crm');
    this.setState({mainComponent: <Dashboard gs={this.state.gs} sgs={this.setGlobalState} _goTicketList={this._goTicketList} _goCustomerList={this._goCustomerList} _goCompanyList={this._goCompanyList} />});
  },
  _goSearch: function(){
    this.setGlobalState('pageTitle', 'Search');
    this.setGlobalState('pageIcon', null);
    this.handlePageHistory('Search', '/crm');
    this.setState({supportingComponent: <Search gs={this.state.gs} sgs={this.setGlobalState} _goTicketList={this._goTicketList} _goCustomerList={this._goCustomerList} _goCompanyList={this._goCompanyList} _goQuickSearch={this._goQuickSearch} />});
  },
  _goNewsfeed: function(){
    this.setGlobalState('pageTitle', 'Newsfeed');
    this.setGlobalState('pageIcon', null);
    this.handlePageHistory('Newsfeed', '/crm');
    this.setState({mainComponent: <Newsfeed gs={this.state.gs} sgs={this.setGlobalState} _goTicketList={this._goTicketList} _goTicket={this._goTicket} _goCustomerList={this._goCustomerList} _goCompanyList={this._goCompanyList} _goQuickSearch={this._goQuickSearch} />});
  },
  _goTicket: function(ticketId){
    this.setState({mainComponent: <TicketShowContainer ticketId={ticketId} gs={this.state.gs} sgs={this.setGlobalState} handlePageHistory={this.handlePageHistory} _goCustomer={this._goCustomer} _goCompany={this._goCompany} />});
  },
  _goCompany: function(companyId){
    this.setState({mainComponent: <CompanyShowContainer companyId={companyId} gs={this.state.gs} sgs={this.setGlobalState} handlePageHistory={this.handlePageHistory} _goTicket={this._goTicket} _goCompany={this._goCompany} _goCustomer={this._goCustomer} />});
  },
  _goCustomer: function(customerId){
    this.setState({mainComponent: <CustomerShowContainer customerId={customerId} gs={this.state.gs} sgs={this.setGlobalState} handlePageHistory={this.handlePageHistory} _goTicket={this._goTicket} _goCompany={this._goCompany} _goCustomer={this._goCustomer} />});
  },
  _goCustomerList: function(searchWord, status){
    this.setGlobalState('searchWord', '');
    this.setGlobalState('customerStatus', status);
    this.setState({mainComponent: <CustomerList _goCustomer={this._goCustomer} gs={this.state.gs} sgs={this.setGlobalState} />});
  },
  _goCompanyList: function(searchWord, status){
    this.setGlobalState('searchWord', '');
    this.setGlobalState('companyStatus', status);
    this.setState({mainComponent: <CompanyList _goCustomer={this._goCustomer} _goCompany={this._goCompany} gs={this.state.gs} sgs={this.setGlobalState} />});
  },
  _goQuickSearch: function(searchWord){
    var h = (
      <div>
        <CustomerList _goCustomer={this._goCustomer} gs={this.state.gs} sgs={this.setGlobalState} />
        <CompanyList _goCustomer={this._goCustomer} _goCompany={this._goCompany} gs={this.state.gs} sgs={this.setGlobalState} />
        <TicketList _goTicket={this._goTicket} gs={this.state.gs} sgs={this.setGlobalState} _goCustomer={this._goCustomer} _goCompany={this._goCompany} />
      </div>
    );
    this.setState({mainComponent: h});
  },
});
