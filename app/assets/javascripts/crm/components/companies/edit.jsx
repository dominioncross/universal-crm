/*
  global React
  global ReactDOM
  global $
*/
var CompanyEdit = React.createClass({
  handleSubmit: function(e){
    e.preventDefault();
    $.ajax({
      method: 'PATCH',
      url: `/crm/companies/${this.props.company.id}`,
      dataType: 'JSON',
      data:{
        company: {
          name: ReactDOM.findDOMNode(this.refs.name).value,
          email: ReactDOM.findDOMNode(this.refs.email).value,
          address_line_1: ReactDOM.findDOMNode(this.refs.address_line_1).value,
          address_line_2: ReactDOM.findDOMNode(this.refs.address_line_2).value,
          address_city: ReactDOM.findDOMNode(this.refs.city).value,
          address_state: ReactDOM.findDOMNode(this.refs.state).value,
          address_post_code: ReactDOM.findDOMNode(this.refs.post_code).value
        }
      },
      success: (function(_this){
        return function(data){
          _this.props.setcompany(data.company);
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
            <div className="col-sm-10"><input type="text" className="form-control" defaultValue={this.props.company.name} ref='name' /></div>
          </div>
          <div className="form-group">
            <label className="col-sm-2 control-label">Email</label>
            <div className="col-sm-10"><input type="text" className="form-control" defaultValue={this.props.company.email} ref='email' /></div>
          </div>
          <div className="form-group">
            <label className="col-sm-2 control-label">Address Line 1</label>
            <div className="col-sm-10"><input type="text" className="form-control" defaultValue={this.props.company.address.line_1} ref='address_line_1' /></div>
          </div>
          <div className="form-group">
            <label className="col-sm-2 control-label">Address Line 2</label>
            <div className="col-sm-10"><input type="text" className="form-control" defaultValue={this.props.company.address.line_2} ref='address_line_2' /></div>
          </div>
          <div className="form-group">
            <label className="col-sm-2 control-label">City</label>
            <div className="col-sm-10"><input type="text" className="form-control" defaultValue={this.props.company.address.city} ref='city' /></div>
          </div>
          <div className="form-group">
            <label className="col-sm-2 control-label">State</label>
            <div className="col-sm-10"><input type="text" className="form-control" defaultValue={this.props.company.address.state} ref='state' /></div>
          </div>
          <div className="form-group">
            <label className="col-sm-2 control-label">Post code</label>
            <div className="col-sm-10"><input type="text" className="form-control" defaultValue={this.props.company.address.post_code} ref='post_code' /></div>
          </div>
          <div className="form-group">
              <div className="col-sm-offset-2 col-sm-10">
                <button className="btn btn-success">
                  <i className="fa fa-check" /> Update
                </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
});