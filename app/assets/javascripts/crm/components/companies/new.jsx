var NewCompany = createReactClass({
  getInitialState: function(){
    return({
      name: null,
      email: null
    })
  },
  handleSubmit: function(e){
    e.preventDefault();
    $.ajax({
      method: 'POST',
      url: '/crm/companies',
      dataType: 'JSON',
      data:{
        name: ReactDOM.findDOMNode(this.refs.name).value,
        email: ReactDOM.findDOMNode(this.refs.email).value
      },
      success: (function(_this){
        return function(data){
          ReactDOM.findDOMNode(_this.refs.name).value=''
          ReactDOM.findDOMNode(_this.refs.email).value=''
          if (data.email){
            if (data.existing){
              showErrorMessage('Company already exists: ' + data.name);
            }else{
              showSuccess('Company created: ' + data.name);
            }
          }
        }
      })(this)
    });
  },
  render: function(){
    return(
      <form onSubmit={this.handleSubmit} className="form-horizontal" role="form">
        <div className="form-group">
          <label className="col-sm-2 control-label">Name</label>
          <div className="col-sm-10"><input type="text" className="form-control" ref='name' /></div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 control-label">Email</label>
          <div className="col-sm-10"><input type="text" className="form-control" ref='email' /></div>
        </div>
        <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
              <button className="btn btn-success">
                <i className="fa fa-check" /> Save
              </button>
          </div>
        </div>
      </form>
    );
  },  
})