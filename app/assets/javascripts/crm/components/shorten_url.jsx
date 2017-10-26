var ShortenUrl = createReactClass({
  getInitialState: function(){
    return({
      shortUrl: null,
      loading: false
    })
  },
  componentDidMount: function(){
    this.setState({shortUrl: this.props.shortUrl})
  },
  render: function(){
    return(<span style={{marginLeft:'10px'}}>
        {this.button()}
        {this.shortUrl()}
      </span>);
  },
  button: function(){
    if (this.state.shortUrl){
      return(null);
    }else{
      return(
        <i className={this.icon()} 
          onClick={this.shortenUrl}
          style={{cursor: 'pointer'}} 
          title="Shorten this URL" />
      );
    }
  },
  icon: function(){
    if (!this.state.loading){
      return("fa fa-link text-info");
    }else{
      return("fa fa-refresh fa-spin text-info");
    }
  },
  shortUrl: function(){
    if (this.state.shortUrl){
      return(
        <span className="small">
          (<a href={this.state.shortUrl} target="_blank">{this.state.shortUrl}</a>)
        </span>
      );
    }
  },
  shortenUrl: function(e){
    if (!this.state.loading){
      this.setState({loading: true});
      var _this=this;
      $.ajax({
        type: 'GET',
        url: `/crm/attachments/${this.props.attachmentId}/shorten_url?subject_id=${this.props.subjectId}&subject_type=${this.props.subjectType}`,
        data: {google_api_key: this.props.gs.config.google_api_key},
        success: function(data){
          _this.setState({shortUrl: data.url});
          this.setState({loading: false});
        }
      });
    }
  }
});