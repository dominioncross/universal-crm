/*
  global React
  global $
  global ReactDOM
*/
var Search = createReactClass({
  getInitialState: function(){
    return({
      searchWord: null,
      searchType: 'email',
      loading: false
    });  
  },
  handleSearchWord: function(e){
    this.setState({searchWord: e.target.value});
    this.props.sgs('searchWord', e.target.value);
  },
  render: function(){
    return(
      <div className="well well-sm">
        <form onSubmit={this.doSearch}>
          <div className="form-group">
            <div className="row">
              <div className="col-sm-6">
                <input type="text" className="form-control" placeholder="Keyword..." ref="keyword" required="true" onChange={this.handleSearchWord} />
              </div>
              <div className="col-sm-6">
                <fieldset>
                  <legend>Options</legend>
                  <div className="btn-group">
                    {this.searchTypeButton('Emails', 'email')}
                    {this.searchTypeButton('Tasks', 'task')}
                    {this.searchTypeButton('Notes', 'normal')}
                    {this.searchTypeButton('Customers', 'customer')}
                    {this.searchTypeButton('Companies', 'company')}
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
          <div className="form-group no-margin">
            <button className="btn btn-primary">
              <i className={`fa fa-fw fa-${this.loadingIcon()}`} /> Search
            </button>
          </div>
        </form>
      </div>
    );
  },
  searchTypeButton: function(title, type){
    var displayButton=true;
    if (type=='task' && this.props.gs && this.props.gs.config && !this.props.gs.config.functions.indexOf('tasks')>-1){
      displayButton=false;
    }else if (type=='company' && this.props.gs && this.props.gs.config && !this.props.gs.config.functions.indexOf('companies')>-1){
      displayButton=false;
    }
    if (displayButton){
      return(
        <button className={`btn btn-${type==this.state.searchType ? 'info' : 'default'} btn-sm`} data-type={type} onClick={this.changeSearchType}>{title}</button>
      );
    }
  },
  changeSearchType: function(e){
    this.setState({searchType: $(e.target).attr('data-type')});
  },
  doSearch: function(e){
    e.preventDefault();
    var keyword = ReactDOM.findDOMNode(this.refs.keyword).value;
    if (keyword){
      var _this=this;
      this.setState({loading: true});
      $.ajax({
        type: 'GET',
        url: '/crm/search',
        data: {
          keyword: keyword,
          search_type: this.state.searchType
        },
        success: function(data){
          _this.setState({loading: false});
          console.log(data);
          if (data.type=='email'||data.type=='task'||data.type=='normal'){
            _this.props._goQuickSearch();
          }
        }
      });
    }
  },
  loadingIcon: function(){
    if (this.state.loading){
      return('refresh fa-spin');
    }else{
      return('search');
    }
  }
});