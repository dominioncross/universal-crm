var ChangeCustomerButton = createReactClass({
  getInitialState: function(){
    return({
      
    });
  },
  render: function(){
    return(
      <div>
        <button className="btn btn-default btn-xs" onClick={this.displayChangeCustomer}>
          <i className="fa fa-user" /> Change customer
        </button>
        <Modal ref='change_customer_modal' modalTitle="Change Customer" modalContent={<ChangeCustomer ticket={this.props.ticket}/>} />
      </div>
    )
  },
  displayChangeCustomer: function(){
    var modal = ReactDOM.findDOMNode(this.refs.change_customer_modal);
    if (modal){
      $(modal).modal('show', {backdrop: 'none'});
    }
  }, 
});