import React, { Component } from 'react';
import MessageGroupList from '../components/MessageGroupList';
import MessageFeed from '../components/MessageFeed';
import MessageGroupForm from '../components/MessageGroupForm';
import {
  createNewGroup,
  retrieveMessageGroups,
  getCurrentGroupMembers,
  sendMessage } from '../services/messageService';
import { getFriends } from '../services/friendshipService';
import socketIOClient from "socket.io-client";

import { connect } from 'react-redux';
import { selectCurrentUser } from '../store/user/user.selectors';

class MessagePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      messageGroups: [],
      currentGroupFeed: [],
      friendsList: [],
      currentGroupMembers: []
    };
  }

  componentDidMount = async () => {
    const { currentUser: user } = this.props;
    const friendsList = await getFriends(user.email);
    const res = await retrieveMessageGroups(user);
    let currentGroupFeed = [];

    if (res.data.length > 0) {
      currentGroupFeed = res.data[0];
      this.populateMessageFeed(currentGroupFeed);
    }

    this.setState({ messageGroups: res.data, friendsList: friendsList.data });
  }

  makeNewGroup = async (membersToAdd, groupName) => {
    try {
      let groupMembersToAdd = [ ...membersToAdd ];
      let messageGroups = [ ...this.state.messageGroups ];
      const { currentUser: user } = this.props;

      groupMembersToAdd.push({ id: user._id });
      const newGroup = await createNewGroup(groupMembersToAdd, groupName);
      if (!newGroup) {
        const error = "A group with that name already exist.";
        this.setState({ error });
        return;
      }

      messageGroups.unshift(newGroup);
      this.setState({ messageGroups });
    } catch (ex) {
      console.log("Unable to make a new group");
    }
  }

  populateMessageFeed = async (currentGroup) => {
    const socket = socketIOClient(process.env.REACT_APP_SOCKET_ENDPOINT);
    socket.on('update messages', async (groupFeed) => {

      let currentGroupFeed = await getCurrentGroupMembers(groupFeed);
      this.setState({ currentGroupFeed });
      return;
    });

    let currentGroupFeed = await getCurrentGroupMembers(currentGroup);
    this.setState({ currentGroupFeed });
  }

  sendMessage = async (e, msg) => {
    e.preventDefault();
    const { currentUser: user } = this.props;
    let { currentGroupFeed } = this.state;

    const response = sendMessage(user._id, msg, currentGroupFeed._id);

    response.then(data => {
      currentGroupFeed.messages.push(data);
      this.setState({ currentGroupFeed });
    }).catch(ex => {
      console.log("unable to handle data", ex);
    });
  }

  render() {
    const { messageGroups, friendsList } = this.state;
    let currentGroupFeed = { ...this.state.currentGroupFeed };
    return (
      <div id="MessagePage" className="container-fluid">
        <MessageGroupForm friendsList={friendsList} onMakeNewGroup={this.makeNewGroup}/>
        <div className="message-grid">
          <div>
            {/* <MessageGroupForm friendsList={friendsList} onMakeNewGroup={this.makeNewGroup}/> */}
            <MessageGroupList messageGroups={messageGroups} onItemClick={this.populateMessageFeed} />
          </div>
          <div>
            { currentGroupFeed &&
              <MessageFeed feed={currentGroupFeed} sendMessage={this.sendMessage} />
            }
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: selectCurrentUser(state)
});

export default connect(mapStateToProps)(MessagePage);
