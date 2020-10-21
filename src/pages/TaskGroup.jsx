import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import ActivityFeed from "../components/ActivityFeed";
import UserItem from "../components/UserItem";
import RecommendationItem from "../components/RecommendationItem";
import {
	getListItems,
	getListItem,
	getTaskUsersLazy,
	getRecentTaskUsers
} from "../services/bucketListService";
import { getUserBasic } from "../services/userService";
import { getRelatedBusinesses } from '../services/yelpService';
import { getCurrentLocation } from '../services/locationService';
import { getRecommendations } from '../services/recommendationService';

import { connect } from 'react-redux';
import { selectCurrentUser, selectUserToken } from '../store/user/user.selectors';
import { selectBucketList } from '../store/bucket-list/bucket-list.selectors';
import { fetchBucketListAsync } from '../store/bucket-list/bucket-list.actions';

class TaskGroup extends Component {

	constructor(props) {
	    super(props);
	    this.state = {
	      task_id: this.props.match.params.task_id,
	      task_name: '',
	      message: '',
	      members: [],
	      loadedMembers: [],
	      loadedMembersPageNum: 0,
	      loadedMembersDone: false,
	      recommendations: [],
	      modalDisplay: false
		};
	}

	async componentDidMount() {
		// User authentication
		const { 
			currentUser: user, 
			token: jwt, 
			listItems, 
			fetchBucketListAsync 
		} = this.props;

		console.log("user", user);
		console.log("jwt", jwt);

		fetchBucketListAsync(user, jwt);
		
		const task = listItems.find(item => item._id === this.props.match.params.task_id);
		const task_name = task ? task.taskName : '';
    	this.setState({ task_name });

		// Call function to retrieve latest members
		let members = await this.getRecentMembers();
		this.setState({ members });

		// Loads first 10 members of group.
		this.getMembersLazy();

		getCurrentLocation().then(async result => {
			const latitude = result.coords.latitude;
			const longitude = result.coords.longitude;

			// get recommendation keywords
			const recommendationKeywords = await getRecommendations();

			const term = this.identifySearchTerm(this.state.task_name, recommendationKeywords);
			// check if the term is in local storage
			const storedData = localStorage.getItem(term.keyword);

			if (term && !storedData) {
				// retrieve recommendations
				let recommendationsData = await getRelatedBusinesses(term.keyword, latitude, longitude);
				let jsonData = JSON.stringify(recommendationsData);
				this.setState({ recommendations: recommendationsData });
				// set in local storage
				localStorage.setItem(term.keyword, jsonData);
			} else {
				let jsonData = JSON.parse(storedData);
				this.setState({ recommendations: jsonData });
			}
		}).catch(error => {
			console.log("ERROR", error);
		});

	}

	getRecentMembers = async () =>  {
		try {
			// Get members with this task in bucketlist
			const membersresponse = await getRecentTaskUsers(this.state.task_id);

		    const members = [];
		    for (var i = 0; i < membersresponse.data.length; i++) {
		    	var member = membersresponse.data[i];
		    	const response = await getUserBasic(member.owner);
		    	members.push(response.data);
		    }

		    return members;
		} catch (ex) {
			console.log("Could not load recent members:", ex);
		}
	}

  	getMembersLazy = async () =>  {
		try {
			// Get members with this task in bucketlist
			const members = this.state.loadedMembers;
			const membersresponse = await getTaskUsersLazy(this.state.task_id, this.state.loadedMembersPageNum);

			if (membersresponse.data.length < 10) {
				this.setState({"loadedMembersDone": !this.state.loadedMembersDone})
			}

			for (var i = 0; i < membersresponse.data.length; i++) {
		    	var member = membersresponse.data[i];
		    	const response = await getUserBasic(member.owner);
		    	members.push(response.data);
		    }
		    this.setState({"loadedMembersPageNum": this.state.loadedMembersPageNum + 1})
	    	this.setState({"loadedMembers": members})
		} catch (ex) {
			console.log("Could not lazy-load members:", ex);
		}
	}

