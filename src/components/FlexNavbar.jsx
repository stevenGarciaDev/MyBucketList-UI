import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { getUnread } from '../services/messageService';
import { getCurrentLocation } from '../services/locationService';

import { connect } from 'react-redux';
import { selectCurrentUser } from '../store/user/user.selectors';

class FlexNavbar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            displayMenu: false,
            isConnectCollapsed: false,
            isAccountCollapsed: false,
            unreadMessages: []
        };
        this.onTabDropdown = this.onTabDropdown.bind(this);
        this.onMenuDropdown = this.onMenuDropdown.bind(this);
        this.hideItem = this.hideItem.bind(this);
    }

    componentDidMount = async () => {
        try {
            const { currentUser: user } = this.props;
            const unread = await getUnread(user._id);
            this.setState({unreadMessages: unread});
            // Get user's current location, with permission
            getCurrentLocation().then(function(response) {
                console.log("Location:", response.coords);
            });
        } catch (ex) {
            console.log("Cannot get Yelp recommendations because user's location is not permitted.");
        }
    }

    hasNewMessages = async () => {
        return (this.state.unreadMessages.count > 0 ) ? true : false;
    }

    onTabDropdown(name) {
        let otherMenu = (name === 'isConnectCollapsed') ? 'isAccountCollapsed' : 'isConnectCollapsed';
        this.setState({
            [name]: !this.state[name],
            [otherMenu]: false
        });
    }

    onCloseTabDropdown() {
        this.setState({
            isConnectCollapsed: false,
            isAccountCollapsed: false,
            displayMenu: false
        });
    }

    onMenuDropdown() {
        console.log("onMenuDropdown");
        this.setState({
            displayMenu: !this.state.displayMenu
        });
    }

    hideItem() {
        const { displayMenu } = this.state;
        return displayMenu ? '' : 'hidden-display-item'; //"fas fa-bars fa-2x"
    }

    render() {
        const { currentUser: user } = this.props;
        const { isConnectCollapsed, isAccountCollapsed } = this.state; //fas fa-times fa-2x

        return (
            <nav>
                <i
                    id="hamburger-menu"
                    className=
                    {`fas fa-${!this.state.displayMenu ? 'bars fa-2x': 'times fa-2x'}`}
                    onClick={() => this.onMenuDropdown()}
                >
                </i>
                {user ?
                    <div className="FlexNavbar">
                        <div className={this.hideItem()}>
                            <NavLink
                                className="nav-link" to="/bucketList"
                                onClick={() => this.onCloseTabDropdown()}
                            >MyList <span className="sr-only">(current)</span></NavLink>
                        </div>
                        <div className={this.hideItem()}>
                            <NavLink
                                className="nav-link" to="/userActivityPage"
                                onClick={() => this.onCloseTabDropdown()}>
                                Activity Page
                            </NavLink>
                        </div>
                        <div className={this.hideItem()}>
                            <div
                                className="nav-link toggle-bar"
                                onClick={() => this.onTabDropdown('isConnectCollapsed')}
                                >
                                Connect {this.state.unreadMessages.length > 0 ?
                                    <span className="nav-new-message">( ! )</span>
                                    :
                                    ''
                                 }
                                <i className={`fas fa-chevron-${isConnectCollapsed ? 'up': 'down'}`}></i>
                            </div>
                            {isConnectCollapsed &&
                                <div className="dropdown-nav connect">
                                    <NavLink
                                        className="nav-link dropdown-item"
                                        onClick={() => this.onCloseTabDropdown()}
                                        to="/friends">Friends</NavLink>
                                    <NavLink
                                        className="nav-link dropdown-item"
                                        onClick={() => this.onCloseTabDropdown()}
                                        to="/messages">Messages {this.state.unreadMessages.length > 0 ?
                                    <span className="nav-new-message">{this.state.unreadMessages.length}</span>
                                    :
                                    ''
                                 }</NavLink>
                                </div>
                            }
                        </div>
                        <div className={this.hideItem()}>
                            <div
                                className="nav-link toggle-bar"
                                onClick={() => this.onTabDropdown('isAccountCollapsed')}>
                                Account <i className={`fas fa-chevron-${isAccountCollapsed ? 'up': 'down'}`}></i>
                            </div>
                            {isAccountCollapsed &&
                                <div className="dropdown-nav account">
                                    <NavLink
                                        className="nav-link dropdown-item"
                                        onClick={() => this.onCloseTabDropdown()}
                                        to={`/profile/${user._id}`}>My Profile</NavLink>
                                    <NavLink
                                        className="nav-link dropdown-item"
                                        onClick={() => this.onCloseTabDropdown()}
                                        to="/myProfile">Edit Profile</NavLink>
                                    <NavLink
                                        className="nav-link dropdown-item"
                                        onClick={() => this.onCloseTabDropdown()}
                                        to="/settings">Setting</NavLink>
                                    <NavLink
                                        className="nav-link"
                                        onClick={() => this.onCloseTabDropdown()}
                                        to="/logout">Sign out</NavLink>
                                </div>
                            }
                        </div>
                    </div>
                :
                    <div className="FlexNavbar display-items">

                        <div className={this.hideItem()}>
                            <NavLink className="nav-link" to="/login">
                                Login
                            </NavLink>
                        </div>

                        <div className={this.hideItem()}>
                            <NavLink className="nav-link" to="/register">
                                Register
                            </NavLink>
                        </div>
                    </div>
                }



            </nav>
        );
    }
}

const mapStateToProps = state => ({
    currentUser: selectCurrentUser(state)
});

export default connect(mapStateToProps)(FlexNavbar);
