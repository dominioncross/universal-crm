/*
  global $, React
*/
var Attachments = createReactClass({
  getInitialState: function(){
    return({
      subjectId: null,
      parentId: null,
      attachments: [],
      newAttachment: false,
      loading: false,
      uniqueId: null
    });
  },
  init: function(){
    var uniqueId = `${this.props.subjectType.replace('::','-')}_${this.props.subjectId||this.props.parentId}`;
    this.setState({uniqueId: uniqueId});
  },
  initFileUpload: function(){
    var uniqueId = this.state.uniqueId;
    var input_id = `#file_input_${uniqueId}`;
    var file = $(input_id);
    var _this = this;
    $(file).fileupload({
      dataType: 'json',
      url: this.url(),
      done: function (e, data) {
        _this.loadAttachments();
        $(`#progress_${uniqueId}`).hide();
        $(`#progress_${uniqueId} .progress-bar`).css('width', '0%');
        _this.toggleNew();
      },
      progressall: function (e, data) {
        $(`#progress_${uniqueId}`).show();
        $('#file_input').blur();
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $(`#progress_${uniqueId} .progress-bar`).css('width', progress + '%');
      }
    });
  },
  componentDidMount: function(){
    this.loadAttachments();
    this.init();
  },
  componentDidUpdate: function(){
    this.initFileUpload();
    if ((this.props.subjectId != null && this.props.subjectId != this.state.subjectId && !this.state.loading) || (this.props.parentId != null && this.props.parentId != this.state.parentId && !this.state.loading)){
      this.loadAttachments();
      this.init();
    }
  },
  url: function(){
    return `/crm/attachments?subject_id=${this.props.subjectId}&subject_type=${this.props.subjectType}&parent_id=${this.props.parentId}&parent_type=${this.props.parentType}`;
  },
  render: function(){
    return(
      <div>
        {this.list()}
        {this.newAttachment()}
        <div id={`new_attachment_form_${this.state.uniqueId}`} style={{display: 'none'}}>
          <div className="form-group">
            <input id={`file_input_${this.state.uniqueId}`} type="file" className="form-control" ref='fileUpload' />
            <div id={`progress_${this.state.uniqueId}`} className="progress" style={{display: 'none'}}>
              <div className="progress-bar progress-bar-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  },
  list: function(){
    var attachments = [];
    if (this.state.attachments.length==0 && (this.props.new==undefined || this.props.new==true)){
      //return(<div className="alert alert-info alert-sm">There are no attachments to list</div>);
    }else if (this.state.attachments.length>0){
      var shortenUrlButton = this.shortenUrlButton;
      var filename=null;
      this.state.attachments.forEach(function(attachment){
        if (attachment.name){
          filename = attachment.name;
        }else{
          filename = attachment.file;
        }
        attachments.push(
          <li key={attachment.id} style={{display: 'block'}}>
            <h5><i className="fa fa-paperclip" /> <a href={attachment.url} target="_blank">{filename}</a></h5>
            <p className="small">{attachment.subject_name} ({attachment.created_formatted})</p>
            {shortenUrlButton(attachment.id, attachment.url, attachment.shortened_url)}
          </li>
        );
      });
      return(
        <div className="well well-sm">
          <ul style={{marginBottom: 0}} className="list-unstyled">{attachments}</ul>
        </div>
      );
    }
  },
  loadAttachments: function(){
    if (!this.state.loading){
      this.setState({loading: true});
      $.ajax({
        method: 'GET',
        url: `/crm/attachments?subject_id=${this.props.subjectId}&subject_type=${this.props.subjectType}&parent_id=${this.props.parentId}&parent_type=${this.props.parentType}`,
        success: (function(_this){
          return function(data){
            if (data){
              _this.setState({subjectId: _this.props.subjectId, parentId: _this.props.parentId, attachments: data.attachments, loading: false});
            }
          };
        })(this)
      });
    }
  },
  toggleNew: function(){
    this.setState({newAttachment: true});
    $(`#new_attachment_form_${this.state.uniqueId}`).show();
  },
  newAttachment: function(){
    if(!this.state.newAttachment && (this.props.new==undefined || this.props.new==true)){
      return(
        <button className="btn btn-primary btn-sm" onClick={this.toggleNew}><i className="fa fa-upload" /> New attachment</button>
      )
    }
  },
  shortenUrlButton: function(id, url, shortUrl){
    if (this.props.gs && this.props.gs.config.google_api_key && this.props.subjectId){
      return(
        <ShortenUrl url={url} attachmentId={id} subjectId={this.props.subjectId} subjectType={this.props.subjectType} shortUrl={shortUrl} gs={this.props.gs} />
      );
    }
  }
});