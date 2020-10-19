import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-responsive-modal';
import { Form, Button } from 'react-bootstrap';
class OptionsToolbar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false
    }
  }
  onCloseModal = () => {
    this.setState({ open: false });
  };
  onOpenModal = () => {
    this.setState({ open: true });
  };
  displayOptions = () => {
    const { isEditing, item } = this.props;

    if (isEditing) {
      return (
        <React.Fragment>
          <div className="col-md-6 nopadding"></div>
          <div className="col-md-3 nopadding">
            <i className="fa fa-check fa-2x"
               aria-hidden="true"
               onClick={ (e) => {
                 e.preventDefault();
  
                 this.props.onUpdate(
                   this.props.item,
                   document.getElementById(`${item.taskName}`).value
                 );
          
                 this.props.onEdit();
               }}></i>
          </div>

          <div className="col-md-3 nopadding">
            <i className="fa fa-times fa-2x"
               aria-hidden="true"
               onClick={ this.props.onEdit }></i>
          </div>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <div className="col-md-3 nopadding">
          <Link to={`/taskgroup/${this.props.item._id}`}>
            <button className="btn btn-warning">Groups</button>
          </Link>
        </div>

        <div className="col-md-3 nopadding">
          <i className="fa fa-pencil-square-o fa-2x"
             aria-hidden="true"
             onClick={ this.props.onEdit }></i>
        </div>

        <div className="col-md-3 nopadding">
          <i className="fa fa-check-circle-o fa-2x"
             aria-hidden="true"
             onClick={ () => this.props.onComplete(item) }></i>
        </div>

        <div className="col-md-3 nopadding">
          <i className="far fa-trash-alt fa-2x"
             aria-hidden="true"
             title={"delete-" + item.taskName}
             onClick={() => this.onOpenModal()}></i>
        </div>
        <Modal open={this.state.open} onClose={this.onCloseModal}>
          <div className="delete-task-popup">
            <h2>Confirm Delete Task</h2>
            <p>Are you sure you wanna delete task?</p>
            <Button 
              className="d-flex justify-content-start" 
              variant="warning" 
              type="submit" 
              onClick={() => {
                this.props.onDelete(item);
                this.onCloseModal();
              }}>
              Confirm
            </Button>
          </div>
        </Modal>
      </React.Fragment>
    );
  }

  render() {
    return (
      <div className="item-modify-options">

        {this.displayOptions()}

      </div>
    );
  }
}

export default OptionsToolbar;
