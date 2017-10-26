var CustomerShowContainer = createReactClass({
  getInitialState: function(){
    return {
      edit: false,
      customer: null,
      customerId: null,
      loading: false,
      pastProps: null
    };
  },
  init: function(){
    this.loadCustomer(this.props.customerId);
  },
  componentDidMount: function(){
    this.init();
  },
  componentDidUpdate: function(){
    if (this.state.pastProps != this.props && !this.state.loading){
      this.init();
    }
  },
  loadCustomer: function(id){
    var _this=this;
    if (id!=undefined&& id != ''&&!this.state.loading){
      this.setState({loading: true, pastProps: this.props});
      $.ajax({
        method: 'GET',
        url: `/crm/customers/${id}.json`,
        success: function(data){
          if (data.customer){
            _this.setCustomer(data.customer);
          }
        }
      });
    }
  },
  setCustomer: function(customer){
    this.setState({customer: customer, customerId: customer.id, edit: false, loading: false});
    this.props.handlePageHistory(`${customer.name||customer.email}`, `/crm/customer/${customer.id}`);
  },
  handleEdit: function(){
    this.setState({edit: !this.state.edit})
  },
  render: function(){
    if (this.props.customerId && this.state.customer){
      return(
        <CustomerShow 
          customer={this.state.customer}
          edit={this.state.edit}
          handleEdit={this.handleEdit}
          loadTickets={this.props.loadTickets}
          setCustomer={this.setCustomer}
          _goTicket={this.props._goTicket}
          _goCustomer={this.props._goCustomer}
          _goCompany={this.props._goCompany}
          gs={this.props.gs} sgs={this.props.sgs}
        />
      );
    }else{
      return(null);
    }
  },
  setCustomerId: function(){
    if (this.props.setCustomerId){
      this.props.setCustomerId();
    }
  }
});