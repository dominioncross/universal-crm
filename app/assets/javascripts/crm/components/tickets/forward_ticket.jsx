/*global React*/
/*global $*/
var ForwardTicket = React.createClass({
  getInitialState: function(){
    return({
      displayForm: false,
      loading: false,
      emailSent: false,
      emailAddress: null
    });
  },
  render: function(){
    if (this.props.gs && this.props.gs.config && this.props.gs.config.functions && this.props.gs.config.functions.indexOf('forward_tickets')>-1){
      if (this.state.displayForm){
        return(this.forwardForm());
      }else{
        return(this.forwardButton());
      }
    }else{
      return(null);
    }
  },
  forwardButton: function(){
    return(
      <button onClick={this.toggleButton} className="btn btn-info btn-sm">Forward to email <i className="fa fa-chevron-right" /></button>
    );
  },
  toggleButton: function(){
    this.setState({displayForm: !this.state.displayForm});
  },
  forwardForm: function(){
    return(
      <div className="row">
        <div className="col-sm-6">
          <div className="input-group">
            <input type="text" className="form-control" placeholder="Email addresss..." onChange={this.changeEmail} />
            <span className="input-group-btn">
              <button onClick={this.submit} className="btn btn-info" disabled={!this.state.emailAddress || this.state.loading}>{this.buttonText()}</button>
              <button onClick={this.cancel} className="btn btn-default">{this.cancelButtonText()}</button>
            </span>
          </div>
        </div>
      </div>
    );
  },
  buttonText: function(){
    if (this.state.emailSent){
      return(<span><i className="fa fa-check" /> Email sent</span>);
    }else{
      return(<span><i className="fa fa-send" /> Forward</span>);
    }
  },
  cancelButtonText: function(){
    if (this.state.emailSent){
      return(<span><i className="fa fa-times" /> Close</span>);
    }else{
      return(<span><i className="fa fa-times" /> Cancel</span>);
    }
  },
  cancel: function(){
    this.setState({loading: false, displayForm: false, emailAddress: null});
  },
  changeEmail: function(e){
    this.setState({emailAddress: e.target.value});
  },
  submit: function(){
    var _this=this;
    if (!this.state.loading){
      this.setState({loading: true});
      $.ajax({
        type: 'POST',
        url: `/crm/tickets/${this.props.ticketId}/forward`,
        data: {email: this.state.emailAddress},
        success: function(data){
          console.log(data);
          if (data.status == 200){
            _this.setState({emailSent: true})
          }
          _this.setState({loading: false});
        }
      });
    }
  }
});
