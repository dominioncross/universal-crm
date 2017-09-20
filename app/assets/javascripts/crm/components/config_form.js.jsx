/*
  global React
  global $
*/
var ConfigForm = React.createClass({
  getInitialState: function(){
    return({
      inbound_domain: this.props.config.inbound_domain,
      functions: this.props.config.functions
    });
  },
  submitForm: function(e){
    e.preventDefault();
    this.props.updateChanges(this.refs);
  },
  changeInboundDomain: function(e){
    this.setState({inbound_domain: e.target.value});
  },
  render: function(){
    return(
      <form onSubmit={this.submitForm}>
        <div className="form-group">
          <label htmlFor="system_name">System Name</label>
          <input type="text" className="form-control" defaultValue={this.props.config.system_name} id="system_name" ref="system_name" />
        </div>
        <div className="form-group">
          <label htmlFor="url">URL</label>
          <input type="text" className="form-control" defaultValue={this.props.config.url} id="url" ref="url" />
        </div>
        <div className="form-group">
          <label htmlFor="inbound_domain">Inbound Domain</label>
          <input type="text" className="form-control" defaultValue={this.props.config.inbound_domain} id="inbound_domain" ref="inbound_domain" onChange={this.changeInboundDomain} />
        </div>
        <div className="form-group">
          <label htmlFor="inbound_email_addresses">Inbound Email Address</label>
          <input type="text" className="form-control" defaultValue={this.props.config.inbound_email_addresses.join(', ')} id="inbound_email_addresses" ref="inbound_email_addresses" />
          <p className="small">Separate with a comma. These addresses will catch all incoming emails and save them as tickets.</p>
        </div>
        {this.supportEmailsTo()}
        <div className="form-group">
          <label htmlFor="transaction_email_from">Transactional Email From Name</label>
          <input type="text" className="form-control" defaultValue={this.props.config.transaction_email_from} id="transaction_email_from" ref="transaction_email_from" />
        </div>
        <div className="form-group">
          <label htmlFor="transaction_email_address">Transactional Email Address</label>
          <p className="small">System emails will be sent FROM this address</p>
          <input type="text" className="form-control" defaultValue={this.props.config.transaction_email_address} id="transaction_email_address" ref="transaction_email_address" />
        </div>
        <div className="form-group">
          <label htmlFor="test_email">Test Email Address</label>
          <p className="small">Dev/Test emails will be sent TO this address</p>
          <input type="text" className="form-control" defaultValue={this.props.config.test_email} id="test_email" ref="test_email" />
        </div>
        <div className="form-group">
          <label htmlFor="new_ticket_header">New Ticket Email Header</label>
          <textarea className="form-control small" defaultValue={this.props.config.new_ticket_header} id="new_ticket_header" ref="new_ticket_header"></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="new_reply_header">New Ticket Reply Email Header</label>
          <textarea className="form-control small" defaultValue={this.props.config.new_reply_header} id="new_reply_header" ref="new_reply_header"></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="email_footer">Email Footer</label>
          <textarea className="form-control small" defaultValue={this.props.config.email_footer} id="email_footer" ref="email_footer"></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="ticket_flags">Ticket Flags</label>
          <p className="small">label|color</p>
          <textarea className="form-control small" defaultValue={this.parseFlags(this.props.config.ticket_flags)} id="ticket_flags" ref="ticket_flags" style={{height: '100px'}}></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="google_api_key">Google API Key (optional)</label>
          <input type="text" className="form-control" defaultValue={this.props.config.google_api_key} id="google_api_key" ref="google_api_key" />
          <p className="small">This will allow shortening of attachment URLs.</p>
        </div>
        <div className="form-group">
          <label htmlFor="default_customer_status">Default new customer/company status</label>
          <p>
            <select id="default_customer_status" ref="default_customer_status" defaultValue={this.props.config.default_customer_status} className="form-control">
              <option>active</option>
              <option>draft</option>
            </select>
          </p>
        </div>
        <div className="form-group">
          <label htmlFor="token">Token</label>
          <input type="text" className="form-control" defaultValue={this.props.config.token} id="token" disabled="disabled"/>
        </div>
        <fieldset>
          <legend>Functions</legend>
          {this.functionCheckbox('advanced_search', 'Advanced search')}
          {this.functionCheckbox('tasks', 'Tasks')}
          {this.functionCheckbox('companies', 'Companies')}
          {this.functionCheckbox('edit_companies', 'Edit companies')}
          {this.functionCheckbox('forward_tickets', 'Forward tickets to external email')}
          {this.functionCheckbox('newsfeed', 'Newsfeed (Recent comments/notes)')}
        </fieldset>
        <div className="form-group">
          {this.submitButton('Save Changes')}
        </div>
      </form>
    );
  },
  submitButton: function(label){
    if (this.props.loading){
      label = 'Loading...';
    }
    return(
      <button className="btn btn-primary btn-block">{label}</button>
    );
  },
  supportEmailsTo: function(){
    if (this.state.inbound_domain){
      return(
        <div className="alert alert-sm alert-info">
          Forward support emails to: <a href={`mailto:${this.props.config.token}@${this.state.inbound_domain}`} target="_blank" style={{fontWeight: 'bold'}}>{this.props.config.token}@{this.state.inbound_domain}</a>
        </div>
      );
    }
  },
  parseFlags: function(flags){
    var f = [];
    for(var i=0;i<flags.length;i++){
      var flag = flags[i];
      f.push(flag['label'] + '|' + flag['color']);
    }
    return(f.join("\r\n"));
  },
  functionCheckbox: function(func, title){
    return(
      <div className="form-group">
        <label>
          <input type="checkbox" data-function={func} onChange={this.changeFunction} defaultChecked={this.props.config.functions && this.props.config.functions.indexOf(func)>-1} /> {title}
        </label>
      </div>
    );
  },
  changeFunction: function(e){
    var f = $(e.target).attr('data-function');
    this.props.updateFunctions(f, e.target.checked);
  }
});