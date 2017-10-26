/*
  global React
  global ReactDOM
  global $
*/
var Config = createReactClass({
  
  getInitialState: function(){
    return({
      config: null,
      signedIn: false,
      loading: false,
      functions: []
    });
  },
  componentDidMount: function(){
    this.init();
  },
  init: function(){
    $.ajax({
      method: 'GET',
      url: `/crm/config.json`,
      success: (function(_this){
        return function(data){
          _this.setState({config: data, functions: data.functions});
        };
      })(this)
    });
  },
  render: function(){
    return(
      <div>
        <header><BrandLogo system_name={this.props.config ? this.props.config.system_name : null} /></header>
        <div className="panel panel-primary" id="locked-screen">
          <div className="panel-heading">
            <h3 className="panel-title">Config</h3>
          </div>
          <div className="panel-body">
            {this.configForm()}
          </div>
        </div>
      </div>
    );
  },
  configForm: function(){
    if (this.state.signedIn){
      return(<ConfigForm config={this.state.config} updateChanges={this.updateChanges} loading={this.state.loading} updateFunctions={this.updateFunctions} />);
    }else{
      return(<ConfigLogin config={this.state.config} submitNewPassword={this.submitNewPassword} signIn={this.signIn} loading={this.state.loading} />);
    }
  },
  loading: function(){
    this.setState({loading: true});
  },
  finished: function(){
    this.setState({loading: false});
  },
  submitNewPassword: function(password){
    this.loading();
    $.ajax({
      method: 'POST',
      url: '/crm/config/set_password',
      dataType: 'JSON',
      data:{
        password: password
      },
      success: (function(_this){
        return function(data){
          _this.setState({config: data});
          showSuccess('Password saved: ' + password);
          _this.finished();
        };
      })(this)
    });
  },
  signIn: function(password){
    this.loading();
    $.ajax({
      method: 'POST',
      url: '/crm/config/signin',
      dataType: 'JSON',
      data:{
        password: password
      },
      success: (function(_this){
        return function(data){
          _this.setState({signedIn: data.signedIn});
          if (data.signedIn){
            showSuccess('Password accepted');  
          }else{
            showErrorMessage('Incorrect password');  
          }
          _this.finished();
        };
      })(this)
    });
  },
  updateChanges: function(refs){
    this.loading();
    $.ajax({
      method: 'PATCH',
      url: '/crm/config',
      dataType: 'JSON',
      data:{
        config: {
          system_name: ReactDOM.findDOMNode(refs.system_name).value,
          inbound_domain: ReactDOM.findDOMNode(refs.inbound_domain).value,
          inbound_email_addresses: ReactDOM.findDOMNode(refs.inbound_email_addresses).value,
          transaction_email_address: ReactDOM.findDOMNode(refs.transaction_email_address).value,
          transaction_email_from: ReactDOM.findDOMNode(refs.transaction_email_from).value,
          new_ticket_header: ReactDOM.findDOMNode(refs.new_ticket_header).value,
          new_reply_header: ReactDOM.findDOMNode(refs.new_reply_header).value,
          email_footer: ReactDOM.findDOMNode(refs.email_footer).value,
          ticket_flags: ReactDOM.findDOMNode(refs.ticket_flags).value,
          url: ReactDOM.findDOMNode(refs.url).value,
          google_api_key: ReactDOM.findDOMNode(refs.google_api_key).value,
          test_email: ReactDOM.findDOMNode(refs.test_email).value,
          default_customer_status: ReactDOM.findDOMNode(refs.default_customer_status).value,
          functions: this.state.functions
        }
      },
      success: (function(_this){
        return function(data){
          showSuccess('Config updated');
          _this.setState({config: data});
          _this.finished();
        };
      })(this)
    });
  },
  updateFunctions: function(f, checked){
    var functions = this.state.functions;
    if (checked){
      functions.push(f);
    }else{
      functions.splice(functions.indexOf(f),1);
    }
    this.setState({functions: functions});
  }
});