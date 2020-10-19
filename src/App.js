import React, { Component } from 'react';
import './App.css';
import { Route, Switch, Redirect } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BucketList from './pages/BucketList';
import TaskGroup from './pages/TaskGroup';
import FlexNavbar from './components/FlexNavbar';
import LoginForm from "./pages/LoginForm";
import Forgot from "./pages/Forgot";
import RegisterForm from "./pages/RegisterForm";
import UserActivityPage from "./pages/UserActivityPage";
import FriendsList from "./pages/FriendsList";
import MessagePage from "./pages/MessagePage";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Settings from "./pages/Settings";
import Logout from './pages/logout';
import NotFound from "./components/notFound";
import ProtectedRoute from "./components/common/protectedRoute";
import Reset from './pages/Reset';

import { connect } from 'react-redux';
import { setUserToken } from './store/user/user.actions';
import { selectUserToken } from './store/user/user.selectors';

class App extends Component {

  componentDidMount() {
    const jwt = localStorage.getItem('token');
    this.props.setUserToken(jwt);
  }

  render() {
    return (
      <div className="App">
        <FlexNavbar />
        <div className="content">
          <Switch>
            <Route path="/home" component={HomePage} />
            <ProtectedRoute
              path="/bucketList"
              render={(props) => <BucketList {...props} /> }
            />
            <Route path="/taskgroup/:task_id" component={TaskGroup} />
            <Route path="/profile/:user_id" component={PublicProfile} />
            <Route path="/login" component={LoginForm} />
            <Route path="/register" component={RegisterForm} />
            <Route path="/logout" component={Logout} />
            <Route path="/Forgot" component={Forgot} />
            <Route path="/Reset/:token" component={Reset} />
            <Route path="/userActivityPage" component={UserActivityPage} />
            <Route path="/friends" component={FriendsList} />
            <Route path="/messages" component={MessagePage} />
            <Route path="/myProfile" component={Profile} />
            <Route path="/settings" component={Settings} />
            <Route path="/not-found" component={NotFound} />
            <Redirect to="/home" />
          </Switch>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  userToken: selectUserToken(state)
});

const mapDispatchToProps = dispatch => ({
  setUserToken: (token) => dispatch(setUserToken(token))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
