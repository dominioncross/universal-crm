var Attachments = React.createClass({
  getInitialState: function(){
    return({
      attachments: [],
      newAttachment: false
    })
  },
  componentDidMount: function(){
    this.loadAttachments();
    var file = ReactDOM.findDOMNode(this.refs.fileUpload);
    var _this = this;
    $(file).fileupload({
      dataType: 'json',
      done: function (e, data) {
        _this.loadAttachments();
        $('#progress').hide();
        $('#progress .progress-bar').css('width', '0%');
        _this.toggleNew();
      },
      progressall: function (e, data) {
        $('#progress').show();
        $('#file_input').blur();
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#progress .progress-bar').css('width', progress + '%');
      }
    });
  },
  url: function(){
    return `/crm/attachments?subject_id=${this.props.subjectId}&subject_type=${this.props.subjectType}`
  },
  render: function(){
    return(
      <div>
        {this.list()}
        <hr />
        {this.newAttachment()}
        <div id="new_attachment_form" style={{display: 'none'}}>
          <div className="form-group">
            <input id="file_input" type="file" className="form-control" ref='fileUpload' data-url={this.url()} />
            <div id="progress" className="progress" style={{display: 'none'}}>
              <div className="progress-bar progress-bar-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  },
  list: function(){
    var attachments = [];
    if (this.state.attachments.length==0){
      return(<div className="alert alert-info alert-sm">There are no attachments to list</div>);
    }else{
      this.state.attachments.forEach(function(attachment){
        attachments.push(
          <li key={attachment.id}><a href={attachment.url} target="_blank">{attachment.file}</a></li>
        )
      });
      return(<ol>{attachments}</ol>)
    }
  },
  loadAttachments: function(){
    $.ajax({
      method: 'GET',
      url: `/crm/attachments?subject_id=${this.props.subjectId}&subject_type=${this.props.subjectType}`,
      success: (function(_this){
        return function(data){
          if (data){
            _this.setState({attachments: data.attachments});
          }
        }
      })(this)
    });
  },
  toggleNew: function(){
    this.setState({newAttachment: true});
    $('#new_attachment_form').show();
  },
  newAttachment: function(){
    if(!this.state.newAttachment){
      return(
        <button className="btn btn-primary btn-sm" onClick={this.toggleNew}><i className="fa fa-plus" /> New</button>
      )
    }
  }
});