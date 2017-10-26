/*
  global React
  global ReactDOM
  global $
*/
var ChangeCustomer = createReactClass({
  getInitialState: function(){
    return({
      customerId: null,
      customerName: null
    });
  },
  componentDidMount: function(){
    this.setState({customerName: this.props.ticket.subject_name});
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
        <p><strong>{this.props.ticket.numbered_title}</strong></p>
        <p className="lead">Current customer: {this.state.customerName}</p>
        <p>To assign this ticket to a different customer, search for them below:</p>
        {this.notFoundWarning()}
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
          <button className="btn btn-primary" onClick={this.saveNewCustomer}>
            <i className="fa fa-check" /> Save new customer
          </button>
        </div>
      );
    }
  },
  notFoundWarning: function(){
    if (!this.state.customerId){
      return(
        <div className="alert alert-info alert-sm">If you cannot find the correct customer, close this window and add them using the button in the menu.</div>
      );
    }
  },
  saveNewCustomer: function(){
    var _this=this;
    var searchField = ReactDOM.findDOMNode(this.refs.searchField);
    $.ajax({
      method: 'PATCH',
      url: `/crm/tickets/${this.props.ticket.id}/update_customer?customer_id=${this.state.customerId}`,
      success: function(data){
        _this.setState({customerName: data.ticket.subject_name, customerId: null});
        searchField.value = '';
      }
    });
  }
});