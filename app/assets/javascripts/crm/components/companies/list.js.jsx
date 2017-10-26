/*
  global React
  global $
*/
var CompanyList = createReactClass({
  getInitialState: function(){
    return({
      companies: null,
      loading: false,
      pagination: null,
      pageNum: null,
      pastProps: null,
      companyStatus: null
    });
  },
  init: function(){
    this.loadCompanies(this.props.gs.searchWord, this.props.gs.companyStatus);
  },
  componentDidMount: function(){
    this.init();
  },
  componentDidUpdate: function(){
    if (this.state.pastProps != this.props && !this.state.loading){
      this.init();
    }
  },
  clickCompany: function(e){
    this.props._goCompany(e.target.id);
  },  
  loadCompanies: function(searchWord, companyStatus, page){
    if (!this.state.loading){
      this.setState({loading: true, pastProps: this.props, companyStatus: companyStatus});
      if (page==undefined){page=1;}
      if (searchWord==undefined){searchWord='';}
      if (companyStatus==undefined){companyStatus='';}
      var _this=this;
      return $.ajax({
        method: 'GET',
        url: `/crm/companies?q=${searchWord}&page=${page}&status=${companyStatus}`,
        success: function(data){
          _this.setState({
            loading: false,
            companies: data.companies,
            pagination: data.pagination,
            pageNum: page
          });
          _this.props.sgs('searching', false);
        }
      });
    }
  },
  companyStateCountry: function(address){
    var items = [];
    if (address.state){items.push(address.state);}
    if (address.country_code){items.push(address.country_code);}
    return items.join(', ');
  },
  companyList: function(){
    var rows = [];
    for (var i=0;i<this.state.companies.length;i++){
      var company = this.state.companies[i];
      var badgeCount, draftBadge;
      var companyStateCountry = this.companyStateCountry(company.address);
      var tags = this.tags(company.tags);
      if (company.ticket_count>0){
        badgeCount = <span className="badge badge-warning" style={{fontSize: '12px', backgroundColor: '#ffab40'}}>{company.ticket_count}</span>;
      }else{
        badgeCount = null;
      }
      if (company.status=='draft'){
        draftBadge = <span className="badge badge-danger" style={{marginRight: '10px'}}>Draft</span>;
      }else{
        draftBadge = null;
      }
      rows.push(
        <tr key={company.id}>
          <td>
            {tags}
            {draftBadge}<a id={company.id} onClick={this.clickCompany} style={{cursor: 'pointer'}}>{company.name}</a>
          </td>
          <td className="small">{company.email}</td>
          <td className="small">{companyStateCountry}</td>
          <td className="small text-center">{company.employees.length}</td>
          <td>{badgeCount}</td>
        </tr>
      );
    }
    return rows;
  },
  pageResults: function(page){
    this.loadCompanies(this.state.searchWord, this.state.companyStatus, page);
    this.setState({currentPage: page});
  },
  render: function(){
    if (this.state.companies && this.state.companies.length>0){
      return(
        <div className="panel panel-warning">
          <div className="panel-heading">
            <h3 className="panel-title">Companies</h3>
          </div>
          <div className="panel-body">
            <table className="table table-striped table-condensed">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>State, Country</th>
                  <th>Employees</th>
                  <th>Open Tickets</th>
                </tr>
              </thead>
              <tbody>
                {this.companyList()}
              </tbody>
            </table>
            <Pagination
              pagination={this.state.pagination}
              currentPage={this.state.pageNum}
              pageResults={this.pageResults}
              displayDescription={true} />
          </div>
        </div>
      );
    }else{
      return(null);
    }
  },
  tags: function(tags){
    var labels = [];
    for (var i=0;i<tags.length;i++){
      var tag_label = tags[i];
      labels.push(<span className="label label-info" key={i} style={{marginRight: '2px'}}>{tag_label}</span>);      
    }
    if (labels.length>0){
      return(<div className="small pull-right">{labels}</div>);
    }
  }
});