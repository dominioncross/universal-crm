var BrandLogo = createReactClass({
  
  render: function(){
    return(
      <div className="brand">
        <a href="/crm" className="logo">
          <i className="fa fa-comments" style={{marginRight: '5px'}}/>
          <span>{this.props.system_name == null ? 'CRM' : this.props.system_name}</span>
        </a>
      </div>
    )
  }
});