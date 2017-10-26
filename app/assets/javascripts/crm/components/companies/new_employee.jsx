/*
  global React
  global ReactDOM
  global $
*/
var NewEmployee = createReactClass({
  getInitialState: function(){
    return({
      subjectId: null,
      subjectType: null,
      customerId: null
    });
  },
  componentDidMount: function(){
    this.setState({subjectId: this.props.subjectId, subjectType: this.props.subjectType});
    var _this=this;
    var searchField = ReactDOM.findDOMNode(this.refs.searchField);
    $(searchField).autocomplete({
      source: `/crm/customers/autocomplete`,
      monLength: 3,
      autoFocus: true,
      delay: 400,
      select: function(e, ui){
        e.preventDefault();
        searchField.value = ui.item.label;
        _this.setState({customerId: ui.item.value});
      },
      focus: function(e,ui){
        e.preventDefault();
      }
    });
  },
  render: function(){
    return(
      <div>
        <hr />
        <h3>Add an employee</h3>
        <div className="form-group">
          <input type="text" placeholder="Keyword..." className="form-control" ref="searchField" />
        </div>
        {this.submitButton()}
      </div>
    );
  },
  submitButton: function(){
    if (this.state.customerId){
      return(
        <div className="form-group">
          <button className="btn btn-primary" onClick={this.addEmployee}>
            <i className="fa fa-check" /> Add employee
          </button>
        </div>
      );
    }
  },
  addEmployee: function(){
    var _this=this;
    var searchField = ReactDOM.findDOMNode(this.refs.searchField)
    $.ajax({
      method: 'PATCH',
      url: `/crm/companies/${this.props.subjectId}/add_employee?customer_id=${this.state.customerId}`,
      success: function(data){
        _this.setState({customerId: null});
        _this.props.updateEmployeeList(data.employees)
        searchField.value = '';
      }
    })
  }
});