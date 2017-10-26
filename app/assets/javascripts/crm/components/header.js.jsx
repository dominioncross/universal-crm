var Header = createReactClass({
  componentDidMount: function(){
  },
  systemName: function(){
    if (this.props.gs && this.props.gs.config){
      return(this.props.gs.config.system_name);
    }
  },
  toggleSidebar: function(e){
    var bodyEl = $('#main-wrapper');
    ($(window).width() > 767) ? $(bodyEl).toggleClass('sidebar-mini'): $(bodyEl).toggleClass('sidebar-opened');
  },
  render: function(){
    return(
      
      <header id="header">
        <BrandLogo system_name={this.systemName()} />
        <ul className="nav navbar-nav navbar-left">
          <li className="toggle-navigation toggle-left">
            <button className="sidebar-toggle" id="toggle-left" onClick={this.toggleSidebar}>
              <i className="fa fa-bars"></i>
            </button>
          </li>
          <li className="hidden-xs hidden-sm">
            <QuickSearch gs={this.props.gs} sgs={this.props.sgs} _goQuickSearch={this.props._goQuickSearch} />
          </li>
        </ul>
        <ul className="nav navbar-nav navbar-right">
          <li className="dropdown profile hidden-xs">
            <a href="javascript:void(0);" className="dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
              <span className="meta">
                <span className="text">{this.props.username}</span>
                <span className="caret"></span>
              </span>
            </a>
            <ul className="dropdown-menu animated bounceIn" role="menu">
              <li>
                <a href="/logout">
                  <span className="icon"><i className="fa fa-sign-out"></i></span>
                  Logout
                </a>
              </li>
            </ul>
          </li>
          <li className="toggle-fullscreen hidden-xs">
            <button type="button" className="btn btn-default expand" id="toggle-fullscreen">
                <i className="fa fa-expand"></i>
            </button>
          </li>
        </ul>
      </header>
    )    
  }
});