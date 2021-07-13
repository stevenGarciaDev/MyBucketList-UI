import React from "react";
import Joi from "joi-browser";
import Form from "../components/common/form";
import { login, authenticateGoogle } from "../services/authService";
import { Link } from "react-router-dom";
import { GoogleLogin } from 'react-google-login';
import Modal from 'react-responsive-modal'
import { Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { setUserToken } from '../store/user/user.actions';
import { selectUserToken } from '../store/user/user.selectors';

class LoginForm extends Form {

  constructor(props) {
    super(props);
    this.state = {
      data: { email: "", password: "" },
      errors: {},
      open: false,
      errorMsg: ''
    };
  }

  schema = {
    email: Joi.string()
      .required()
      .email()
      .label("Email"),
    password: Joi.string()
      .required()
      .label("Password")
  }

  doSubmit = async () => {
    // Call the server
    try {
      const { data } = this.state;
      const { data: jwt } = await login(data.email, data.password);
      localStorage.setItem('token', jwt);
      this.props.setUserToken(jwt);
    }
    catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = {...this.state.errors};
        errors.username = ex.response.data;  // display error from server
        this.setState({ errors });
        this.onOpenModal('Invalid Username or password');
      }
      if (ex.response && ex.response.status === 401) {
        const errors = {...this.state.errors};
        errors.username = ex.response.data;  // display error from server
        this.setState({ errors });
        this.onOpenModal("User does not exist");
        window.location = "/register";
      }
    }
  }

  forgotPage = () => {
    window.location = "/Forgot";
  }

  googleSuccess = async (response) => {
    const name = response.profileObj.name;
    const email = response.profileObj.email;
    const password = response.tokenObj.access_token;
    // Call the server
    try {
      const { data: jwt } = await authenticateGoogle(name, email, password);
      this.props.setUserToken(jwt);
      localStorage.setItem('token', jwt);
      window.location = "/bucketList";
    }
    catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = {...this.state.errors};
        errors.username = ex.response.data;  // display error from server
        this.setState({ errors });
      }
    }
  }

  googleError = (response) => {
    console.log(response);
  }
  onOpenModal = (x) => {
    this.setState({ open: true,errorMsg: x });
  };

  onCloseModal = () => {
    this.setState({ open: false });
    this.state.data.email = '';
    this.state.data.password = '';
  };

  render() {
    const { userToken } = this.props;
    var errorMsg = this.state.errorMsg;
    const open = this.state.open;
    return (
      <React.Fragment>
        <Modal open={open} onClose={this.onCloseModal}>
          <h2>{errorMsg}</h2>
          <Button className="d-flex justify-content-start" variant="warning" type="submit" onClick={() => this.onCloseModal()}>
            Confirm
          </Button>
        </Modal>
        <div className="jumbotron" id="auth-jumbotron"></div>

        { userToken ? <Redirect to="/bucketList" />
          :
          <div className="authenticate-form">
              <h1>Login</h1>
              <form onSubmit={this.handleSubmit}>
                {this.renderInput("email", "Email", "email")}
                {this.renderInput("password", "Password", "password")}
                {this.renderButton("Login")}
                <Link to="/Forgot" className="auth-sub-text">Forgot password?</Link>
              </form>
              {/* <hr />
              <h5>or</h5>
                <GoogleLogin
                  clientId="745879377205-gjmkk5rrfnnqtehsae85n23cuuqol4d5.apps.googleusercontent.com"
                  render={renderProps => (

                    <button className="button-google" onClick={renderProps.onClick} disabled={renderProps.disabled}>
                      <img alt="button google logo" className="button-google-logo" src="https://developers.google.com/identity/images/g-logo.png"/>Sign in with Google
                    </button>
                  )}
                  buttonText="Login"
                  onSuccess={this.googleSuccess}
                  onFailure={this.googleError}
                  cookiePolicy={'single_host_origin'}
                /> */}
          </div>
      }
        
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  userToken: selectUserToken(state)
});

const mapDispatchToProps = dispatch => ({
  setUserToken: (token) => dispatch(setUserToken(token))
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
