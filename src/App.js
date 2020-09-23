import React, { Component } from 'react';
import './App.css';
import { Route, Switch, Redirect } from 'react-router-dom';
import HomePage from './components/HomePage';
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
import { getCurrentUser } from "./services/authService";
import Reset from './pages/Reset';

class App extends Component {

  state = {
    user: ''
  };

  componentDidMount() {
    const user = getCurrentUser();
    if (user) this.setState({ user });
  }

  render() {
    return (
      <div className="App">
        <FlexNavbar user={this.state.user} />
        <div className="content">
          <Switch>
            <Route path="/home" component={HomePage} />
            <ProtectedRoute
              path="/bucketList"
              render={(props) => <BucketList user={this.state.user} {...props} /> }
            />
            <Route path="/taskgroup/:task_id" component={TaskGroup} />
            <Route path="/profile/:user_id" component={PublicProfile} />
            <Route path="/login" component={LoginForm} />
            <Route path="/register" component={RegisterForm} />
            <Route path="/logout" component={Logout} />
            <Route path="/Forgot" component={Forgot} />
            <Route path="/Reset/:token" component={Reset} />
            <Route path="/userActivityPage" render={(props) => <UserActivityPage user={this.state.user} /> } />
            <Route path="/friends" component={FriendsList} />
            <Route path="/messages" component={MessagePage} />
            <Route path="/myProfile" render={(props) => <Profile user={this.state.user} /> } />
            <Route path="/settings" component={Settings} />
            <Route path="/not-found" component={NotFound} />
            <Redirect to="/home" />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
