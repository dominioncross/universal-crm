/*
  global React
  global $
*/
var CompanyShow = createReactClass({
  render: function(){
    if (this.props.company.id && this.props.company){
      var newTicket = null;
      if (this.props.company.status=='active'){
        newTicket = <NewTicket key="new_ticket"
            subjectId={this.props.company.id}
            subjectType='UniversalCrm::Company'
            subject={this.props.company}
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
                <h3 className="panel-title">{this.props.company.name}</h3>
              </div>
              <div className="panel-body">
                {this.renderViewEdit()}
                {this.renderEditButton()}
              </div>
            </div>
            {newTicket}
          </div>
          <div className="col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">company data</h3>
              </div>
              <div className="panel-body">
                <div className="tab-wrapper tab-primary">
                  <ul className="nav nav-tabs">
                    <li className="active"><a data-toggle="tab" href="#tab-notes">Notes</a></li>
                    <li><a data-toggle="tab" href="#tab-employees">Employees{this.employeeCount()}</a></li>
                    <li><a data-toggle="tab" href="#tab-attachments">Files</a></li>
                    <li><a data-toggle="tab" href="#tab-settings">Settings</a></li>
                  </ul>
                  <div className="tab-content">
                    <div className="tab-pane active" id="tab-notes">
                      <Comments 
                        subject_type='UniversalCrm::Company'
                        subject_id={this.props.company.id}
                        newCommentPosition='bottom'
                        status='active'
                        newCommentPlaceholder='New note...'
                        fullWidth={true}
                        allowEmail={false}
                        />
                    </div>
                    <div className="tab-pane" id="tab-employees">
                      <Employees subjectId={this.props.company.id} subjectType='UniversalCrm::Company' employees={this.props.company.employees} sgs={this.props.sgs} _goCustomer={this.props._goCustomer} />
                    </div>
                    <div className="tab-pane" id="tab-attachments">
                      <Attachments subjectId={this.props.company.id} subjectType='UniversalCrm::Company' />
                    </div>
                    <div className="tab-pane" id="tab-settings">
                      <CompanySettings company={this.props.company} gs={this.props.gs} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                    _goCompany={this.props._goCompany}
                    _goCustomer={this.props._goCustomer}
                    subjectId={this.props.company.id}
                    subjectType='UniversalCrm::Company'
                    gs={this.props.gs}
                    sgs={this.props.sgs}
                    />
                </div>
                <div className="tab-pane" id="tab-ticket-attachments">
                  <Attachments parentId={this.props.company.id} parentType='UniversalCrm::Company' subjectType='UniversalCrm::Ticket' new={false} />
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
  renderViewEdit: function(){
    if (this.props.edit){
      return(
        <CompanyEdit
          company={this.props.company}
          handleEdit={this.props.handleEdit}
          setCompanyId={this.props.setCompanyId}
          setCompany={this.props.setCompany}
          />
      );
    }else{
      return(
        <div className="row">
          <div className="col-sm-12">
            {this.draftAlert()}
            <dl className="dl-horizontal no-margin">
              <dt>Email:</dt>
              <dd className="small" style={{whiteSpace: 'nowrap'}}>{this.mailto()}</dd>
              <dt>Address:</dt>
              <dd className="small">{this.props.company.address.formatted}</dd>
              <dt>Tags:</dt>
              <dd><Tags subjectType="UniversalCrm::Company" subjectId={this.props.company.id} tags={this.props.company.tags} /></dd>
            </dl>
          </div>
        </div>
      );
    }
  },
  draftAlert: function(){
    if (this.props.company.status == 'draft'){
      return(<div className="alert alert-danger alert-sm text-center"><i className="fa fa-exclamation-triangle" /> Draft Company</div>);
    }
  },
  employeeCount: function(){
    if (this.props.company.employees.length>0){
      return(<span className="text-muted"> ({this.props.company.employees.length})</span>);
    }
  },
  mailto: function(){
    if (this.props.company.email){
      return(
        <a href={`mailto:${this.props.company.email}?bcc=${this.props.gs.config.inbound_email_addresses[0]}`}>{this.props.company.email} <i className="fa fa-external-link" /></a>
        );
    }
  },
  renderEditButton: function(){
    if (this.props.gs.config.functions.indexOf('edit_companies')>-1){
      return(
        <div className="text-right">
          <button className="btn btn-warning btn-xs m-0" onClick={this.props.handleEdit}>
            <i className="fa fa-pencil" />
            {this.props.edit ? ' Cancel' : ' Edit'}
          </button>
        </div>
      );
    }
  }
});