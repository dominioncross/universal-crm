/*
  global $
  global React
*/
var CRM = React.createClass({
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
  },
  init: function(_this){
    if (_this.props.customerId){
      window.setTimeout(function(){_this._goCustomer(_this.props.customerId);}, 1000);
    }else if (_this.props.companyId){
      window.setTimeout(function(){_this._goCompany(_this.props.companyId);}, 1000);
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
          _goSearch={this._goSearch}
          />
        <Aside
          gs={this.state.gs} sgs={this.setGlobalState}
          _goHome={this._goHome}
          _goCompany={this._goCompany}
          _goTicketList={this._goTicketList}
          _goCustomerList={this._goCustomerList}
          _goCompanyList={this._goCompanyList}
          />
        <section className="main-content-wrapper">
          <PageHeader
            gs={this.state.gs} sgs={this.setGlobalState}
            _goHome={this._goHome}
            />
          <section id="main-content">
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
    this.setGlobalState('searchWord', '');
    this.setState({mainComponent: <TicketList _goTicket={this._goTicket} gs={this.state.gs} sgs={this.setGlobalState} status={status} flag={flag} _goCustomer={this._goCustomer} />});

  },
  _goTicket: function(ticketId){
    this.setState({mainComponent: <TicketShowContainer ticketId={ticketId} gs={this.state.gs} sgs={this.setGlobalState} handlePageHistory={this.handlePageHistory} _goCustomer={this._goCustomer} />});
  },
  _goCompany: function(companyId){
    this.setState({mainComponent: <CompanyShowContainer companyId={companyId} gs={this.state.gs} sgs={this.setGlobalState} handlePageHistory={this.handlePageHistory} _goTicket={this._goTicket} _goCompany={this._goCompany} />});
  },
  _goCustomer: function(customerId){
    this.setState({mainComponent: <CustomerShowContainer customerId={customerId} gs={this.state.gs} sgs={this.setGlobalState} handlePageHistory={this.handlePageHistory} _goTicket={this._goTicket} _goCustomer={this._goCustomer} />});
  },
  _goCustomerList: function(searchWord){
    this.setGlobalState('searchWord', '');
    this.setState({mainComponent: <CustomerList _goCustomer={this._goCustomer} gs={this.state.gs} sgs={this.setGlobalState} />});
  },
  _goCompanyList: function(searchWord){
    this.setGlobalState('searchWord', '');
    this.setState({mainComponent: <CompanyList _goCompany={this._goCompany} gs={this.state.gs} sgs={this.setGlobalState} />});
  },
  _goSearch: function(searchWord){
    var h = (
      <div>
        <CustomerList _goCustomer={this._goCustomer} gs={this.state.gs} sgs={this.setGlobalState} />
        <TicketList _goTicket={this._goTicket} gs={this.state.gs} sgs={this.setGlobalState} />
      </div>
    );
    this.setState({mainComponent: h});
  },
});