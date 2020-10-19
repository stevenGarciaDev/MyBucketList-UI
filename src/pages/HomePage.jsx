import React from "react";
import { Link } from 'react-router-dom';

const HomePage = () => {
	return(
		<React.Fragment>
			<div className="home-container">
				<div className="home-title-container">
					<h1 className="home-title">My Bucket List</h1>
					<p className="home-subtitle">A social network that connects people to check off items on their bucket list.</p>
				</div>

				<div className="home-center">
					<div>
						<Link to='/login' className="btn btn-warning">Sign in!</Link>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}

export default HomePage;
