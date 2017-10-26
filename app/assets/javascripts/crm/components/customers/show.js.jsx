/*
  global React
  global $
*/
var CustomerShow = createReactClass({
  render: function(){
    if (this.props.customer.id && this.props.customer){
      var newTicket = null;
      if (this.props.customer.status=='active'){
        newTicket = <NewTicket key="new_ticket"
          subjectId={this.props.customer.id}
          subjectType='UniversalCrm::Customer'
          subject={this.props.customer}
          loadTickets={this.props.loadTickets}
          gs={this.props.gs}
          sgs={this.props.sgs}
          _goTicket={this.props._goTicket}
          />;
      }
      return(
        <div className="row">
          <div className="col-sm-6">
            <div className="panel panel-info">
              <div className="panel-heading">
                <h3 className="panel-title">{this.props.customer.name}</h3>
              </div>
              <div className="panel-body">
                {this.renderViewEdit()}
                <div className="text-right">
                  <button className="btn btn-warning btn-xs m-0" onClick={this.props.handleEdit}>
                    <i className="fa fa-pencil" />
                    {this.props.edit ? ' Cancel' : ' Edit'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Customer data</h3>
              </div>
              <div className="panel-body">
                <div className="tab-wrapper tab-primary">
                  <ul className="nav nav-tabs">
                    <li className="active"><a data-toggle="tab" href="#tab-notes">Notes</a></li>
                    <li><a data-toggle="tab" href="#tab-attachments">Files</a></li>
                    <li><a data-toggle="tab" href="#tab-settings">Settings</a></li>
                  </ul>
                  <div className="tab-content">
                    <div className="tab-pane active" id="tab-notes">
                      <Comments 
                        subject_type='UniversalCrm::Customer'
                        subject_id={this.props.customer.id}
                        newCommentPosition='bottom'
                        status='active'
                        newCommentPlaceholder='New note...'
                        fullWidth={true}
                        allowEmail={false}
                        />
                    </div>
                    <div className="tab-pane" id="tab-attachments">
                      <Attachments subjectId={this.props.customer.id} subjectType='UniversalCrm::Customer' />
                    </div>
                    <div className="tab-pane" id="tab-settings">
                      <CustomerSettings customer={this.props.customer} gs={this.props.gs} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-12 text-center">
            {newTicket}
          </div>
          <div className="col-sm-12">
            <div className="tab-wrapper tab-primary">
              <ul className="nav nav-tabs">
                <li className="active"><a data-toggle="tab" href="#tab-tickets">Tickets</a></li>
                <li><a data-toggle="tab" href="#tab-ticket-attachments">Attachments</a></li>
              </ul>
              <div className="tab-content">
                <div className="tab-pane active" id="tab-tickets">
                  <TicketList
                    _goTicket={this.props._goTicket}
                    _goCustomer={this.props._goCustomer}
                    subjectId={this.props.customer.id}
                    subjectType='UniversalCrm::Customer'
                    gs={this.props.gs}
                    sgs={this.props.sgs}
                    />
                </div>
                <div className="tab-pane" id="tab-ticket-attachments">
                  <Attachments parentId={this.props.customer.id} parentType='UniversalCrm::Customer' subjectType='UniversalCrm::Ticket' new={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }else{
      return(null);
    }
  },
  mailto: function(){
    if (this.props.customer.email){
      return(
        <a href={`mailto:${this.props.customer.email}?bcc=${this.props.gs.config.inbound_email_addresses[0]}`}>{this.props.customer.email} <i className="fa fa-external-link" /></a>
        );
    }
  },
  renderViewEdit: function(){
    if (this.props.edit){
      return(
        <CustomerEdit
          customer={this.props.customer}
          handleEdit={this.props.handleEdit}
          setCustomerId={this.props.setCustomerId}
          setCustomer={this.props.setCustomer}
          />
      );
    }else{
      return(
        <div className="row">
          <div className="col-sm-12">
            {this.draftAlert()}
            <dl className="dl-horizontal no-margin small">
              <dt> Position:</dt>
              <dd>{this.props.customer.position}</dd>
              <dt> Email:</dt>
              <dd style={{whiteSpace: 'nowrap'}}>{this.mailto()}</dd>
              <dt>Phone (Home):</dt>
              <dd>{this.props.customer.phone_home}</dd>
              <dt>Phone (Work):</dt>
              <dd>{this.props.customer.phone_work}</dd>
              <dt>Phone (Mobile):</dt>
              <dd>{this.props.customer.phone_mobile}</dd>
              {this.companies()}
              <dt>Tags:</dt>
              <dd><Tags subjectType="UniversalCrm::Customer" subjectId={this.props.customer.id} tags={this.props.customer.tags} /></dd>
            </dl>
          </div>
        </div>
      );
    }
  },
  draftAlert: function(){
    if (this.props.customer.status == 'draft'){
      return(<div className="alert alert-danger alert-sm text-center"><i className="fa fa-exclamation-triangle" /> Draft Customer</div>);
    }
  },
  companies: function(){
    if (this.props.gs && this.props.gs.config && this.props.gs.config.functions.indexOf('companies')>-1 && this.props.customer.companies.length>0){
      var rows = [];
      var goCompany = this.clickCompany;
      this.props.customer.companies.forEach(function(company){
        rows.push(<div key={company.id}>
          <a id={company.id} onClick={goCompany} style={{cursor: 'pointer'}}>{company.name}</a>
        </div>);
      });
      return (<div>
        <dt>Companies:</dt>
        <dd>{rows}</dd>
      </div>);
    }
  },
  clickCompany: function(e){
    this.props._goCompany(e.target.id);
  }
});