/*
  global React
  global ReactDOM
  global $
 */ 
var NewTicket = createReactClass({
  getInitialState: function(){
    return({
      title: '',
      content: '',
      dueOn: null,
      data: '',
      loading: false,
      kind: null,
      datepickerLoaded: false,
      responsibleId: null
    });
  },
  componentDidUpdate: function(){
    if (this.isTask() && this.state.title && !this.state.datepickerLoaded){
      var _this=this;
      $('.datepicker').datepicker({dateFormat:'yy-mm-dd', 
        onSelect: function(date){
          _this.handleDueOnChange(date);
        }});
      this.setState({datepickerLoaded: true, responsibleId: this.props.gs.user.id});
    }
  },
  handleContentChange: function(e){
    this.setState({content: e.target.value});
  },
  handleTitleChange: function(e){
    this.setState({title: e.target.value});
  },
  handleDueOnChange: function(date){
    this.setState({dueOn: date});
  },
  selectKind: function(e){
    this.setState({kind: $(e.target).attr('data-kind')});
  },
  isNote: function(){
    return(this.state.kind=='note');
  },
  isTask: function(){
    return(this.state.kind=='task');
  },
  isEmail: function(){
    return(this.state.kind=='email');
  },
  buttonList: function(){
    var buttons = [];
    buttons.push(
      <button key="btn-note" className="btn btn-info btn-sm" disabled={this.isNote()} data-kind="note" onClick={this.selectKind}>
        <i className="fa fa-sticky-note" onClick={this.selectKind} data-kind="note" /> New Note
      </button>
    );
    if (this.props.gs && this.props.gs.config && this.props.gs.config.functions.indexOf('tasks')>-1){
      buttons.push(
        <button key="btn-task" className="btn btn-info btn-sm" disabled={this.isTask()} data-kind="task" onClick={this.selectKind}>
          <i className="fa fa-check-circle" onClick={this.selectKind} data-kind="task" /> New Task
        </button>
      );
    }
    if (this.props.gs.config && this.props.gs.config.transaction_email_address && this.props.subject.email){
      buttons.push(
        <button key="btn-email" className="btn btn-info btn-sm" disabled={this.isEmail()} data-kind="email" onClick={this.selectKind}>
          <i className="fa fa-envelope" onClick={this.selectKind} data-kind="email" /> New Email
        </button>);
    }
    return(<div className="form-group"><div className="btn-group">{buttons}</div></div>);
  },
  render: function(){
    return(
      <div>
        {this.buttonList()}
        {this.newForm()}
      </div>
    );
  },
  handleSubmit: function(e){
    e.preventDefault();
    var _this=this;
    if (!this.state.loading){
      this.setState({loading: true});
      $.ajax({
        method: 'POST',
        url: '/crm/tickets',
        dataType: 'JSON',
        data:{
          title: this.state.title,
          content: this.state.content,
          due_on: this.state.dueOn,
          subject_id: this.props.subjectId,
          subject_type: this.props.subjectType,
          kind: this.state.kind,
          responsible_id: this.state.responsibleId
        },
        success: function(data){
          _this.setState({title: '', content: '', loading: false, kind: null, dueOn: null});
          _this.props._goTicket(data.ticket.id);
        }
      });
    }
  },
  loadingIcon: function(){
    if (this.state.loading){
      return('fa fa-refresh fa-spin');
    }else{
      return('fa fa-check');
    }
  },
  newForm: function(){
    var form;
    if (this.isNote()){
      form = this.newNote();
    }else if (this.isTask()){
      form = this.newTask();
    }else if (this.isEmail()){
      form = this.newEmail();
    }
    if (this.state.kind){
      return(
        <div className="panel panel-success text-left">
          <div className="panel-heading">
            <h3 className="panel-title">New {this.state.kind}</h3>
          </div>
          <div className="panel-body">
            {form}
          </div>
          <div className="panel-footer">{this.submitButton()}</div>
        </div>
      );
    }
  },
  newNote: function(){
    return(
      <div>
        {this.titleField()}
        {this.contentField()}
      </div>
    );
  },
  newTask: function(){
    return(
      <div>
        {this.titleField()}
        {this.contentField()}
        {this.taskFields()}
      </div>
    );
  },
  newEmail: function(){
    return(
      <div>
        {this.titleField()}
        {this.contentField()}
        <p className="small text-muted no-margin hidden">
          Or, forward an email to: <a href={`mailto:${this.props.subject.inbound_email_address}`}>{this.props.subject.inbound_email_address}</a>
        </p>
      </div>
    );
  },
  titleField: function(){
    return(
      <div className='form-group'>
        <input type='text' 
         defaultValue={this.state.title} 
         className='form-control'
         onChange={this.handleTitleChange}
         placeholder="Title..." />
      </div>
    );
  },
  contentField: function(){
    var height=100;
    if (this.isEmail()){
      height=200;
    }
    if (this.state.title){
      return(
        <div className="form-group">
          <textarea className="form-control" 
            placeholder="Content..."
            onChange={this.handleContentChange}
            defaultValue={this.state.content}
            style={{height: `${height}px`}} />
        </div>
      );
    }
  },
  submitButton: function(){
    var action = `Save`;
    var formValid=this.state.title;
    if (this.isEmail()){
      action = 'Send';
    }else if (this.isTask()){
      // formValid = (this.state.title && this.state.dueOn);
    }
    if (formValid){
      return(
        <div className="form-group m-0">
          <button className='btn btn-success upcase' onClick={this.handleSubmit}>
            <i className={this.loadingIcon()} /> {action} {this.state.kind}
          </button>
        </div>
      );
    }
  },
  taskFields: function(){
    if (this.state.title){
      return(
        <div className="form-group">
          <div className="row">
            <div className="col-sm-4 col-xs-6">
              <label>
                Due date:
                <input type="text" className="datepicker form-control" placeholder="DD-MM-YYYY"/>
              </label>
            </div>
            <div className="col-sm-8 col-xs-12">
              <label>
                Assign to:
                {this.users()}
              </label>
            </div>
          </div>
        </div>
      );
    }
  },
  users: function(){
    if (this.props.gs && this.props.gs.users){
      var u = [];
      for (var i=0;i<this.props.gs.users.length;i++){
        var user = this.props.gs.users[i];
        u.push(<li key={user.id}>{this.userButton(user)}</li>);
      }
      return(<ul className="list-inline">{u}</ul>);
    }
  },
  userButton: function(user){
    var btnClass = 'btn-default';
    var btnText = user.name;
    if (this.state.responsibleId==user.id){
      btnClass = 'btn-primary';
    }
    if (this.props.gs.user.id==user.id){
      btnText = 'Me';
    }
    return(
      <button className={`btn ${btnClass} btn-xs`} onClick={this.assignUser} data-id={user.id} data-name={user.name}>{btnText}</button>
    );
  },
  assignUser: function(e){
    var userId = $(e.target).attr('data-id');
    this.setState({responsibleId: userId});
  }
});