var Tags = createReactClass({
  getInitialState: function(){
    return {
      propTags: null,
      tags: [],
      editedTags: [],
      edit: false,
      subjectId: null
    }
  },
  componentDidMount: function(){
    this.setState({tags: this.props.tags, propTags: this.props.tags});
  },
  componentDidUpdate: function(){
    field = ReactDOM.findDOMNode(this.refs.edit_field);
    if (this.state.edit && field){
      field.focus();
    }
    if (this.props.tags != this.state.propTags){ //we have sent new props
      this.setState({tags: this.props.tags, propTags: this.props.tags});
    }
  }, 
  handleToggle: function(e){
    e.preventDefault();
    this.setState({edit: !this.state.edit});
  },
  handleEdit: function(e){
    this.setState({editedTags: e.target.value.replace(', ',',').split(',')});
  },
  handleSubmit: function(e){
    e.preventDefault();
    this.setState({edit: false});
    $.ajax({
      method: 'POST',
      url: `/universal/tags?model_class=${this.props.subjectType}&model_id=${this.props.subjectId}`,
      dataType: 'JSON',
      data: {tags: this.state.editedTags.join(',')},
      success: (function(_this){
        return function(data){
          _this.setState({tags: data.tags});
        }
      })(this)
    });
  },
  onIcon: function(e){
    e.target.className = 'fa fa-fw fa-pencil';
  },
  offIcon: function(e){
    e.target.className = 'fa fa-fw fa-tags';
  },
  listTags: function(){
    var tags = []
    for (var i=0;i<this.state.tags.length;i++){
      var tag = this.state.tags[i];
      tags.push(<span key={i} className="label label-info" style={{display: 'inline-block', marginRight: '5px'}}>{tag}</span>)
    }
    return(
      <div>
        <a onClick={this.handleToggle} style={{cursor: 'pointer', marginRight: '5px'}}>
          <i className='fa fa-fw fa-tags' onMouseOver={this.onIcon} onMouseOut={this.offIcon} />
        </a>
        {tags}
      </div>
    )
  },
  editForm: function(){
    return (
      <div className="input-group">
        <span className="input-group-btn">
          <button className='btn btn-default' onClick={this.handleToggle}><i className="fa fa-times" /></button>
        </span>
        <div className='form-group'>
          <form className='form' onSubmit={this.handleSubmit}>
            <input
              className='form-control'
              defaultValue={this.state.tags.join(', ')}
              onChange={this.handleEdit}
              id="tag_edit_field_{this.props.subjectId}"
              ref='edit_field' />
          </form>
        </div>
      </div>
    )
  },        
  render: function(){
    if (this.state.edit){
      return(this.editForm());
    }else{
      return(this.listTags());
    }
  }
});