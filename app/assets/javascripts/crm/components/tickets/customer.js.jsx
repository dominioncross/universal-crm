var TicketCustomerName = createReactClass({
  render: function(){
    if (this.props.name || this.props.email){
      return (
        <div style={{display: 'inline-block'}}>
          {this.creator()}
          <span onClick={this.setCustomerId} style={{textDecoration: 'underline', cursor: 'pointer'}}>
            {this.props.name||this.props.email}
          </span> {this.draft()}
        </div>
      );
    }else{
      return(null);
    }
  },
  setCustomerId: function(){
    // console.log(this.props.subject_type);
    // console.log( this.props._goCompany);
    if (this.props.subject_type == 'UniversalCrm::Customer' && this.props._goCustomer){
      this.props._goCustomer(this.props.id);
    }else if (this.props.subject_type == 'UniversalCrm::Company' && this.props._goCompany){
      this.props._goCompany(this.props.id);
    }
  },
  draft: function(){
    if (this.props.status=='draft'){
      return(<span className="text-muted">(Draft)</span>);
    }
  },
  creator: function(){
    if (this.props.creator_name){
      return(<span className="text-info">{this.props.creator_name} &raquo; </span>);
    }
  },
});