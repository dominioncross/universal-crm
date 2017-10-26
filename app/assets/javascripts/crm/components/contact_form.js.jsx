var ContactForm = createReactClass({
  getInitialState: function(){
    return({
      name: null, email: null, subject: null, message: null
    })
  },
  handleSubmit: function(e){
    e.preventDefault();
    $.ajax({
      method: 'POST',
      url: '/crm/tickets',
      dataType: 'JSON',
      data:{title: this.state.subject, content: this.state.message, customer_name: this.state.name, customer_email: this.state.email},
      success: (function(_this){
        return function(data){
          showSuccess('Message sent')
        }
      })(this)
    });
  },
  changeField: function(e){
    this.setState({[e.target.name]: e.target.value});
  },
  submitButton: function(){
    if (this.state.name && this.state.email && this.state.subject && this.state.message){
      return(<button className="btn btn-primary">Submit</button>);
    }else{
      return(<button className="btn btn-primary" disabled="disabled">Submit</button>);
    }
  },
  render: function(){
    return(
      <div className="container">
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your name:</label>
            <input type="text" className="form-control" ref='name' id="name" name="name" onChange={this.changeField} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Your email:</label>
            <input type="text" className="form-control" ref='email' id="email" name="email" onChange={this.changeField} />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject:</label>
            <input type="text" className="form-control" ref='subject' id="subject" name="subject" onChange={this.changeField} />
          </div>
          <div className="form-group">
            <label htmlFor="message">Your message:</label>
            <textarea className="form-control" ref='message' id="message" name="message" onChange={this.changeField} ></textarea>
          </div>
          <div className="form-group">
            {this.submitButton()}
          </div>
        </form>
      </div>
    )
  }
})