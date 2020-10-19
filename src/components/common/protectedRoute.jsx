import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { selectCurrentUser } from '../../store/user/user.selectors';

const ProtectedRoute = ({ path, component: Component, render, currentUser, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        if (!currentUser) return <Redirect to="/login" />
        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
};

const mapStateToProps = state => ({
  currentUser: selectCurrentUser(state)
});

export default connect(mapStateToProps)(ProtectedRoute);
