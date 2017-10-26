/*
  global React
*/
var TicketStatus = createReactClass({
  getInitialState: function(){
    return({});
  },
  render: function(){
    return(
      <div>{this.status()}</div>
    );
  },
  status: function(){
    var viewers = this.viewers();
    var editors = this.editors();
    if (editors){
      return(
        <div className="alert alert-danger alert-sm no-margin text-center">
          <i className="fa fa-exclamation-triangle" /> Currently being edited by: {this.editors()}
        </div>
      );
    }else if (viewers){
      return(
        <div className="alert alert-warning alert-sm no-margin text-center">
          <i className="fa fa-exclamation-triangle" /> Currently being viewed by: {this.viewers()}
        </div>
      );
    }
  },
  viewers: function(){
    if (this.props.ticket.viewer_ids && this.props.gs && this.props.gs.user && this.props.gs.user.id){
      var v = [];
      var this_viewer = this.props.gs.user.name;
      this.props.ticket.viewer_names.forEach(function(viewer){
        if (viewer!=this_viewer){
          v.push(viewer);
        }
      });
      if (v.length>0){
        var html = [<span key='0'>{v[0]}</span>];
        if (v.length>1){
          for (var i=1;i<v.length-1;i++){
            html.push(<span key={i}>, {v[i]}</span>);
          }
          html.push(<span key={v.length-1}> &amp; {v[v.length-1]}</span>);
        }
        return html;
      }
    }
  },
  editors: function(){
    if (this.props.ticket.editor_ids && this.props.gs && this.props.gs.user && this.props.gs.user.id){
      var v = [];
      var this_editor = this.props.gs.user.name;
      this.props.ticket.editor_names.forEach(function(editor){
        if (editor!=this_editor){
          v.push(editor);
        }
      });
      if (v.length>0){
        var html = [<span key='0'>{v[0]}</span>];
        if (v.length>1){
          for (var i=1;i<v.length-1;i++){
            html.push(<span key={i}>, {v[i]}</span>);
          }
          html.push(<span key={v.length-1}> &amp; {v[v.length-1]}</span>);
        }
        return html;
      }
    }
  }
});