	toggleMembersModal = () => {
		this.setState({"modalDisplay" : !this.state.modalDisplay})
	}

	contains = (arr, key, val) => {
    for (var i = 0; i < arr.length; i++) {
        if(arr[i][key] === val) return true;
    }
    return false;
	}

	renderRedirect = () => {
    if (this.state.task_name === '') {
			return (<Redirect to='/not-found' />);
		}
	}

	identifySearchTerm = (name, keywords) => {
		// split the task name
		// identify which of them are found in
		// recommendation database
		const words = name.toLowerCase().split(" ");
		let filtered = [{}];

		for (let word of words) {
			filtered = keywords.filter(k => k.keyword === word);
			if (filtered.length > 0)
				break;
		}
		return filtered.length > 0 ? filtered[0] : null;
	}

	render() {
		const { task_name, task_id, message, members, recommendations } = this.state;
		return (
			<React.Fragment>
				<div className="jumbotron task-group-jumbotron"><h1 className="shadow-text bold-text">{`"${task_name}" Group`}</h1>
					{/* TODO: Add user count */}
					<h3 className="shadow-text">{`${message}`}</h3>
				</div>
				<div className="task-group-content">
	  			<div className="row nopadding">
	  				<div className="task-group-feed col-lg-9">
	  					<ActivityFeed taskId={task_id} />
	  				</div>
          	<div className="task-group-members col-lg-3">
          		<div className="sticky">
          			<div  className="side-section-nav">
						<div name = "membersIconTitle">Recently Joined Members</div>

							<div name = "membersIconBody" className="task-group-members-list">
									{members.length > 0 && members.map ( item =>
										<UserItem
											key={item._id}
											user={item}
										/>
									)}
								<button className="mx-auto d-block btn btn-light" onClick={this.toggleMembersModal}>View All</button>
							</div>
						</div>
						<section className="recommendations-container">
							<div className="sticky">
								<div className="side-section-nav">
									<h3 className="recommendation-title">Recommendations</h3>
									<div>
										{ recommendations.length > 0 ?
											recommendations.map(r => (
												<RecommendationItem
													name={r.name}
													location={r.location.address1}
												/>
											))
											:
											<div>No recommendations</div>
										}
									</div>
								</div>
							</div>
						</section>
					</div>
      			</div>
      		</div>
      	</div>

      			{ this.state.modalDisplay &&
      				<div id="modal-members" className="task-group-modal-members">
						<div className="task-group-modal-members-content">
							<div className="p-3 row">
								<div className="col-12">
									<span className="task-group-modal-members-close" onClick={this.toggleMembersModal}>&times;</span>
									<h3>Members for {`${task_name}`}</h3>
								</div>
							</div>
							<div className="p-3 task-group-modal-members-content-users-list">
								{this.state.loadedMembers.map ( item =>
									<div key={item._id} className="row text-left task-group-modal-members-user">
										<div className="col-12">
											<span>
												{ item.photo ?
													(<img alt="default profile" src={item.photo} className="task-group-modal-members-user-avatar" />)
													:
													(<img alt="default profile" src="https://pbs.twimg.com/profile_images/901947348699545601/hqRMHITj_400x400.jpg" className="task-group-modal-members-user-avatar" />)
												}
											</span>
											<span>
												{`${item.name}`}
											</span>
										</div>
									</div>
								)}
								{ !this.state.loadedMembersDone &&
									<button className="mt-2 mx-auto d-block btn btn-light" onClick={this.getMembersLazy}>
										Load More
									</button>
								}
							</div>
						</div>
					</div>
      			}

			</React.Fragment>
		);
	}

}

const mapStateToProps = state => ({
	currentUser: selectCurrentUser(state),
	selectUserToken: selectUserToken(state),
	listItems: selectBucketList(state)
});

const mapDispatchToProps = dispatch => ({
	fetchBucketListAsync: (user, token) => dispatch(fetchBucketListAsync(user, token))
});

export default connect(mapStateToProps, mapDispatchToProps)(TaskGroup);
