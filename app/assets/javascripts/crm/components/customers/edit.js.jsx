/*
  global React
  global ReactDOM
  global $
*/
var CustomerEdit = createReactClass({
  handleSubmit: function(e){
    e.preventDefault();
    $.ajax({
      method: 'PATCH',
      url: `/crm/customers/${this.props.customer.id}`,
      dataType: 'JSON',
      data:{
        customer: {
          name: ReactDOM.findDOMNode(this.refs.name).value, 
          position: ReactDOM.findDOMNode(this.refs.position).value, 
          email: ReactDOM.findDOMNode(this.refs.email).value, 
          phone_home: ReactDOM.findDOMNode(this.refs.phone_home).value, 
          phone_work: ReactDOM.findDOMNode(this.refs.phone_work).value, 
          phone_mobile: ReactDOM.findDOMNode(this.refs.phone_mobile).value
        }
      },
      success: (function(_this){
        return function(data){
          _this.props.setCustomer(data.customer);
        };
      })(this)
    });
  },
  render: function(){
    return(
      <div>
        <form onSubmit={this.handleSubmit} className="form-horizontal" role="form">
          <div className="form-group">
            <label className="col-sm-2 control-label">Name</label>
            <div className="col-sm-10"><input type="text" className="form-control" defaultValue={this.props.customer.name} ref='name' /></div>
          </div>
          <div className="form-group">
            <label className="col-sm-2 control-label">Position</label>
            <div className="col-sm-10"><input type="text" className="form-control" defaultValue={this.props.customer.position} ref='position' /></div>
          </div>
          <div className="form-group">
            <label className="col-sm-2 control-label">Email</label>
            <div className="col-sm-10"><input type="text" className="form-control" defaultValue={this.props.customer.email} ref='email' /></div>
          </div>
          <div className="form-group">
            <label className="col-sm-2 control-label">Phone (Home)</label>
            <div className="col-sm-10"><input type="text" className="form-control" defaultValue={this.props.customer.phone_home} ref='phone_home' /></div>
          </div>
          <div className="form-group">
            <label className="col-sm-2 control-label">Phone (Work)</label>
            <div className="col-sm-10"><input type="text" className="form-control" defaultValue={this.props.customer.phone_work} ref='phone_work' /></div>
          </div>
          <div className="form-group">
            <label className="col-sm-2 control-label">Phone (Mobile)</label>
            <div className="col-sm-10"><input type="text" className="form-control" defaultValue={this.props.customer.phone_mobile} ref='phone_mobile' /></div>
          </div>
          <div className="form-group no-margin">
              <div className="col-sm-offset-2 col-sm-10">
                <button className="btn btn-success">
                  <i className="fa fa-check" /> Update
                </button>
            </div>
          </div>
        </form>
      </div>
    )
  }
});