var CustomerSettings = createReactClass({
  getInitialState: function(){
    return({
      status: null
    });
  },
  componentDidMount: function(){
    if (this.props.customer){
      this.setState({status: this.props.customer.status});
    }
  },
  toggleBlock: function(){
    if (this.state.status == 'active'){
      if (confirm('Are you sure you want to Block this customer?')){
        this.setState({status: 'blocked'});
        this.updateStatus('blocked');
      }
    }else{
      if (confirm('Are you sure you want to Unblock this customer?')){
        this.setState({status: 'active'});
        this.updateStatus('active');
      }
    }
  },
  updateStatus: function(status){
    $.ajax({
      method: 'PATCH',
      url: `/crm/customers/${this.props.customer.id}/update_status?status=${status}`,
      success: function(data){
        // console.log(data);
      }
    });
  },
  render: function(){
    return(
      <div>
        <h3>Block customer</h3>
        {this.noAccess()}
        {this.active()}
        {this.blocked()}
      </div>
    );
  },
  hasAccess: function(){
    return can(this.props.gs, 'block_customers')
  },
  noAccess: function(){
    if (!this.hasAccess()){
      return(<p className="text-warning text-center"><i className="fa fa-lock" /> You do not have access to this function</p>);
    }
  },
  active: function(){
    if (this.hasAccess() && this.state.status=='active'){
      return(
        <div>
          <div className="alert alert-info">
            This customer is active. To block them on the system so they no longer receive new tickets, click the button below.
          </div>
          <button className="btn btn-danger" onClick={this.toggleBlock} >
            <i className="fa fa-fw fa-ban" /> Block customer
          </button>
        </div>
      );
    }
  },
  blocked: function(){
    if (this.hasAccess() && this.state.status=='blocked'){
      return(
        <div>
          <div className="alert alert-warning">
            This customer has been blocked. New tickets will no longer be raised when emails from <strong>{this.props.customer.email}</strong> are received.
          </div>
          <button className="btn btn-warning" onClick={this.toggleBlock} >
            <i className="fa fa-fw fa-ban" /> Unblock customer
          </button>
        </div>
      );
    }
  }
});