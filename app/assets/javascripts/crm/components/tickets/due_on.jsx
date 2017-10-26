/*
  global React
  global ReactDOM
  global $
*/
var TicketDueOn = createReactClass({
  getInitialState: function(){
    return({
      editing: false,
      dueOn: null,
      jsLoaded: false
    });
  },
  componentDidMount: function(){
    this.setState({dueOn: this.props.ticket.due_on});
  },
  componentDidUpdate: function(){
    if (true){
      var _this=this;
      $('.datepicker').datepicker({dateFormat:'yy-mm-dd', 
        onSelect: function(date){
          _this.handleDueOnChange(date);
        }});
    }
  },
  render: function(){
    if (this.props.ticket && this.props.ticket.kind=='task'){
      return(
        <div>
          {this.displayDate()}
          {this.editForm()}
        </div>
      );
    }else{
      return(null);
    }
  },
  handleDueOnChange: function(date){
    this.setState({dueOn: date});
    var _this=this;
    var input = ReactDOM.findDOMNode(this.refs.due_on);
    $.ajax({
      type: 'PATCH',
      url: `/crm/tickets/${_this.props.ticket.id}/update_due_on`,
      dataType: 'JSON',
      data: {due_on: this.state.dueOn},
      success: function(data){
        _this.setState({editing: false, dueOn: data.ticket.due_on, jsLoaded: true});
        input.value = data.ticket.due_on;
      }
    });
  },
  editDate: function(){
    this.setState({editing: !this.state.editing});
  },
  editButton: function(){
    if (this.props.editable){
      return(
        <i className="fa fa-pencil" onClick={this.editDate} style={{marginLeft: '10px', cursor: 'pointer'}} />
      );
    }
  },
  displayDate: function(){
    if (!this.state.editing){
      var labelClass = 'warning';
      if (new Date(this.props.ticket.due_on) < new Date()){
        labelClass = 'danger';
      }
      return(<span className={`label label-${labelClass}`} style={{marginLeft: (this.props.margin ? '10px' : null)}}>Due: {this.state.dueOn} {this.editButton()}</span>);
    }
  },
  editForm: function(){
    if (this.state.editing){
      return(
        <div className="row">
          <div className="col-sm-4">
            <div className="form-group">
              <label>
                <small>Select new date:</small><br />
                <input type="text" className="datepicker form-control" ref="due_on" placeholder="DD-MM-YYYY" defaultValue={this.state.dueOn} />
              </label>
            </div>
          </div>
        </div>
      );
    }
  }
});