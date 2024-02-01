/*
  global React
  global ReactDOM
*/
var QuickSearch = createReactClass({
  getInitialState: function(){
    return({
      searchWord: null,
      searchTimer: null,
      displayDates: false,
    });
  },
  handleSearch: function(e){
    e.preventDefault();
    if (this.state.searchTimer == null){
      this.props.sgs('searching', true);
      this.setState({searchTimer: setTimeout(this.loadSearch, 800)});
      var input = ReactDOM.findDOMNode(this.refs.search_input);
      // input.value='';
    }
  },
  handleSearchWord: function(e){
    this.setState({searchWord: e.target.value});
    this.props.sgs('searchWord', e.target.value);
  },
  handleSearchDateStart: function(e){
    this.setState({dateStart: e.target.value});
    this.props.sgs('dateStart', e.target.value);
  },
  handleSearchDateEnd: function(e){
    this.setState({dateEnd: e.target.value});
    this.props.sgs('dateEnd', e.target.value);
  },
  loadSearch: function(){
    this.props._goQuickSearch(this.state.searchWord);
    this.setState({searchTimer: null});
  },
  handleOnClose: function(){
    this.setState({displayDates: !this.state.displayDates})
  },
  handleClearDates(){
    this.setState({dateStart: '', dateEnd: ''});
    this.props.sgs('dateStart', '');
    this.props.sgs('dateEnd', '');
  },
  render: function(){
    return (
      <div>
        <form onSubmit={this.handleSearch}>
          <input type="text" placeholder='Quick Search...' className="search" onChange={this.handleSearchWord} ref="search_input" />
          <button type="submit" className="btn btn-sm btn-search"><i className={this.icon()}></i></button>
      <i className={`fa fa-calendar ${this.state.dateEnd && this.state.dateStart ? 'text-success' : ''}`} style={{ position: 'absolute', marginTop: 23, marginLeft: 10, cursor: 'pointer' }} onClick={this.handleOnClose} />
          <div className="well well-sm" style={{background: '#FFF', position: 'absolute', marginTop: -30, left: 230, display: this.state.displayDates ? '' : 'none'}}>
            <div className="form-group" style={{marginBottom: 5}}>
              <label>From:
                <input type="text" placeholder='From...' className="form-control" onChange={this.handleSearchDateStart} type="date" />
              </label>
            </div>
            <div className="form-group" style={{marginBottom: 5}}>
              <label>To:
                <input type="text" placeholder='From...' className="form-control" onChange={this.handleSearchDateEnd} type="date" value={this.props.dateEnd}/>
              </label>
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <div className="pull-right"><button type="reset" className="btn btn-xs btn-default" onClick={this.handleClearDates}>Clear</button></div>
            </div>
          </div>
        </form>
      </div>
    );
  },
  icon: function(){
    if (this.props.gs.searching){
      return('fa fa-refresh fa-spin');
    }else{
      return('fa fa-search');
    }
  }
});
