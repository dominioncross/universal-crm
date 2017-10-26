var Flags = createReactClass({
  
  render: function(){
    var labels = [];
    for (var i=0;i<this.props.flags.length;i++){
      var flag_label = this.props.flags[i];
      labels.push(<span className="badge" key={i} style={{background: this.labelColor(flag_label), marginRight: '2px'}}>{flag_label}</span>);      
    }
    if (labels.length>0){
      return(<span style={{marginLeft: '10px'}}>{labels}</span>);
    }else{
      return(null);
    }
  },
  labelColor: function(label){
    if (this.props.gs && this.props.gs.config){
      return `#${this.flagColor(label)}`;
    }
  },
  flagColor: function(flag_label){
    var obj = findObjectByKeyValue(this.props.gs.config.ticket_flags, 'label', flag_label);
    if (obj){
      return obj['color'];
    }else{
      return null;
    }
  },
});