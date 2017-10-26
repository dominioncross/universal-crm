var CustomerSearch = createReactClass({
  getInitialState: function(){
    return({
      searchWord: null,
      searchTimer: null
    });
  },
  handleSearch: function(e){
    e.preventDefault();
    if (this.state.searchTimer == null){
      this.props.sgs('searching', true);
      this.setState({searchTimer: setTimeout(this.loadSearch, 800)});
    }
  },
  handleSearchWord: function(e){
    this.setState({searchWord: e.target.value});
    this.props.sgs('searchWord', e.target.value);
  },
  loadSearch: function(){
    this.props._goCustomerList(this.state.searchWord);
    this.setState({searchTimer: null});
  },
  render: function(){
    return (
      <form onSubmit={this.handleSearch}>
        <input type="text" placeholder='Search...' className="search" onChange={this.handleSearchWord} />
        <button type="submit" className="btn btn-sm btn-search"><i className={this.icon()}></i></button>
      </form>
    )
  },
  icon: function(){
    if (this.props.gs.searching){
      return 'fa fa-refresh fa-spin'
    }else{
      return 'fa fa-search'
    }
  }
});
